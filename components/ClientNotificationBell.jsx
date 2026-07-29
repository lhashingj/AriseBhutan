'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Bell, MapPin, FileCheck2, Leaf, Stamp, QrCode, Plane } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { fetchGuestItineraries } from '@/utils/bookingGuests'

/**
 * Client-portal notification bell — a lightweight activity feed derived
 * from existing itinerary/travel-document timestamps (no dedicated
 * notifications table). "Seen" state is tracked per-browser via
 * localStorage; this is intentionally simple rather than a full
 * cross-device read/unread system.
 */

const SEEN_KEY = 'arb_notifications_last_seen'
const LOOKBACK_DAYS = 21

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const EVENT_ICON = { status: MapPin, flight: Plane, visa_doc: FileCheck2, qr: QrCode, sdf: Leaf, visa_status: Stamp }

function buildEvents(itineraries, docs, since) {
  const events = []
  for (const i of itineraries) {
    if ((i.status === 'quoted' || i.status === 'confirmed') && i.updated_at >= since) {
      events.push({
        id: `status-${i.booking_reference}-${i.status}`,
        type: 'status',
        ref: i.booking_reference,
        text: `${i.tour_summary?.tour_package || 'Your itinerary'} was ${i.status === 'quoted' ? 'Quoted' : 'Confirmed'}`,
        at: i.updated_at,
      })
    }
  }
  for (const d of docs) {
    if (d.updated_at < since) continue
    if (d.flight_tickets_url) events.push({ id: `doc-${d.booking_id}-flight`, type: 'flight', ref: d.booking_id, text: `Flight tickets uploaded — ${d.booking_id}`, at: d.updated_at })
    if (d.visa_file_url) events.push({ id: `doc-${d.booking_id}-visa`, type: 'visa_doc', ref: d.booking_id, text: `Visa clearance letter uploaded — ${d.booking_id}`, at: d.updated_at })
    if (d.entrance_qr_url) events.push({ id: `doc-${d.booking_id}-qr`, type: 'qr', ref: d.booking_id, text: `Entrance QR code uploaded — ${d.booking_id}`, at: d.updated_at })
    if (d.sdf_status === 'PAID' || d.sdf_status === 'APPROVED') {
      events.push({ id: `sdf-${d.booking_id}-${d.sdf_status}`, type: 'sdf', ref: d.booking_id, text: `SDF marked ${d.sdf_status === 'PAID' ? 'Paid' : 'Approved'} — ${d.booking_id}`, at: d.updated_at })
    }
    if (d.visa_status === 'PROCESSING' || d.visa_status === 'ISSUED') {
      events.push({ id: `visa-${d.booking_id}-${d.visa_status}`, type: 'visa_status', ref: d.booking_id, text: `Visa ${d.visa_status === 'ISSUED' ? 'issued' : 'processing started'} — ${d.booking_id}`, at: d.updated_at })
    }
  }
  return events.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12)
}

export default function ClientNotificationBell({ className = '', align = 'right', direction = 'down' }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [lastSeen, setLastSeen] = useState(0)
  const rootRef = useRef(null)

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString()

    const [{ data: byUserId }, { data: byEmail }, byMembership] = await Promise.all([
      supabase.from('itineraries').select('booking_reference, status, tour_summary, updated_at').eq('user_id', session.user.id).gte('updated_at', since),
      supabase.from('itineraries').select('booking_reference, status, tour_summary, updated_at').filter('client_info->>email', 'eq', session.user.email).gte('updated_at', since),
      fetchGuestItineraries(),
    ])

    const seenRefs = new Set()
    const itins = [...(byUserId || []), ...(byEmail || []), ...(byMembership || [])].filter(i => {
      if (!i.booking_reference || seenRefs.has(i.booking_reference)) return false
      seenRefs.add(i.booking_reference)
      return true
    })

    let docs = []
    if (seenRefs.size > 0) {
      const { data } = await supabase.from('travel_documents').select('*').in('booking_id', [...seenRefs]).gte('updated_at', since)
      docs = data || []
    }

    setItems(buildEvents(itins, docs, since))
  }, [])

  useEffect(() => {
    load()
    setLastSeen(Number(localStorage.getItem(SEEN_KEY) || 0))
  }, [load])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const unreadCount = items.filter(e => new Date(e.at).getTime() > lastSeen).length

  function handleToggle() {
    setOpen(v => !v)
    if (!open) {
      const now = Date.now()
      localStorage.setItem(SEEN_KEY, String(now))
      setLastSeen(now)
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        className={`relative p-2 rounded-xl transition-colors ${className}`}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900" />
        )}
      </button>

      {open && (
        <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl shadow-stone-900/10 dark:shadow-black/40 z-50 overflow-hidden`}>
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <p className="text-sm font-serif font-bold text-stone-900 dark:text-stone-50">Recent Updates</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-stone-500 italic px-4 py-6 text-center">
                Nothing new — check back after your specialist reviews your trip.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {items.map(evt => {
                  const Icon = EVENT_ICON[evt.type] || Bell
                  return (
                    <li key={evt.id}>
                      <a
                        href={`/itinerary/${evt.ref}`}
                        className="flex items-start gap-2.5 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                      >
                        <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-stone-700 dark:text-stone-200 leading-snug">{evt.text}</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{timeAgo(evt.at)}</p>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
