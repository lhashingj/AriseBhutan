'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Check, Mail } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="space-y-7">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Check your email</h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
            We&apos;ve sent a password reset link to <strong className="text-stone-700">{email}</strong>. Check your inbox and click the link to set a new password.
          </p>
        </div>

        <p className="text-center text-xs text-stone-400">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            className="text-amber-600 hover:underline font-medium"
            onClick={() => { setSent(false) }}
          >
            try again
          </button>
          .
        </p>

        <div className="text-center">
          <Link href="/login" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
          <Mail className="w-6 h-6 text-amber-700" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Reset your password</h1>
        <p className="text-stone-500 text-sm mt-1">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</span>
            : 'Send Reset Link'
          }
        </button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
