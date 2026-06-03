'use client'

import { useState } from 'react'
import { X, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, FileText, Loader2, User, Mail, Calendar, Users, DollarSign } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700 border-amber-200',  icon: Clock },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-green-100 text-green-700 border-green-200',  icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 border-red-200',        icon: XCircle },
}

function StatusBadge({ status }) {
  const cfg  = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

function CostRow({ label, calc, amount, bold, dark }) {
  return (
    <tr className={dark ? 'bg-stone-800' : bold ? 'bg-amber-50' : ''}>
      <td className={`px-3 py-2 text-xs ${dark ? 'text-white font-bold' : bold ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
        {label}
      </td>
      <td className={`px-3 py-2 text-xs text-right ${dark ? 'text-stone-400' : 'text-stone-400'}`}>{calc}</td>
      <td className={`px-3 py-2 text-sm text-right font-bold ${dark ? 'text-amber-400' : bold ? 'text-stone-900' : 'text-stone-800'}`}>
        ${Number(amount || 0).toLocaleString()}
      </td>
    </tr>
  )
}

function BookingCard({ booking, onConfirm, onCancel }) {
  const [open, setOpen]         = useState(false)
  const [confirming, setConf]   = useState(false)
  const [cancelling, setCanc]   = useState(false)

  const nights = booking.arrival_date && booking.return_date
    ? Math.max(0, Math.floor((new Date(booking.return_date) - new Date(booking.arrival_date)) / 86400000))
    : null

  async function handleConfirm() {
    setConf(true)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CONFIRMED' })
      .eq('id', booking.id)
    setConf(false)
    if (!error) onConfirm()
  }

  async function handleCancel() {
    setCanc(true)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', booking.id)
    setCanc(false)
    if (!error) onCancel()
  }

  const refCode = `ARB-${new Date(booking.created_at).getFullYear()}-${booking.id.slice(0,6).toUpperCase()}`

  return (
    <div className={`rounded-2xl border overflow-hidden transition-shadow ${
      booking.status === 'CONFIRMED' ? 'border-green-200' :
      booking.status === 'CANCELLED' ? 'border-red-200' : 'border-amber-200'
    }`}>
      {/* Card header — always visible */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-stone-900 text-sm line-clamp-1">
                {booking.tour_title || 'Custom Package'}
              </p>
            </div>
            <p className="text-[10px] font-mono text-stone-400">{refCode}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
          {[
            [Users, `${booking.group_size || '—'} pax`],
            [Calendar, booking.arrival_date ? new Date(booking.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'],
            [DollarSign, `$${Number(booking.total_cost || 0).toLocaleString()} USD`],
            [FileText, `${booking.hotel_tier || '—'} · ${nights !== null ? `${nights}N` : '—'}`],
          ].map(([Icon, val], i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="text-xs text-stone-600">{val}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {confirming
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle2 className="w-3.5 h-3.5" />
                }
                Confirm Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2 px-3 rounded-xl transition-colors border border-red-200 disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Cancel
              </button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Payment confirmed — booking active
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="ml-auto p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
            title={open ? 'Collapse' : 'Expand details'}
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-stone-100">

          {/* Flight details */}
          {(booking.flight_arrival || booking.flight_return) && (
            <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Flights</p>
              <div className="space-y-1 text-xs text-stone-700">
                {booking.flight_arrival && <p>✈ In: {booking.flight_arrival}</p>}
                {booking.flight_return  && <p>✈ Out: {booking.flight_return}</p>}
              </div>
            </div>
          )}

          {/* Day-by-day itinerary */}
          {Array.isArray(booking.itinerary_days) && booking.itinerary_days.length > 0 && (
            <div className="px-4 py-3 bg-white border-b border-stone-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                Day-by-Day Itinerary ({booking.itinerary_days.length} days)
              </p>
              <div className="space-y-2">
                {booking.itinerary_days.map((day, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900">{day.title || `Day ${i + 1}`}</p>
                      {day.activities && (
                        <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">{day.activities}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        {day.hotel && <span className="text-[9px] text-stone-400">🏨 {day.hotel}</span>}
                        <span className="text-[9px] text-stone-400">
                          {[day.breakfast && 'B', day.lunch && 'L', day.dinner && 'D'].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="px-4 py-3 bg-stone-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Cost Breakdown</p>
            <div className="rounded-xl overflow-hidden border border-stone-200">
              <table className="w-full border-collapse text-xs">
                <tbody>
                  {Array.isArray(booking.cost_items) && booking.cost_items.map((item, i) => (
                    <CostRow key={i} label={item.label} calc={item.calc} amount={item.amount} />
                  ))}
                  <CostRow label="Sub-total" amount={booking.subtotal} bold />
                  <CostRow label="GST (5%)"  amount={booking.gst} />
                  <CostRow label="GRAND TOTAL (USD)" amount={booking.total_cost} dark />
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              INR equiv. ≈ ₹{Math.round(Number(booking.total_cost || 0) * 83.5).toLocaleString('en-IN')} @ ₹83.50
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main drawer ──────────────────────────────────────────────────────────────
export default function AdminBookingDrawer({ profile, bookings, onClose, onStatusChange }) {
  const totalSpend = bookings.reduce((s, b) => s + Number(b.total_cost || 0), 0)
  const confirmed  = bookings.filter((b) => b.status === 'CONFIRMED').length
  const pending    = bookings.filter((b) => b.status === 'PENDING').length

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden">

        {/* ── Drawer header ── */}
        <div className="flex-shrink-0 bg-stone-900 px-6 py-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-white text-base leading-tight">{profile?.name || 'Client'}</p>
                <p className="text-stone-400 text-xs">{profile?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Packages', value: bookings.length, color: 'text-white' },
              { label: 'Confirmed',      value: confirmed,        color: 'text-green-400' },
              { label: 'Total Spend',    value: `$${totalSpend.toLocaleString()}`, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                <p className="text-stone-400 text-[9px] uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`font-bold text-sm ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bookings list ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-stone-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900 text-sm">
              Itinerary Vouchers
              {pending > 0 && (
                <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  {pending} pending
                </span>
              )}
            </h3>
            <span className="text-xs text-stone-400">{bookings.length} total</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No packages yet for this client.</p>
            </div>
          ) : (
            bookings.map((bk) => (
              <BookingCard
                key={bk.id}
                booking={bk}
                onConfirm={onStatusChange}
                onCancel={onStatusChange}
              />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-4 bg-white border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </p>
          <button onClick={onClose} className="btn-outline text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
