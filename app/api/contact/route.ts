import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, tourInterest, travelDate, groupSize, interests, message } = body

    const { error } = await resend.emails.send({
      from: 'Arise Bhutan Enquiries <noreply@arisebhutan.com>',
      to:   ['arisebhutan@gmail.com'],
      replyTo: email,
      subject: `New Enquiry from ${name} — ${tourInterest || 'General Inquiry'}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
          <div style="background: #78350f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fef3c7; margin: 0; font-size: 22px;">New Travel Enquiry</h1>
            <p style="color: #fde68a; margin: 4px 0 0; font-size: 14px;">Arise Bhutan Tours &amp; Travel</p>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-top: none; padding: 24px 32px; border-radius: 0 0 12px 12px;">

            <h2 style="color: #78350f; font-size: 16px; margin: 0 0 16px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #78716c; width: 140px;">Name</td><td style="padding: 6px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 6px 0; color: #78716c;">Email</td><td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #b45309;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 6px 0; color: #78716c;">Phone / WhatsApp</td><td style="padding: 6px 0;">${phone}</td></tr>` : ''}
              <tr><td style="padding: 6px 0; color: #78716c;">Country</td><td style="padding: 6px 0;">${country}</td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0;" />

            <h2 style="color: #78350f; font-size: 16px; margin: 0 0 16px;">Travel Details</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${tourInterest ? `<tr><td style="padding: 6px 0; color: #78716c; width: 140px;">Tour Interest</td><td style="padding: 6px 0;">${tourInterest}</td></tr>` : ''}
              ${travelDate  ? `<tr><td style="padding: 6px 0; color: #78716c;">Travel Date</td><td style="padding: 6px 0;">${travelDate}</td></tr>` : ''}
              ${groupSize   ? `<tr><td style="padding: 6px 0; color: #78716c;">Group Size</td><td style="padding: 6px 0;">${groupSize}</td></tr>` : ''}
            </table>

            ${interests?.length ? `
            <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0;" />
            <h2 style="color: #78350f; font-size: 16px; margin: 0 0 12px;">Special Interests</h2>
            <p style="font-size: 14px; margin: 0;">${interests.join(' &bull; ')}</p>
            ` : ''}

            ${message ? `
            <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0;" />
            <h2 style="color: #78350f; font-size: 16px; margin: 0 0 12px;">Additional Notes</h2>
            <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            ` : ''}

            <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0;" />
            <p style="font-size: 12px; color: #a8a29e; margin: 0;">
              Reply directly to this email to respond to ${name} at ${email}.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
