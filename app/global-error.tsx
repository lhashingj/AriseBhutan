'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Catches errors thrown in the root layout itself (rare — most errors
 * are caught by page-level boundaries). Reports to Sentry when
 * configured; always renders a minimal recovery screen since this
 * replaces the entire document, including <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#fafaf9', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#78716c', marginBottom: 20, lineHeight: 1.6 }}>
              We&apos;ve been notified and are looking into it. Please try again, or contact us at{' '}
              <a href="mailto:arisebhutan@gmail.com" style={{ color: '#d97706' }}>arisebhutan@gmail.com</a>.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#d97706', color: '#fff', border: 'none', borderRadius: 10,
                padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
