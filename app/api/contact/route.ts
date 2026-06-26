import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { tours } from '@/data/tours'

const resend = new Resend(process.env.RESEND_API_KEY)

// Anon client — used for itinerary_requests (public insert policy)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Service-role client — bypasses RLS for the auto-created itineraries row
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SITE_URL = 'https://www.arisebhutan.com'

// ── Tour itinerary helpers ────────────────────────────────────────────────────

type ActivityItem = { name: string; location: string; duration_hours: number; category: string }

function findTourByInterest(tourInterest: string | undefined) {
  if (!tourInterest) return null
  const lower = tourInterest.toLowerCase()
  return tours.find(t => lower.includes(t.title.toLowerCase())) ?? null
}

function mealsToCSV(meals: string): string {
  const codes: string[] = []
  if (/breakfast/i.test(meals)) codes.push('B')
  if (/lunch/i.test(meals))    codes.push('L')
  if (/dinner/i.test(meals))   codes.push('D')
  return codes.join(',')
}

function buildDayByDay(
  tour: ReturnType<typeof findTourByInterest>,
  parsedNights: number,
  actList: ActivityItem[],
  depDate: Date | null,
) {
  if (tour && tour.itinerary.length > 0) {
    const numDays = tour.itinerary.length

    // Randomly shuffle & inject selected activities into middle days (skip first + last)
    const shuffled = [...actList].sort(() => Math.random() - 0.5)
    const injected: Record<number, ActivityItem[]> = {}
    for (let i = 0; i < numDays; i++) injected[i] = []

    if (shuffled.length > 0 && numDays > 0) {
      const middleStart = numDays > 2 ? 1 : 0
      const middleCount = Math.max(1, numDays > 2 ? numDays - 2 : numDays)
      shuffled.forEach((act, i) => {
        injected[middleStart + (i % middleCount)].push(act)
      })
    }

    return tour.itinerary.map((day, i) => {
      const date = depDate
        ? new Date(depDate.getTime() + i * 86400000).toISOString().split('T')[0]
        : null

      const baseProgramme   = day.activities.join(' · ')
      const injectedActs    = injected[i] ?? []
      const injectedText    = injectedActs.map(a => `${a.name} · ${a.location} (${a.duration_hours}h)`).join('\n')
      const programme       = [baseProgramme, injectedText].filter(Boolean).join('\n')

      return {
        day: i + 1,
        date,
        programme,
        accommodation_name: day.accommodation || '',
        meals: mealsToCSV(day.meals),
      }
    })
  }

  // Fallback: distribute activities round-robin when no tour match
  return Array.from({ length: parsedNights }, (_, i) => {
    const dayDate = depDate
      ? new Date(depDate.getTime() + i * 86400000).toISOString().split('T')[0]
      : null
    const dayActivities = actList.filter((_, ai) => ai % parsedNights === i)
    const programme     = dayActivities.map(a => `${a.name} · ${a.location} (${a.duration_hours}h)`).join('\n')
    const meals         = i === 0 ? 'L,D' : i === parsedNights - 1 ? 'B,L' : 'B,D'
    return { day: i + 1, date: dayDate, programme, accommodation_name: '', meals }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, phone, country,
      tourInterest, travelDate, groupSize,
      nights, hotelTier,
      interests, message,
      activitiesSelected,
    } = body

    const parsedNights = typeof nights === 'number' ? nights : (parseInt(nights) || 5)
    const parsedGuests = parseInt((groupSize || '2').split(/[\s–]/)[0]) || 2
    const normalizedTier = (['3-Star', '4-Star', '5-Star Luxury'] as const)
      .includes(hotelTier) ? hotelTier : '4-Star'

    // ── Build day_by_day from nights + selected activities ────────────
    const actList: ActivityItem[] = activitiesSelected ?? []

    const depDate  = travelDate ? new Date(travelDate) : null
    const matchedTour = findTourByInterest(tourInterest)

    const day_by_day = buildDayByDay(matchedTour, parsedNights, actList, depDate)

    // ── 1. Create itineraries row (enquiry_pending, all pricing zeroed) ──
    const { data: itinRow, error: itinErr } = await supabaseAdmin
      .from('itineraries')
      .insert({
        status: 'enquiry_pending',
        client_info: {
          guest_name:  name,
          email:       email,
          phone:       phone    || null,
          nationality: country,
        },
        tour_summary: {
          tour_package:    tourInterest || 'Custom Bhutan Itinerary',
          tour_title:      matchedTour?.title  || tourInterest || 'Custom Bhutan Itinerary',
          category:        matchedTour?.categoryLabel || (interests?.length ? interests[0] : 'Custom'),
          duration_nights: matchedTour ? matchedTour.nights : parsedNights,
          duration_days:   matchedTour ? matchedTour.days   : parsedNights + 1,
          group_size:      parsedGuests,
          hotel_tier:      normalizedTier,
          departure_date:  travelDate || null,
          return_date:     null,
          highlights:      matchedTour?.highlights?.slice(0, 5) ?? [],
          interests:            interests            ?? [],
          activities_selected:  activitiesSelected   ?? [],
          message:              message              || null,
          guide_name:           null,
          vehicle_details:      null,
        },
        flights:    [],
        day_by_day,
        pricing: {
          package_rate_per_pax: 0,
          sdf_total:            0,
          service_fee:          0,
          subtotal:             0,
          gst:                  0,
          grand_total:          0,
          equivalent_inr:       0,
        },
      })
      .select('booking_reference')
      .single()

    if (itinErr) console.error('itineraries insert error:', itinErr)

    const bookingRef  = itinRow?.booking_reference ?? null
    const voucherUrl  = bookingRef ? `${SITE_URL}/itinerary/${bookingRef}` : null

    // ── 2. Save to itinerary_requests (enquiry log) ──────────────────
    const { error: reqErr } = await supabase.from('itinerary_requests').insert({
      status:               'enquiry_pending',
      nights:               parsedNights,
      guests:               parsedGuests,
      tier:                 normalizedTier,
      selected_activities:  interests ?? [],
      client_name:          name,
      client_email:         email,
      client_phone:         phone        || null,
      client_country:       country,
      tour_interest:        tourInterest || null,
      travel_date:          travelDate   || null,
      message:              message      || null,
      interests:            interests    ?? [],
    })
    if (reqErr) console.error('itinerary_requests insert error:', reqErr)

    // ── 3. Admin notification email (no pricing rows) ─────────────────
    await resend.emails.send({
      from:    'Arise Bhutan Enquiries <noreply@arisebhutan.com>',
      to:      ['arisebhutan@gmail.com'],
      replyTo: email,
      subject: `New Enquiry${bookingRef ? ` · ${bookingRef}` : ''} — ${name} · ${tourInterest || 'Custom Trip'}`,
      html:    buildAdminEmail({ name, email, phone, country, tourInterest, travelDate, parsedNights, groupSize, normalizedTier, interests, message, bookingRef, voucherUrl }),
    }).catch(err => console.error('Admin email error:', err))

    // ── 4. Guest confirmation email ───────────────────────────────────
    if (bookingRef) {
      await resend.emails.send({
        from:    'Arise Bhutan <noreply@arisebhutan.com>',
        to:      [email],
        subject: `Enquiry Received — Reference ${bookingRef} | Arise Bhutan`,
        html:    buildGuestEmail({ name, tourInterest, parsedNights, groupSize, normalizedTier, interests, bookingRef, voucherUrl }),
      }).catch(err => console.error('Guest email error:', err))
    }

    return NextResponse.json({ success: true, booking_reference: bookingRef })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ── Admin notification (full travel details, zero pricing rows) ───────
function buildAdminEmail({ name, email, phone, country, tourInterest, travelDate, parsedNights, groupSize, normalizedTier, interests, message, bookingRef, voucherUrl }: {
  name: string; email: string; phone?: string; country: string
  tourInterest?: string; travelDate?: string; parsedNights: number
  groupSize?: string; normalizedTier: string; interests?: string[]
  message?: string; bookingRef: string | null; voucherUrl: string | null
}) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
      <div style="background: #78350f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fef3c7; margin: 0; font-size: 22px;">New Travel Enquiry</h1>
        <p style="color: #fde68a; margin: 6px 0 0; font-size: 14px;">
          Arise Bhutan Tours &amp; Travel${bookingRef ? ` &mdash; <span style="font-family: monospace; font-weight: bold;">${bookingRef}</span>` : ''}
        </p>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-top: none; padding: 24px 32px; border-radius: 0 0 12px 12px;">

        ${voucherUrl ? `
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 13px; color: #78350f;">
            <strong>Pending Voucher:</strong>
            <a href="${voucherUrl}" style="color: #b45309; margin-left: 6px;">${voucherUrl}</a>
          </p>
        </div>
        ` : ''}

        <h2 style="color: #78350f; font-size: 16px; margin: 0 0 16px;">Contact Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #78716c; width: 150px;">Name</td><td style="padding: 6px 0; font-weight: bold;">${name}</td></tr>
          <tr><td style="padding: 6px 0; color: #78716c;">Email</td><td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #b45309;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding: 6px 0; color: #78716c;">Phone / WhatsApp</td><td style="padding: 6px 0;">${phone}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; color: #78716c;">Country</td><td style="padding: 6px 0;">${country}</td></tr>
        </table>

        <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0;" />

        <h2 style="color: #78350f; font-size: 16px; margin: 0 0 16px;">Trip Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${tourInterest ? `<tr><td style="padding: 6px 0; color: #78716c; width: 150px;">Tour Interest</td><td style="padding: 6px 0; font-weight: bold;">${tourInterest}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; color: #78716c;">Duration</td><td style="padding: 6px 0; font-weight: bold;">${parsedNights} nights</td></tr>
          <tr><td style="padding: 6px 0; color: #78716c;">Group Size</td><td style="padding: 6px 0;">${groupSize || '—'}</td></tr>
          <tr><td style="padding: 6px 0; color: #78716c;">Accommodation Tier</td><td style="padding: 6px 0;">${normalizedTier}</td></tr>
          ${travelDate ? `<tr><td style="padding: 6px 0; color: #78716c;">Preferred Date</td><td style="padding: 6px 0;">${travelDate}</td></tr>` : ''}
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
        <p style="font-size: 13px; color: #92400e; margin: 0 0 4px; font-weight: bold;">
          Status: Enquiry Pending — Pricing Under Concierge Review
        </p>
        <p style="font-size: 12px; color: #a8a29e; margin: 4px 0 0;">
          Reply directly to this email to contact ${name} at ${email}.
        </p>
      </div>
    </div>
  `
}

// ── Guest confirmation (no pricing, includes reference + voucher link) ─
function buildGuestEmail({ name, tourInterest, parsedNights, groupSize, normalizedTier, interests, bookingRef, voucherUrl }: {
  name: string; tourInterest?: string; parsedNights: number
  groupSize?: string; normalizedTier: string; interests?: string[]
  bookingRef: string; voucherUrl: string | null
}) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
      <div style="background: #78350f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fef3c7; margin: 0; font-size: 22px;">Enquiry Received</h1>
        <p style="color: #fde68a; margin: 6px 0 0; font-size: 14px;">Arise Bhutan Tours &amp; Travel</p>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-top: none; padding: 24px 32px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 15px; margin: 0 0 18px;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.75; color: #44403c; margin: 0 0 20px;">
          Thank you for reaching out to Arise Bhutan. We have received your travel enquiry and a dedicated specialist
          will personally review your preferences and respond within <strong>24 hours</strong> with a bespoke
          itinerary and personalised quote.
        </p>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 18px 22px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 6px; font-size: 11px; color: #78716c; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">Your Booking Reference</p>
          <p style="margin: 0; font-size: 26px; font-weight: bold; font-family: monospace; color: #78350f; letter-spacing: 0.05em;">${bookingRef}</p>
          ${voucherUrl ? `
          <p style="margin: 10px 0 0; font-size: 12px; color: #92400e;">
            Track your enquiry:
            <a href="${voucherUrl}" style="color: #b45309; font-weight: bold;">${voucherUrl}</a>
          </p>
          ` : ''}
        </div>

        <h2 style="color: #78350f; font-size: 15px; margin: 0 0 14px;">Your Enquiry Summary</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${tourInterest ? `<tr><td style="padding: 5px 0; color: #78716c; width: 150px;">Tour Interest</td><td style="padding: 5px 0; font-weight: bold;">${tourInterest}</td></tr>` : ''}
          <tr><td style="padding: 5px 0; color: #78716c;">Duration</td><td style="padding: 5px 0;">${parsedNights} nights</td></tr>
          <tr><td style="padding: 5px 0; color: #78716c;">Group Size</td><td style="padding: 5px 0;">${groupSize || '—'}</td></tr>
          <tr><td style="padding: 5px 0; color: #78716c;">Accommodation</td><td style="padding: 5px 0;">${normalizedTier}</td></tr>
        </table>

        ${interests?.length ? `
        <p style="font-size: 13px; color: #78716c; margin: 16px 0 0;">
          Special Interests: <strong style="color: #44403c;">${interests.join(' · ')}</strong>
        </p>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #fde68a; margin: 24px 0;" />

        <p style="font-size: 13px; color: #78716c; margin: 0;">
          Your bespoke package pricing will be shared once our concierge desk completes its review.
          No payment or commitment is required at this stage.
        </p>
        <p style="font-size: 12px; color: #a8a29e; margin: 12px 0 0;">
          Questions? Email us at
          <a href="mailto:arisebhutan@gmail.com" style="color: #b45309;">arisebhutan@gmail.com</a>
          or WhatsApp <strong>+975 77 319 405</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #fde68a; margin: 20px 0;" />
        <p style="font-size: 11px; color: #a8a29e; margin: 0; text-align: center; font-style: italic;">
          &ldquo;To Arise is to Awaken.&rdquo; — Arise Bhutan Tours &amp; Travels &middot; Licensed by Tourism Council of Bhutan
        </p>
      </div>
    </div>
  `
}
