'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import PhoneInput from '@/components/PhoneInput'
import CountrySelect from '@/components/CountrySelect'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100 dark:placeholder:text-stone-500'

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

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', country: '' })
  const [showPw, setShowPw]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess]       = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthErr) {
      setError(oauthErr.message)
      setGoogleLoading(false)
    }
  }

  const pwMatch  = form.password === form.confirm
  const pwStrong = form.password.length >= 8

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pwMatch)        return setError('Passwords do not match.')
    if (!pwStrong)       return setError('Password must be at least 8 characters.')
    if (!form.country)   return setError('Please select your country of residence so we can apply the correct SDF and visa rates.')

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
      options:  {
        data: {
          name:        form.name,
          phone:       form.phone       || null,
          nationality: form.country     || null,
        },
      },
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

    // Upsert profile row — only runs when session exists (email confirmation off).
    // When confirmation is required, the handle_new_user trigger saves the data instead.
    if (data.user && data.session) {
      await supabase.from('profiles').upsert({
        id:          data.user.id,
        name:        form.name,
        email:       form.email,
        role:        'CLIENT',
        phone:       form.phone    || null,
        nationality: form.country  || null,
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
          <div className="absolute inset-0 bg-amber-100 dark:bg-amber-500/20 rounded-full animate-ping opacity-40" />
          <div className="relative w-16 h-16 bg-amber-100 dark:bg-amber-500/15 rounded-full flex items-center justify-center">
            <Mail className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">Check Your Inbox</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-stone-700 dark:text-stone-200">{form.email}</span>.<br />
            Click the link to activate your account, then sign in.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl px-5 py-4 text-left space-y-2">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Didn&apos;t receive it?</p>
          <ul className="text-sm text-stone-600 dark:text-stone-300 space-y-1 list-disc list-inside">
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
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">Create your account</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Build and manage your Bhutan itinerary</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Full Name *</label>
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
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Country of Residence *</label>
          <CountrySelect
            id="country"
            value={form.country}
            onChange={v => set('country', v)}
            placeholder="Search country…"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Phone / WhatsApp</label>
          <PhoneInput
            id="phone"
            value={form.phone}
            onChange={v => set('phone', v)}
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email Address *</label>
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
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Password *</label>
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
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Confirm Password *</label>
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
          disabled={loading || !form.name || !form.email || !pwStrong || !pwMatch || !form.country}
          className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</span>
            : <><UserPlus className="w-4 h-4" /> Create Account</>
          }
        </button>
      </form>

      <p className="text-xs text-stone-400 dark:text-stone-500 text-center">
        By registering you agree to Arise Bhutan&apos;s booking terms and privacy policy.
      </p>

      <div className="text-center text-sm text-stone-500 dark:text-stone-400">
        Already have an account?{' '}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-amber-600 font-semibold hover:underline">
          Sign in
        </Link>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">or continue with</span>
        <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
      </div>

      {/* Google Sign Up */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {googleLoading
          ? <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          : <GoogleIcon />
        }
        Continue with Google
      </button>
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
