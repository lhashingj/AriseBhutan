'use client'
import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'

interface FormData {
  name: string; email: string; phone: string; country: string
  tourInterest: string; travelDate: string; groupSize: string; duration: string
  interests: string[]; message: string
}

const INTERESTS = ['Cultural Heritage', 'Trekking & Adventure', 'Festival Experience', 'Photography', 'Wellness & Meditation', 'Luxury Travel', 'Wildlife & Nature', 'Spiritual Journey']

const STEPS = ['Contact', 'Travel Details', 'Preferences']

export default function BookingForm({ defaultTour = '' }: { defaultTour?: string }) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Inquiry Received!</h3>
        <p className="text-stone-600 max-w-md mx-auto">
          Thank you, <strong>{data.name}</strong>! Our Bhutan travel specialist will contact you within 24 hours to craft your perfect itinerary.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-stone-900' : 'text-stone-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px w-8 ${i < step ? 'bg-amber-600' : 'bg-stone-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0: Contact */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                <input required value={data.name} onChange={(e) => set('name', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
                <input required type="email" value={data.email} onChange={(e) => set('email', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="your@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone / WhatsApp</label>
                <input value={data.phone} onChange={(e) => set('phone', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Country of Residence *</label>
                <input required value={data.country} onChange={(e) => set('country', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. United States" />
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)}
              disabled={!data.name || !data.email || !data.country}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: Travel Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tour of Interest</label>
              <select value={data.tourInterest} onChange={(e) => set('tourInterest', e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                <option value="">Select a tour (or describe below)</option>
                <option>Classic Bhutan Cultural Tour — 5D/4N</option>
                <option>Bhutan Heritage Trail — 7D/6N</option>
                <option>Kingdom of Happiness — 10D/9N</option>
                <option>Tiger's Nest Day Hike — 1 Day</option>
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
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Group Size</label>
                <select value={data.groupSize} onChange={(e) => set('groupSize', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  {['1', '2', '3', '4', '5', '6–10', '10–15', '15+'].map((n) => (
                    <option key={n}>{n} {n === '1' ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
              <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
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
                    className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      data.interests.includes(interest)
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                  >
                    {data.interests.includes(interest) && <Check className="w-3 h-3 inline mr-1" />}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Additional Notes or Questions</label>
              <textarea value={data.message} onChange={(e) => set('message', e.target.value)} rows={4}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                placeholder="Any dietary requirements, accessibility needs, or specific interests you'd like us to know..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Submit Inquiry
              </button>
            </div>
            <p className="text-xs text-stone-400 text-center">
              We respond within 24 hours. No payment required at this stage.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
