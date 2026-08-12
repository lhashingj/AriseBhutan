interface RouteMapProps {
  /** Day-ordered location names, e.g. tour.itinerary.map(d => d.location) */
  locations: (string | null | undefined)[]
  className?: string
}

// No Google Maps API key is configured for this project, so this uses Google's
// long-standing key-less embed trick (classic maps.google.com "output=embed")
// to show a real driving route on the real Bhutan road network, rather than a
// hand-drawn schematic. Verified working (200, resolves real directions) as of
// this writing — if Google ever retires it, swap this for the official
// Maps Embed API (requires an API key + billing).
function buildEmbedUrl(stops: string[]): string {
  const places = stops.map((s) => encodeURIComponent(`${s}, Bhutan`))
  const [origin, ...rest] = places
  return `https://www.google.com/maps?saddr=${origin}&daddr=${rest.join('+to:')}&output=embed`
}

export default function RouteMap({ locations, className = '' }: RouteMapProps) {
  // Collapse consecutive repeats into one stop (e.g. 2 nights in Thimphu = 1 stop).
  const stops: string[] = []
  for (const loc of locations) {
    if (!loc) continue
    if (stops[stops.length - 1] === loc) continue
    stops.push(loc)
  }

  if (stops.length < 2) return null

  return (
    <div className={className}>
      <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-1">Route Map</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">{stops.join(' → ')}</p>
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden aspect-[16/10]">
        <iframe
          src={buildEmbedUrl(stops)}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Route map: ${stops.join(' → ')}`}
        />
      </div>
    </div>
  )
}
