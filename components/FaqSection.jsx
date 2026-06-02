'use client'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { faqs } from '@/data/bhutanContent'

// Group FAQs by category
function groupByCategory(items) {
  return items.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = []
    acc[faq.category].push(faq)
    return acc
  }, {})
}

export default function FaqSection() {
  const grouped = groupByCategory(faqs)
  const categories = Object.keys(grouped)

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full mb-5">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Planning a trip to Bhutan involves a few unique requirements. Here are the questions our
            travelers ask most.
          </p>
        </div>

        {/* FAQ groups */}
        <div className="space-y-10">
          {categories.map((category) => (
            <FaqGroup
              key={category}
              category={category}
              items={grouped[category]}
            />
          ))}
        </div>

        {/* Contact nudge */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-stone-700 font-semibold text-lg mb-2">
            Still have questions?
          </p>
          <p className="text-stone-500 text-sm mb-5">
            Our Bhutan specialists answer every inquiry within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-amber-600/25 text-sm"
          >
            Ask a Specialist
          </a>
        </div>
      </div>
    </section>
  )
}

function FaqGroup({ category, items }) {
  return (
    <div>
      <h3 className="font-semibold text-xs uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
        <span className="h-px flex-1 bg-amber-200" />
        {category}
        <span className="h-px flex-1 bg-amber-200" />
      </h3>
      <div className="space-y-2">
        {items.map((faq) => (
          <FaqItem key={faq.id} faq={faq} />
        ))}
      </div>
    </div>
  )
}

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        open
          ? 'border-amber-300 bg-amber-50/40 shadow-sm'
          : 'border-stone-200 bg-white hover:border-amber-200'
      }`}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-2xl"
      >
        <span className="font-semibold text-stone-900 text-sm sm:text-base leading-snug pr-2">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-amber-500 transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Answer — height animation via grid trick to prevent layout shift */}
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 border-t border-stone-100/80">
            <p className="text-stone-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
