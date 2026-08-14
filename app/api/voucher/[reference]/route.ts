import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

type Access = 'admin' | 'client' | 'ops'

// Pricing/payment fields never reach a viewer who isn't a verified admin or
// the itinerary's own client — including anonymous guide/driver links, and
// anyone who edits the URL trying to request the client view. The one
// exception is a minimal cash-collection reminder for the guide/driver —
// just the amount and method, never the itemized breakdown that produced it.
function stripFinancials(itinerary: Record<string, any>) {
  const { pricing, payment_link, ...rest } = itinerary

  const collection_note =
    pricing?.balance_collection_method === 'cash_on_arrival' && Number(pricing?.balance_due) > 0
      ? {
          amount: pricing.balance_due,
          sym: pricing.is_saarc ? '₹' : '$',
        }
      : null

  return { ...rest, collection_note }
}

async function resolveAccess(req: NextRequest, itinerary: Record<string, any>): Promise<Access> {
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!jwt) return 'ops'

  const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
  if (!user) return 'ops'

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'ADMIN') return 'admin'

  if (itinerary.user_id === user.id) return 'client'
  if (itinerary.client_info?.email && itinerary.client_info.email === user.email) return 'client'

  const { data: guestRow } = await supabaseAdmin
    .from('booking_guests')
    .select('id')
    .eq('booking_id', itinerary.booking_reference)
    .eq('user_id', user.id)
    .maybeSingle()
  if (guestRow) return 'client'

  return 'ops'
}

export async function GET(req: NextRequest, { params }: { params: { reference: string } }) {
  const { data: itinerary, error } = await supabaseAdmin
    .from('itineraries')
    .select('*')
    .eq('booking_reference', params.reference)
    .single()

  if (error || !itinerary) {
    return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
  }

  const access = await resolveAccess(req, itinerary)

  // The requested view can only ever downgrade what's returned, never upgrade it —
  // lets an admin/client explicitly preview the ops copy without granting anyone
  // unauthorized a way to ask their way into the priced version.
  const requestedView = req.nextUrl.searchParams.get('view')
  const granted: Access = access !== 'ops' && requestedView === 'ops' ? 'ops' : access

  const payload = granted === 'ops' ? stripFinancials(itinerary) : itinerary
  return NextResponse.json({ itinerary: payload, access: granted })
}
