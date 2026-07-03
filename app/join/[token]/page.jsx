'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Loader2, AlertTriangle, LogIn, UserPlus, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { storePendingInvite } from '@/utils/bookingGuests'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Group-booking invitation landing page.
 * - Signed in  → claim the token, then straight to the itinerary.
 * - Signed out → stash the token and offer sign-in / registration;
 *   the client portal claims it automatically after auth.
 */
export default function JoinInvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const [state, setState] = useState('checking') // checking | claimed | guest | invalid

  useEffect(() => {
    let active = true
    async function run() {
      if (!UUID_RE.test(String(token || ''))) {
        if (active) setState('invalid')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        storePendingInvite(String(token))
        if (active) setState('guest')
        return
      }

      const { data: claimed, error } = await supabase.rpc('claim_guest_invitation', {
        invite: String(token),
      })
      if (!active) return

      if (error || !claimed) {
        setState('invalid')
        return
      }
      setState('claimed')
      setTimeout(() => router.replace('/client/itineraries'), 1200)
    }
    run()
    return () => { active = false }
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-28 pb-16 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-sm p-8 text-center transition-colors duration-300">

        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-5">
          {state === 'checking' && <Loader2 className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-spin" />}
          {state === 'claimed'  && <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />}
          {state === 'guest'    && <Users className="w-7 h-7 text-amber-600 dark:text-amber-400" />}
          {state === 'invalid'  && <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />}
        </div>

        {state === 'checking' && (
          <>
            <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">Checking your invitation…</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">One moment while we verify your group trip link.</p>
          </>
        )}

        {state === 'claimed' && (
          <>
            <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">You&apos;re in! 🎉</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              You&apos;ve joined the group booking. Taking you to your itinerary…
            </p>
          </>
        )}

        {state === 'guest' && (
          <>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Group Trip Invitation</p>
            <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">Join your Bhutan travel group</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              Sign in or create a free account and your group&apos;s itinerary, travel documents
              and trip updates will be waiting for you.
            </p>
            <div className="space-y-2.5">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Create My Free Account
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-sm font-semibold transition-colors"
              >
                <LogIn className="w-4 h-4" /> I Already Have an Account
              </Link>
            </div>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-5 leading-relaxed">
              Your invitation is linked to this device — after signing in you&apos;ll be added to the group automatically.
            </p>
          </>
        )}

        {state === 'invalid' && (
          <>
            <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">Invitation link not valid</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              This link may have expired, already been used by another account,
              or been copied incompletely. Ask your trip organiser to re-send the invitation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-sm font-semibold transition-colors"
            >
              Contact Support
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
