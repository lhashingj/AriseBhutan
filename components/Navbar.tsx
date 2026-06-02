'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Tours', href: '/tours',
    children: [
      { label: 'Cultural Tours',       href: '/tours?cat=cultural' },
      { label: 'Adventure & Trekking', href: '/tours?cat=adventure' },
      { label: 'Festival Tours',       href: '/tours?cat=festival' },
      { label: 'Luxury & Wellness',    href: '/tours?cat=luxury' },
    ],
  },
  { label: 'Gallery',  href: '/gallery' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact',  href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [toursOpen, setToursOpen]     = useState(false)
  const [toursExpanded, setToursExpanded] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMobileOpen(false); setToursOpen(false) } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const solid = scrolled || mobileOpen

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-white/98 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
          : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className={`relative h-10 w-10 rounded-full overflow-hidden ring-2 transition-all duration-300 ${
              solid ? 'ring-stone-200' : 'ring-white/25'
            }`}>
              <Image
                src="/images/logo.jpeg"
                alt="Arise Bhutan"
                fill
                className={`object-contain transition-all duration-300 ${solid ? '' : 'brightness-0 invert'}`}
                priority
              />
            </div>
            <div className={`hidden sm:block transition-colors duration-300 ${solid ? 'text-stone-900' : 'text-white'}`}>
              <p className="font-serif font-bold text-[1.05rem] leading-tight">Arise Bhutan</p>
              <p className="text-[9px] tracking-[0.22em] uppercase opacity-55 font-semibold">Tours &amp; Travels</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setToursOpen(true)}
                  onMouseLeave={() => setToursOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                      solid
                        ? 'text-stone-700 hover:text-amber-600 hover:bg-amber-50/80'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${toursOpen ? 'rotate-180' : ''}`} />
                  </Link>

                  {/* Dropdown panel */}
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-54 bg-white rounded-2xl shadow-xl shadow-stone-200/80 border border-stone-100 py-1.5 z-50 transition-all duration-200 origin-top ${
                      toursOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {/* Arrow */}
                    <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-t border-l border-stone-100 rotate-45 rounded-sm" />
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="flex items-center px-4 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-700 mx-1 rounded-xl transition-colors"
                        onClick={() => setToursOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                    solid
                      ? 'text-stone-700 hover:text-amber-600 hover:bg-amber-50/80'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+97517123456"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                solid ? 'text-stone-500 hover:text-amber-600' : 'text-white/75 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              +975 17 123 456
            </a>
            <Link
              href="/contact"
              className="bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-amber-600/25"
            >
              Book Now
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${
              solid ? 'text-stone-800 hover:bg-stone-100' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <div className="relative w-5 h-5">
              <span className={`absolute inset-0 transition-all duration-200 ${mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                <X className="w-5 h-5" />
              </span>
              <span className={`absolute inset-0 transition-all duration-200 ${mobileOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                <Menu className="w-5 h-5" />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className="lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: mobileOpen ? '560px' : '0px' }}
      >
        <div className="bg-white border-t border-stone-100 px-4 pb-7 pt-2">
          {navLinks.map((link) => (
            <div key={link.label}>
              <div className="flex items-center justify-between border-b border-stone-50">
                <Link
                  href={link.href}
                  className="flex-1 py-3.5 text-stone-800 font-medium text-sm hover:text-amber-600 transition-colors"
                  onClick={() => { if (!link.children) setMobileOpen(false) }}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <button
                    className="p-2 text-stone-400"
                    onClick={() => setToursExpanded(!toursExpanded)}
                    aria-label="Toggle tours submenu"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toursExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {link.children && (
                <div
                  className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
                  style={{ maxHeight: toursExpanded ? '200px' : '0px' }}
                >
                  <div className="pl-3 py-1 bg-stone-50/50 rounded-xl my-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="flex py-2.5 px-2 text-sm text-stone-500 hover:text-amber-600 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href="tel:+97517123456"
              className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-stone-700 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              +975 17 123 456
            </a>
            <Link
              href="/contact"
              className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 text-sm rounded-2xl transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Book Your Bhutan Trip
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
