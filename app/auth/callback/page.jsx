'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Upsert profile for OAuth users (Google doesn't go through register page)
        await supabase.from('profiles').upsert({
          id:    session.user.id,
          name:  session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          role:  'CLIENT',
        }, { onConflict: 'id', ignoreDuplicates: true })

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
