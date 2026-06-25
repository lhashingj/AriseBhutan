import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { VoucherDocument } from '@/utils/voucherDocument'

// Service-role client — bypasses RLS for trusted server reads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: NextRequest) {
  // ── 1. Authenticate caller ──────────────────────────────────
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!jwt) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
  }

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
  if (authErr || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  // ── 2. Verify admin role ────────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // ── 3. Fetch booking ────────────────────────────────────────
  const bookingId = req.nextUrl.searchParams.get('id')
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing booking id parameter' }, { status: 400 })
  }

  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from('bookings')
    .select('*, profiles(name, email)')
    .eq('id', bookingId)
    .single()

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // ── 4. Map DB record → voucher shape ───────────────────────
  const voucherData = {
    bookingRef: `ARB-${booking.id.slice(0, 8).toUpperCase()}`,
    issueDate:  new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
    status:     booking.status,

    client: {
      name:             booking.client_name ?? booking.profiles?.name,
      email:            booking.profiles?.email ?? '',
      phone:            booking.phone             ?? '',
      nationality:      booking.nationality       ?? '',
      passportNo:       booking.passport_no       ?? '',
      passportExpiry:   booking.passport_expiry   ?? '',
      emergencyContact: booking.emergency_contact ?? '',
    },

    tour: {
      title:     booking.tour_title,
      category:  booking.tour_category ?? 'Cultural Tour',
      duration:  booking.arrival_date && booking.return_date
        ? `${Math.ceil((new Date(booking.return_date).getTime() - new Date(booking.arrival_date).getTime()) / 86_400_000)} Days`
        : '',
      pax:       Number(booking.group_size) || 1,
      startDate: booking.arrival_date  ? new Date(booking.arrival_date).toLocaleDateString('en-US', { dateStyle: 'medium' })  : '',
      endDate:   booking.return_date   ? new Date(booking.return_date).toLocaleDateString('en-US', { dateStyle: 'medium' })   : '',
      guide:     booking.guide         ?? 'Licensed DOT Guide',
      vehicle:   booking.vehicle       ?? 'Private Vehicle & Driver',
    },

    // Pricing pulled from itinerary_details if set, or cost_items fallback
    pricing: {
      pricePerPerson:       Number(booking.final_calculated_price)
        ? Number(booking.final_calculated_price) / (Number(booking.group_size) || 1)
        : Number(booking.subtotal ?? 0),
      pax:                  Number(booking.group_size) || 1,
      sdfPerPersonPerNight: 100,
      nights:               booking.arrival_date && booking.return_date
        ? Math.ceil((new Date(booking.return_date).getTime() - new Date(booking.arrival_date).getTime()) / 86_400_000)
        : 1,
      serviceFeePerPax:     150,
      gstRate:              booking.gst && booking.subtotal
        ? Number(booking.gst) / Number(booking.subtotal)
        : 0.05,
      inrRate:              83.5,
    },

    inclusions: [
      'Bhutan Sustainable Development Fee (SDF)',
      'Bhutan visa & permit processing',
      'All accommodation per itinerary',
      'All meals as specified',
      'Licensed English-speaking DOT-certified guide',
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

  // ── 5. Generate PDF ─────────────────────────────────────────
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

  // ── 6. Stream PDF response ──────────────────────────────────
  const filename = `Arise-Bhutan-${voucherData.bookingRef}.pdf`
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(pdfBuffer.length),
      'Cache-Control':       'no-store',
    },
  })
}
