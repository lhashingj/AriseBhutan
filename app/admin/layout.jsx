'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, Map, LogOut, Shield, Menu, UserCircle, MessageCircle } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { subscribeToAllThreads, fetchAdminUnreadTotal } from '@/utils/chat'

const navItems = [
  { label: 'Overview',    href: '/admin/dashboard',   icon: LayoutDashboard },
  { label: 'Itineraries', href: '/admin/itineraries', icon: Map },
  { label: 'Chat',        href: '/admin/chat',        icon: MessageCircle },
  { label: 'Clients',     href: '/admin/users',       icon: Users },
  { label: 'My Profile',  href: '/admin/profile',     icon: UserCircle },
]

export default function AdminLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile, setProfile]   = useState(null)
  const [checking, setChecking] = useState(true)
  const [sideOpen, setSideOpen]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [unreadChat, setUnreadChat]   = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!data || data.role !== 'ADMIN') {
        router.push('/client/dashboard')
        return
      }
      setProfile(data)
      setChecking(false)
    })
  }, [router])

  // Total unread across every client thread, for the sidebar badge.
  useEffect(() => {
    if (!profile) return
    async function loadUnread() {
      const count = await fetchAdminUnreadTotal().catch(() => 0)
      setUnreadChat(count)
    }
    loadUnread()
    const unsubscribe = subscribeToAllThreads(loadUnread)
    return () => unsubscribe()
  }, [profile])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 text-sm">Verifying admin access…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-stone-950">
      {/* ── Admin Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 border-r border-white/5 flex flex-col transition-transform duration-300
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex-shrink-0
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white overflow-hidden flex-shrink-0">
              <Image src="/images/logo.jpeg" alt="Arise Bhutan" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="font-serif font-bold text-white text-sm leading-tight">Arise Bhutan</p>
              <p className="text-[9px] tracking-widest uppercase text-amber-500 font-semibold">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="mx-3 mt-4">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400 text-[11px] font-semibold uppercase tracking-wider">Administrator</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
            return (
              <Link key={label} href={href} onClick={() => setSideOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  active
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-stone-400 hover:text-white hover:bg-white/10'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
                {label === 'Chat' && unreadChat > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                    {unreadChat > 9 ? '9+' : unreadChat}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Profile + Sign out */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <Link href="/admin/profile" onClick={() => setSideOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url
                ? <Image src={profile.avatar_url} alt="" fill sizes="32px" className="object-cover" />
                : <span className="text-amber-400 font-bold text-xs">{profile?.name?.[0]?.toUpperCase() || 'A'}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.name}</p>
              <p className="text-stone-500 text-xs truncate">{profile?.email}</p>
            </div>
          </Link>
          <button onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-950">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-stone-900 border-b border-white/10">
          <button onClick={() => setSideOpen(true)} className="p-2 rounded-xl text-stone-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-serif font-bold text-white">Admin Panel</p>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Logout confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-stone-800 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white text-center">Sign out?</h3>
            <p className="text-stone-400 text-sm text-center mt-1 mb-6">You'll be signed out of the admin panel.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-stone-300 text-sm font-semibold hover:bg-white/5 transition-colors"
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
