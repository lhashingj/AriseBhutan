'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TourCard from '@/components/TourCard'
import { tours, categories, type Tour } from '@/data/tours'
import { Search, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'

function ToursContent() {
  const searchParams = useSearchParams()
  const [activecat, setActivecat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'duration'>('rating')

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) setActivecat(cat)
  }, [searchParams])

  const filtered = tours
    .filter((t) => {
      const matchCat = activecat === 'all' || t.category === activecat
      const matchSearch = search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        t.locations.some((l) => l.toLowerCase().includes(search.toLowerCase()))
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.startingFrom - b.startingFrom
      if (sortBy === 'price-desc') return b.startingFrom - a.startingFrom
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'duration') return a.days - b.days
      return 0
    })

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-32 text-white text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/img-20.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <span className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-4 block">Our Tours</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-5">
            Explore Bhutan — Every Way Possible
          </h1>
          <p className="text-white/80 text-lg">
            From sacred monastery hikes to luxury valley retreats — find the Bhutan journey that speaks to your soul.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-18 z-30 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActivecat(id)}
                  className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    activecat === id
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {label} <span className="opacity-70">({count})</span>
                </button>
              ))}
            </div>

            {/* Search + Sort */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tours..."
                  className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="pl-9 pr-8 py-2 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 appearance-none bg-white"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="duration">Shortest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-stone-400 text-lg">No tours match your search. Try a different keyword or category.</p>
              <button onClick={() => { setSearch(''); setActivecat('all') }} className="btn-primary mt-6">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-stone-500 text-sm mb-8">Showing {filtered.length} tour{filtered.length !== 1 ? 's' : ''}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {filtered.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Custom Trip CTA */}
      <section className="py-16 bg-amber-50 border-t border-amber-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-3">
            Don&apos;t See the Perfect Trip?
          </h2>
          <p className="text-stone-600 mb-7">
            Every Arise Bhutan tour can be fully customized. Tell us your dates, interests, and budget — we&apos;ll build it from scratch.
          </p>
          <a href="/contact" className="btn-primary">Request a Custom Itinerary</a>
        </div>
      </section>
    </>
  )
}

export default function ToursPage() {
  return (
    <div className="pt-18">
      <Suspense fallback={<div className="h-32 flex items-center justify-center text-stone-400">Loading tours...</div>}>
        <ToursContent />
      </Suspense>
    </div>
  )
}
