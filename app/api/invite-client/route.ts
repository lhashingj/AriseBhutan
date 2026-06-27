import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Verify admin session
    const auth = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(auth)
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const firstName = name?.split(' ')[0] || 'Traveller'
    const registerUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arisebhutan.com'}/register`

    await resend.emails.send({
      from:    'Arise Bhutan <noreply@arisebhutan.com>',
      to:      [email],
      replyTo: 'arisebhutan@gmail.com',
      subject: `You're invited to Arise Bhutan — Your Bhutan journey awaits`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>You're Invited — Arise Bhutan</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f6f2; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 6px solid #D97706;">

          <!-- Logo & Brand -->
          <tr>
            <td align="center" style="padding: 35px 40px 20px 40px;">
              <img src="https://gmueciaiagpsdlollyuh.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" alt="Arise Bhutan Logo" width="120" style="display: block; margin-bottom: 15px; height: auto; border: 0;">
              <h1 style="font-size: 24px; font-weight: 800; color: #1c1917; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">Arise Bhutan</h1>
              <p style="font-size: 11px; color: #D97706; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Tours &amp; Travels</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding: 0 40px;"><hr style="border: 0; border-top: 1px solid #e5e5e0; margin: 0;"></td></tr>

          <!-- Invitation badge -->
          <tr>
            <td align="center" style="padding: 28px 40px 0 40px;">
              <div style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 50px; padding: 6px 18px;">
                <p style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.12em; margin: 0;">✦ Personal Invitation</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 40px 40px 40px; text-align: left;">
              <p style="font-size: 16px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 15px;">
                Kuzu zangpo la, ${name ? name : firstName},
              </p>
              <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin-bottom: 20px;">
                You have been personally invited by the <strong>Arise Bhutan</strong> team to join our private travel portal — your exclusive gateway to the Kingdom of Happiness.
              </p>
              <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin-bottom: 24px;">
                Create your free account in seconds and we'll get started planning your dream journey to Bhutan together.
              </p>

              <!-- What you get -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <p style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 12px;">Your portal includes</p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #44403c;">
                      <tr><td style="padding: 5px 0; width: 22px; color: #D97706;">✦</td><td style="padding: 5px 0;">Custom day-by-day itinerary builder</td></tr>
                      <tr><td style="padding: 5px 0; color: #D97706;">✦</td><td style="padding: 5px 0;">Browse &amp; customise curated tour packages</td></tr>
                      <tr><td style="padding: 5px 0; color: #D97706;">✦</td><td style="padding: 5px 0;">Download your personalised travel voucher</td></tr>
                      <tr><td style="padding: 5px 0; color: #D97706;">✦</td><td style="padding: 5px 0;">Direct access to our Bhutan travel specialists</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <a href="${registerUrl}" target="_blank"
                       style="background-color: #D97706; color: #ffffff; padding: 14px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(217,119,6,0.25);">
                      Create My Free Account →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #a8a29e; text-align: center; margin-top: 16px; margin-bottom: 0;">
                Or copy this link: <a href="${registerUrl}" style="color: #D97706; text-decoration: none;">${registerUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1c1917; padding: 28px 40px; text-align: center; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
              <p style="font-size: 14px; color: #ffffff; font-weight: 600; margin: 0 0 4px 0;">Warm Tashi Delek,</p>
              <p style="font-size: 13px; color: #a8a29e; margin: 0; font-style: italic;">Arise Bhutan Support Team</p>
              <p style="font-size: 11px; color: #78716c; margin-top: 15px; margin-bottom: 0;">
                Nyamaizampa, Paro, Bhutan &bull;
                <a href="mailto:arisebhutan@gmail.com" style="color: #78716c; text-decoration: none;">arisebhutan@gmail.com</a>
              </p>
              <p style="font-size: 10px; color: #57534e; margin-top: 12px; margin-bottom: 0;">
                You received this because you were personally invited by the Arise Bhutan team.<br>If this was unexpected, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Invite email error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
