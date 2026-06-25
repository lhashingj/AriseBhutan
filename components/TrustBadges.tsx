import { Shield, Users, Star, Clock } from 'lucide-react'

const badges = [
  { icon: Shield, value: 'DOT Certified',     label: 'Licensed by Bhutan Tourism' },
  { icon: Users,  value: '1,000+ Travelers', label: 'Happy clients since 2026' },
  { icon: Star,   value: '4.9 / 5 Stars',    label: 'Average tour rating' },
  { icon: Clock,  value: '24/7 Support',     label: 'Before & during your trip' },
]

export default function TrustBadges() {
  return (
    <section className="bg-stone-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: horizontal scroll strip | sm+: 2-col grid | lg+: 4-col */}
        <div className="flex gap-5 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible pb-1 sm:pb-0">
          {badges.map(({ icon: Icon, value, label }) => (
            <div
              key={value}
              className="flex items-center gap-3 min-w-[190px] sm:min-w-0 flex-shrink-0 sm:flex-shrink"
            >
              <div className="w-11 h-11 bg-amber-600/15 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm sm:text-base leading-tight">{value}</p>
                <p className="text-stone-400 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
