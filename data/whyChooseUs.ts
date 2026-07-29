// Single source of truth for "Why Travel With Arise Bhutan" — reused across
// the itinerary voucher, the booking voucher, the emailed/downloaded PDF
// voucher, and the homepage, so all four stay in sync. Every claim here is
// grounded in what's already established elsewhere on the site (DOT license,
// private/personalized tours, direct SDF remittance, licensed guides, 24/7
// support, flight/helicopter arranging, 24-hour quote turnaround) rather
// than invented perks.

export interface WhyReason {
  title: string;
  body: string;
}

export const WHY_ARISE_BHUTAN: WhyReason[] = [
  {
    title: 'Fully Private, Built Around You',
    body: 'No fixed departures, no group tours. Every itinerary is planned from scratch around your dates, pace and interests.',
  },
  {
    title: 'DOT-Licensed & Guide-Certified',
    body: 'Licensed under Bhutan’s Department of Tourism (Lic. No. 50001567), with every guide DOT-certified — never subcontracted freelancers.',
  },
  {
    title: 'Your SDF, Remitted Directly',
    body: 'We remit your Sustainable Development Fee straight to the Royal Government, funding Bhutan’s free healthcare, education and carbon-neutral policies.',
  },
  {
    title: 'One Team for Visa, Flights & Permits',
    body: 'Visa processing, restricted-area permits, and even your Drukair/Bhutan Airlines flights and helicopter charters — arranged through a single point of contact.',
  },
  {
    title: '24/7 Support, On the Ground in Paro',
    body: 'Based in Bhutan, not a call centre overseas — our team is reachable around the clock while you’re travelling.',
  },
  {
    title: 'Honest, Itemized Quotes in 24 Hours',
    body: 'A detailed quote with SDF, permits and fees itemized upfront, so nothing is added later.',
  },
];
