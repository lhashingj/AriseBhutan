import { Users, ShieldCheck, Leaf, Plane, Clock, FileCheck2 } from 'lucide-react'
import { WHY_ARISE_BHUTAN } from '@/data/whyChooseUs'

const ICONS = [Users, ShieldCheck, Leaf, Plane, Clock, FileCheck2]

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 surface-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="section-badge">Why Choose Us</span>
          <h2 className="section-title">Why Travel With Arise Bhutan</h2>
          <p className="section-subtitle">
            Every journey we plan is built on the same foundation — full transparency, direct local expertise, and nothing outsourced.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {WHY_ARISE_BHUTAN.map(({ title, body }, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <div key={title} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm transition-colors duration-300">
                <div className="w-11 h-11 bg-amber-600/15 border border-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg mb-2">{title}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
