'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle, Phone } from 'lucide-react'
import { faqs } from '@/data/bhutanContent'

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
        <div className="text-center mb-12 sm:mb-14">
          <span className="section-badge">Travel Questions</span>
          <h2 className="section-title">Everything You Need to Know</h2>
          <p className="section-subtitle mx-auto">
            Bhutan has a few unique entry requirements. Here are the questions our travellers ask most.
          </p>
        </div>

        {/* FAQ groups */}
        <div className="space-y-10">
          {categories.map((category) => (
            <FaqGroup key={category} category={category} items={grouped[category]} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-stone-900 rounded-2xl p-8 sm:p-10 text-center text-white">
          <HelpCircle className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
            Our Bhutan specialists answer every inquiry personally and within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="btn-primary">
              Ask a Specialist
            </Link>
            <a
              href="tel:+97577319405"
              className="btn-outline border-stone-600 text-stone-300 hover:bg-stone-700 hover:text-white hover:border-stone-700"
            >
              <Phone className="w-4 h-4" />
              +975 77 319 405
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqGroup({ category, items }) {
  return (
    <div>
      {/* Category divider label */}
      <div className="flex items-center gap-4 mb-5">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-amber-600 font-semibold text-[10px] tracking-widest uppercase whitespace-nowrap">
          {category}
        </span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

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
      className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
        open ? 'border-amber-300 bg-amber-50/30' : 'border-stone-200 bg-white hover:border-amber-200'
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-amber-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Grid-rows animation — no layout shift */}
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 border-t border-stone-100">
            <p className="text-stone-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
