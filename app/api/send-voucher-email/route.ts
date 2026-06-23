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
  const { enquiryId, tourTitle, arrivalDate, returnDate, totalCost } = body as {
    enquiryId:   string
    tourTitle:   string
    arrivalDate: string
    returnDate:  string
    totalCost:   number
  }

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
  const cost    = Number(totalCost) || 0
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
      passportNo:       '',
      passportExpiry:   '',
      emergencyContact: '',
    },

    tour: {
      title:     tourTitle || enquiry.tour_interest || 'Custom Bhutan Package',
      category:  'Cultural Tour',
      duration:  `${nights + 1} Days / ${nights} Nights`,
      pax,
      startDate: start.toLocaleDateString('en-US', { dateStyle: 'medium' }),
      endDate:   end.toLocaleDateString('en-US', { dateStyle: 'medium' }),
      guide:     'Licensed ATCB Guide',
      vehicle:   'Private Vehicle & Driver',
    },

    pricing: {
      pricePerPerson:       cost > 0 ? cost / pax : 0,
      pax,
      sdfPerPersonPerNight: 100,
      nights,
      serviceFeePerPax:     0,
      gstRate:              0,
      inrRate:              83.5,
    },

    inclusions: [
      'Bhutan Sustainable Development Fee (SDF)',
      'Bhutan visa & permit processing',
      'All accommodation per itinerary',
      'All meals as specified',
      'Licensed English-speaking ATCB guide',
      'Private vehicle & dedicated driver',
      'All monument & dzong entry fees',
      'Arise Bhutan 24/7 in-country support',
    ],

    exclusions: [
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

  // ── 6. Email PDF to client ─────────────────────────────────
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
            <tr><td style="padding: 6px 0; color: #78716c; width: 140px;">Booking Reference</td><td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${bookingRef}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Tour</td><td style="padding: 6px 0;">${voucherData.tour.title}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Travel Dates</td><td style="padding: 6px 0;">${voucherData.tour.startDate} – ${voucherData.tour.endDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Duration</td><td style="padding: 6px 0;">${voucherData.tour.duration}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Guests</td><td style="padding: 6px 0;">${pax} ${pax === 1 ? 'person' : 'people'}</td></tr>
          </table>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            If you have any questions, please reply to this email or WhatsApp us at <strong>+975 17 288 286</strong>.
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

  // ── 7. Mark enquiry as quoted ──────────────────────────────
  await supabaseAdmin
    .from('itinerary_requests')
    .update({ status: 'quoted' })
    .eq('id', enquiryId)

  return NextResponse.json({ success: true, ref: bookingRef })
}
