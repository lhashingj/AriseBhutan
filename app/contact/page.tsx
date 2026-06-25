import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import BookingForm from '@/components/BookingForm'

const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3541.543822755736!2d89.4225462!3d27.4211577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e19db6bc9e290d%3A0x423ce3020a2693d1!2sArise%20Bhutan%20Tours%20%26%20Travels!5e0!3m2!1sen!2sbt!4v1782362871699!5m2!1sen!2sbt'

const contactInfo = [
  { icon: Phone,         label: 'Phone',              value: '+975 77 319 405',       href: 'tel:+97577319405' },
  { icon: MessageCircle, label: 'WhatsApp',           value: 'Message us directly',   href: 'https://wa.me/97577319405' },
  { icon: Mail,          label: 'Email',              value: 'arisebhutan@gmail.com', href: 'mailto:arisebhutan@gmail.com' },
  { icon: MapPin,        label: 'Office',             value: 'Nyamaizampa, Paro 12001', href: undefined },
  { icon: Clock,         label: 'Response Time',      value: 'Within 24 hours',       href: undefined },
]

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative pt-36 pb-16 sm:pt-44 sm:pb-20 text-white text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/prayer-flags-mountains.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-2xl mx-auto px-5">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">Contact Us</span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 leading-tight">
            Let&apos;s Plan Your Bhutan Journey
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            Tell us your travel dreams. Our Bhutan specialists will craft a personalised itinerary just for you — no obligation, no cookie-cutter packages.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 sm:gap-12">
            {/* Form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-6 sm:p-8 md:p-10">
                <div className="mb-7 sm:mb-8">
                  <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Send Us Your Enquiry</h2>
                  <p className="text-stone-500 text-sm">
                    Fill in the form below — our specialist will respond with a custom quote and itinerary within 24 hours.
                  </p>
                </div>
                <BookingForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-5">Get in Touch</h2>
                <div className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">{label}</p>
                        {href ? (
                          <a href={href} className="text-stone-800 font-semibold hover:text-amber-600 transition-colors text-sm">
                            {value}
                          </a>
                        ) : (
                          <p className="text-stone-800 font-semibold text-sm">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar map */}
              <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                <iframe
                  src={MAPS_EMBED_SRC}
                  className="w-full h-52 border-0 block"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Arise Bhutan office location"
                  allowFullScreen
                />
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 mb-4">Quick Answers</h3>
                <div className="space-y-4">
                  {[
                    { q: 'How early should I book?', a: 'For festival tours, book 3–6 months ahead. For other tours, 4–8 weeks is usually sufficient.' },
                    { q: 'Can I customize a tour?', a: 'Absolutely. Every Arise Bhutan tour can be fully tailored to your interests, dates, and group size.' },
                    { q: 'What currency is used?', a: 'Bhutanese Ngultrum (BTN), pegged 1:1 with Indian Rupee. USD is widely accepted.' },
                  ].map(({ q, a }) => (
                    <div key={q} className="border-l-2 border-amber-300 pl-4">
                      <p className="font-semibold text-stone-800 text-sm">{q}</p>
                      <p className="text-stone-500 text-xs mt-1 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Google Map */}
      <section className="border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-6">
            <span className="text-amber-600 font-semibold text-xs tracking-widest uppercase block mb-1">Find Us</span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Our Office in Paro, Bhutan</h2>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-md border border-stone-100" style={{ height: '420px' }}>
            <iframe
              src={MAPS_EMBED_SRC}
              className="w-full h-full border-0 block"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Arise Bhutan Tours & Travels — Paro office"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="py-10 sm:py-12 bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-stone-400 text-xs mb-5 tracking-widest uppercase font-medium">Trusted by travelers from</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-white font-semibold text-base sm:text-lg opacity-70">
            {['🇺🇸 USA', '🇬🇧 UK', '🇩🇪 Germany', '🇸🇬 Singapore', '🇯🇵 Japan', '🇦🇺 Australia', '🇮🇳 India', '🇨🇦 Canada'].map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
