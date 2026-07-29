'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, UserCircle, LogOut, Menu, MailWarning, RefreshCw, MapPin } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { useEmailVerified } from '@/utils/useEmailVerified'
import ThemeToggle from '@/components/ThemeToggle'
import ClientNotificationBell from '@/components/ClientNotificationBell'

const navItems = [
  { label: 'Dashboard',      href: '/client/dashboard',   icon: LayoutDashboard },
  { label: 'My Itineraries', href: '/client/itineraries', icon: MapPin },
  { label: 'My Profile',     href: '/client/profile',     icon: UserCircle },
]

export default function ClientLayout({ children }) {
  const router = useRouter()
  const [profile, setProfile]     = useState(null)
  const [checking, setChecking]   = useState(true)
  const [sidebarOpen, setSidebar]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resendSent, setResendSent]   = useState(false)
  const [resendError, setResendError] = useState('')

  const { verified, loading: verifyLoading, resend } = useEmailVerified()

  async function handleResend() {
    setResendError('')
    const { error } = await resend()
    if (error) {
      setResendError('Couldn\'t send email — try again in a few minutes.')
    } else {
      setResendSent(true)
      setTimeout(() => setResendSent(false), 30000)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
      setChecking(false)
    })
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading your portal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 flex flex-col transition-transform duration-300
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white overflow-hidden flex-shrink-0">
              <Image src="/images/logo.jpeg" alt="Arise Bhutan" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="font-serif font-bold text-white text-sm leading-tight">Arise Bhutan</p>
              <p className="text-[9px] tracking-widest uppercase text-stone-500">Client Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = typeof window !== 'undefined' && window.location.pathname === href
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setSidebar(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Profile + Sign Out */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">Theme</span>
            <div className="flex items-center gap-1">
              <ClientNotificationBell className="text-stone-400 hover:text-amber-400 hover:bg-white/10" align="left" direction="up" />
              <ThemeToggle className="text-stone-400 hover:text-amber-400 hover:bg-white/10" />
            </div>
          </div>
          <Link href="/client/profile" onClick={() => setSidebar(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url
                ? <Image src={profile.avatar_url} alt="" fill sizes="32px" className="object-cover" />
                : <span className="text-amber-400 font-bold text-xs">{profile?.name?.[0]?.toUpperCase() || '?'}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.name || 'Client'}</p>
              <p className="text-stone-500 text-xs truncate">{profile?.email}</p>
            </div>
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
          <button onClick={() => setSidebar(true)} className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-serif font-bold text-stone-900 dark:text-stone-50">Client Portal</p>
          <div className="flex items-center gap-1">
            <ClientNotificationBell className="text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10" />
            <ThemeToggle className="text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10" />
          </div>
        </div>

        {/* ── Email verification banner ── */}
        {!verifyLoading && verified === false && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 sm:px-6 py-3 flex flex-col gap-1.5 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <MailWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-200 leading-snug">
                  <span className="font-semibold">Verify your email address.</span>{' '}
                  Check your inbox for the confirmation link we sent you. You won&apos;t be able to submit bookings until your email is verified.
                </p>
              </div>
              <button
                onClick={handleResend}
                disabled={resendSent}
                className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 disabled:opacity-50 disabled:cursor-default transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendSent ? '' : 'hover:rotate-180 transition-transform'}`} />
                {resendSent ? 'Email sent!' : 'Resend email'}
              </button>
            </div>
            {resendError && (
              <p className="text-xs text-red-600 pl-6">{resendError}</p>
            )}
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Logout confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 px-4">
          <div className="bg-white dark:bg-stone-900 dark:border dark:border-stone-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm transition-colors duration-300">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-50 text-center">Sign out?</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm text-center mt-1 mb-6">You'll need to sign in again to access your portal.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={signOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
