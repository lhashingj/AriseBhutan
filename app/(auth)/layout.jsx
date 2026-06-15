import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Account | Arise Bhutan Tours & Travels',
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel — brand imagery ── */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tigers-nest-1.jpg"
            alt="Tiger's Nest, Bhutan"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900/80 via-stone-900/60 to-amber-900/50" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden shadow-lg flex-shrink-0">
              <Image src="/images/logo-buddha.png" alt="Arise Bhutan" width={40} height={40} className="object-contain" />
            </div>
            <div className="text-white">
              <p className="font-serif font-bold text-lg leading-tight">Arise Bhutan</p>
              <p className="text-[10px] tracking-[0.2em] uppercase opacity-60">Tours &amp; Travels</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <p className="font-serif text-3xl font-bold text-white leading-snug">
            &ldquo;To Arise<br />is to Awaken.&rdquo;
          </p>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Manage your Bhutan journey — from custom itinerary building to booking confirmation, all in one place.
          </p>
          <div className="flex items-center gap-4 pt-2">
            {['ATCB Licensed', 'SDF Compliant', '24/7 Support'].map((b) => (
              <span key={b} className="text-amber-400 text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-400" />{b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-full bg-stone-100 overflow-hidden">
              <Image src="/images/logo-buddha.png" alt="Arise Bhutan" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="font-serif font-bold text-stone-900 leading-tight">Arise Bhutan</p>
              <p className="text-[9px] tracking-widest uppercase text-stone-400">Tours &amp; Travels</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
