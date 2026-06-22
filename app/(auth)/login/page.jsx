'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || ''

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function signInWithGoogle() {
    setGoogleLoading(true)
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }

    // Fetch role then redirect to ?next= or role-based dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (next && next.startsWith('/')) {
      router.push(next)
    } else {
      router.push(profile?.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard')
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Welcome back</h1>
        <p className="text-stone-500 text-sm mt-1">Sign in to your Arise Bhutan portal</p>
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
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputCls}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-stone-700">Password</label>
          </div>
          <div className="relative">
            <input
              required
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className={`${inputCls} pr-11`}
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.email || !form.password}
          className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</span>
            : <><LogIn className="w-4 h-4" /> Sign In</>
          }
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-stone-200" />
        <span className="text-xs text-stone-400 uppercase tracking-wider">or</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading
          ? <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          : <GoogleIcon />
        }
        Continue with Google
      </button>

      <div className="text-center text-sm text-stone-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-amber-600 font-semibold hover:text-amber-700 hover:underline transition-colors">
          Create one
        </Link>
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
          ← Back to website
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
