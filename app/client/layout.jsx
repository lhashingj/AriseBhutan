'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, FileText, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const navItems = [
  { label: 'Dashboard',  href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'My Vouchers', href: '/client/dashboard', icon: FileText },
]

export default function ClientLayout({ children }) {
  const router = useRouter()
  const [profile, setProfile]     = useState(null)
  const [checking, setChecking]   = useState(true)
  const [sidebarOpen, setSidebar] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading your portal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white overflow-hidden flex-shrink-0">
              <Image src="/images/logo-buddha.png" alt="Arise Bhutan" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="font-serif font-bold text-white text-sm leading-tight">Arise Bhutan</p>
              <p className="text-[9px] tracking-widest uppercase text-stone-500">Client Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setSidebar(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Profile + Sign Out */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <div className="px-3 py-2">
            <p className="text-white text-sm font-medium truncate">{profile?.name || 'Client'}</p>
            <p className="text-stone-500 text-xs truncate">{profile?.email}</p>
          </div>
          <button
            onClick={signOut}
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
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100">
          <button onClick={() => setSidebar(true)} className="p-2 rounded-xl text-stone-600 hover:bg-stone-100">
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-serif font-bold text-stone-900">Client Portal</p>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
