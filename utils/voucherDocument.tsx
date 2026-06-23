/**
 * Server-safe React PDF document for booking vouchers.
 * Rendered by app/api/booking-voucher/route.ts using @react-pdf/renderer.
 * Uses only @react-pdf/renderer primitives — no browser APIs.
 */

import {
  Document, Page, View, Text, Image, StyleSheet,
} from '@react-pdf/renderer'
import { computePricing } from './pdfGenerator'

// ── Styles ────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily:      'Helvetica',
    fontSize:        10,
    color:           '#1c1917',
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    backgroundColor: '#92400e',
    padding:         24,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  brandName: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   16,
    color:      '#fef3c7',
    marginBottom: 2,
  },
  brandSub: { fontSize: 8, color: '#fde68a', letterSpacing: 1.5 },
  refBox: {
    borderWidth:  1,
    borderColor:  'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding:      10,
    alignItems:   'center',
    minWidth:     130,
  },
  refLabel: { fontSize: 8, color: 'rgba(255,255,255,0.65)', marginBottom: 2, letterSpacing: 1 },
  refValue: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#ffffff', letterSpacing: 1.5 },

  // Body
  body: { padding: '16 24' },

  // Section heading
  sectionRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  8,
    marginTop:     12,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#fde68a' },
  sectionLabel: {
    fontFamily:      'Helvetica-Bold',
    fontSize:        8,
    color:           '#92400e',
    letterSpacing:   1.5,
    marginHorizontal: 8,
    textTransform:   'uppercase',
  },

  // Two-column grid
  grid2: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  card: {
    flex:         1,
    borderWidth:  1,
    borderColor:  '#e7e5e4',
    borderRadius: 6,
    overflow:     'hidden',
  },
  cardHeader: {
    backgroundColor: '#1c1917',
    paddingHorizontal: 10,
    paddingVertical:   6,
  },
  cardHeaderAmber: {
    backgroundColor: '#b45309',
    paddingHorizontal: 10,
    paddingVertical:   6,
  },
  cardHeaderText: {
    fontFamily:  'Helvetica-Bold',
    fontSize:    8,
    color:       '#ffffff',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection:   'row',
    paddingHorizontal: 10,
    paddingVertical:   3,
  },
  infoLabel: { width: 90, color: '#78716c', fontSize: 9 },
  infoValue: { flex: 1, color: '#1c1917', fontFamily: 'Helvetica-Bold', fontSize: 9 },

  // Table
  table: {
    borderWidth:  1,
    borderColor:  '#e7e5e4',
    borderRadius: 6,
    overflow:     'hidden',
    marginBottom: 4,
  },
  thead: { flexDirection: 'row', backgroundColor: '#1c1917' },
  th: {
    fontFamily:   'Helvetica-Bold',
    fontSize:     8,
    color:        '#ffffff',
    paddingHorizontal: 8,
    paddingVertical:   5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tr: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#f5f5f4' },
  td: {
    fontSize:     9,
    color:        '#44403c',
    paddingHorizontal: 8,
    paddingVertical:   5,
  },
  tdBold: {
    fontFamily:   'Helvetica-Bold',
    color:        '#1c1917',
  },

  // Pricing total rows
  totalRow: {
    flexDirection:  'row',
    backgroundColor: '#1c1917',
    borderTopWidth: 1,
    borderColor:    '#292524',
  },
  totalLabel: {
    flex:         2,
    fontFamily:   'Helvetica-Bold',
    fontSize:     9,
    color:        '#ffffff',
    paddingHorizontal: 8,
    paddingVertical:   7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontFamily:   'Helvetica-Bold',
    fontSize:     13,
    color:        '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical:   5,
    textAlign:    'right',
    minWidth:     80,
  },
  subTotalRow: {
    flexDirection:   'row',
    backgroundColor: '#fef3c7',
    borderTopWidth:  1,
    borderColor:     '#fde68a',
  },

  // Inclusion / exclusion lists
  inclRow: { flexDirection: 'row', paddingVertical: 2, paddingHorizontal: 10 },
  inclBullet: { width: 12, color: '#16a34a', fontFamily: 'Helvetica-Bold', fontSize: 10 },
  exclBullet: { width: 12, color: '#dc2626', fontFamily: 'Helvetica-Bold', fontSize: 10 },
  listText: { flex: 1, fontSize: 9, color: '#44403c' },

  // Footer
  footer: {
    backgroundColor: '#111827',
    padding:         16,
    marginTop:       16,
  },
  footerGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  footerCol: { flex: 1 },
  footerTitle: {
    fontFamily:    'Helvetica-Bold',
    fontSize:      8,
    color:         '#fbbf24',
    letterSpacing: 1.2,
    marginBottom:  4,
    textTransform: 'uppercase',
  },
  footerText: { fontSize: 8, color: '#9ca3af', marginBottom: 2 },
  footerLine: { borderTopWidth: 1, borderColor: '#374151', paddingTop: 6 },
  footerNote: { fontSize: 7.5, color: '#6b7280' },

  // Brand strip
  brandStrip: {
    backgroundColor: 'rgba(217,119,6,0.15)',
    borderTopWidth:  1,
    borderColor:     'rgba(217,119,6,0.25)',
    paddingHorizontal: 24,
    paddingVertical:   8,
    flexDirection:     'row',
    gap:               16,
  },
  stripBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  stripCheck: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#fbbf24' },
  stripText: { fontSize: 8, color: '#fde68a' },
})

// ── Helpers ───────────────────────────────────────────────────

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

// ── Document ──────────────────────────────────────────────────

const LOGO_URL = 'https://www.arisebhutan.com/images/logo.jpeg'

interface VoucherProps {
  booking: any
}

export function VoucherDocument({ booking }: VoucherProps) {
  const p     = booking.pricing ?? {}
  const costs = computePricing({
    pricePerPerson:       p.pricePerPerson       ?? 0,
    pax:                  p.pax                  ?? booking.group_size ?? 1,
    sdfPerPersonPerNight: p.sdfPerPersonPerNight  ?? 100,
    nights:               p.nights               ?? 1,
    serviceFeePerPax:     p.serviceFeePerPax      ?? 150,
    gstRate:              p.gstRate              ?? 0.05,
    inrRate:              p.inrRate              ?? 83.5,
  })

  const client = booking.client ?? {}
  const tour   = booking.tour   ?? {}

  const usd = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

  return (
    <Document
      title={`Arise Bhutan Voucher — ${booking.bookingRef ?? booking.id}`}
      author="Arise Bhutan Tours & Travels"
    >
      <Page size="A4" style={s.page}>

        {/* ── HEADER ───────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src={LOGO_URL} style={s.logo} />
            <View>
              <Text style={s.brandName}>Arise Bhutan</Text>
              <Text style={s.brandSub}>TOURS & TRAVELS · ATCB LICENSED</Text>
              <Text style={[s.brandSub, { marginTop: 2, opacity: 0.6 }]}>
                Booking Confirmation & Itinerary Voucher
              </Text>
            </View>
          </View>
          <View style={s.refBox}>
            <Text style={s.refLabel}>BOOKING REFERENCE</Text>
            <Text style={s.refValue}>{booking.bookingRef ?? booking.id}</Text>
            <Text style={[s.refLabel, { marginTop: 4 }]}>
              {booking.issueDate ?? new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
            </Text>
          </View>
        </View>

        {/* ── BODY ─────────────────────────────────────────── */}
        <View style={s.body}>

          {/* Client + Tour grid */}
          <View style={s.grid2}>
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardHeaderText}>Client Information</Text>
              </View>
              <InfoGrid rows={[
                ['Guest Name',         client.name         ?? booking.client_name],
                ['Email Address',      client.email        ?? ''],
                ['Phone / WhatsApp',   client.phone        ?? ''],
                ['Nationality',        client.nationality  ?? ''],
                ['Passport No.',       client.passportNo   ?? ''],
                ['Passport Expiry',    client.passportExpiry ?? ''],
                ['Emergency Contact',  client.emergencyContact ?? ''],
              ]} />
            </View>
            <View style={s.card}>
              <View style={s.cardHeaderAmber}>
                <Text style={s.cardHeaderText}>Tour Summary</Text>
              </View>
              <InfoGrid rows={[
                ['Tour Package',  tour.title    ?? booking.tour_title],
                ['Category',      tour.category ?? ''],
                ['Duration',      tour.duration ?? ''],
                ['Group Size',    `${tour.pax ?? booking.group_size ?? ''} Pax`],
                ['Departure',     tour.startDate  ?? (booking.arrival_date  ? String(booking.arrival_date)  : '')],
                ['Return',        tour.endDate    ?? (booking.return_date   ? String(booking.return_date)   : '')],
                ['Guide',         tour.guide      ?? ''],
                ['Vehicle',       tour.vehicle    ?? ''],
              ]} />
            </View>
          </View>

          {/* Pricing Matrix */}
          <SectionHead>Cost Breakdown & Pricing Summary</SectionHead>
          <View style={s.grid2}>
            {/* Cost table */}
            <View style={[s.table, { flex: 3 }]}>
              <View style={s.thead}>
                <Text style={[s.th, { flex: 2 }]}>Cost Item</Text>
                <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Calculation</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Amount (USD)</Text>
              </View>

              {/* Package */}
              <View style={s.tr}>
                <Text style={[s.td, s.tdBold, { flex: 2 }]}>Package Rate</Text>
                <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                  {usd(p.pricePerPerson ?? 0)} × {p.pax ?? 1} pax
                </Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.packageTotal)}</Text>
              </View>

              {/* SDF */}
              <View style={[s.tr, { backgroundColor: '#fafaf9' }]}>
                <Text style={[s.td, s.tdBold, { flex: 2 }]}>Sustainable Development Fee</Text>
                <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                  ${p.sdfPerPersonPerNight ?? 100}/pax/night × {p.nights ?? 1}N × {p.pax ?? 1}
                </Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.sdfTotal)}</Text>
              </View>

              {/* Service */}
              <View style={s.tr}>
                <Text style={[s.td, s.tdBold, { flex: 2 }]}>Service & Handling</Text>
                <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                  ${p.serviceFeePerPax ?? 150}/pax × {p.pax ?? 1}
                </Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.serviceTotal)}</Text>
              </View>

              {/* Sub-total */}
              <View style={s.subTotalRow}>
                <Text style={[s.td, s.tdBold, { flex: 4, color: '#1c1917' }]}>Sub-total</Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.subtotal)}</Text>
              </View>

              {/* GST */}
              <View style={s.tr}>
                <Text style={[s.td, s.tdBold, { flex: 2 }]}>
                  GST ({((p.gstRate ?? 0.05) * 100).toFixed(0)}%)
                </Text>
                <Text style={[s.td, { flex: 2, textAlign: 'right', color: '#78716c' }]}>
                  {((p.gstRate ?? 0.05) * 100).toFixed(0)}% on sub-total
                </Text>
                <Text style={[s.td, s.tdBold, { flex: 1, textAlign: 'right' }]}>{usd(costs.gst)}</Text>
              </View>

              {/* Grand total USD */}
              <View style={s.totalRow}>
                <Text style={[s.totalLabel, { flex: 3 }]}>Grand Total (USD)</Text>
                <Text style={s.totalValue}>{usd(costs.totalUSD)}</Text>
              </View>

              {/* Grand total INR */}
              <View style={[s.totalRow, { backgroundColor: '#b45309' }]}>
                <Text style={[s.totalLabel, { flex: 3 }]}>
                  Equivalent INR @ ₹{p.inrRate ?? 83.5}
                </Text>
                <Text style={[s.totalValue, { color: '#ffffff' }]}>{inr(costs.totalINR)}</Text>
              </View>
            </View>

            {/* Payment notes */}
            <View style={[s.card, { flex: 2 }]}>
              <View style={[s.cardHeader, { backgroundColor: '#1e40af' }]}>
                <Text style={s.cardHeaderText}>Payment Schedule</Text>
              </View>
              <View style={{ padding: 8 }}>
                {(booking.payment ?? [
                  '30% deposit required to confirm booking',
                  'Full balance due 30 days before departure',
                  'Bank transfer or major credit card accepted',
                  'All payments in USD',
                ]).map((line: string, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={{ color: '#3b82f6', marginRight: 4, fontSize: 9 }}>•</Text>
                    <Text style={{ fontSize: 9, color: '#44403c', flex: 1 }}>{line}</Text>
                  </View>
                ))}
              </View>
              <View style={[s.cardHeaderAmber, { marginTop: 'auto' }]}>
                <Text style={s.cardHeaderText}>Pricing Notes</Text>
              </View>
              <View style={{ padding: 8 }}>
                {[
                  'SDF is set by the Royal Govt. of Bhutan.',
                  'INR equivalent shown for reference only.',
                  'Quote valid 14 days from issue date.',
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

          {/* Inclusions / Exclusions */}
          {(booking.inclusions || booking.exclusions) && (
            <>
              <SectionHead>Package Inclusions & Exclusions</SectionHead>
              <View style={s.grid2}>
                {booking.inclusions && (
                  <View style={[s.card, { flex: 1 }]}>
                    <View style={[s.cardHeader, { backgroundColor: '#166534' }]}>
                      <Text style={s.cardHeaderText}>✓ Included</Text>
                    </View>
                    <View style={{ paddingVertical: 6 }}>
                      {booking.inclusions.map((inc: string, i: number) => (
                        <View key={i} style={s.inclRow}>
                          <Text style={s.inclBullet}>✓</Text>
                          <Text style={s.listText}>{inc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {booking.exclusions && (
                  <View style={[s.card, { flex: 1 }]}>
                    <View style={[s.cardHeader, { backgroundColor: '#991b1b' }]}>
                      <Text style={s.cardHeaderText}>✗ Not Included</Text>
                    </View>
                    <View style={{ paddingVertical: 6 }}>
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

        </View>

        {/* ── BRAND STRIP ──────────────────────────────────── */}
        <View style={s.brandStrip}>
          {['100% ATCB Compliant', 'SDF Directly Remitted', '24/7 In-Country Support', 'Licensed Guides Only'].map(label => (
            <View key={label} style={s.stripBadge}>
              <Text style={s.stripCheck}>✓</Text>
              <Text style={s.stripText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <View style={s.footer}>
          <View style={s.footerGrid}>
            <View style={s.footerCol}>
              <Text style={s.footerTitle}>Arise Bhutan Tours & Travels</Text>
              <Text style={s.footerText}>ATCB License No: ATCB/TA-2024/1047</Text>
              <Text style={s.footerText}>Tourism Council of Bhutan — Registered</Text>
              <Text style={s.footerText}>Main Street, Paro, Kingdom of Bhutan</Text>
            </View>
            <View style={s.footerCol}>
              <Text style={s.footerTitle}>Contact & Support</Text>
              <Text style={s.footerText}>+975 17 288 286 (WhatsApp)</Text>
              <Text style={s.footerText}>arisebhutan@gmail.com</Text>
              <Text style={s.footerText}>www.arisebhutan.com</Text>
            </View>
            <View style={s.footerCol}>
              <Text style={s.footerTitle}>Travel Assurance</Text>
              <Text style={s.footerText}>✓ ATCB Licensed & Inspected</Text>
              <Text style={s.footerText}>✓ SDF Remitted to Royal Govt.</Text>
              <Text style={s.footerText}>✓ All Guides ATCB Certified</Text>
              <Text style={s.footerText}>✓ Emergency Evacuation Protocol</Text>
            </View>
          </View>
          <View style={s.footerLine}>
            <Text style={s.footerNote}>
              This voucher is computer-generated and is valid without a physical signature.
              Ref: {booking.bookingRef ?? booking.id}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
