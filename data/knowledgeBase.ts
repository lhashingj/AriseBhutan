/**
 * Arise Bhutan Assistant — Knowledge Base
 *
 * Markdown knowledge base injected into the AI concierge's system
 * prompt (app/api/chat/route.ts). Exported as a TS constant (rather
 * than a raw .md file) so it bundles reliably in the Vercel serverless
 * runtime without filesystem tracing.
 *
 * Keep this in sync with data/tours.ts, the FAQ page, and the
 * festival calendar when packages or policies change.
 */

export const KNOWLEDGE_BASE = `
# ARISE BHUTAN TOURS & TRAVELS — KNOWLEDGE BASE

## Company
- DOT-licensed Bhutanese tour operator based in Nyamaizampa, Paro 12001, Bhutan.
- Phone: +975 77 319 405 (Bhutan) · WhatsApp: +975 77 319 405 or +61 435 341 033 (Australia)
- Email: arisebhutan@gmail.com · Website: arisebhutan.com
- Every itinerary is FULLY PRIVATE — no fixed-departure group tours, ever.
- Booking references look like ARB-2026-B010C9 (format: ARB-YEAR-6 characters).

## Tour Packages (starting prices per person, all-inclusive)
### Cultural
1. **Classic Bhutan Cultural Tour** — 5 Days / 4 Nights, from USD 1,850. Paro · Thimphu · Punakha. Easy. Best Mar–May & Sep–Nov. Buddha Dordenma, Dochu La pass, Punakha Dzong, Kyichu Lhakhang, Tiger's Nest.
2. **Bhutan Heritage Trail** — 7 Days / 6 Nights, from USD 2,400. Adds Wangdue & Phobjikha Valley (Black-Necked Cranes Nov–Mar), Gangtey Monastery, farmhouse lunch, hot stone bath, archery demo.
3. **Kingdom of Happiness** — 10 Days / 9 Nights, from USD 3,200. The deep exploration: Paro, Thimphu, Punakha, Phobjikha, Trongsa Dzong, Bumthang (Kurjey Lhakhang, Jambay Lhakhang) — Bhutan's spiritual heartland.

### Adventure & Trekking
4. **Tiger's Nest Day Hike** — 1 Day, from USD 150. Moderate. 4-hour round trip to Taktsang Monastery at 3,120 m. Year-round.
5. **Druk Path Trek** — 9 Days / 8 Nights, from USD 3,175. Moderate. Classic ridge trek Paro → Thimphu past Jele Dzong, sacred lakes Jimilang Tsho & Simkotra Tsho (4,050 m), Phajoding Monastery. Best Mar–May & Sep–Nov.
6. **Jomolhari Base Camp Trek** — 9 Days / 8 Nights, from USD 3,400. Challenging. Base camp at Jangothang (4,080 m) beneath Jomolhari (7,314 m). Best Apr–Jun & Sep–Oct.
- The 25-day Snowman Trek (one of the world's hardest treks) can be arranged on request.

### Festival
7. **Paro Tshechu Festival Tour** — 5 Days / 4 Nights, from USD 2,100. Late Mar/early Apr. Dawn Thongdrel unfurling, Cham mask dances, Tiger's Nest.
8. **Thimphu Tshechu Festival Tour** — 7 Days / 6 Nights, from USD 2,050. Sep/Oct. Festival at Tashichho Dzong plus Punakha and Paro.
9. **Punakha Drubchen & Tshechu** — 5 Days / 4 Nights, from USD 2,000. Feb/Mar. Warriors re-enacting the 17th-century victory over Tibet — virtually unknown to outsiders.

### Luxury & Wellness
10. **Bhutan Luxury Escape** — 7 Days / 6 Nights, from USD 4,500. 5-star lodges (Uma by COMO / Amankora tier), sunrise helicopter flight over the Himalaya, private monastery ceremony, private chef, VIP reception.
11. **Bhutan Wellness Retreat** — 8 Days / 7 Nights, from USD 3,800. Daily yoga & meditation, dotsho hot-stone spa, sound healing, gentle valley hikes.

## Hotel Tiers (per person per night, all-inclusive guide prices)
- **Standard (3-star)** USD 200–300 · **Deluxe (4-star boutique)** USD 350–500 · **Luxury (heritage resorts)** USD 500–700+.

## SDF — Sustainable Development Fee (regulations)
- USD 100 per person per night for international visitors.
- INR 1,200 per person per night for SAARC nationals (India, Bangladesh, Maldives).
- Children under 5: free. Children 6–11: 50% concession.
- Mandatory government levy, collected before visa/permit issuance. It funds Bhutan's free healthcare, free education, and carbon-negative environmental programmes.
- ALWAYS included in our quoted package price — no hidden charges.

## Visa & Entry
- SAARC nationals (India, Bangladesh, Maldives): no visa — an entry permit is required, which we arrange.
- All other nationalities: Bhutan Tourist Visa (USD 40, single entry) — we handle the full online application; no embassy visit needed. Passport must be valid 6+ months beyond travel dates.
- Visa clearance is issued only after full SDF payment; it is typically processed within 5 working days.
- Restricted-area permits (e.g. for treks) are included and arranged by us.

## Travel Documents (client portal)
- Once a booking is confirmed, we upload Flight Tickets (PDF), the Visa Clearance Letter (PDF), and Monument Entrance-Fee QR Codes to the client's portal, alongside live SDF and visa status tracking.
- Clients can ask this assistant for their documents by giving their booking reference (ARB-…) or by being signed in.
- SDF status values: PENDING → PAID → APPROVED. Visa status values: NOT_APPLIED → PROCESSING → ISSUED.

## Getting There
- All flights land at Paro International Airport (PBH) via Druk Air or Bhutan Airlines.
- Hubs: Bangkok, Singapore, Delhi, Kolkata, Kathmandu, Dhaka, Mumbai, Kuala Lumpur.
- Weather can delay Paro flights — we build buffer days into itineraries.

## Payment & Cancellation
- Bank transfer in USD or INR. 30% deposit confirms the booking; remaining 70% due 30 days before arrival. No credit cards/PayPal currently.
- Cancellation: 30+ days before arrival = full refund minus processing fees; 15–30 days = 50% refund; under 15 days = non-refundable. Travel insurance strongly recommended.

## Best Seasons
- Spring (Mar–May): rhododendrons, clear skies, Paro Tshechu. Most popular.
- Autumn (Sep–Nov): sharpest Himalayan views, Thimphu Tshechu.
- Winter (Dec–Feb): quiet, snow-dusted dzongs, black-necked cranes in Phobjikha.
- Monsoon (Jun–Aug): lush and green, occasional rain; quieter and greener.

## 2026 Festival Dates (exact)
Punakha Drubchen Feb 22–24 · Punakha Tshechu Feb 26–28 · Chhorten Kora Mar 3 & Mar 19 · Paro Tshechu Mar 29–Apr 2 · Rhododendron Festival Apr 13 · Ura Yakchoe Apr 28–May 2 · Nimalung Tshechu Jun 22–24 · Kurjey Tshechu Jun 24 · Thimphu Drubchen Sep 17 · Wangdue Tshechu Sep 19–21 · Thimphu Tshechu Sep 21–23 · Gangtey Tshechu Sep 24–26 · Jambay Lhakhang Drup Oct 26–29 · Black-Necked Crane Festival Nov 11 · Trashigang Tshechu Nov 18–20 · Trongsa Tshechu Dec 17–21.
Full calendar: /festival-calendar

## What Every Package Includes
Accommodation, all meals (B/L/D), licensed English-speaking guide, private vehicle & driver, SDF, visa/permit processing, all monument entry fees, airport transfers.
NOT included: international flights, travel insurance, personal expenses, alcoholic drinks, guide gratuities.

## Practical FAQs
- Currency: Ngultrum (BTN), pegged 1:1 to INR; INR accepted everywhere. ATMs in Thimphu/Paro; carry cash for rural areas.
- Connectivity: hotel WiFi in main valleys; local SIMs (Bhutan Telecom/TashiCell) at Paro Airport; weak signal on treks.
- Dress code: cover shoulders and knees in dzongs & monasteries. Layered clothing; strong sun at altitude.
- Bhutan is the world's only carbon-negative country; 70%+ forest cover is constitutionally mandated. Gross National Happiness guides policy.

## Useful Website Links (use these in answers as markdown links)
- Browse tours: /tours · Adventure Builder (custom trip): /adventure-builder · Contact & enquiry: /contact
- Festival calendar: /festival-calendar · FAQs: /faq · Client portal sign-up: /register · Sign in: /login
`
