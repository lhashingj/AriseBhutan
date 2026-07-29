'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'

const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'Tours',    href: '/tours' },
  { label: 'Gallery',  href: '/gallery' },
  { label: 'Flight',   href: '/flight-schedule', children: [
      { label: 'Drukair Schedule',          href: '/flight-schedule?airline=druk' },
      { label: 'Bhutan Airlines Schedule',  href: '/flight-schedule?airline=bhutan' },
      { label: 'Helicopter Services',       href: '/helicopter-services' },
    ] },
  { label: 'About Us', href: '/about' },
  { label: 'Contact',  href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)
  const [user, setUser]             = useState<{ name: string; role: string } | null>(null)
  const [userMenuOpen, setUserMenu]       = useState(false)
  const [showLogoutConfirm, setLogoutConfirm] = useState(false)
  const userMenuRef                       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    if (!mobileOpen) setMobileSubOpen(null)
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Load auth state on mount and listen for changes
  useEffect(() => {
    async function loadUser(sessionUser: { id: string } | null) {
      if (!sessionUser) { setUser(null); return }
      const { data: prof } = await supabase
        .from('profiles').select('name, role').eq('id', sessionUser.id).single()
      setUser(prof ? { name: prof.name || sessionUser.id, role: prof.role } : null)
    }

    supabase.auth.getSession().then(({ data: { session } }) => loadUser(session?.user ?? null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      loadUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close user dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserMenu(false)
    setMobileOpen(false)
  }

  const solid = scrolled || mobileOpen

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-white shadow-sm dark:bg-stone-950 dark:shadow-black/40 dark:border-b dark:border-white/5'
          : 'bg-gradient-to-b from-black/55 via-black/20 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {/* White circle ensures logo is visible on any bg — no filter needed */}
            <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-sm ring-1 ring-white/30">
              <Image
                src="/images/logo.jpeg"
                alt="Arise Bhutan"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className={`hidden sm:block transition-colors duration-300 ${solid ? 'text-stone-900 dark:text-white' : 'text-white'}`}>
              <p className="font-serif font-bold text-[1.05rem] leading-tight">Arise Bhutan</p>
              <p className="text-[9px] tracking-[0.22em] uppercase opacity-55 font-semibold">Tours &amp; Travels</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              link.children ? (
                <div key={link.label} className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                      solid
                        ? 'text-stone-700 hover:text-amber-600 hover:bg-amber-50/80 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-white/5'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="w-60 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 py-2 overflow-hidden">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                    solid
                      ? 'text-stone-700 hover:text-amber-600 hover:bg-amber-50/80 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:bg-white/5'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+97577319405"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                solid ? 'text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400' : 'text-white/75 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              +975 77 319 405
            </a>

            <ThemeToggle
              className={
                solid
                  ? 'text-stone-500 hover:text-amber-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-amber-400 dark:hover:bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }
            />

            {user ? (
              /* ── Logged-in user menu ── */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu(!userMenuOpen)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                    solid
                      ? 'border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-600 bg-white dark:bg-stone-900 dark:border-stone-700 dark:text-stone-200 dark:hover:border-amber-500 dark:hover:text-amber-400'
                      : 'border-white/40 text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {user.name.split(' ')[0]}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 py-2 z-50 overflow-hidden transition-colors duration-300">
                    <div className="px-4 py-2 border-b border-stone-50 dark:border-stone-800 mb-1">
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{user.name}</p>
                    </div>
                    <Link
                      href={user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'}
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setUserMenu(false); setLogoutConfirm(true) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest buttons ── */
              <>
                <Link
                  href="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                    solid
                      ? 'border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-600 dark:border-stone-700 dark:text-stone-200 dark:hover:border-amber-500 dark:hover:text-amber-400'
                      : 'border-white/40 text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-amber-600/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile: theme toggle + hamburger ── */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle
              className={
                solid
                  ? 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10'
                  : 'text-white/85 hover:bg-white/10'
              }
            />
            <button
              className={`p-2 rounded-xl transition-all duration-200 ${
                solid ? 'text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/10' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className="lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: mobileOpen ? '760px' : '0px' }}
      >
        <div className="bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 px-4 pb-7 pt-2 transition-colors duration-300">
          {navLinks.map((link) => (
            link.children ? (
              <div key={link.label} className="border-b border-stone-50 dark:border-stone-800/60">
                <button
                  type="button"
                  onClick={() => setMobileSubOpen(mobileSubOpen === link.label ? null : link.label)}
                  className="w-full flex items-center justify-between py-3.5 text-stone-800 dark:text-stone-200 font-medium text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  {link.label}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileSubOpen === link.label ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: mobileSubOpen === link.label ? '200px' : '0px' }}
                >
                  <div className="pb-2 pl-3 flex flex-col">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="py-2.5 text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="flex py-3.5 text-stone-800 dark:text-stone-200 font-medium text-sm border-b border-stone-50 dark:border-stone-800/60 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          ))}

          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href="tel:+97577319405"
              className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              +975 77 319 405
            </a>

            {user ? (
              <>
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl px-4 py-2.5 text-center">
                  <p className="text-xs text-stone-400 dark:text-stone-500">Signed in as</p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{user.name}</p>
                </div>
                <Link
                  href={user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-2xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); setLogoutConfirm(true) }}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center py-3 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-2xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 text-sm rounded-2xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up — It&apos;s Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/70 px-4">
          <div className="bg-white dark:bg-stone-900 dark:border dark:border-stone-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm transition-colors duration-300">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-50 text-center">Sign out?</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm text-center mt-1 mb-6">You'll need to sign in again to access your account.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => { await handleLogout(); setLogoutConfirm(false) }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
