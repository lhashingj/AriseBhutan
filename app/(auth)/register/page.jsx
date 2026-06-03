'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const pwMatch   = form.password === form.confirm
  const pwStrong  = form.password.length >= 8

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pwMatch)  return setError('Passwords do not match.')
    if (!pwStrong) return setError('Password must be at least 8 characters.')

    setLoading(true)
    setError('')

    // Create auth user
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  { data: { name: form.name } },
    })

    if (signUpErr) {
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    // Upsert profile row (trigger handles insert but this ensures name is set)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id:    data.user.id,
        name:  form.name,
        email: form.email,
        role:  'CLIENT',
      })
    }

    setSuccess(true)
    setLoading(false)

    // If auto-confirmed, redirect immediately
    if (data.session) {
      setTimeout(() => router.push('/client/dashboard'), 1200)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">Account Created!</h2>
        <p className="text-stone-500 text-sm max-w-xs mx-auto">
          {`Check your inbox for a confirmation email, then sign in to access your portal.`}
        </p>
        <Link href="/login" className="btn-primary inline-flex mt-2">
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
          {error}
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
        <Link href="/login" className="text-amber-600 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
