import { Shield, Users, Star, Clock } from 'lucide-react'

const badges = [
  { icon: Shield,  value: 'ATCB Licensed',    label: 'Certified by Bhutan Tourism' },
  { icon: Users,   value: '1,000+ Travelers', label: 'Happy clients since 2012' },
  { icon: Star,    value: '4.9 / 5 Stars',    label: 'Average tour rating' },
  { icon: Clock,   value: '24/7 Support',     label: 'Before & during your trip' },
]

export default function TrustBadges() {
  return (
    <section className="bg-stone-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(({ icon: Icon, value, label }) => (
            <div key={value} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-bold text-white text-base">{value}</p>
                <p className="text-stone-400 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
