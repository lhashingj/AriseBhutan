import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { isRateLimited, getClientIp, rateLimitResponse } from '@/utils/rateLimit'

/**
 * Notifies a client by email when their itinerary is marked Quoted or
 * Confirmed by an admin — closes the gap where a client would otherwise
 * only find out by checking the portal themselves.
 */

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const COPY: Record<string, { subject: string; heading: string; body: string }> = {
  quoted: {
    subject: 'Your Bhutan itinerary is ready to view',
    heading: 'Your Personalised Quote is Ready',
    body: 'Your Arise Bhutan specialist has finished pricing your trip. Your itinerary, full cost breakdown, and payment details are ready to view.',
  },
  confirmed: {
    subject: 'Your Bhutan booking is confirmed!',
    heading: 'Booking Confirmed — Tashi Delek!',
    body: 'Your booking is now confirmed. Your final itinerary, travel documents, and payment details are ready in your voucher.',
  },
}

export async function POST(req: NextRequest) {
  if (isRateLimited(`notify-status:${getClientIp(req)}`, 30, 10 * 60_000)) {
    return rateLimitResponse()
  }

  // ── 1. Authenticate admin ──────────────────────────────────
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ── 2. Parse + validate body ────────────────────────────────
  const { bookingReference, status } = await req.json()
  const copy = COPY[status]
  if (!bookingReference || !copy) {
    return NextResponse.json({ error: 'Missing or invalid bookingReference/status' }, { status: 400 })
  }

  // ── 3. Look up the itinerary for guest name/email/tour ─────
  const { data: itinerary, error: fetchErr } = await supabaseAdmin
    .from('itineraries')
    .select('client_info, tour_summary')
    .eq('booking_reference', bookingReference)
    .single()

  if (fetchErr || !itinerary) {
    return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
  }

  const email = itinerary.client_info?.email
  if (!email) {
    return NextResponse.json({ error: 'No client email on file for this itinerary' }, { status: 400 })
  }

  const firstName = (itinerary.client_info?.guest_name || '').split(' ')[0] || 'Traveller'
  const tourName  = itinerary.tour_summary?.tour_package || 'Your Bhutan Journey'
  const voucherUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arisebhutan.com'}/itinerary/${bookingReference}`

  // ── 4. Send email ────────────────────────────────────────────
  try {
    await resend.emails.send({
      from:    'Arise Bhutan <noreply@arisebhutan.com>',
      to:      [email],
      replyTo: 'arisebhutan@gmail.com',
      subject: copy.subject,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${copy.subject}</title></head>
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
          <td style="padding: 28px 40px 40px 40px; text-align: left;">
            <p style="font-size: 16px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 15px;">Kuzu zangpo la, ${firstName},</p>
            <h2 style="font-size: 19px; color: #92400e; margin: 0 0 14px;">${copy.heading}</h2>
            <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin-bottom: 24px;">${copy.body}</p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin-bottom: 30px;">
              <tr><td style="padding: 18px 22px;">
                <p style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 6px;">Trip</p>
                <p style="font-size: 15px; color: #1c1917; font-weight: 700; margin: 0 0 4px;">${tourName}</p>
                <p style="font-size: 12px; color: #78716c; font-family: monospace; margin: 0;">${bookingReference}</p>
              </td></tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center" style="padding-bottom: 10px;">
                <a href="${voucherUrl}" target="_blank" style="background-color: #D97706; color: #ffffff; padding: 14px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(217,119,6,0.25);">
                  View My Itinerary &amp; Voucher →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color: #1c1917; padding: 28px 40px; text-align: center;">
            <p style="font-size: 14px; color: #ffffff; font-weight: 600; margin: 0 0 4px 0;">Warm Tashi Delek,</p>
            <p style="font-size: 13px; color: #a8a29e; margin: 0; font-style: italic;">Arise Bhutan Support Team</p>
            <p style="font-size: 11px; color: #78716c; margin-top: 15px; margin-bottom: 0;">
              +975 77 319 405 &bull; arisebhutan@gmail.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/notify-itinerary-status]', err)
    return NextResponse.json({ error: 'Failed to send notification email' }, { status: 500 })
  }
}
