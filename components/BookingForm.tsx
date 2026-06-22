'use client'
import { useState } from 'react'
import { Check, ChevronRight, AlertCircle } from 'lucide-react'

interface FormData {
  name: string; email: string; phone: string; country: string
  tourInterest: string; travelDate: string; groupSize: string; duration: string
  interests: string[]; message: string
}

const INTERESTS = [
  'Cultural Heritage', 'Trekking & Adventure', 'Festival Experience', 'Photography',
  'Wellness & Meditation', 'Luxury Travel', 'Wildlife & Nature', 'Spiritual Journey',
]

const STEPS = ['Contact', 'Travel Details', 'Preferences']

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

export default function BookingForm({ defaultTour = '' }: { defaultTour?: string }) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [data, setData] = useState<FormData>({
    name: '', email: '', phone: '', country: '',
    tourInterest: defaultTour, travelDate: '', groupSize: '2', duration: '',
    interests: [], message: '',
  })

  const set = (k: keyof FormData, v: string | string[]) =>
    setData((d) => ({ ...d, [k]: v }))

  const toggleInterest = (i: string) =>
    set('interests', data.interests.includes(i)
      ? data.interests.filter((x) => x !== i)
      : [...data.interests, i])

  if (submitted) {
    return (
      <div className="text-center py-10 sm:py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Inquiry Received!</h3>
        <p className="text-stone-600 max-w-md mx-auto text-sm sm:text-base">
          Thank you, <strong>{data.name}</strong>! Our Bhutan travel specialist will contact you within 24 hours to craft your perfect itinerary.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Step indicator — compact on mobile, full labels on sm+ */}
      <div className="flex items-center mb-7 sm:mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i <= step ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`hidden sm:block ml-1.5 text-xs font-medium whitespace-nowrap ${i === step ? 'text-stone-900' : 'text-stone-400'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 sm:mx-3 ${i < step ? 'bg-amber-500' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setSubmitError('')
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (!res.ok) throw new Error('Failed')
          setSubmitted(true)
        } catch {
          setSubmitError('Something went wrong sending your enquiry. Please email us directly at arisebhutan@gmail.com.')
        } finally {
          setSubmitting(false)
        }
      }}>
        {/* Step 0: Contact */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                <input required value={data.name} onChange={(e) => set('name', e.target.value)}
                  className={inputCls} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
                <input required type="email" value={data.email} onChange={(e) => set('email', e.target.value)}
                  className={inputCls} placeholder="your@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone / WhatsApp</label>
                <input value={data.phone} onChange={(e) => set('phone', e.target.value)}
                  className={inputCls} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Country of Residence *</label>
                <input required value={data.country} onChange={(e) => set('country', e.target.value)}
                  className={inputCls} placeholder="e.g. United States" />
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)}
              disabled={!data.name || !data.email || !data.country}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: Travel Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tour of Interest</label>
              <select value={data.tourInterest} onChange={(e) => set('tourInterest', e.target.value)} className={inputCls}>
                <option value="">Select a tour (or describe below)</option>
                <option>Classic Bhutan Cultural Tour — 5D/4N</option>
                <option>Bhutan Heritage Trail — 7D/6N</option>
                <option>Kingdom of Happiness — 10D/9N</option>
                <option>Tiger&apos;s Nest Day Hike — 1 Day</option>
                <option>Druk Path Trek — 6D/5N</option>
                <option>Jomolhari Base Camp Trek — 9D/8N</option>
                <option>Paro Tshechu Festival Tour — 5D/4N</option>
                <option>Thimphu Tshechu Festival Tour — 5D/4N</option>
                <option>Punakha Drubchen — 5D/4N</option>
                <option>Bhutan Luxury Escape — 7D/6N</option>
                <option>Bhutan Wellness Retreat — 8D/7N</option>
                <option>Custom itinerary (please describe)</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Preferred Travel Date</label>
                <input type="date" value={data.travelDate} onChange={(e) => set('travelDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Group Size</label>
                <select value={data.groupSize} onChange={(e) => set('groupSize', e.target.value)} className={inputCls}>
                  {['1', '2', '3', '4', '5', '6–10', '10–15', '15+'].map((n) => (
                    <option key={n}>{n} {n === '1' ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
              <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Special Interests (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    type="button" key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs sm:text-sm transition-all min-h-[44px] ${
                      data.interests.includes(interest)
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                  >
                    {data.interests.includes(interest) && <Check className="w-3 h-3 inline mr-1 flex-shrink-0" />}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Additional Notes or Questions</label>
              <textarea value={data.message} onChange={(e) => set('message', e.target.value)} rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Any dietary requirements, accessibility needs, or specific interests you'd like us to know..." />
            </div>
            {submitError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1" disabled={submitting}>Back</button>
              <button type="submit" className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  : <><Check className="w-4 h-4" /> Submit Inquiry</>
                }
              </button>
            </div>
            <p className="text-xs text-stone-400 text-center">We respond within 24 hours. No payment required at this stage.</p>
          </div>
        )}
      </form>
    </div>
  )
}
