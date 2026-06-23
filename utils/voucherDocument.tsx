/**
 * Server-safe React PDF document for booking vouchers.
 * Rendered server-side via @react-pdf/renderer — no browser APIs.
 */

import {
  Document, Page, View, Text, Image, StyleSheet,
} from '@react-pdf/renderer'
import { computePricing } from './pdfGenerator'

const s = StyleSheet.create({
  page:            { fontFamily: 'Helvetica', fontSize: 10, color: '#1c1917', backgroundColor: '#ffffff' },

  // ── Header ──
  header:          { backgroundColor: '#92400e', padding: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo:            { width: 44, height: 44, borderRadius: 22 },
  brandName:       { fontFamily: 'Helvetica-Bold', fontSize: 18, color: '#fef3c7', marginBottom: 2 },
  brandSub:        { fontSize: 8, color: '#fde68a', letterSpacing: 1.5 },
  refBox:          { borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 8, padding: 10, alignItems: 'center', minWidth: 140 },
  refLabel:        { fontSize: 7.5, color: 'rgba(255,255,255,0.65)', marginBottom: 3, letterSpacing: 1 },
  refValue:        { fontFamily: 'Helvetica-Bold', fontSize: 14, color: '#ffffff', letterSpacing: 1.5 },
  statusBadge:     { marginTop: 6, backgroundColor: '#16a34a', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:      { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#ffffff', letterSpacing: 0.8 },

  // ── Body ──
  body:            { padding: '14 22' },

  // ── Section heading ──
  sectionRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 7, marginTop: 12 },
  sectionLine:     { flex: 1, height: 1, backgroundColor: '#fde68a' },
  sectionLabel:    { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#92400e', letterSpacing: 1.5, marginHorizontal: 8, textTransform: 'uppercase' },

  // ── Two-column card grid ──
  grid2:           { flexDirection: 'row', gap: 10, marginBottom: 8 },
  card:            { flex: 1, borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 6, overflow: 'hidden' },
  cardHeader:      { backgroundColor: '#1c1917', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderAmber: { backgroundColor: '#b45309', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderBlue:  { backgroundColor: '#1e40af', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderGreen: { backgroundColor: '#166534', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderRed:   { backgroundColor: '#991b1b', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderText:  { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#ffffff', letterSpacing: 1.2, textTransform: 'uppercase' },
  infoRow:         { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 3 },
  infoLabel:       { width: 92, color: '#78716c', fontSize: 9 },
  infoValue:       { flex: 1, color: '#1c1917', fontFamily: 'Helvetica-Bold', fontSize: 9 },

  // ── Table ──
  table:           { borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 6, overflow: 'hidden', marginBottom: 4 },
  thead:           { flexDirection: 'row', backgroundColor: '#1c1917' },
  th:              { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#ffffff', paddingHorizontal: 8, paddingVertical: 5, letterSpacing: 0.5, textTransform: 'uppercase' },
  tr:              { flexDirection: 'row', borderTopWidth: 1, borderColor: '#f5f5f4' },
  td:              { fontSize: 9, color: '#44403c', paddingHorizontal: 8, paddingVertical: 5 },
  tdBold:          { fontFamily: 'Helvetica-Bold', color: '#1c1917' },
  tdAmber:         { fontFamily: 'Helvetica-Bold', color: '#b45309' },

  // ── Pricing rows ──
  subTotalRow:     { flexDirection: 'row', backgroundColor: '#fef3c7', borderTopWidth: 1, borderColor: '#fde68a' },
  totalRow:        { flexDirection: 'row', backgroundColor: '#1c1917', borderTopWidth: 1, borderColor: '#292524' },
  totalRowAmber:   { flexDirection: 'row', backgroundColor: '#b45309', borderTopWidth: 1, borderColor: '#92400e' },
  totalLabel:      { flex: 2, fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#ffffff', paddingHorizontal: 8, paddingVertical: 7, letterSpacing: 0.5, textTransform: 'uppercase' },
  totalValue:      { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#fbbf24', paddingHorizontal: 8, paddingVertical: 5, textAlign: 'right', minWidth: 80 },

  // ── Incl/Excl lists ──
  inclRow:         { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 10 },
  inclBullet:      { width: 12, color: '#16a34a', fontFamily: 'Helvetica-Bold', fontSize: 10 },
  exclBullet:      { width: 12, color: '#dc2626', fontFamily: 'Helvetica-Bold', fontSize: 10 },
  listText:        { flex: 1, fontSize: 9, color: '#44403c' },

  // ── Brand closing ──
  brandClose:      { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 6, padding: 14, marginTop: 12, marginBottom: 4 },
  brandCloseTitle: { fontFamily: 'Helvetica-Bold', fontSize: 15, color: '#92400e', marginBottom: 8 },
  brandCloseBody:  { fontSize: 9, color: '#57534e', lineHeight: 1.6 },

  // ── Brand strip ──
  brandStrip:      { backgroundColor: 'rgba(217,119,6,0.12)', borderTopWidth: 1, borderColor: 'rgba(217,119,6,0.25)', paddingHorizontal: 22, paddingVertical: 8, flexDirection: 'row', gap: 14 },
  stripBadge:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  stripCheck:      { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#fbbf24' },
  stripText:       { fontSize: 8, color: '#78716c' },

  // ── Footer ──
  footer:          { backgroundColor: '#111827', padding: 14 },
  footerGrid:      { flexDirection: 'row', gap: 10, marginBottom: 8 },
  footerCol:       { flex: 1 },
  footerTitle:     { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#fbbf24', letterSpacing: 1.2, marginBottom: 4, textTransform: 'uppercase' },
  footerText:      { fontSize: 8, color: '#9ca3af', marginBottom: 2 },
  footerLine:      { borderTopWidth: 1, borderColor: '#374151', paddingTop: 6 },
  footerNote:      { fontSize: 7.5, color: '#6b7280' },

  noteText:        { fontSize: 8, color: '#78716c', marginTop: 2, marginBottom: 6 },
})

function SectionHead({ children }: { children: string }) {
  return (
    <View style={s.sectionRow}>
      <View style={s.sectionLine} />
      <Text style={s.sectionLabel}>{children}</Text>
      <View style={s.sectionLine} />
    </View>
  )
}

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <View style={{ paddingVertical: 4 }}>
      {rows.map(([label, val]) => (
        <View key={label} style={s.infoRow}>
          <Text style={s.infoLabel}>{label}</Text>
          <Text style={s.infoValue}>{val || '—'}</Text>
        </View>
      ))}
    </View>
  )
}

const LOGO_URL = 'https://www.arisebhutan.com/images/logo.jpeg'

export function VoucherDocument({ booking }: { booking: any }) {
  const p     = booking.pricing ?? {}
  const costs = computePricing({
    pricePerPerson:       p.pricePerPerson       ?? 0,
    pax:                  p.pax                  ?? booking.group_size ?? 1,
    sdfPerPersonPerNight: p.sdfPerPersonPerNight  ?? 100,
    nights:               p.nights               ?? 1,
    serviceFeePerPax:     p.serviceFeePerPax      ?? 0,
    gstRate:              p.gstRate              ?? 0,
    inrRate:              p.inrRate              ?? 83.5,
  })

  const client  = booking.client ?? {}
  const tour    = booking.tour   ?? {}

  const usd = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

  const flights          = Array.isArray(booking.flights)            ? booking.flights            : []
  const itinerary        = Array.isArray(booking.itinerary)          ? booking.itinerary          : []
  const accommodation    = Array.isArray(booking.accommodation)      ? booking.accommodation      : []
  const cancellationPolicy = Array.isArray(booking.cancellationPolicy) ? booking.cancellationPolicy : []

  return (
    <Document
      title={`Arise Bhutan Voucher — ${booking.bookingRef ?? booking.id}`}
      author="Arise Bhutan Tours & Travels"
    >
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src={LOGO_URL} style={s.logo} />
            <View>
              <Text style={s.brandName}>Arise Bhutan</Text>
              <Text style={s.brandSub}>TOURS & TRAVELS · ATCB LICENSED</Text>
              <Text style={[s.brandSub, { marginTop: 2, opacity: 0.7 }]}>Booking Confirmation & Itinerary Voucher</Text>
            </View>
          </View>
          <View style={s.refBox}>
            <Text style={s.refLabel}>BOOKING REFERENCE</Text>
            <Text style={s.refValue}>{booking.bookingRef ?? booking.id}</Text>
            <Text style={[s.refLabel, { marginTop: 5 }]}>Issued: {booking.issueDate ?? new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</Text>
            {booking.status && (
              <View style={s.statusBadge}>
                <Text style={s.statusText}>{booking.status}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* Client + Tour 2-col */}
          <View style={s.grid2}>
            <View style={s.card}>
              <View style={s.cardHeader}><Text style={s.cardHeaderText}>Client Information</Text></View>
              <InfoGrid rows={[
                ['Guest Name',        client.name             ?? booking.client_name ?? ''],
                ['Email Address',     client.email            ?? ''],
                ['Phone / WhatsApp',  client.phone            ?? ''],
                ['Nationality',       client.nationality      ?? ''],
                ['Passport No.',      client.passportNo       ?? ''],
                ['Passport Expiry',   client.passportExpiry   ?? ''],
                ['Emergency Contact', client.emergencyContact ?? ''],
              ]} />
            </View>
            <View style={s.card}>
              <View style={s.cardHeaderAmber}><Text style={s.cardHeaderText}>Tour Summary</Text></View>
              <InfoGrid rows={[
                ['Tour Package', tour.title    ?? booking.tour_title ?? ''],
                ['Category',     tour.category ?? ''],
                ['Duration',     tour.duration ?? ''],
                ['Group Size',   `${tour.pax ?? booking.group_size ?? ''} Pax`],
                ['Departure',    tour.startDate  ?? ''],
                ['Return',       tour.endDate    ?? ''],
                ['Guide',        tour.guide      ?? ''],
                ['Vehicle',      tour.vehicle    ?? ''],
              ]} />
            </View>
          </View>

          {/* Flight Details */}
          {flights.length > 0 && (
            <>
              <SectionHead>Flight Details</SectionHead>
              <View style={s.table}>
                <View style={s.thead}>
                  <Text style={[s.th, { flex: 2 }]}>Sector</Text>
                  <Text style={[s.th, { flex: 2 }]}>Date</Text>
                  <Text style={[s.th, { flex: 1.5 }]}>Flight No.</Text>
                  <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Departs</Text>
                  <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Arrives</Text>
                  <Text style={[s.th, { flex: 2 }]}>Airline</Text>
                </View>
                {flights.map((f: any, i: number) => (
                  <View key={i} style={[s.tr, i % 2 === 1 ? { backgroundColor: '#fafaf9' } : {}]}>
                    <Text style={[s.td, s.tdBold, { flex: 2 }]}>{f.sector}</Text>
                    <Text style={[s.td, { flex: 2 }]}>{f.date}</Text>
                    <Text style={[s.td, s.tdAmber, { flex: 1.5 }]}>{f.flightNo}</Text>
                    <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>{f.departs}</Text>
                    <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>{f.arrives}</Text>
                    <Text style={[s.td, { flex: 2 }]}>{f.airline}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.noteText}>* Confirm flight schedules directly with the airline. Arise Bhutan is not responsible for schedule changes.</Text>
            </>
          )}

          {/* Day-by-Day Itinerary */}
          {itinerary.length > 0 && (
            <>
              <SectionHead>Day-by-Day Itinerary Programme</SectionHead>
              <View style={s.table}>
                <View style={s.thead}>
                  <Text style={[s.th, { width: 28 }]}>Day</Text>
                  <Text style={[s.th, { width: 54 }]}>Date</Text>
                  <Text style={[s.th, { flex: 1 }]}>Programme & Activities</Text>
                  <Text style={[s.th, { width: 118 }]}>Accommodation</Text>
                  <Text style={[s.th, { width: 44, textAlign: 'center' }]}>Meals</Text>
                </View>
                {itinerary.map((day: any, i: number) => (
                  <View key={i} style={[s.tr, { alignItems: 'flex-start' }, i % 2 === 1 ? { backgroundColor: '#fafaf9' } : {}]}>
                    <Text style={[s.td, { width: 28, textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                      {String(day.day).padStart(2, '0')}
                    </Text>
                    <Text style={[s.td, { width: 54, fontSize: 8 }]}>{day.date}</Text>
                    <View style={[s.td, { flex: 1, paddingVertical: 4 }]}>
                      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 2 }}>{day.title}</Text>
                      {day.activities?.filter(Boolean).map((act: string, j: number) => (
                        <View key={j} style={{ flexDirection: 'row', marginTop: 1.5 }}>
                          <Text style={{ fontSize: 7.5, color: '#b45309', marginRight: 3, marginTop: 0.5 }}>›</Text>
                          <Text style={{ fontSize: 7.5, color: '#57534e', flex: 1, lineHeight: 1.4 }}>{act}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={[s.td, { width: 118, fontSize: 8 }]}>{day.accommodation}</Text>
                    <Text style={[s.td, { width: 44, textAlign: 'center', fontSize: 8, fontFamily: 'Helvetica-Bold' }]}>{day.meals}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.noteText}>B = Breakfast · L = Lunch · D = Dinner</Text>
            </>
          )}

          {/* Cost Breakdown */}
          <SectionHead>Cost Breakdown & Pricing Summary</SectionHead>
          <View style={s.grid2}>
            {/* Cost table */}
            <View style={[s.table, { flex: 3 }]}>
              <View style={s.thead}>
                <Text style={[s.th, { flex: 2 }]}>Cost Item</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Calculation</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Amount (USD)</Text>
              </View>
              <View style={s.tr}>
                <Text style={[s.td, s.tdBold, { flex: 2 }]}>Package Rate (per person)</Text>
                <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                  {usd(p.pricePerPerson ?? 0)} × {p.pax ?? 1} pax
                </Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.packageTotal)}</Text>
              </View>
              <View style={[s.tr, { backgroundColor: '#fafaf9' }]}>
                <View style={[s.td, { flex: 2 }]}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>Sustainable Development Fee</Text>
                  <Text style={{ fontSize: 7.5, color: '#78716c' }}>Mandatory Royal Govt. of Bhutan levy</Text>
                </View>
                <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                  ${p.sdfPerPersonPerNight ?? 100}/pax/night × {p.nights ?? 1}N × {p.pax ?? 1}
                </Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.sdfTotal)}</Text>
              </View>
              {costs.serviceTotal > 0 && (
                <View style={s.tr}>
                  <Text style={[s.td, s.tdBold, { flex: 2 }]}>Service & Handling Fee</Text>
                  <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                    ${p.serviceFeePerPax ?? 0}/pax × {p.pax ?? 1}
                  </Text>
                  <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.serviceTotal)}</Text>
                </View>
              )}
              <View style={s.subTotalRow}>
                <Text style={[s.td, s.tdBold, { flex: 4, color: '#1c1917' }]}>Sub-total</Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.subtotal)}</Text>
              </View>
              {costs.gst > 0 && (
                <View style={s.tr}>
                  <Text style={[s.td, s.tdBold, { flex: 2 }]}>GST ({((p.gstRate ?? 0) * 100).toFixed(0)}%)</Text>
                  <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                    {((p.gstRate ?? 0) * 100).toFixed(0)}% on sub-total
                  </Text>
                  <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.gst)}</Text>
                </View>
              )}
              <View style={s.totalRow}>
                <Text style={[s.totalLabel, { flex: 3 }]}>Grand Total (USD)</Text>
                <Text style={s.totalValue}>{usd(costs.totalUSD)}</Text>
              </View>
              <View style={s.totalRowAmber}>
                <Text style={[s.totalLabel, { flex: 3 }]}>Equivalent INR @ ₹{p.inrRate ?? 83.5}</Text>
                <Text style={[s.totalValue, { color: '#ffffff' }]}>{inr(costs.totalINR)}</Text>
              </View>
            </View>

            {/* Payment + pricing notes */}
            <View style={[{ flex: 2, gap: 0 }]}>
              <View style={[s.card, { marginBottom: 8 }]}>
                <View style={s.cardHeaderBlue}><Text style={s.cardHeaderText}>Payment Schedule</Text></View>
                <View style={{ padding: 8 }}>
                  {(booking.payment ?? [
                    '30% deposit required to confirm reservation',
                    'Balance due 30 days before departure',
                    'USD bank transfer or credit card',
                  ]).map((line: string, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                      <Text style={{ color: '#3b82f6', marginRight: 4, fontSize: 9 }}>•</Text>
                      <Text style={{ fontSize: 9, color: '#44403c', flex: 1 }}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={s.card}>
                <View style={s.cardHeaderAmber}><Text style={s.cardHeaderText}>Pricing Notes</Text></View>
                <View style={{ padding: 8 }}>
                  {[
                    'SDF is non-negotiable — set by Royal Govt.',
                    'INR equivalent shown for reference only.',
                    'Quote valid 14 days from issue date.',
                    'Child rates available on request.',
                    'Group discounts available (10+ pax).',
                  ].map((note, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                      <Text style={{ color: '#d97706', marginRight: 4, fontSize: 9 }}>•</Text>
                      <Text style={{ fontSize: 9, color: '#44403c', flex: 1 }}>{note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Accommodation Schedule */}
          {accommodation.length > 0 && (
            <>
              <SectionHead>Accommodation Schedule</SectionHead>
              <View style={s.table}>
                <View style={s.thead}>
                  <Text style={[s.th, { flex: 2.5 }]}>Hotel Name</Text>
                  <Text style={[s.th, { flex: 1.5 }]}>Location</Text>
                  <Text style={[s.th, { flex: 1 }]}>Category</Text>
                  <Text style={[s.th, { flex: 2 }]}>Property Type</Text>
                  <Text style={[s.th, { width: 44, textAlign: 'right' }]}>Nights</Text>
                </View>
                {accommodation.map((h: any, i: number) => (
                  <View key={i} style={[s.tr, i % 2 === 1 ? { backgroundColor: '#fafaf9' } : {}]}>
                    <Text style={[s.td, s.tdBold, { flex: 2.5 }]}>{h.hotel}</Text>
                    <Text style={[s.td, { flex: 1.5 }]}>{h.location}</Text>
                    <Text style={[s.td, { flex: 1 }]}>{h.category}</Text>
                    <Text style={[s.td, { flex: 2 }]}>{h.type}</Text>
                    <Text style={[s.td, { width: 44, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{h.nights}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.noteText}>
                Hotels may be substituted with a property of equal or superior category if unavailability arises. Arise Bhutan will notify you with at least 72 hours notice.
              </Text>
            </>
          )}

          {/* Inclusions & Exclusions */}
          {(booking.inclusions?.length > 0 || booking.exclusions?.length > 0) && (
            <>
              <SectionHead>Package Inclusions & Exclusions</SectionHead>
              <View style={s.grid2}>
                {booking.inclusions?.length > 0 && (
                  <View style={[s.card, { flex: 1 }]}>
                    <View style={s.cardHeaderGreen}><Text style={s.cardHeaderText}>✓ Included in Package</Text></View>
                    <View style={{ paddingVertical: 5 }}>
                      {booking.inclusions.map((inc: string, i: number) => (
                        <View key={i} style={s.inclRow}>
                          <Text style={s.inclBullet}>✓</Text>
                          <Text style={s.listText}>{inc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {booking.exclusions?.length > 0 && (
                  <View style={[s.card, { flex: 1 }]}>
                    <View style={s.cardHeaderRed}><Text style={s.cardHeaderText}>✗ Not Included</Text></View>
                    <View style={{ paddingVertical: 5 }}>
                      {booking.exclusions.map((exc: string, i: number) => (
                        <View key={i} style={s.inclRow}>
                          <Text style={s.exclBullet}>✗</Text>
                          <Text style={s.listText}>{exc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Cancellation Policy */}
          {cancellationPolicy.length > 0 && (
            <>
              <SectionHead>Cancellation & Refund Policy</SectionHead>
              <View style={s.table}>
                <View style={s.thead}>
                  <Text style={[s.th, { flex: 1.5 }]}>Cancellation Period</Text>
                  <Text style={[s.th, { flex: 3 }]}>Refund Terms</Text>
                </View>
                {cancellationPolicy.map((row: any, i: number) => (
                  <View key={i} style={[s.tr, i % 2 === 1 ? { backgroundColor: '#fafaf9' } : {}]}>
                    <Text style={[s.td, s.tdBold, { flex: 1.5 }]}>{row.period}</Text>
                    <Text style={[s.td, { flex: 3 }]}>{row.refund}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.noteText}>
                Force majeure events (natural disasters, civil unrest, airline cancellations) handled on a case-by-case basis. Travel insurance strongly recommended.
              </Text>
            </>
          )}

          {/* Brand closing */}
          <View style={s.brandClose}>
            <Text style={s.brandCloseTitle}>To Arise is to Awaken.</Text>
            <Text style={s.brandCloseBody}>
              At Arise Bhutan, we believe the finest journey is one that transforms. Each itinerary we craft carries the weight of our founder's conviction — born in the shadows of Paro's fortress walls, refined through seasons of walking Bhutan's ancient trails. We do not simply take you through Bhutan. We introduce you to it.
            </Text>
            <Text style={[s.brandCloseBody, { marginTop: 6 }]}>
              Your booking is a promise — of early morning monastery bells, of steaming ema datshi in a farmhouse kitchen, of prayer flags catching the first Himalayan light. We honour this promise with meticulous care, passionate guides, and the quiet confidence of a team that calls this kingdom home. Welcome to Bhutan. Welcome to your awakening.
            </Text>
          </View>

        </View>

        {/* ── BRAND STRIP ── */}
        <View style={s.brandStrip}>
          {['100% ATCB Compliant', 'SDF Directly Remitted', '24/7 In-Country Support', 'Licensed Guides Only'].map(label => (
            <View key={label} style={s.stripBadge}>
              <Text style={s.stripCheck}>✓</Text>
              <Text style={s.stripText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <View style={s.footerGrid}>
            <View style={s.footerCol}>
              <Text style={s.footerTitle}>Arise Bhutan Tours & Travels</Text>
              <Text style={s.footerText}>ATCB License No: ATCB/TA-2024/1047</Text>
              <Text style={s.footerText}>Tourism Council of Bhutan — Registered</Text>
              <Text style={s.footerText}>Main Street, Paro, Kingdom of Bhutan</Text>
              <Text style={s.footerText}>P.O. Box 1234, Paro 11001</Text>
            </View>
            <View style={s.footerCol}>
              <Text style={s.footerTitle}>Contact & Support</Text>
              <Text style={s.footerText}>+975 17 288 286</Text>
              <Text style={s.footerText}>+975 2 272 929 (Office)</Text>
              <Text style={s.footerText}>arisebhutan@gmail.com</Text>
              <Text style={s.footerText}>www.arisebhutan.com</Text>
              <Text style={s.footerText}>WhatsApp: +975 17 288 286</Text>
            </View>
            <View style={s.footerCol}>
              <Text style={s.footerTitle}>Travel Assurance</Text>
              <Text style={s.footerText}>✓ ATCB Licensed & Inspected</Text>
              <Text style={s.footerText}>✓ SDF Remitted to Royal Govt.</Text>
              <Text style={s.footerText}>✓ All Guides ATCB Certified</Text>
              <Text style={s.footerText}>✓ Comprehensive In-Country Support</Text>
              <Text style={s.footerText}>✓ Emergency Evacuation Protocol</Text>
            </View>
          </View>
          <View style={s.footerLine}>
            <Text style={s.footerNote}>
              This voucher is computer-generated and is valid without a physical signature. Document issued on {booking.issueDate ?? new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}. {'  '}Ref: {booking.bookingRef ?? booking.id}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
