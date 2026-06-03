'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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

    // Fetch role and route accordingly
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    router.push(profile?.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard')
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
