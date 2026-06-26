import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const firstName = name?.split(' ')[0] || 'Traveller'

    await resend.emails.send({
      from:    'Arise Bhutan <noreply@arisebhutan.com>',
      to:      [email],
      replyTo: 'arisebhutan@gmail.com',
      subject: `Kuzu zangpo la, ${firstName} — Welcome to Arise Bhutan`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Arise Bhutan</title>
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

          <!-- Body -->
          <tr>
            <td style="padding: 30px 40px 40px 40px; text-align: left;">
              <p style="font-size: 16px; font-weight: 700; color: #1c1917; margin-top: 0; margin-bottom: 15px;">
                Kuzu zangpo la, ${name || 'Traveller'},
              </p>
              <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin-bottom: 20px;">
                Welcome to Arise Bhutan — your private gateway to the Kingdom of Happiness. We are delighted to have you with us.
              </p>
              <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin-bottom: 20px;">
                Your personal travel portal is now ready. From here you can build a custom day-by-day itinerary, explore our curated Bhutan packages, and connect directly with our specialist team.
              </p>

              <!-- What you can do -->
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
                    <a href="https://www.arisebhutan.com/client/dashboard" target="_blank"
                       style="background-color: #D97706; color: #ffffff; padding: 14px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(217,119,6,0.25);">
                      Go to My Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
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
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
