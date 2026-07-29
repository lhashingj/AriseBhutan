import { siVisa, siMastercard, siJcb, siDiscover, siDinersclub, siGooglepay, siApplepay } from 'simple-icons'
import { Landmark } from 'lucide-react'

// Payment methods Arise Bhutan actually accepts today: SWIFT bank transfer
// (primary method), plus everything routed through the Bhutan Payments / BNB
// secure checkout (Stripe-powered) — card networks confirmed via BNB's own
// payment-gateway page, and Google Pay / Apple Pay / Amazon Pay confirmed by
// testing the live checkout. UnionPay/Alipay/WeChat Pay are deliberately
// omitted — neither source confirms Arise Bhutan actually accepts them.

interface BrandIcon {
  title: string
  path: string
  hex: string
}

const CARD_NETWORKS: BrandIcon[] = [siVisa, siMastercard, siJcb, siDiscover, siDinersclub]
const WALLETS: BrandIcon[] = [siGooglepay, siApplepay]

function LogoBadge({ icon }: { icon: BrandIcon }) {
  return (
    <span
      title={icon.title}
      className="inline-flex items-center justify-center w-11 h-8 rounded-md bg-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path fill={`#${icon.hex}`} d={icon.path} />
      </svg>
    </span>
  )
}

function TextBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center h-8 px-2.5 rounded-md bg-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 text-[10px] font-bold text-stone-700 flex-shrink-0">
      {label}
    </span>
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
        {CARD_NETWORKS.map(b => <LogoBadge key={b.title} icon={b} />)}
        {WALLETS.map(b => <LogoBadge key={b.title} icon={b} />)}
        <TextBadge label="Amazon Pay" />
      </div>
    </div>
  )
}
