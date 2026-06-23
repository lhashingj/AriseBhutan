import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { VoucherDocument } from '@/utils/voucherDocument'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────
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

  // ── 4. Build voucher data ──────────────────────────────────
  const start  = new Date(arrivalDate)
  const end    = new Date(returnDate)
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
  const pax    = enquiry.guests || 2
  const bookingRef = `ARB-${enquiry.id.slice(0, 8).toUpperCase()}`

  const voucherData = {
    bookingRef,
    issueDate: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
    status: 'QUOTED',

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

    flights:            Array.isArray(flights)             ? flights.filter((f: any) => f.sector || f.flightNo) : [],
    itinerary:          Array.isArray(itinerary)           ? itinerary           : [],
    accommodation:      Array.isArray(accommodation)       ? accommodation.filter((h: any) => h.hotel)          : [],
    cancellationPolicy: Array.isArray(cancellationPolicy)  ? cancellationPolicy  : [],

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
  } catch (err) {
    console.error('PDF render error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  const filename = `Arise-Bhutan-${bookingRef}.pdf`
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(pdfBuffer.length),
    },
  })
}
