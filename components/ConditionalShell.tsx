'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

const SHELL_HIDDEN_PREFIXES = ['/login', '/register', '/client', '/admin']

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideShell = SHELL_HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))

  if (hideShell) return <>{children}</>

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
