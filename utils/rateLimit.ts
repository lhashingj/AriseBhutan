/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 *
 * Caveat: serverless functions can cold-start at any time, which resets
 * this in-memory store — so this is best-effort bot/abuse deterrence,
 * not a hard guarantee. It's sufficient for a low-traffic marketing
 * site's public forms without adding a paid Redis dependency; upgrade
 * to Upstash/Vercel KV if traffic volume ever demands a durable limiter.
 */

const buckets = new Map<string, number[]>()

// Periodically drop empty/stale buckets so the Map doesn't grow forever
// across a long-lived warm lambda.
let lastSweep = Date.now()
function sweep(windowMs: number) {
  const now = Date.now()
  if (now - lastSweep < 5 * 60_000) return
  lastSweep = now
  buckets.forEach((timestamps, key) => {
    const fresh = timestamps.filter(t => now - t < windowMs)
    if (fresh.length === 0) buckets.delete(key)
    else buckets.set(key, fresh)
  })
}

/**
 * Returns true if `key` has exceeded `limit` requests within `windowMs`.
 * Records the current attempt regardless of outcome.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  sweep(windowMs)
  const now = Date.now()
  const timestamps = (buckets.get(key) || []).filter(t => now - t < windowMs)

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps)
    return true
  }

  timestamps.push(now)
  buckets.set(key, timestamps)
  return false
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export function rateLimitResponse(retryAfterSeconds = 60) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again in a few minutes.' }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': String(retryAfterSeconds),
      },
    }
  )
}
