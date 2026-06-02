import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Arise Bhutan Tours & Travel — Discover the Kingdom of Happiness',
  description: 'Experience authentic Bhutan with Arise Bhutan Tours. Cultural tours, trekking adventures, festival experiences, and luxury wellness retreats in the Kingdom of Happiness. Licensed by ATCB.',
  keywords: 'Bhutan tours, Bhutan travel, Tiger\'s Nest hike, Bhutan trekking, Bhutan festivals, Tshechu, Paro, Thimphu, Punakha',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-stone-800">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
