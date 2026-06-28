'use client'

import { useState } from 'react'
import { Check, AlertCircle, Zap, Compass } from 'lucide-react'
import BookingForm from '@/components/BookingForm'
import PhoneInput from '@/components/PhoneInput'

const inputCls =
  'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

function QuickEnquiryForm() {
  const [data, setData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }))
  const canSubmit = data.name.trim() && data.email.trim() && data.message.trim()

  if (submitted) {
    return (
      <div className="text-center py-10 sm:py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Message Sent!</h3>
        <p className="text-stone-600 max-w-sm mx-auto text-sm leading-relaxed">
          Thank you, <strong>{submittedName}</strong>! Our Bhutan travel team will get back to you
          within 24 hours.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/simple-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    data.name,
          email:   data.email,
          phone:   data.phone,
          message: data.message,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmittedName(data.name)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please email us directly at arisebhutan@gmail.com.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Your Name *</label>
          <input
            required
            value={data.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls}
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">E-mail *</label>
          <input
            required
            type="email"
            value={data.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputCls}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Mobile</label>
        <PhoneInput
          id="phone"
          value={data.phone}
          onChange={v => set('phone', v)}
          placeholder="Phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Message *</label>
        <textarea
          required
          value={data.message}
          onChange={(e) => set('message', e.target.value)}
          rows={5}
          className={`${inputCls} resize-none`}
          placeholder="Tell us about your dream Bhutan trip — dates, group size, interests…"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          'Send It'
        )}
      </button>

      <p className="text-xs text-stone-400 text-center">We respond within 24 hours. No payment required.</p>
    </form>
  )
}

type Mode = 'quick' | 'builder'

export default function ContactFormSection() {
  const [mode, setMode] = useState<Mode>('quick')

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-6 sm:p-8 md:p-10">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          {mode === 'quick' ? 'Contact Us' : 'Send Us Your Enquiry'}
        </h2>
        <p className="text-stone-500 text-sm">
          {mode === 'quick'
            ? 'Drop us a message and our team will respond within 24 hours.'
            : 'Fill in the form below — our specialist will respond with a custom quote and itinerary within 24 hours.'}
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl mb-7">
        <button
          type="button"
          onClick={() => setMode('quick')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'quick'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          Quick Enquiry
        </button>
        <button
          type="button"
          onClick={() => setMode('builder')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'builder'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Compass className="w-4 h-4" />
          Adventure Builder
        </button>
      </div>

      {mode === 'quick' ? <QuickEnquiryForm /> : <BookingForm />}
    </div>
  )
}
