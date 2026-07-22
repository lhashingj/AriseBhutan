/**
 * Fires the "Lead" conversion event on GA4 and Meta Pixel, if either
 * is configured (see components/AdPixels.jsx). Safe to call
 * unconditionally — silently does nothing when a pixel isn't loaded.
 */
export function trackLead(details = {}) {
  if (typeof window === 'undefined') return

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', details)
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', details)
  }
}
