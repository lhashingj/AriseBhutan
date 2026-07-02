import { Sprout, Compass, Eye } from 'lucide-react'

const pillars = [
  {
    icon: Sprout,
    title: 'Growth & Exploration',
    body: 'Travel that transforms you. Every itinerary is crafted to encourage personal inspiration and deep cultural immersion — not just sightseeing.',
    accent: 'before:bg-emerald-500',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    icon: Compass,
    title: 'New Beginnings',
    body: 'Step away from the noise of the modern world and step into the Kingdom of Happiness for a fresh perspective on life and what truly matters.',
    accent: 'before:bg-amber-500',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    icon: Eye,
    title: 'Awaken the Spirit',
    body: 'Hike legendary cliffside monasteries, witness vibrant festival dances, and breathe pristine Himalayan air that has remained unchanged for centuries.',
    accent: 'before:bg-blue-500',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
  },
]

export default function BrandPhilosophy() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-amber-50 to-white dark:from-stone-900 dark:to-stone-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-14">
          <span className="section-badge">Our Philosophy</span>
          <h2 className="section-title">Why Arise Bhutan?</h2>
          <p className="section-subtitle mx-auto mt-4">
            &ldquo;To &lsquo;Arise&rsquo; is to awaken. We don&apos;t just show you landscapes — we invite you to discover, awaken to, and experience the living culture, ancient spirit, and profound beauty of Bhutan.&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map(({ icon: Icon, title, body, accent, iconColor, iconBg }) => (
            <div
              key={title}
              className={`relative bg-white dark:bg-stone-900 rounded-2xl p-7 sm:p-8 shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-lg dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 group overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-2xl ${accent}`}
            >
              <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </div>
              <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-50 mb-3">{title}</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
