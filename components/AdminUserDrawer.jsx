'use client'

import { useState } from 'react'
import {
  X, Pencil, Save, Trash2, AlertTriangle, User, Mail, Phone,
  CreditCard, Calendar, Plane, ShieldCheck, ShieldOff,
  CheckCircle2, Clock, XCircle, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors bg-stone-800'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25',   icon: Clock },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/15 text-red-400 border-red-500/25',          icon: XCircle },
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function nights(a, b) {
  if (!a || !b) return 0
  return Math.max(0, Math.floor((new Date(b) - new Date(a)) / 86400000))
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-stone-500 font-medium shrink-0 w-36">{label}</span>
      <span className={`text-sm text-stone-200 text-right ${mono ? 'font-mono font-semibold' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}

function FlightBlock({ label, sector, flightNo, depart, arrive, date }) {
  if (!sector && !flightNo) return null
  return (
    <div className="bg-stone-900/50 border border-white/5 rounded-xl p-3 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {flightNo && (
          <span className="text-xs font-mono font-bold bg-stone-800 border border-white/10 px-2 py-0.5 rounded-lg text-stone-200">
            {flightNo}
          </span>
        )}
        {sector && <span className="text-sm font-medium text-stone-300">{sector}</span>}
      </div>
      <div className="flex gap-4 text-xs text-stone-500">
        {date   && <span><Calendar className="w-3 h-3 inline mr-1" />{fmtDate(date)}</span>}
        {depart && <span>Dep {depart}</span>}
        {arrive && arrive !== '—' && <span>Arr {arrive}</span>}
      </div>
    </div>
  )
}

function BookingCard({ booking }) {
  const [open, setOpen] = useState(false)
  const StatusIcon = STATUS_CONFIG[booking.status]?.icon || Clock
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
  const n   = nights(booking.arrival_date, booking.return_date)
  const pax = parseInt(booking.group_size) || 0
  const sdf = n * pax * 100

  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-stone-800">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm line-clamp-1">{booking.tour_title || 'Custom Package'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
              <StatusIcon className="w-3 h-3" />
              {cfg.label}
            </span>
            <span className="text-[11px] text-stone-500">{fmtDate(booking.arrival_date)} → {fmtDate(booking.return_date)}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-white">${Number(booking.total_cost || 0).toLocaleString()}</p>
          <p className="text-[10px] text-stone-500">{pax} pax · {n}N</p>
        </div>
        <button onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-white/10 transition-colors self-center">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          <div className="px-4 py-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Travel Documents</p>
            <InfoRow label="Passport No."      value={booking.passport_number}  mono />
            <InfoRow label="Passport Expiry"   value={fmtDate(booking.passport_expiry)} />
            <InfoRow label="Nationality"       value={booking.nationality} />
            <InfoRow label="Emergency Contact" value={booking.emergency_contact} />
            <InfoRow label="Client Email"      value={booking.client_email} />
            <InfoRow label="Client Phone"      value={booking.client_phone} />
          </div>

          {(booking.flight_arrival || booking.flight_return) && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Flights</p>
              <FlightBlock
                label="Inbound (to Paro)"
                sector={booking.flight_arrival}
                flightNo={booking.flight_arrival_no}
                depart={booking.flight_arrival_depart}
                arrive={booking.flight_arrival_arrive}
                date={booking.arrival_date}
              />
              <FlightBlock
                label="Outbound (from Paro)"
                sector={booking.flight_return}
                flightNo={booking.flight_return_no}
                depart={booking.flight_return_depart}
                arrive={booking.flight_return_arrive}
                date={booking.return_date}
              />
            </div>
          )}

          <div className="px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">SDF & Cost</p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 space-y-1 text-xs mb-2">
              <div className="flex justify-between">
                <span className="text-stone-400">SDF formula</span>
                <span className="text-stone-300 font-mono">{n} nights × {pax} pax × $100</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">SDF Total</span>
                <span className="text-amber-400">${sdf.toLocaleString()} USD</span>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-500">Sub-total</span>
              <span className="text-stone-300">${Number(booking.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-500">GST (5%)</span>
              <span className="text-stone-300">${Number(booking.gst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-1 mt-1">
              <span className="text-stone-300">Grand Total</span>
              <span className="text-white">${Number(booking.total_cost || 0).toLocaleString()} USD</span>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Stay Details</p>
            <InfoRow label="Hotel Tier"  value={booking.hotel_tier} />
            <InfoRow label="Group Size"  value={`${booking.group_size || '—'} pax`} />
            <InfoRow label="Nights"      value={`${n} nights`} />
            <InfoRow label="Payment"     value={booking.payment_status === 'PAID' ? '✓ Paid' : '⏳ Unpaid'} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main drawer component ─────────────────────────────────────────────────────
export default function AdminUserDrawer({ profile, bookings, onClose, onDelete, onUpdate }) {
  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState({
    name:              profile.name              || '',
    role:              profile.role              || 'CLIENT',
    phone:             profile.phone             || '',
    nationality:       profile.nationality       || '',
    passport_number:   profile.passport_number   || '',
    passport_expiry:   profile.passport_expiry   || '',
    emergency_contact: profile.emergency_contact || '',
  })
  const [saving, setSaving]       = useState(false)
  const [saveErr, setSaveErr]     = useState('')
  const [confirmDelete, setConfDel] = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [delErr, setDelErr]       = useState('')

  const latest = bookings[0] || null

  async function handleSave() {
    setSaving(true)
    setSaveErr('')
    const { error } = await supabase
      .from('profiles')
      .update({
        name:              form.name.trim(),
        role:              form.role,
        phone:             form.phone.trim()             || null,
        nationality:       form.nationality.trim()       || null,
        passport_number:   form.passport_number.trim()   || null,
        passport_expiry:   form.passport_expiry          || null,
        emergency_contact: form.emergency_contact.trim() || null,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setEditing(false)
    onUpdate({ ...profile, ...form, name: form.name.trim() })
  }

  async function handleDelete() {
    setDeleting(true)
    setDelErr('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setDelErr('Session expired. Please refresh.'); setDeleting(false); return }

    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId: profile.id }),
    })

    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setDelErr(json.error || 'Delete failed'); return }
    onDelete(profile.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-stone-900 h-full flex flex-col shadow-2xl overflow-hidden border-l border-white/5">

        {/* ── Header ── */}
        <div className="flex-shrink-0 bg-stone-950 px-6 py-5 border-b border-white/10">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base flex-shrink-0">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-white text-base leading-tight">{profile.name || '—'}</p>
                <p className="text-stone-400 text-xs">{profile.email}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                  profile.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-700 text-stone-400'
                }`}>{profile.role}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Bookings',    value: bookings.length },
              { label: 'Confirmed',   value: bookings.filter((b) => b.status === 'CONFIRMED').length, color: 'text-emerald-400' },
              { label: 'Total Spend', value: `$${bookings.reduce((s, b) => s + Number(b.total_cost || 0), 0).toLocaleString()}`, color: 'text-amber-400' },
            ].map(({ label, value, color = 'text-white' }) => (
              <div key={label} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                <p className="text-stone-400 text-[9px] uppercase tracking-wider">{label}</p>
                <p className={`font-bold text-sm ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Profile section */}
          <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <p className="font-semibold text-white text-sm">Profile Details</p>
              {!editing ? (
                <button
                  onClick={() => { setEditing(true); setSaveErr('') }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditing(false); setSaveErr(''); setForm({ name: profile.name || '', role: profile.role || 'CLIENT' }) }}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-200 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="px-4 py-3 space-y-3">
              {saveErr && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{saveErr}</p>
              )}

              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Full Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className={inputCls}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Role</label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className={inputCls}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Nationality</label>
                      <input
                        value={form.nationality}
                        onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                        className={inputCls}
                        placeholder="e.g. Indian"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Passport Number</label>
                      <input
                        value={form.passport_number}
                        onChange={(e) => setForm((f) => ({ ...f, passport_number: e.target.value }))}
                        className={inputCls}
                        placeholder="A1234567"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Passport Expiry</label>
                      <input
                        type="date"
                        value={form.passport_expiry}
                        onChange={(e) => setForm((f) => ({ ...f, passport_expiry: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1">Emergency Contact</label>
                    <input
                      value={form.emergency_contact}
                      onChange={(e) => setForm((f) => ({ ...f, emergency_contact: e.target.value }))}
                      className={inputCls}
                      placeholder="Name & phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1">Email (read-only)</label>
                    <input value={profile.email} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
                    <p className="text-[10px] text-stone-500 mt-1">Email & password changes are only available to the user themselves.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 py-1">
                    <User className="w-4 h-4 text-stone-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-medium text-stone-200">{profile.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm text-stone-200">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    {profile.role === 'ADMIN'
                      ? <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                      : <ShieldOff className="w-4 h-4 text-stone-500 shrink-0" />}
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-wider">Role</p>
                      <p className="text-sm font-medium text-stone-200">{profile.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-wider">Member Since</p>
                      <p className="text-sm text-stone-200">{fmtDate(profile.created_at)}</p>
                    </div>
                  </div>
                  {(profile.phone || latest?.client_phone) && (
                    <div className="flex items-center gap-3 py-1">
                      <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Phone</p>
                        <p className="text-sm text-stone-200">{profile.phone || latest?.client_phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.nationality && (
                    <div className="flex items-center gap-3 py-1">
                      <CreditCard className="w-4 h-4 text-stone-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Nationality</p>
                        <p className="text-sm text-stone-200">{profile.nationality}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Travel documents — prefer profile data, fall back to latest booking */}
          {(profile.passport_number || profile.passport_expiry || profile.emergency_contact ||
            latest?.passport_number || latest?.nationality || latest?.passport_expiry || latest?.emergency_contact) && (
            <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="font-semibold text-white text-sm">Travel Documents</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {profile.passport_number ? 'From client profile' : 'From most recent booking'}
                </p>
              </div>
              <div className="px-4 py-3">
                <InfoRow label="Passport Number"   value={profile.passport_number   || latest?.passport_number}  mono />
                <InfoRow label="Passport Expiry"   value={fmtDate(profile.passport_expiry   || latest?.passport_expiry)} />
                <InfoRow label="Nationality"       value={profile.nationality       || latest?.nationality} />
                <InfoRow label="Emergency Contact" value={profile.emergency_contact || latest?.emergency_contact} />
              </div>
            </div>
          )}

          {/* Bookings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-white text-sm">Bookings & Flight Details</p>
              <span className="text-xs text-stone-500">{bookings.length} total</span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-stone-800 rounded-2xl border border-white/5 px-4 py-12 text-center text-stone-500">
                <Plane className="w-8 h-8 mx-auto mb-2 opacity-25" />
                <p className="text-sm">No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((bk) => (
                  <BookingCard key={bk.id} booking={bk} />
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-red-500/5 rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-red-500/15">
              <p className="font-semibold text-red-400 text-sm">Danger Zone</p>
            </div>
            <div className="px-4 py-4">
              {!confirmDelete ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-stone-200">Delete this client</p>
                    <p className="text-xs text-stone-500 mt-0.5">Permanently removes the account and all {bookings.length} booking{bookings.length !== 1 ? 's' : ''}.</p>
                  </div>
                  <button
                    onClick={() => setConfDel(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete User
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">
                      This will permanently delete <strong className="text-red-200">{profile.name || profile.email}</strong> and all their data. This cannot be undone.
                    </p>
                  </div>
                  {delErr && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{delErr}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setConfDel(false); setDelErr('') }}
                      className="flex-1 text-xs font-semibold text-stone-300 bg-stone-700 hover:bg-stone-600 py-2.5 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Yes, Delete Permanently
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
