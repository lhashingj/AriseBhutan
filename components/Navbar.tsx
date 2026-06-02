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
      { label: 'Cultural Tours', href: '/tours?cat=cultural' },
      { label: 'Adventure & Trekking', href: '/tours?cat=adventure' },
      { label: 'Festival Tours', href: '/tours?cat=festival' },
      { label: 'Luxury & Wellness', href: '/tours?cat=luxury' },
    ],
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toursOpen, setToursOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const solid = scrolled || mobileOpen
  const textColor = solid ? 'text-stone-800' : 'text-white'
  const logoFilter = solid ? '' : 'brightness-0 invert'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative h-11 w-11">
              <Image
                src="/images/logo.jpeg"
                alt="Arise Bhutan Logo"
                fill
                className={`object-contain transition-all duration-300 ${logoFilter}`}
              />
            </div>
            <div className={`hidden sm:block transition-colors duration-300 ${textColor}`}>
              <p className="font-serif font-bold text-lg leading-tight">Arise Bhutan</p>
              <p className="text-[10px] tracking-[0.2em] uppercase opacity-70">Tours & Travel</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setToursOpen(true)}
                  onMouseLeave={() => setToursOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 text-sm font-medium hover:text-amber-500 transition-colors ${textColor}`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toursOpen ? 'rotate-180' : ''}`} />
                  </Link>
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 transition-all duration-200 ${
                      toursOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
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
                  className={`text-sm font-medium hover:text-amber-500 transition-colors ${textColor}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+97517123456"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-amber-500 ${textColor}`}
            >
              <Phone className="w-3.5 h-3.5" />
              +975 17 123 456
            </a>
            <Link href="/contact" className="btn-primary text-sm !px-5 !py-2.5">
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors hover:bg-black/10 ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — animated slide-down */}
      <div
        className="lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: mobileOpen ? '520px' : '0px' }}
      >
        <div className="bg-white/97 backdrop-blur-md border-t border-stone-100 px-4 pb-6 pt-2">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className="flex items-center py-3.5 text-stone-800 font-medium border-b border-stone-100 hover:text-amber-600 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-4 pt-1 pb-2 border-b border-stone-100">
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="flex py-2 text-sm text-stone-500 hover:text-amber-600 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-5 flex flex-col gap-3">
            <a
              href="tel:+97517123456"
              className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-stone-700 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              +975 17 123 456
            </a>
            <Link
              href="/contact"
              className="btn-primary w-full text-sm"
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
