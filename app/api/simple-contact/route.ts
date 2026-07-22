import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isRateLimited, getClientIp, rateLimitResponse } from '@/utils/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  if (isRateLimited(`simple-contact:${getClientIp(req)}`, 5, 10 * 60_000)) {
    return rateLimitResponse()
  }

  try {
    const { name, email, phone, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await resend.emails.send({
      from:    'Arise Bhutan Contact <noreply@arisebhutan.com>',
      to:      ['arisebhutan@gmail.com'],
      replyTo: email,
      subject: `New Contact Message — ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
          <div style="background: #78350f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fef3c7; margin: 0; font-size: 20px;">New Contact Message</h1>
            <p style="color: #fde68a; margin: 6px 0 0; font-size: 13px;">Arise Bhutan Tours &amp; Travels — arisebhutan.com</p>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-top: none; padding: 24px 32px; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #78716c; width: 120px; vertical-align: top;">Name</td>
                <td style="padding: 6px 0; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #78716c; vertical-align: top;">Email</td>
                <td style="padding: 6px 0;">
                  <a href="mailto:${email}" style="color: #b45309;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 6px 0; color: #78716c; vertical-align: top;">Mobile</td>
                <td style="padding: 6px 0;">${phone}</td>
              </tr>` : ''}
            </table>
            <hr style="border: none; border-top: 1px solid #fde68a; margin: 0 0 20px;" />
            <h2 style="color: #78350f; font-size: 15px; margin: 0 0 10px;">Message</h2>
            <p style="font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap; color: #292524;">${message}</p>
            <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0 12px;" />
            <p style="font-size: 12px; color: #a8a29e; margin: 0;">
              Reply directly to this email to respond to ${name} at ${email}.
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Simple contact error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
