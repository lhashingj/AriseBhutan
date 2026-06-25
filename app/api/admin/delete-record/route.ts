import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function verifyAdmin(token: string | null) {
  if (!token) return false
  const { data: { user }, error } = await adminSupabase.auth.getUser(token)
  if (error || !user) return false
  const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'ADMIN'
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? null
  if (!(await verifyAdmin(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, id } = await req.json()
  if (!type || !id) return NextResponse.json({ error: 'type and id are required' }, { status: 400 })

  if (type === 'itinerary') {
    // Fetch itinerary to find matching booking
    const { data: itin } = await adminSupabase
      .from('itineraries')
      .select('client_info, tour_summary')
      .eq('id', id)
      .single()

    // Delete the itinerary
    const { error } = await adminSupabase.from('itineraries').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also delete matching booking(s) by email + tour title
    if (itin?.client_info?.email) {
      const email    = itin.client_info.email
      const tourName = itin.tour_summary?.tour_package

      let query = adminSupabase.from('bookings').delete().eq('client_email', email)
      if (tourName) query = query.eq('tour_title', tourName)
      await query
    }

    return NextResponse.json({ success: true })
  }

  if (type === 'booking') {
    // Fetch booking to find matching itinerary
    const { data: bk } = await adminSupabase
      .from('bookings')
      .select('client_email, tour_title')
      .eq('id', id)
      .single()

    // Delete the booking
    const { error } = await adminSupabase.from('bookings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also delete matching itinerary by email + tour package
    if (bk?.client_email) {
      let query = adminSupabase
        .from('itineraries')
        .delete()
        .eq('client_info->>email', bk.client_email)
      if (bk.tour_title) query = query.eq('tour_summary->>tour_package', bk.tour_title)
      await query
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
