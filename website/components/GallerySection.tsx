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
    <section className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3 block">Photo Gallery</span>
          <h2 className="section-title">A Glimpse of Bhutan</h2>
          <p className="section-subtitle mx-auto mt-4">
            From sacred monasteries to vibrant festivals — every frame tells a story of a kingdom unlike any other.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-[520px]">
          {photos.map(({ src, span, alt }) => (
            <div key={src} className={`relative overflow-hidden rounded-xl group ${span}`}>
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                <p className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {alt}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/tours" className="btn-outline">
            Explore All Tours & Destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
