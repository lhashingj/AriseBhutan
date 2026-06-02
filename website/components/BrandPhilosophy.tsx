import { Sprout, Compass, Eye } from 'lucide-react'

const pillars = [
  {
    icon: Sprout,
    title: 'Growth & Exploration',
    body: 'Travel that transforms you. Every itinerary is crafted to encourage personal inspiration and deep cultural immersion — not just sightseeing.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Compass,
    title: 'New Beginnings',
    body: 'Step away from the noise of the modern world and step into the Kingdom of Happiness for a fresh perspective on life and what truly matters.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Eye,
    title: 'Awaken the Spirit',
    body: 'Hike legendary cliffside monasteries, witness vibrant festival dances, and breathe pristine Himalayan air that has remained unchanged for centuries.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
]

export default function BrandPhilosophy() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3 block">
            Our Philosophy
          </span>
          <h2 className="section-title">Why Arise Bhutan?</h2>
          <p className="section-subtitle mx-auto mt-4">
            &ldquo;To &lsquo;Arise&rsquo; is to awaken. We don&apos;t just show you landscapes — we invite you to discover, awaken to, and experience the living culture, ancient spirit, and profound beauty of Bhutan.&rdquo;
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map(({ icon: Icon, title, body, color, bg }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <h3 className="font-serif font-bold text-xl text-stone-900 mb-3">{title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
