/**
 * Group Bookings — client-side helpers
 *
 * A booking reference (ARB-2026-50D4B6) can be shared by many
 * invited guests via the booking_guests junction table. These
 * helpers claim pending invitations after login and resolve the
 * set of booking references the signed-in user belongs to.
 */

import { supabase } from '@/utils/supabase/client'

const PENDING_INVITE_KEY = 'arb_pending_invite'

/** Stash an invite token before the guest authenticates (see /join/[token]). */
export function storePendingInvite(token: string) {
  try {
    localStorage.setItem(PENDING_INVITE_KEY, token)
  } catch {
    /* private browsing — the email-based claim still covers them */
  }
}

/**
 * Claim any invitations belonging to the signed-in user. Idempotent
 * and safe to run on every portal load:
 *  1. redeems a pending /join/{token} deep link, if one was stashed
 *  2. maps user_id onto guest rows whose email matches the JWT email
 */
export async function claimGuestInvitations(): Promise<void> {
  try {
    const pending = localStorage.getItem(PENDING_INVITE_KEY)
    if (pending) {
      await supabase.rpc('claim_guest_invitation', { invite: pending })
      localStorage.removeItem(PENDING_INVITE_KEY)
    }
  } catch {
    /* non-fatal — fall through to the email-based claim */
  }
  try {
    await supabase.rpc('claim_my_guest_invitations')
  } catch {
    /* non-fatal — RLS email matching still grants read access */
  }
}

/**
 * Booking references the signed-in user is a member of (as PRIMARY
 * or invited GUEST). RLS restricts booking_guests to bookings the
 * user belongs to, so a plain select is already scoped correctly.
 */
export async function fetchMyGuestBookingRefs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('booking_guests')
    .select('booking_id')
  if (error || !data) return []
  return Array.from(new Set<string>(data.map(r => r.booking_id).filter(Boolean)))
}

/**
 * Fetch every itinerary the user can see as a group member.
 * Complements the legacy owner-based queries in the portal.
 */
export async function fetchGuestItineraries(): Promise<unknown[]> {
  const refs = await fetchMyGuestBookingRefs()
  if (refs.length === 0) return []
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .in('booking_reference', refs)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data
}
