// Sentry edge-runtime error monitoring (middleware, edge API routes).
// Safe no-op until SENTRY_DSN is set — get a free DSN at sentry.io.
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  })
}
