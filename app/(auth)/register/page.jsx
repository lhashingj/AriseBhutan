'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

// Known disposable / temporary email provider domains
const BLOCKED_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamailblock.com', 'grr.la', 'spam4.me', 'sharklasers.com',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.at',
  'trashmail.io', 'trashmail.xyz', 'trashmail.org',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.de',
  '10minemail.com', '10minutemail.co.za',
  'tempmail.com', 'tempmail.net', 'tempmail.io', 'tempmailo.com',
  'temp-mail.org', 'temp-mail.io', 'temp-mail.ru',
  'throwaway.email', 'throwam.com',
  'yopmail.com', 'yopmail.fr',
  'dispostable.com', 'discardmail.com', 'discardmail.de',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'mailnull.com', 'mailnesia.com', 'maildrop.cc',
  'fakeinbox.com', 'fakeinbox.org',
  'discard.email', 'emailondeck.com',
  'getnada.com', 'mohmal.com',
  'einrot.com', 'einrot.de',
  'filzmail.com', 'filzmail.de',
  'getairmail.com', 'mailexpire.com',
  'spamhere.com', 'spamhereplease.com', 'spamcorner.com',
  'spamoff.de', 'spamevader.com',
  'tempinbox.com', 'tempinbox.co.uk',
  'tempsky.com', 'tempail.com',
  'mt2015.com', 'mt2016.com', 'mt2017.com',
  'byom.de', 'wegwerfmail.de', 'wegwerfmail.org', 'wegwerfmail.net',
  'sogetthis.com', 'spamavert.com',
  'boximail.com', 'crazymailing.com',
  'binkmail.com', 'bobmail.info', 'meltmail.com',
  'mytrashmail.com', 'mytempemail.com',
  'trashdevil.com', 'trashdevil.de',
  'spamfree24.org', 'spamfree.eu',
  'junk1.com', 'mail-temporaire.fr',
  'safetymail.info', 'safe-mail.net',
  'no-spam.ws', 'nospam.ze.tc', 'nospam4.us',
  'anonbox.net', 'anonymbox.com',
])

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return BLOCKED_DOMAINS.has(domain)
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || ''

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const pwMatch  = form.password === form.confirm
  const pwStrong = form.password.length >= 8

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pwMatch)  return setError('Passwords do not match.')
    if (!pwStrong) return setError('Password must be at least 8 characters.')

    // Block disposable email addresses before hitting the API
    if (isDisposableEmail(form.email)) {
      return setError(
        'Temporary or disposable email addresses are not accepted. Please use your real email — we need it to send your booking vouchers and confirmations.'
      )
    }

    setLoading(true)
    setError('')

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  { data: { name: form.name } },
    })

    if (signUpErr) {
      const raw = signUpErr.message ?? ''
      const msg = String(raw).toLowerCase()
      const isEmpty = !raw || raw === '{}' || raw === '{}'
      if (isEmpty || msg.includes('sending') || msg.includes('email') || msg.includes('smtp') || msg.includes('rate')) {
        setError(
          'We couldn\'t send your confirmation email right now. Our email service may be temporarily busy — please try again in a few minutes, or email us directly at arisebhutan@gmail.com.'
        )
      } else if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setError(String(raw) || 'Something went wrong. Please try again.')
      }
      setLoading(false)
      return
    }

    // Upsert profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id:    data.user.id,
        name:  form.name,
        email: form.email,
        role:  'CLIENT',
      })
    }

    setLoading(false)
    // If confirmation is disabled Supabase returns a session immediately — redirect.
    // If confirmation is enabled, no session yet — show inbox screen.
    if (data?.session) {
      router.push(next || '/client/dashboard')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-5">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-40" />
          <div className="relative w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Mail className="w-7 h-7 text-amber-600" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Check Your Inbox</h2>
          <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-stone-700">{form.email}</span>.<br />
            Click the link to activate your account, then sign in.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left space-y-2">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Didn&apos;t receive it?</p>
          <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside">
            <li>Check your spam / junk folder</li>
            <li>Make sure <span className="font-medium">{form.email}</span> is correct</li>
            <li>Allow a minute or two for delivery</li>
          </ul>
        </div>

        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="btn-primary inline-flex mt-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Create your account</h1>
        <p className="text-stone-500 text-sm mt-1">Build and manage your Bhutan itinerary</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputCls}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Password *</label>
          <div className="relative">
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className={`${inputCls} pr-11`}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password && (
            <p className={`text-xs mt-1 ${pwStrong ? 'text-green-600' : 'text-red-500'}`}>
              {pwStrong ? '✓ Strong enough' : '✗ At least 8 characters required'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm Password *</label>
          <input
            required
            type={showPw ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            className={`${inputCls} ${form.confirm && !pwMatch ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
          {form.confirm && !pwMatch && (
            <p className="text-xs text-red-500 mt-1">✗ Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !form.name || !form.email || !pwStrong || !pwMatch}
          className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</span>
            : <><UserPlus className="w-4 h-4" /> Create Account</>
          }
        </button>
      </form>

      <p className="text-xs text-stone-400 text-center">
        By registering you agree to Arise Bhutan&apos;s booking terms and privacy policy.
      </p>

      <div className="text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-amber-600 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
