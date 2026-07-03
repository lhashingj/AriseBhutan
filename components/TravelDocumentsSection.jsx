'use client'

import { useEffect, useState } from 'react'
import { Plane, FileCheck2, QrCode, Download, Loader2, Leaf, Stamp, AlertTriangle } from 'lucide-react'
import { fetchTravelDocuments, downloadTravelDocument } from '@/utils/travelDocuments'

const SDF_BADGE = {
  PENDING:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30', dot: 'bg-amber-400' },
  PAID:     { label: 'Paid',     cls: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30',       dot: 'bg-blue-400' },
  APPROVED: { label: 'Approved', cls: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30', dot: 'bg-green-500' },
}

const VISA_BADGE = {
  NOT_APPLIED: { label: 'Not Applied', cls: 'bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700', dot: 'bg-stone-400' },
  PROCESSING:  { label: 'Processing',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30', dot: 'bg-amber-400' },
  ISSUED:      { label: 'Issued',      cls: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30', dot: 'bg-green-500' },
}

const DOC_ROWS = [
  { column: 'flight_tickets_url', label: 'Flight Tickets',         sub: 'E-tickets for all passengers · PDF', icon: Plane,      filename: 'flight-tickets.pdf' },
  { column: 'visa_file_url',      label: 'Visa Clearance Letter',  sub: 'Official visa clearance · PDF',      icon: FileCheck2, filename: 'visa-clearance.pdf' },
  { column: 'entrance_qr_url',    label: 'Entrance Fees QR Code',  sub: 'Monument & site entry pass · Image', icon: QrCode,     filename: 'entrance-qr.png' },
]

function StatusPill({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-3.5 py-3">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
        <Icon className="w-4 h-4 text-amber-500 shrink-0" />
        {title}
      </span>
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${badge.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
        {badge.label}
      </span>
    </div>
  )
}

function DocRow({ row, path, bookingId }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')
  const Icon = row.icon

  async function handleDownload() {
    if (busy) return
    setBusy(true)
    setErr('')
    try {
      await downloadTravelDocument(path, `${bookingId}-${row.filename}`)
    } catch (e) {
      setErr(e.message || 'Download failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3.5 transition-colors">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{row.label}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{row.sub}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={busy}
          aria-label={`Download ${row.label}`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 shrink-0"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{busy ? 'Preparing…' : 'Download'}</span>
        </button>
      </div>
      {err && (
        <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 mt-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {err}
        </p>
      )}
    </div>
  )
}

/**
 * "Travel Documents & Clearances" — client-portal section shown
 * inside the itinerary card once the Arise Bhutan team has staged
 * documents / clearance statuses for the booking. Files are private
 * and download through 15-minute signed URLs.
 */
export default function TravelDocumentsSection({ bookingId }) {
  const [record, setRecord] = useState(null)

  useEffect(() => {
    let active = true
    if (!bookingId) return undefined
    fetchTravelDocuments(bookingId).then(data => {
      if (active) setRecord(data)
    })
    return () => { active = false }
  }, [bookingId])

  // Nothing staged for this booking yet — render nothing.
  if (!record) return null

  const sdf  = SDF_BADGE[record.sdf_status]   || SDF_BADGE.PENDING
  const visa = VISA_BADGE[record.visa_status] || VISA_BADGE.NOT_APPLIED
  const docs = DOC_ROWS.filter(r => record[r.column])

  return (
    <div className="border-t border-stone-100 dark:border-stone-800 px-4 sm:px-6 py-5">
      <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <span className="w-1 h-4 rounded-full bg-amber-400 inline-block" />
        Travel Documents & Clearances
      </p>

      {/* Clearance status badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        <StatusPill icon={Leaf}  title="Sustainable Development Fee" badge={sdf} />
        <StatusPill icon={Stamp} title="Bhutan Visa"                 badge={visa} />
      </div>

      {/* Downloadable documents */}
      {docs.length > 0 ? (
        <div className="space-y-2.5">
          {docs.map(row => (
            <DocRow key={row.column} row={row} path={record[row.column]} bookingId={bookingId} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-400 dark:text-stone-500 italic">
          Your documents will appear here as soon as they are issued by our team.
        </p>
      )}

      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-3 italic">
        Download links are secured and expire after 15 minutes — simply click again for a fresh link.
      </p>
    </div>
  )
}
