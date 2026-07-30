import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { blogPosts, getBlogPostBySlug } from '@/data/blog'

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} | Arise Bhutan`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }],
    },
  }
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `https://www.arisebhutan.com${post.coverImage}`,
    datePublished: post.publishedDate,
    author: { '@type': 'Organization', name: 'Arise Bhutan Tours & Travels' },
    publisher: { '@type': 'Organization', name: 'Arise Bhutan Tours & Travels' },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      <div className="relative h-[45vh] min-h-[340px] overflow-hidden">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10 max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-600 text-white inline-block mb-3">
            {post.category}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span>{fmtDate(post.publishedDate)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readingTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        {post.sections.map((section, i) => (
          <div key={i} className="mb-8">
            {section.heading && (
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 mb-4">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{p}</p>
            ))}
            {section.list && (
              <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                {section.list.map((item, k) => <li key={k}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}

        {post.relatedLinks && post.relatedLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-6 mb-10">
            {post.relatedLinks.map((l) => (
              <Link key={l.href} href={l.href} className="btn-outline text-sm">{l.label}</Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-amber-50 dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-2xl p-8 text-center">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            Ready to Plan Your Bhutan Trip?
          </h3>
          <p className="text-stone-600 dark:text-stone-400 mb-5 text-sm">
            Tell us your dream trip and we&apos;ll build an itemized quote — SDF and visa already included.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Start Planning <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* More guides */}
        {otherPosts.length > 0 && (
          <div className="mt-14">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 mb-5">More Travel Guides</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {otherPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 overflow-hidden hover:shadow-md dark:hover:shadow-black/40 transition-all flex gap-4 p-3">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={p.coverImage} alt={p.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{p.readingTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
