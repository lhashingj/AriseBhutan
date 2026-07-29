import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import NewsletterForm from '@/components/NewsletterForm'

const quickLinks = [
  { label: 'Classic Cultural Tour', href: '/tours/classic-bhutan-cultural-tour' },
  { label: "Tiger's Nest Day Hike", href: '/tours/tigers-nest-day-hike' },
  { label: 'Paro Tshechu Festival', href: '/tours/paro-tshechu-festival-tour' },
  { label: 'Bhutan Luxury Escape', href: '/tours/bhutan-luxury-escape' },
  { label: 'Druk Path Trek', href: '/tours/druk-path-trek' },
  { label: 'Wellness Retreat', href: '/tours/bhutan-wellness-retreat' },
]

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative h-11 w-11 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm">
                <Image src="/images/logo.jpeg" alt="Arise Bhutan Logo" fill className="object-contain" />
              </div>
              <div>
                <p className="font-serif font-bold text-white text-lg leading-tight">Arise Bhutan</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400">Tours &amp; Travels</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-5">
              To &ldquo;Arise&rdquo; is to awaken. We invite you to discover, awaken to, and experience the ancient spirit and profound beauty of Bhutan.
            </p>
            <p className="text-xs text-stone-500 mb-4">Licensed by DOT · Lic. No. 50001567</p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 rounded-full bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-xs tracking-wider uppercase">Popular Tours</h3>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-xs tracking-wider uppercase">Company</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'All Tours', href: '/tours' },
                { label: 'Festival Calendar', href: '/festival-calendar' },
                { label: 'Flight Schedule', href: '/flight-schedule' },
                { label: 'Travel FAQ', href: '/faq' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Book a Tour', href: '/contact' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-xs tracking-wider uppercase">Contact Us</h3>
            <div className="space-y-4 mb-7">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-stone-400">Paro, Kingdom of Bhutan</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="tel:+97577319405" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                  +975 77 319 405
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="https://wa.me/61435341033" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                  +61 435 341 033 (WhatsApp AU)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="mailto:arisebhutan@gmail.com" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                  arisebhutan@gmail.com
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <p className="text-sm font-medium text-white mb-3">Get Bhutan Travel Tips</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Arise Bhutan Tours & Travel. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-stone-300 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
