'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const name  = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Traveller'
        const email = session.user.email

        // Detect brand-new users: created_at and last_sign_in_at are within 10 seconds of each other
        const createdAt    = new Date(session.user.created_at).getTime()
        const lastSignIn   = new Date(session.user.last_sign_in_at).getTime()
        const isNewUser    = Math.abs(lastSignIn - createdAt) < 10000

        // Upsert profile for OAuth users (Google doesn't go through register page)
        await supabase.from('profiles').upsert({
          id:   session.user.id,
          name,
          email,
          role: 'CLIENT',
        }, { onConflict: 'id', ignoreDuplicates: true })

        // Send welcome email only for first-time Google sign-ups
        if (isNewUser) {
          fetch('/api/welcome-email', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name, email }),
          }).catch(() => {})
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        router.push(profile?.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-500 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
