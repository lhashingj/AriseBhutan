/**
 * Next.js instrumentation hook — routes Sentry init to the right
 * runtime. Safe no-op until SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN are
 * set (see sentry.server.config.js / sentry.edge.config.js).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
