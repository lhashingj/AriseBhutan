/**
 * Server-safe React PDF document for the free sample-itinerary lead
 * magnet. Rendered server-side via @react-pdf/renderer — no browser APIs.
 */

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Tour } from '../data/tours'

const LOGO_URL = 'https://www.arisebhutan.com/images/logo.jpeg'

const s = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', fontSize: 10, color: '#1c1917', backgroundColor: '#ffffff' },

  header:       { backgroundColor: '#92400e', padding: 22, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo:         { width: 40, height: 40, borderRadius: 20 },
  brandName:    { fontFamily: 'Helvetica-Bold', fontSize: 16, color: '#fef3c7' },
  brandSub:     { fontSize: 7.5, color: '#fde68a', letterSpacing: 1.5, marginTop: 2 },

  cover:        { padding: '26 26 18' },
  coverBadge:   { alignSelf: 'flex-start', backgroundColor: '#fef3c7', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  coverBadgeText: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#92400e', letterSpacing: 1.2, textTransform: 'uppercase' },
  coverTitle:   { fontFamily: 'Helvetica-Bold', fontSize: 20, color: '#1c1917', marginBottom: 6 },
  coverSub:     { fontSize: 10, color: '#57534e', marginBottom: 14, lineHeight: 1.5 },

  metaRow:      { flexDirection: 'row', gap: 8, marginBottom: 4 },
  metaCard:     { flex: 1, borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 6, padding: 9 },
  metaLabel:    { fontSize: 7, color: '#a8a29e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  metaValue:    { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: '#1c1917' },

  body:         { padding: '4 26' },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 7, marginTop: 12 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: '#fde68a' },
  sectionLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#92400e', letterSpacing: 1.5, marginHorizontal: 8, textTransform: 'uppercase' },

  dayCard:      { borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 6, marginBottom: 7, overflow: 'hidden' },
  dayHeader:    { flexDirection: 'row', backgroundColor: '#1c1917', paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', gap: 8 },
  dayNum:       { width: 20, height: 20, borderRadius: 10, backgroundColor: '#b45309', color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center', paddingTop: 4 },
  dayTitle:     { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: '#ffffff', flex: 1 },
  dayBody:      { padding: 10 },
  dayDesc:      { fontSize: 8.5, color: '#44403c', lineHeight: 1.5, marginBottom: 5 },
  dayMetaRow:   { flexDirection: 'row', gap: 14 },
  dayMetaLabel: { fontSize: 7, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: 0.5 },
  dayMetaValue: { fontSize: 8, color: '#1c1917', fontFamily: 'Helvetica-Bold' },

  grid2:        { flexDirection: 'row', gap: 10, marginBottom: 8 },
  card:         { flex: 1, borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 6, overflow: 'hidden' },
  cardHeaderGreen: { backgroundColor: '#166534', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderRed:   { backgroundColor: '#991b1b', paddingHorizontal: 10, paddingVertical: 5 },
  cardHeaderText:  { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#ffffff', letterSpacing: 1.2, textTransform: 'uppercase' },
  listRow:      { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 10 },
  bulletGreen:  { width: 12, color: '#16a34a', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  bulletRed:    { width: 12, color: '#dc2626', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  listText:     { flex: 1, fontSize: 8.5, color: '#44403c' },

  priceStrip:   { backgroundColor: '#fef3c7', borderRadius: 6, padding: 12, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel:   { fontSize: 9, color: '#92400e', fontFamily: 'Helvetica-Bold' },
  priceValue:   { fontSize: 16, color: '#92400e', fontFamily: 'Helvetica-Bold' },

  closing:      { backgroundColor: '#1c1917', padding: 20, marginTop: 14 },
  closingTitle: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: '#fbbf24', marginBottom: 5 },
  closingText:  { fontSize: 8.5, color: '#d6d3d1', lineHeight: 1.5, marginBottom: 8 },
  closingContact: { fontSize: 8, color: '#a8a29e' },

  footer:       { position: 'absolute', bottom: 16, left: 26, right: 26, textAlign: 'center', fontSize: 7, color: '#a8a29e' },
})

export function SampleItineraryDocument({ tour }: { tour: Tour }) {
  return (
    <Document title={`${tour.title} — Sample Itinerary — Arise Bhutan`}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Image src={LOGO_URL} style={s.logo} />
          <View>
            <Text style={s.brandName}>Arise Bhutan Tours &amp; Travels</Text>
            <Text style={s.brandSub}>DOT LIC. NO. 50001567 · PARO, BHUTAN</Text>
          </View>
        </View>

        <View style={s.cover}>
          <View style={s.coverBadge}>
            <Text style={s.coverBadgeText}>Free Sample Itinerary</Text>
          </View>
          <Text style={s.coverTitle}>{tour.title}</Text>
          <Text style={s.coverSub}>{tour.subtitle} — {tour.overview.split('\n\n')[0]}</Text>

          <View style={s.metaRow}>
            <View style={s.metaCard}>
              <Text style={s.metaLabel}>Duration</Text>
              <Text style={s.metaValue}>{tour.duration}</Text>
            </View>
            <View style={s.metaCard}>
              <Text style={s.metaLabel}>Group Size</Text>
              <Text style={s.metaValue}>{tour.groupSize}</Text>
            </View>
            <View style={s.metaCard}>
              <Text style={s.metaLabel}>Best Season</Text>
              <Text style={s.metaValue}>{tour.bestSeason}</Text>
            </View>
          </View>
        </View>

        <View style={s.body}>
          <View style={s.sectionRow}>
            <View style={s.sectionLine} />
            <Text style={s.sectionLabel}>Day-by-Day Itinerary</Text>
            <View style={s.sectionLine} />
          </View>

          {tour.itinerary.map((day) => (
            <View key={day.day} style={s.dayCard} wrap={false}>
              <View style={s.dayHeader}>
                <Text style={s.dayNum}>{day.day}</Text>
                <Text style={s.dayTitle}>{day.title}</Text>
              </View>
              <View style={s.dayBody}>
                <Text style={s.dayDesc}>{day.description}</Text>
                <View style={s.dayMetaRow}>
                  <View>
                    <Text style={s.dayMetaLabel}>Accommodation</Text>
                    <Text style={s.dayMetaValue}>{day.accommodation}</Text>
                  </View>
                  <View>
                    <Text style={s.dayMetaLabel}>Meals</Text>
                    <Text style={s.dayMetaValue}>{day.meals}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <View style={s.sectionRow}>
            <View style={s.sectionLine} />
            <Text style={s.sectionLabel}>Inclusions &amp; Exclusions</Text>
            <View style={s.sectionLine} />
          </View>
          <View style={s.grid2} wrap={false}>
            <View style={s.card}>
              <View style={s.cardHeaderGreen}><Text style={s.cardHeaderText}>Included</Text></View>
              {tour.inclusions.map((i) => (
                <View key={i} style={s.listRow}>
                  <Text style={s.bulletGreen}>✓</Text>
                  <Text style={s.listText}>{i}</Text>
                </View>
              ))}
            </View>
            <View style={s.card}>
              <View style={s.cardHeaderRed}><Text style={s.cardHeaderText}>Not Included</Text></View>
              {tour.exclusions.map((i) => (
                <View key={i} style={s.listRow}>
                  <Text style={s.bulletRed}>✕</Text>
                  <Text style={s.listText}>{i}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.priceStrip}>
            <Text style={s.priceLabel}>Starting From</Text>
            <Text style={s.priceValue}>${tour.startingFrom.toLocaleString()} / person</Text>
          </View>

          <View style={s.closing} wrap={false}>
            <Text style={s.closingTitle}>Want This Trip, Tailored to You?</Text>
            <Text style={s.closingText}>
              This is a sample of one of our most-booked itineraries. Every Arise Bhutan trip is fully private and
              built around your dates, pace, and interests — tell us what you have in mind and we&apos;ll send an
              itemized quote within 24 hours, with your Sustainable Development Fee and visa processing already
              included.
            </Text>
            <Text style={s.closingContact}>arisebhutan@gmail.com  ·  +975 77 319 405  ·  arisebhutan.com</Text>
          </View>
        </View>

        <Text style={s.footer} fixed>
          Arise Bhutan Tours &amp; Travels · DOT Lic. No. 50001567 · Paro, Kingdom of Bhutan · This sample itinerary is indicative — exact stops may vary by season.
        </Text>
      </Page>
    </Document>
  )
}
