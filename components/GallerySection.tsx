import Image from 'next/image'
import Link from 'next/link'

const photos = [
  { src: '/images/img-33.jpeg', span: 'col-span-2 row-span-2', alt: "Tiger's Nest Monastery" },
  { src: '/images/img-02.jpeg', span: 'col-span-1',            alt: 'Cham dancer festival' },
  { src: '/images/img-14.jpeg', span: 'col-span-1',            alt: 'Buddha Dordenma statue' },
  { src: '/images/img-37.jpeg', span: 'col-span-1',            alt: 'Sunrise prayer flags' },
  { src: '/images/img-13.jpeg', span: 'col-span-1',            alt: 'Festival dancer' },
  { src: '/images/img-09.jpeg', span: 'col-span-1',            alt: 'Bhutanese food' },
  { src: '/images/img-07.jpeg', span: 'col-span-1',            alt: 'Himalayan peaks' },
]

export default function GallerySection() {
  return (
    <section className="py-16 sm:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <span className="section-badge">Photo Gallery</span>
          <h2 className="section-title">A Glimpse of Bhutan</h2>
          <p className="section-subtitle mx-auto mt-4">
            From sacred monasteries to vibrant festivals — every frame tells a story of a kingdom unlike any other.
          </p>
        </div>

        {/* Mobile: uniform 2-column auto-rows grid | md+: mosaic with row-span */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[180px] md:auto-rows-[165px] gap-3">
          {photos.map(({ src, span, alt }) => (
            <div key={src} className={`relative overflow-hidden rounded-xl group ${span}`}>
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-3 sm:p-4">
                <p className="text-white font-medium text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {alt}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Link href="/tours" className="btn-outline">
            Explore All Tours & Destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
