import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Clock, ArrowRight } from 'lucide-react'
import { blogPosts } from '@/data/blog'

export const metadata: Metadata = {
  title: 'Bhutan Travel Guides | Arise Bhutan',
  description: 'Visa & SDF guides, best time to visit, and festival planning tips for your Bhutan trip — written by a licensed Bhutan tour operator.',
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BlogIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 sm:pt-44 sm:pb-24 text-white text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/prayer-flags-mountains.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="section-badge text-amber-400">Travel Guides</span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
            Planning Guides &amp; Bhutan Travel Tips
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto">
            Practical, honest guides from a licensed local operator — visas, fees, seasons, and festivals.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium">Blog</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-600 text-white shadow">
                  {post.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-serif font-bold text-stone-900 dark:text-stone-50 text-lg mb-2 leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <span>{fmtDate(post.publishedDate)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 sm:mt-16 bg-amber-50 dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 mb-3">
            Have a Question These Guides Don&apos;t Cover?
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm sm:text-base max-w-xl mx-auto">
            Check our full Travel FAQ, or tell us your dream trip and we&apos;ll build an itemized quote within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/faq" className="btn-outline">Read the Travel FAQ</Link>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Plan My Trip <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
