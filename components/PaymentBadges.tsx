import { Landmark } from 'lucide-react'

// Payment logos sourced from Datatrans' open payment-logos repository
// (github.com/datatrans/payment-logos, CC BY-SA 4.0), saved locally under
// public/payment-logos/. Methods shown are what Arise Bhutan actually
// accepts today: SWIFT bank transfer (primary), plus everything routed
// through the Bhutan Payments / BNB secure checkout (Stripe-powered) — card
// networks confirmed via BNB's own payment-gateway page, Google Pay / Apple
// Pay / Amazon Pay confirmed by testing the live checkout. UnionPay, Alipay
// and WeChat Pay are deliberately omitted — neither source confirms
// Arise Bhutan actually accepts them.

const CARD_LOGOS = [
  { file: 'visa', alt: 'Visa' },
  { file: 'mastercard', alt: 'Mastercard' },
  { file: 'jcb', alt: 'JCB' },
  { file: 'discover', alt: 'Discover' },
  { file: 'diners', alt: 'Diners Club' },
]

const WALLET_LOGOS = [
  { file: 'google-pay', alt: 'Google Pay' },
  { file: 'apple-pay', alt: 'Apple Pay' },
  { file: 'amazon-pay', alt: 'Amazon Pay' },
]

function Logo({ file, alt }: { file: string; alt: string }) {
  return (
    <img
      src={`/payment-logos/${file}.svg`}
      alt={alt}
      className="h-8 w-auto rounded shadow-sm flex-shrink-0"
    />
  )
}

export default function PaymentBadges({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark'
  const iconCls = isDark ? 'text-amber-400' : 'text-amber-600 dark:text-amber-400'
  const labelCls = isDark ? 'text-stone-400' : 'text-stone-500 dark:text-stone-400'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Landmark className={`w-4 h-4 flex-shrink-0 ${iconCls}`} />
        <span className={`text-xs font-medium ${labelCls}`}>Bank Transfer (SWIFT)</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {CARD_LOGOS.map(l => <Logo key={l.file} {...l} />)}
        {WALLET_LOGOS.map(l => <Logo key={l.file} {...l} />)}
      </div>
    </div>
  )
}
