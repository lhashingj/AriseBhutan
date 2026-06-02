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
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toursOpen, setToursOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navBg = scrolled || mobileOpen
    ? 'bg-white shadow-md'
    : 'bg-transparent'
  const textColor = scrolled || mobileOpen ? 'text-stone-800' : 'text-white'
  const logoFilter = scrolled || mobileOpen ? '' : 'brightness-0 invert'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative h-12 w-12">
              <Image
                src="/images/logo.jpeg"
                alt="Arise Bhutan Logo"
                fill
                className={`object-contain transition-all duration-300 ${logoFilter}`}
              />
            </div>
            <div className={`hidden sm:block transition-colors duration-300 ${textColor}`}>
              <p className="font-serif font-bold text-lg leading-tight">Arise Bhutan</p>
              <p className="text-xs tracking-widest uppercase opacity-80">Tours & Travel</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
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
                    <ChevronDown className="w-3 h-3" />
                  </Link>
                  {toursOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
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

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+97517123456"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-500 ${textColor}`}
            >
              <Phone className="w-4 h-4" />
              +975 17 123 456
            </a>
            <Link href="/contact" className="btn-primary text-sm px-5 py-2.5">
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-stone-100 px-4 pb-6 pt-4">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className="block py-3 text-stone-800 font-medium border-b border-stone-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-4">
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block py-2.5 text-sm text-stone-600 border-b border-stone-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/contact"
            className="btn-primary w-full text-center mt-4"
            onClick={() => setMobileOpen(false)}
          >
            Book Your Bhutan Trip
          </Link>
        </div>
      )}
    </header>
  )
}
