'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Plane, FileCheck2, QrCode, UploadCloud, Trash2, ExternalLink,
  Loader2, Leaf, Stamp, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { getSignedDocumentUrl } from '@/utils/travelDocuments'
import {
  uploadTravelDocument,
  removeTravelDocument,
  updateTravelDocumentStatus,
} from '@/app/actions/travel-documents'

const DOC_SLOTS = [
  {
    type: 'flight_tickets',
    column: 'flight_tickets_url',
    label: 'Flight Tickets',
    hint: 'PDF · e-tickets for all passengers',
    accept: 'application/pdf',
    icon: Plane,
  },
  {
    type: 'visa_file',
    column: 'visa_file_url',
    label: 'Visa Clearance Letter',
    hint: 'PDF · official visa clearance',
    accept: 'application/pdf',
    icon: FileCheck2,
  },
  {
    type: 'entrance_qr',
    column: 'entrance_qr_url',
    label: 'Entrance Fees QR Code',
    hint: 'PNG / JPG / WEBP · monument entry QR',
    accept: 'image/png,image/jpeg,image/webp',
    icon: QrCode,
  },
]

const SDF_OPTIONS  = ['PENDING', 'PAID', 'APPROVED']
const VISA_OPTIONS = ['NOT_APPLIED', 'PROCESSING', 'ISSUED']

const STATUS_TONE = {
  PENDING:     'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PAID:        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  APPROVED:    'bg-green-500/15 text-green-400 border-green-500/30',
  NOT_APPLIED: 'bg-stone-500/15 text-stone-400 border-stone-500/30',
  PROCESSING:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ISSUED:      'bg-green-500/15 text-green-400 border-green-500/30',
}

const lbl = 'text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5'

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}

function DocSlot({ slot, path, bookingId, onChanged }) {
  const inputRef = useRef(null)
  const [busy, setBusy]       = useState(false)
  const [err, setErr]         = useState('')
  const [dragOver, setDragOver] = useState(false)
  const Icon = slot.icon

  const handleFile = useCallback(async (file) => {
    if (!file || busy) return
    setBusy(true)
    setErr('')
    try {
      const fd = new FormData()
      fd.append('accessToken', await getAccessToken())
      fd.append('bookingId', bookingId)
      fd.append('docType', slot.type)
      fd.append('file', file)
      const res = await uploadTravelDocument(fd)
      if (!res.success) setErr(res.error)
      else onChanged()
    } catch (e) {
      setErr(e.message || 'Upload failed.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [bookingId, busy, onChanged, slot.type])

  async function handleView() {
    setErr('')
    try {
      const url = await getSignedDocumentUrl(path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      setErr(e.message || 'Could not open document.')
    }
  }

  async function handleRemove() {
    if (busy) return
    setBusy(true)
    setErr('')
    try {
      const res = await removeTravelDocument({
        accessToken: await getAccessToken(),
        bookingId,
        docType: slot.type,
      })
      if (!res.success) setErr(res.error)
      else onChanged()
    } catch (e) {
      setErr(e.message || 'Could not remove document.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-stone-800/60 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-100 leading-tight">{slot.label}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">{slot.hint}</p>
        </div>
        {path && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/15 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Uploaded
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={slot.accept}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />

      {path ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-xs font-semibold text-stone-300 hover:text-white hover:border-amber-500/40 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-xs font-semibold text-stone-300 hover:text-white hover:border-amber-500/40 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            Replace
          </button>
          <button
            onClick={handleRemove}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
          disabled={busy}
          className={`w-full flex flex-col items-center justify-center gap-1.5 px-4 py-6 rounded-xl border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-amber-500/60 bg-amber-500/10'
              : 'border-white/10 bg-stone-900/50 hover:border-amber-500/40 hover:bg-stone-900'
          } disabled:opacity-60`}
        >
          {busy
            ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            : <UploadCloud className="w-5 h-5 text-stone-500" />}
          <span className="text-xs font-semibold text-stone-400">
            {busy ? 'Uploading…' : 'Click or drop file to upload'}
          </span>
        </button>
      )}

      {err && (
        <p className="flex items-start gap-1.5 text-xs text-red-400 mt-2.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {err}
        </p>
      )}
    </div>
  )
}

function StatusSelect({ label, icon: Icon, value, options, onChange, saving }) {
  return (
    <div className="bg-stone-800/60 border border-white/10 rounded-xl p-4">
      <span className={lbl}>
        <Icon className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-400" />
        {label}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={saving}
          className="flex-1 bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-60"
        >
          {options.map(o => (
            <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {saving
          ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          : (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide shrink-0 ${STATUS_TONE[value] || STATUS_TONE.PENDING}`}>
              {value.replace(/_/g, ' ')}
            </span>
          )}
      </div>
    </div>
  )
}

/**
 * Admin manager for a booking's travel documents & clearance statuses.
 * Dark-native styling to match the admin panel.
 */
export default function AdminTravelDocuments({ bookingId }) {
  const [record, setRecord]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [statusSaving, setStatusSaving] = useState('') // 'sdf' | 'visa' | ''
  const [statusErr, setStatusErr]   = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('travel_documents')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle()
    setRecord(data || null)
    setLoading(false)
  }, [bookingId])

  useEffect(() => { load() }, [load])

  async function saveStatus(kind, value) {
    setStatusSaving(kind)
    setStatusErr('')
    // Optimistic update
    setRecord(prev => ({
      ...(prev || { booking_id: bookingId, sdf_status: 'PENDING', visa_status: 'NOT_APPLIED' }),
      [kind === 'sdf' ? 'sdf_status' : 'visa_status']: value,
    }))
    try {
      const res = await updateTravelDocumentStatus({
        accessToken: await getAccessToken(),
        bookingId,
        ...(kind === 'sdf' ? { sdfStatus: value } : { visaStatus: value }),
      })
      if (!res.success) {
        setStatusErr(res.error)
        await load()
      }
    } catch (e) {
      setStatusErr(e.message || 'Could not save status.')
      await load()
    } finally {
      setStatusSaving('')
    }
  }

  if (!bookingId) {
    return (
      <p className="text-sm text-stone-500 italic">
        A booking reference is required before documents can be managed.
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-serif font-bold text-base">Travel Documents & Clearances</h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Files upload to the private <span className="font-mono text-stone-400">travel-documents</span> bucket
          for <span className="font-mono text-amber-400">{bookingId}</span> — clients download them via
          15-minute signed links.
        </p>
      </div>

      {/* Clearance statuses */}
      <div className="grid sm:grid-cols-2 gap-3">
        <StatusSelect
          label="SDF Status"
          icon={Leaf}
          value={record?.sdf_status || 'PENDING'}
          options={SDF_OPTIONS}
          saving={statusSaving === 'sdf'}
          onChange={v => saveStatus('sdf', v)}
        />
        <StatusSelect
          label="Visa Status"
          icon={Stamp}
          value={record?.visa_status || 'NOT_APPLIED'}
          options={VISA_OPTIONS}
          saving={statusSaving === 'visa'}
          onChange={v => saveStatus('visa', v)}
        />
      </div>
      {statusErr && (
        <p className="flex items-start gap-1.5 text-xs text-red-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {statusErr}
        </p>
      )}

      {/* Document uploads */}
      <div className="space-y-3">
        {DOC_SLOTS.map(slot => (
          <DocSlot
            key={slot.type}
            slot={slot}
            path={record?.[slot.column] || null}
            bookingId={bookingId}
            onChanged={load}
          />
        ))}
      </div>
    </div>
  )
}
