import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { isRateLimited, getClientIp, rateLimitResponse } from '@/utils/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  if (isRateLimited(`subscribe:${getClientIp(req)}`, 5, 10 * 60_000)) {
    return rateLimitResponse()
  }

  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Save to Supabase — silently skip if email already exists
    const { error: dbError } = await supabase
      .from('subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })

    if (dbError) {
      console.error('[/api/subscribe] DB error:', dbError)
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
    }

    // Send travel tips email via Resend
    await resend.emails.send({
      from:    'Arise Bhutan <noreply@arisebhutan.com>',
      to:      [email],
      replyTo: 'arisebhutan@gmail.com',
      subject: 'Your Bhutan Travel Tips — Arise Bhutan',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bhutan Travel Tips</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f6f2; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 6px solid #D97706;">

          <!-- Logo & Brand -->
          <tr>
            <td align="center" style="padding: 35px 40px 20px 40px;">
              <img src="https://gmueciaiagpsdlollyuh.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" alt="Arise Bhutan Logo" width="100" style="display: block; margin: 0 auto 15px; height: auto; border: 0;">
              <h1 style="font-size: 22px; font-weight: 800; color: #1c1917; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">Arise Bhutan</h1>
              <p style="font-size: 11px; color: #D97706; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Tours &amp; Travels</p>
            </td>
          </tr>

          <!-- Hero banner -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); padding: 30px 40px; text-align: center;">
                <tr>
                  <td>
                    <p style="font-size: 12px; color: #D97706; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 10px;">Your Bhutan Guide</p>
                    <h2 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 10px; line-height: 1.3;">10 Essential Tips for<br>Your Bhutan Journey</h2>
                    <p style="font-size: 14px; color: #a8a29e; margin: 0;">Everything you need to know before you go</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 30px 40px 10px;">
              <p style="font-size: 15px; color: #44403c; line-height: 1.7; margin: 0;">
                Kuzu zangpo la! Thank you for subscribing to Arise Bhutan travel tips. We have put together our team&apos;s insider knowledge to help you plan the perfect Bhutan journey.
              </p>
            </td>
          </tr>

          <!-- Tips -->
          <tr>
            <td style="padding: 20px 40px 30px;">

              <!-- Tip 1 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">1</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Visit in Spring or Autumn</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Spring (March–May) brings blooming rhododendrons and the famous Paro Tshechu festival. Autumn (September–November) offers crystal-clear Himalayan views and the grand Thimphu Tshechu. These are Bhutan&apos;s finest seasons.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 2 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">2</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Understand the SDF Fee</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Bhutan charges a Sustainable Development Fee (SDF) of USD $100 per person per night. This funds free healthcare, education, and conservation — it is not a tourist tax but Bhutan&apos;s philosophy in action. We include this in all our package quotes.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 3 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">3</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Tiger&apos;s Nest: Start Early</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Paro Taktsang (Tiger&apos;s Nest) is a 2–3 hour hike each way. Start by 7–8 AM to beat the crowds and midday heat. Horses are available halfway up. Carry water and wear sturdy shoes — the trail is rocky but the view is life-changing.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 4 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">4</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Book Festivals 3–6 Months Ahead</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Paro Tshechu (late March/April) and Thimphu Tshechu (September/October) are Bhutan&apos;s most spectacular festivals. Hotels fill up months in advance. If a festival is on your list, plan early — we can check exact 2026 dates for you.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 5 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">5</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Visa &amp; Entry Permits — We Handle It All</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">All foreign visitors need a Tourist Visa (except Indian, Bangladeshi, and Maldivian nationals who need only an entry permit). As your licensed DOT operator, Arise Bhutan processes the full visa application for you — nothing to do on your end.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 6 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">6</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Pack Layers — Altitude Changes Everything</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Paro sits at 2,200m and temperatures can swing 15°C in a day. Bring a warm fleece or jacket even in summer. For treks above 3,500m, pack thermal base layers, waterproofs, and a good pair of broken-in hiking boots.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 7 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">7</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Currency &amp; Cash</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">The Bhutanese Ngultrum (BTN) is pegged 1:1 with the Indian Rupee. USD is widely accepted. ATMs are available in Thimphu and Paro but can be unreliable — carry enough cash for smaller dzongs and villages. Credit cards are accepted at most hotels.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 8 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">8</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Respect the Culture</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Remove shoes before entering dzongs and temples. Dress modestly (covered shoulders and knees). Always walk clockwise around stupas and prayer wheels. Ask before photographing monks or ceremonies. A small respectful gesture goes a very long way in Bhutan.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 9 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">9</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Try the Food</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Ema Datshi (chilli and cheese stew) is Bhutan&apos;s national dish — it is fiery and delicious. Red rice, momos (dumplings), and butter tea are staples. Ask your guide to arrange a home-cooked meal with a local family for an unforgettable experience.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip 10 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 0;">
                <tr>
                  <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 28px; height: 28px; background-color: #D97706; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 800; color: #ffffff;">10</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 4px;">Slow Down &amp; Be Present</p>
                    <p style="font-size: 13px; color: #57534e; line-height: 1.6; margin: 0;">Bhutan is not a country you rush. The Gross National Happiness philosophy is real — you will feel it. Allow empty time in your itinerary for spontaneous conversations, monastery visits off the beaten path, or simply sitting by a river. The best moments are unplanned.</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding: 0 40px;"><hr style="border: 0; border-top: 1px solid #e5e5e0; margin: 0;"></td></tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #fffbeb;">
              <p style="font-size: 15px; font-weight: 700; color: #1c1917; margin: 0 0 8px;">Ready to plan your Bhutan journey?</p>
              <p style="font-size: 13px; color: #57534e; margin: 0 0 20px; line-height: 1.6;">Our team in Paro is ready to craft a fully private, personalised itinerary just for you — no cookie-cutter packages.</p>
              <a href="https://www.arisebhutan.com/contact" target="_blank"
                 style="background-color: #D97706; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(217,119,6,0.25);">
                Start Planning My Trip →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1c1917; padding: 26px 40px; text-align: center; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
              <p style="font-size: 14px; color: #ffffff; font-weight: 600; margin: 0 0 4px;">Warm Tashi Delek,</p>
              <p style="font-size: 13px; color: #a8a29e; margin: 0 0 15px; font-style: italic;">The Arise Bhutan Team</p>
              <p style="font-size: 11px; color: #78716c; margin: 0;">
                Nyamaizampa, Paro 12001, Bhutan &bull;
                <a href="mailto:arisebhutan@gmail.com" style="color: #78716c; text-decoration: none;">arisebhutan@gmail.com</a><br>
                WhatsApp: +975 77 319 405 &bull; +61 435 341 033
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
  } catch (err: any) {
    console.error('[/api/subscribe]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
