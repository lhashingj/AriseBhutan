'use client'

import { useState } from 'react'
import { Download, FileText, Clock, CheckCircle2 } from 'lucide-react'

export default function SampleItineraryMagnet() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        window.location.href = '/api/sample-itinerary'
      } else {
        const data = await res.json()
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-stone-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url(/images/monastery-architecture.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-800/60 border border-stone-700 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-amber-600/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
            <FileText className="w-9 h-9 text-amber-400" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-2 block">Free Download</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              Get a Real 5-Day Bhutan Itinerary — Free
            </h2>
            <p className="text-stone-400 text-sm sm:text-base mb-1 max-w-xl">
              The exact day-by-day plan, inclusions, and pricing from our most-booked Classic Bhutan Cultural Tour — as a PDF you can keep, compare, and share.
            </p>
            <p className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-amber-400/90 mb-5 mt-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              Today&apos;s discounted $100/night SDF rate is locked in only through August 31, 2027
            </p>

            {status === 'success' ? (
              <div className="bg-green-600/15 border border-green-500/25 rounded-xl px-4 py-3 text-sm text-green-400 flex items-center gap-2 max-w-md mx-auto md:mx-0">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Your download is starting — check your downloads folder.
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto md:mx-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Your email"
                    disabled={status === 'loading'}
                    className="flex-1 px-3.5 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors min-w-0 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {status === 'loading' ? 'Preparing…' : 'Get the PDF'}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-xs text-red-400 mt-2">{message}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
