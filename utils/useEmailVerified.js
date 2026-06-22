import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

/**
 * Returns the email-verification status of the currently signed-in user.
 *
 * { verified: bool | null, loading: bool, email: string | null, resend: fn }
 *
 * verified === null  → still loading
 * verified === false → session exists but email_confirmed_at is null
 * verified === true  → email confirmed
 */
export function useEmailVerified() {
  const [state, setState] = useState({ verified: null, loading: true, email: null })

  useEffect(() => {
    function applySession(session) {
      if (!session) {
        setState({ verified: false, loading: false, email: null })
        return
      }
      setState({
        verified: !!session.user.email_confirmed_at,
        loading:  false,
        email:    session.user.email,
      })
    }

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function resend() {
    if (!state.email) return { error: null }
    const { error } = await supabase.auth.resend({ type: 'signup', email: state.email })
    return { error }
  }

  return { ...state, resend }
}
