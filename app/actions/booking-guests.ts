'use server'

/**
 * Server Actions — Group Booking Guests
 *
 * Admin-only actions for managing the booking_guests junction table:
 * bulk-adding invited guest emails to a booking reference, removing
 * guests, changing roles, and sending branded invitation emails with
 * secure /join/{token} deep links.
 *
 * Auth follows the project's existing pattern: the browser client
 * passes its access token explicitly; we verify ADMIN role with the
 * service-role client before acting.
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const BOOKING_ID_RE = /^ARB-\d{4}-[A-Z0-9]{6}$/
const EMAIL_RE      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_GUESTS_PER_ADD = 25

export interface BookingGuest {
  id: string
  booking_id: string
  email: string
  user_id: string | null
  role: 'PRIMARY' | 'GUEST'
  invite_token: string
  invited_at: string
  claimed_at: string | null
}

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyAdmin(
  supabase: ReturnType<typeof adminClient>,
  token: string | null | undefined
): Promise<boolean> {
  if (!token) return false
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'ADMIN'
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arisebhutan.com'
}

/** Parse a pasted blob of emails (commas / semicolons / whitespace / newlines). */
function parseEmails(raw: string): { valid: string[]; invalid: string[] } {
  const parts = (raw || '')
    .split(/[\s,;]+/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const valid: string[] = []
  const invalid: string[] = []
  for (const p of parts) {
    if (EMAIL_RE.test(p)) {
      if (!valid.includes(p)) valid.push(p)
    } else {
      invalid.push(p)
    }
  }
  return { valid, invalid }
}

function inviteEmailHtml(params: {
  email: string
  bookingId: string
  tourName: string
  joinUrl: string
}) {
  const { bookingId, tourName, joinUrl } = params
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>You're invited — Arise Bhutan</title></head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f6f2; margin: 0; padding: 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; padding: 40px 20px;">
    <tr><td align="center">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 6px solid #D97706;">
        <tr>
          <td align="center" style="padding: 35px 40px 20px 40px;">
            <img src="https://gmueciaiagpsdlollyuh.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" alt="Arise Bhutan Logo" width="120" style="display: block; margin-bottom: 15px; height: auto; border: 0;">
            <h1 style="font-size: 24px; font-weight: 800; color: #1c1917; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">Arise Bhutan</h1>
            <p style="font-size: 11px; color: #D97706; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Tours &amp; Travels</p>
          </td>
        </tr>
        <tr><td style="padding: 0 40px;"><hr style="border: 0; border-top: 1px solid #e5e5e0; margin: 0;"></td></tr>
        <tr>
          <td align="center" style="padding: 28px 40px 0 40px;">
            <div style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 50px; padding: 6px 18px;">
              <p style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.12em; margin: 0;">✦ Group Trip Invitation</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 40px 40px 40px; text-align: left;">
            <p style="font-size: 16px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 15px;">Kuzu zangpo la,</p>
            <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin-bottom: 20px;">
              You've been added to a group booking with <strong>Arise Bhutan Tours &amp; Travels</strong>.
              Join your travel group's private portal to view the full itinerary, travel documents and trip updates.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin-bottom: 30px;">
              <tr><td style="padding: 18px 22px;">
                <p style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 8px;">Your trip</p>
                <p style="font-size: 15px; color: #1c1917; font-weight: 700; margin: 0 0 4px;">${tourName}</p>
                <p style="font-size: 12px; color: #78716c; font-family: monospace; margin: 0;">Booking reference: ${bookingId}</p>
              </td></tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center" style="padding-bottom: 10px;">
                <a href="${joinUrl}" target="_blank" style="background-color: #D97706; color: #ffffff; padding: 14px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(217,119,6,0.25);">
                  View My Trip →
                </a>
              </td></tr>
            </table>
            <p style="font-size: 12px; color: #a8a29e; text-align: center; margin-top: 16px; margin-bottom: 0;">
              Or copy this link: <a href="${joinUrl}" style="color: #D97706; text-decoration: none;">${joinUrl}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #1c1917; padding: 28px 40px; text-align: center;">
            <p style="font-size: 14px; color: #ffffff; font-weight: 600; margin: 0 0 4px 0;">Warm Tashi Delek,</p>
            <p style="font-size: 13px; color: #a8a29e; margin: 0; font-style: italic;">Arise Bhutan Support Team</p>
            <p style="font-size: 10px; color: #57534e; margin-top: 12px; margin-bottom: 0;">
              You received this because you were added to a group booking.<br>If this was unexpected, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendInviteEmail(guest: { email: string; invite_token: string }, bookingId: string, tourName: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from:    'Arise Bhutan <noreply@arisebhutan.com>',
    to:      [guest.email],
    replyTo: 'arisebhutan@gmail.com',
    subject: `You're invited to a Bhutan group trip — ${bookingId}`,
    html: inviteEmailHtml({
      email: guest.email,
      bookingId,
      tourName,
      joinUrl: `${siteUrl()}/join/${guest.invite_token}`,
    }),
  })
}

/**
 * Bulk-add invited guest emails to a booking.
 * Accepts a raw pasted string; parses, dedupes and validates.
 * Backfills user_id for guests who already have an account, and
 * (optionally) sends each NEW guest a branded /join/{token} email.
 */
export async function addBookingGuests(params: {
  accessToken: string
  bookingId: string
  emails: string
  sendEmails?: boolean
}): Promise<ActionResult<{ guests: BookingGuest[]; added: number; invalid: string[]; emailErrors: string[] }>> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }

    const bookingId = (params.bookingId || '').trim().toUpperCase()
    if (!BOOKING_ID_RE.test(bookingId)) {
      return { success: false, error: 'Invalid booking ID. Expected format: ARB-2026-50D4B6' }
    }

    const { valid, invalid } = parseEmails(params.emails)
    if (valid.length === 0) {
      return { success: false, error: 'No valid email addresses found.' }
    }
    if (valid.length > MAX_GUESTS_PER_ADD) {
      return { success: false, error: `Too many emails — add at most ${MAX_GUESTS_PER_ADD} at a time.` }
    }

    // Booking must exist (booking_guests has a hard FK on it)
    const { data: itinerary } = await supabase
      .from('itineraries')
      .select('booking_reference, tour_summary')
      .eq('booking_reference', bookingId)
      .maybeSingle()
    if (!itinerary) {
      return { success: false, error: `No itinerary found for ${bookingId}.` }
    }
    const tourName = itinerary.tour_summary?.tour_package || 'Your Bhutan Journey'

    // Which of these emails are genuinely new for this booking?
    const { data: existingRows } = await supabase
      .from('booking_guests')
      .select('email')
      .eq('booking_id', bookingId)
      .in('email', valid)
    const existingEmails = new Set((existingRows || []).map(r => r.email))
    const newEmails = valid.filter(e => !existingEmails.has(e))

    if (newEmails.length > 0) {
      // Backfill user_id for guests who already have an account
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('email', newEmails)
      const profileByEmail = new Map(
        (profiles || [])
          .filter(p => p.email)
          .map(p => [String(p.email).toLowerCase(), p.id])
      )

      const rows = newEmails.map(email => ({
        booking_id: bookingId,
        email,
        role: 'GUEST',
        user_id: profileByEmail.get(email) ?? null,
        claimed_at: profileByEmail.has(email) ? new Date().toISOString() : null,
      }))

      const { error: insertError } = await supabase
        .from('booking_guests')
        .upsert(rows, { onConflict: 'booking_id,email', ignoreDuplicates: true })
      if (insertError) {
        return { success: false, error: `Could not add guests: ${insertError.message}` }
      }
    }

    // Re-read the full guest list (tokens included) for the response
    const { data: guests, error: listError } = await supabase
      .from('booking_guests')
      .select('*')
      .eq('booking_id', bookingId)
      .order('invited_at', { ascending: true })
    if (listError) {
      return { success: false, error: listError.message }
    }

    // Send invitation emails to the newly added guests
    const emailErrors: string[] = []
    if (params.sendEmails !== false && newEmails.length > 0) {
      const newGuests = (guests || []).filter(g => newEmails.includes(g.email))
      for (const g of newGuests) {
        try {
          await sendInviteEmail(g, bookingId, tourName)
        } catch {
          emailErrors.push(g.email)
        }
      }
    }

    return {
      success: true,
      data: {
        guests: (guests || []) as BookingGuest[],
        added: newEmails.length,
        invalid,
        emailErrors,
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error while adding guests.' }
  }
}

/** List all guests of a booking (admin view, tokens included). */
export async function listBookingGuests(params: {
  accessToken: string
  bookingId: string
}): Promise<ActionResult<{ guests: BookingGuest[] }>> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }
    const { data, error } = await supabase
      .from('booking_guests')
      .select('*')
      .eq('booking_id', (params.bookingId || '').trim().toUpperCase())
      .order('invited_at', { ascending: true })
    if (error) return { success: false, error: error.message }
    return { success: true, data: { guests: (data || []) as BookingGuest[] } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error while loading guests.' }
  }
}

/** Remove one guest from a booking. */
export async function removeBookingGuest(params: {
  accessToken: string
  guestId: string
}): Promise<ActionResult> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }
    const { error } = await supabase
      .from('booking_guests')
      .delete()
      .eq('id', params.guestId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error while removing guest.' }
  }
}

/** Toggle a guest's role between PRIMARY and GUEST. */
export async function updateBookingGuestRole(params: {
  accessToken: string
  guestId: string
  role: 'PRIMARY' | 'GUEST'
}): Promise<ActionResult> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }
    if (params.role !== 'PRIMARY' && params.role !== 'GUEST') {
      return { success: false, error: 'Invalid role.' }
    }
    const { error } = await supabase
      .from('booking_guests')
      .update({ role: params.role })
      .eq('id', params.guestId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error while updating role.' }
  }
}

/** Re-send the invitation email for one guest. */
export async function resendGuestInvite(params: {
  accessToken: string
  guestId: string
}): Promise<ActionResult> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }
    const { data: guest, error } = await supabase
      .from('booking_guests')
      .select('email, invite_token, booking_id')
      .eq('id', params.guestId)
      .maybeSingle()
    if (error || !guest) return { success: false, error: 'Guest not found.' }

    const { data: itinerary } = await supabase
      .from('itineraries')
      .select('tour_summary')
      .eq('booking_reference', guest.booking_id)
      .maybeSingle()

    await sendInviteEmail(
      guest,
      guest.booking_id,
      itinerary?.tour_summary?.tour_package || 'Your Bhutan Journey'
    )
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Could not send the invitation email.' }
  }
}
