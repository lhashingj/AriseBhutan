import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { booking } = await req.json()
    if (!booking) return NextResponse.json({ error: 'No booking data' }, { status: 400 })

    const nights = booking.itinerary_days?.length
      ? Math.max(0, booking.itinerary_days.length - 1)
      : 0

    const flights: object[] = []
    if (booking.flight_arrival) {
      flights.push({
        sector:    booking.flight_arrival,
        airline:   booking.flight_arrival_no?.startsWith('KB') ? 'Druk Air (KB)' : booking.flight_arrival_no?.startsWith('B3') ? 'Bhutan Airlines (B3)' : '',
        flight_no: booking.flight_arrival_no  || '',
        date:      booking.arrival_date       || '',
        depart:    booking.flight_arrival_depart || '',
        arrive:    booking.flight_arrival_arrive || '',
      })
    }
    if (booking.flight_return) {
      flights.push({
        sector:    booking.flight_return,
        airline:   booking.flight_return_no?.startsWith('KB') ? 'Druk Air (KB)' : booking.flight_return_no?.startsWith('B3') ? 'Bhutan Airlines (B3)' : '',
        flight_no: booking.flight_return_no  || '',
        date:      booking.return_date        || '',
        depart:    booking.flight_return_depart || '',
        arrive:    booking.flight_return_arrive || '',
      })
    }

    const day_by_day = (booking.itinerary_days || []).map((d: {
      title?: string; description?: string; location?: string; activities?: string; hotel?: string
      breakfast?: boolean; lunch?: boolean; dinner?: boolean; date?: string
    }, i: number) => ({
      day:                i + 1,
      date:               d.date || null,
      programme:          [d.title, d.description, d.activities && `Activities: ${d.activities}`].filter(Boolean).join('\n') || '',
      location:           d.location || null,
      accommodation_name: d.hotel || '',
      meals:              [d.breakfast && 'B', d.lunch && 'L', d.dinner && 'D'].filter(Boolean).join(','),
    }))

    const year = new Date().getFullYear()
    const booking_reference = `ARB-${year}-${booking.id.slice(0, 6).toUpperCase()}`

    const { error } = await supabaseAdmin.from('itineraries').insert({
      booking_reference,
      status: 'enquiry_pending',
      client_info: {
        guest_name:       booking.client_name      || '',
        email:            booking.client_email     || '',
        phone:            booking.client_phone     || null,
        nationality:      booking.nationality      || '',
        passport_no:      booking.passport_number  || null,
        passport_expiry:  booking.passport_expiry  || null,
        emergency_contact: booking.emergency_contact || null,
      },
      tour_summary: {
        tour_package:      booking.tour_title         || 'Custom Package',
        category:          'Custom',
        duration_nights:   nights,
        group_size:        parseInt(booking.group_size) || 1,
        hotel_tier:        booking.hotel_tier         || '3-Star',
        departure_date:    booking.arrival_date       || null,
        return_date:       booking.return_date        || null,
        activities_selected: [],
        travel_interests:  booking.travel_interests   || [],
        guide_name:        null,
        vehicle_details:   null,
      },
      flights,
      day_by_day,
      pricing: {
        package_rate_per_pax: 0,
        sdf_total:            0,
        service_fee:          0,
        subtotal:             0,
        gst:                  0,
        grand_total:          0,
        equivalent_inr:       0,
      },
    })

    if (error) {
      console.error('sync-itinerary insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('sync-itinerary error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
