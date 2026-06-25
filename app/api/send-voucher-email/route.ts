import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { VoucherDocument } from '@/utils/voucherDocument'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  // ── 1. Authenticate admin ──────────────────────────────────
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ── 2. Parse body ──────────────────────────────────────────
  const body = await req.json()
  const {
    enquiryId,
    tourTitle,
    category,
    arrivalDate,
    returnDate,
    guide,
    vehicle,
    clientExtras,
    flights,
    itinerary,
    pricing,
    accommodation,
    inclusions,
    exclusions,
    cancellationPolicy,
  } = body

  if (!enquiryId || !arrivalDate || !returnDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // ── 3. Fetch enquiry ───────────────────────────────────────
  const { data: enquiry, error: fetchErr } = await supabaseAdmin
    .from('itinerary_requests').select('*').eq('id', enquiryId).single()
  if (fetchErr || !enquiry) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
  }
  if (!enquiry.client_email) {
    return NextResponse.json({ error: 'No client email on this enquiry' }, { status: 400 })
  }

  // ── 4. Build voucher data ──────────────────────────────────
  const start   = new Date(arrivalDate)
  const end     = new Date(returnDate)
  const nights  = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
  const pax     = enquiry.guests || 2
  const bookingRef = `ARB-${enquiry.id.slice(0, 8).toUpperCase()}`

  const voucherData = {
    bookingRef,
    issueDate: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
    status: 'CONFIRMED',

    client: {
      name:             enquiry.client_name    || 'Valued Guest',
      email:            enquiry.client_email   || '',
      phone:            enquiry.client_phone   || '',
      nationality:      enquiry.client_country || '',
      passportNo:       clientExtras?.passportNo       || '',
      passportExpiry:   clientExtras?.passportExpiry   || '',
      emergencyContact: clientExtras?.emergencyContact || '',
    },

    tour: {
      title:     tourTitle    || enquiry.tour_interest || 'Custom Bhutan Package',
      category:  category     || (enquiry.tier ? `${enquiry.tier} Package` : 'Cultural Tour'),
      duration:  `${nights + 1} Days / ${nights} Nights`,
      pax,
      startDate: start.toLocaleDateString('en-US', { dateStyle: 'medium' }),
      endDate:   end.toLocaleDateString('en-US', { dateStyle: 'medium' }),
      guide:     guide   || 'Licensed ATCB Guide',
      vehicle:   vehicle || 'Private Vehicle & Driver',
    },

    flights:           Array.isArray(flights)            ? flights.filter((f: any) => f.sector || f.flightNo)  : [],
    itinerary:         Array.isArray(itinerary)          ? itinerary          : [],
    accommodation:     Array.isArray(accommodation)      ? accommodation.filter((h: any) => h.hotel)           : [],
    cancellationPolicy: Array.isArray(cancellationPolicy) ? cancellationPolicy : [],

    pricing: {
      pricePerPerson:       pricing?.pricePerPerson       ?? 0,
      pax,
      sdfPerPersonPerNight: pricing?.sdfPerPersonPerNight ?? 100,
      nights,
      serviceFeePerPax:     pricing?.serviceFeePerPax     ?? 0,
      gstRate:              pricing?.gstRate               ?? 0,
      inrRate:              pricing?.inrRate               ?? 83.5,
    },

    inclusions: inclusions?.filter(Boolean) ?? [
      'Bhutan Sustainable Development Fee (SDF)',
      'Bhutan visa & permit processing',
      'All accommodation per itinerary',
      'All meals as specified',
      'Licensed English-speaking ATCB guide',
      'Private vehicle & dedicated driver',
      'All monument & dzong entry fees',
      'Arise Bhutan 24/7 in-country support',
    ],

    exclusions: exclusions?.filter(Boolean) ?? [
      'International airfare to/from Paro',
      'Travel & medical insurance',
      'Personal expenses & gratuities',
      'Alcoholic & premium beverages',
      'Optional adventure activities',
    ],
  }

  // ── 5. Generate PDF ────────────────────────────────────────
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createElement(VoucherDocument, { booking: voucherData }) as any
    )
  } catch (renderErr) {
    console.error('PDF render error:', renderErr)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  // ── 6. Compute totals for email preview ───────────────────
  const { computePricing } = await import('@/utils/pdfGenerator')
  const costs = computePricing(voucherData.pricing)

  // ── 7. Email PDF to client ─────────────────────────────────
  const filename = `Arise-Bhutan-${bookingRef}.pdf`

  const { error: emailErr } = await resend.emails.send({
    from:    'Arise Bhutan Tours <noreply@arisebhutan.com>',
    to:      [enquiry.client_email],
    replyTo: 'arisebhutan@gmail.com',
    subject: `Your Bhutan Travel Voucher — ${bookingRef}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: #78350f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fef3c7; margin: 0; font-size: 22px;">Your Bhutan Travel Voucher</h1>
          <p style="color: #fde68a; margin: 4px 0 0; font-size: 14px;">Arise Bhutan Tours &amp; Travel</p>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-top: none; padding: 24px 32px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 15px; margin: 0 0 12px;">Dear <strong>${enquiry.client_name || 'Valued Guest'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            Thank you for choosing Arise Bhutan Tours &amp; Travel. Please find your personalised travel voucher attached to this email.
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0; color: #78716c; width: 160px;">Booking Reference</td><td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${bookingRef}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Tour</td><td style="padding: 6px 0;">${voucherData.tour.title}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Travel Dates</td><td style="padding: 6px 0;">${voucherData.tour.startDate} – ${voucherData.tour.endDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Duration</td><td style="padding: 6px 0;">${voucherData.tour.duration}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Guests</td><td style="padding: 6px 0;">${pax} ${pax === 1 ? 'person' : 'people'}</td></tr>
            ${costs.totalUSD > 0 ? `<tr><td style="padding: 6px 0; color: #78716c;">Total Cost</td><td style="padding: 6px 0; font-weight: bold; color: #92400e;">$${costs.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>` : ''}
          </table>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            Please review the attached PDF for your full itinerary, flight details, and booking terms. If you have any questions, please reply to this email or WhatsApp us at <strong>+975 77 319 405</strong>.
          </p>
          <p style="font-size: 13px; color: #78716c; margin: 0;">
            Warm regards,<br /><strong>Arise Bhutan Tours &amp; Travel</strong><br />Paro Town, Bhutan
          </p>
        </div>
      </div>
    `,
    attachments: [{ filename, content: pdfBuffer }],
  })

  if (emailErr) {
    console.error('Resend error:', emailErr)
    return NextResponse.json({ error: 'Failed to send voucher email' }, { status: 500 })
  }

  // ── 8. Mark enquiry as quoted ──────────────────────────────
  await supabaseAdmin
    .from('itinerary_requests')
    .update({ status: 'quoted' })
    .eq('id', enquiryId)

  // ── 9. Save to client account if registered ────────────────
  try {
    const { data: clientProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', enquiry.client_email)
      .single()

    if (clientProfile) {
      await supabaseAdmin.from('bookings').insert({
        user_id:                clientProfile.id,
        client_name:            enquiry.client_name  || '',
        client_email:           enquiry.client_email || '',
        client_phone:           enquiry.client_phone || '',
        tour_title:             voucherData.tour.title,
        group_size:             String(pax),
        hotel_tier:             enquiry.tier || '4-Star',
        arrival_date:           arrivalDate,
        return_date:            returnDate,
        total_cost:             costs.totalUSD,
        subtotal:               costs.subtotal,
        gst:                    costs.gst,
        status:                 'CONFIRMED',
        final_calculated_price: costs.totalUSD,
        itinerary_details:      voucherData,
      })
    }
  } catch (e) {
    console.error('Non-blocking: failed to create booking for registered client:', e)
  }

  return NextResponse.json({ success: true, ref: bookingRef })
}
