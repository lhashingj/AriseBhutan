'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, UserPlus, Loader2, Trash2, Crown, Link2, Send,
  AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import {
  addBookingGuests,
  listBookingGuests,
  removeBookingGuest,
  updateBookingGuestRole,
  resendGuestInvite,
} from '@/app/actions/booking-guests'

const lbl = 'text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5'

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}

function siteOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function GuestRow({ guest, onChanged }) {
  const [busy, setBusy]     = useState('')   // 'remove' | 'role' | 'resend' | ''
  const [copied, setCopied] = useState(false)
  const [err, setErr]       = useState('')

  const joined  = Boolean(guest.user_id)
  const primary = guest.role === 'PRIMARY'

  async function withBusy(kind, fn) {
    if (busy) return
    setBusy(kind)
    setErr('')
    try {
      const res = await fn()
      if (res && !res.success) setErr(res.error)
      else onChanged()
    } catch (e) {
      setErr(e.message || 'Something went wrong.')
    } finally {
      setBusy('')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${siteOrigin()}/join/${guest.invite_token}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setErr('Could not copy — your browser blocked clipboard access.')
    }
  }

  return (
    <div className="bg-stone-800/60 border border-white/10 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          primary ? 'bg-amber-500/15 text-amber-400' : 'bg-stone-700/60 text-stone-400'
        }`}>
          {primary ? <Crown className="w-4 h-4" /> : <Users className="w-4 h-4" />}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-100 truncate">{guest.email}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
              primary
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-stone-700/50 text-stone-400 border-white/10'
            }`}>
              {guest.role}
            </span>
            {joined ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-green-500/15 text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3 h-3" /> Joined
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Clock className="w-3 h-3" /> Invited
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={copyLink}
            title="Copy invite link"
            className="p-2 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-white/5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
          </button>
          {!joined && (
            <button
              onClick={() => withBusy('resend', async () =>
                resendGuestInvite({ accessToken: await getAccessToken(), guestId: guest.id })
              )}
              title="Re-send invitation email"
              disabled={!!busy}
              className="p-2 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              {busy === 'resend' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => withBusy('role', async () =>
              updateBookingGuestRole({
                accessToken: await getAccessToken(),
                guestId: guest.id,
                role: primary ? 'GUEST' : 'PRIMARY',
              })
            )}
            title={primary ? 'Demote to guest' : 'Make lead traveller'}
            disabled={!!busy}
            className="p-2 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {busy === 'role' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => withBusy('remove', async () =>
              removeBookingGuest({ accessToken: await getAccessToken(), guestId: guest.id })
            )}
            title="Remove guest"
            disabled={!!busy}
            className="p-2 rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
          >
            {busy === 'remove' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {err && (
        <p className="flex items-start gap-1.5 text-xs text-red-400 mt-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {err}
        </p>
      )}
    </div>
  )
}

/**
 * Admin manager for a booking's guest group — paste multiple emails,
 * send /join/{token} invitations, track claim status, manage roles.
 * Dark-native styling to match the admin panel.
 */
export default function AdminBookingGuests({ bookingId }) {
  const [guests, setGuests]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [raw, setRaw]           = useState('')
  const [sendEmails, setSend]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [err, setErr]           = useState('')
  const [notice, setNotice]     = useState('')

  const load = useCallback(async () => {
    const res = await listBookingGuests({
      accessToken: await getAccessToken(),
      bookingId,
    })
    if (res.success) setGuests(res.data?.guests || [])
    setLoading(false)
  }, [bookingId])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    if (adding || !raw.trim()) return
    setAdding(true)
    setErr('')
    setNotice('')
    try {
      const res = await addBookingGuests({
        accessToken: await getAccessToken(),
        bookingId,
        emails: raw,
        sendEmails,
      })
      if (!res.success) {
        setErr(res.error)
      } else {
        setGuests(res.data?.guests || [])
        setRaw('')
        const bits = [`${res.data?.added ?? 0} guest${(res.data?.added ?? 0) === 1 ? '' : 's'} added`]
        if (res.data?.invalid?.length) bits.push(`${res.data.invalid.length} invalid skipped: ${res.data.invalid.join(', ')}`)
        if (res.data?.emailErrors?.length) bits.push(`email failed for: ${res.data.emailErrors.join(', ')}`)
        setNotice(bits.join(' · '))
      }
    } catch (e) {
      setErr(e.message || 'Could not add guests.')
    } finally {
      setAdding(false)
    }
  }

  if (!bookingId) {
    return (
      <p className="text-sm text-stone-500 italic">
        A booking reference is required before guests can be invited.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-serif font-bold text-base">Group Booking · Guests</h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Everyone added here shares booking <span className="font-mono text-amber-400">{bookingId}</span> —
          the itinerary and travel documents appear in each guest&apos;s own portal.
        </p>
      </div>

      {/* Add guests */}
      <div className="bg-stone-800/60 border border-white/10 rounded-xl p-4 space-y-3">
        <span className={lbl}>
          <UserPlus className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-400" />
          Invite Guests
        </span>
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          rows={3}
          placeholder={'Paste one or many emails — separated by commas, spaces or new lines\ne.g. tashi@example.com, pema@example.com'}
          className="w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-y"
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendEmails}
              onChange={e => setSend(e.target.checked)}
              className="accent-amber-500"
            />
            Send branded invitation emails
          </label>
          <button
            onClick={handleAdd}
            disabled={adding || !raw.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            {adding ? 'Adding…' : 'Add Guests'}
          </button>
        </div>
        {err && (
          <p className="flex items-start gap-1.5 text-xs text-red-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {err}
          </p>
        )}
        {notice && (
          <p className="flex items-start gap-1.5 text-xs text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {notice}
          </p>
        )}
      </div>

      {/* Guest list */}
      <div>
        <span className={lbl}>
          <Users className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-400" />
          Travel Group {guests.length > 0 && `· ${guests.length} member${guests.length === 1 ? '' : 's'}`}
        </span>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
        ) : guests.length === 0 ? (
          <p className="text-sm text-stone-500 italic py-4 text-center border border-dashed border-white/10 rounded-xl">
            No guests yet — paste emails above to build the travel group.
          </p>
        ) : (
          <div className="space-y-2">
            {guests.map(g => (
              <GuestRow key={g.id} guest={g} onChanged={load} />
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-600 leading-relaxed">
        Guests join instantly if they already have an account. Otherwise the invite link
        (<span className="font-mono">/join/…</span>) signs them up and connects them to this booking automatically —
        matching by email also works as a fallback.
      </p>
    </div>
  )
}
