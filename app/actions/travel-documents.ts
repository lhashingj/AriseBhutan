'use server'

/**
 * Server Actions — Travel Document Management
 *
 * Admin-only actions for uploading flight tickets / visa letters /
 * entrance QR codes into the PRIVATE `travel-documents` storage
 * bucket, and for updating SDF / visa statuses.
 *
 * Auth follows the project's existing pattern: the browser client
 * (localStorage sessions, no auth cookies) passes its access token
 * explicitly; we verify it with the service-role client and check
 * profiles.role === 'ADMIN' before doing anything.
 */

import { createClient } from '@supabase/supabase-js'

const BUCKET = 'travel-documents'

export type DocType = 'flight_tickets' | 'visa_file' | 'entrance_qr'

const DOC_CONFIG: Record<DocType, { column: string; mimeTypes: string[]; label: string }> = {
  flight_tickets: {
    column: 'flight_tickets_url',
    mimeTypes: ['application/pdf'],
    label: 'Flight Tickets (PDF)',
  },
  visa_file: {
    column: 'visa_file_url',
    mimeTypes: ['application/pdf'],
    label: 'Visa Clearance Letter (PDF)',
  },
  entrance_qr: {
    column: 'entrance_qr_url',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    label: 'Entrance Fees QR Code (Image)',
  },
}

const SDF_STATUSES  = ['PENDING', 'PAID', 'APPROVED'] as const
const VISA_STATUSES = ['NOT_APPLIED', 'PROCESSING', 'ISSUED'] as const

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB (matches bucket limit)
const BOOKING_ID_RE  = /^ARB-\d{4}-[A-Z0-9]{6}$/

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyAdmin(
  supabase: ReturnType<typeof adminClient>,
  token: string | null | undefined
): Promise<boolean> {
  if (!token) return false
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'ADMIN'
}

/**
 * Upload (or replace) one travel document for a booking.
 * FormData fields: accessToken, bookingId, docType, file
 */
export async function uploadTravelDocument(
  formData: FormData
): Promise<ActionResult<{ path: string }>> {
  try {
    const accessToken = formData.get('accessToken') as string | null
    const bookingId   = ((formData.get('bookingId') as string) || '').trim().toUpperCase()
    const docType     = formData.get('docType') as DocType | null
    const file        = formData.get('file') as File | null

    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }

    if (!BOOKING_ID_RE.test(bookingId)) {
      return { success: false, error: 'Invalid booking ID. Expected format: ARB-2026-B010C9' }
    }
    if (!docType || !DOC_CONFIG[docType]) {
      return { success: false, error: 'Invalid document type.' }
    }
    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' }
    }

    const cfg = DOC_CONFIG[docType]
    if (!cfg.mimeTypes.includes(file.type)) {
      return { success: false, error: `Invalid file type for ${cfg.label}. Allowed: ${cfg.mimeTypes.join(', ')}` }
    }
    if (file.size > MAX_FILE_BYTES) {
      return { success: false, error: 'File exceeds the 10 MB limit.' }
    }

    // Path convention: {bookingId}/{docType}-{timestamp}.{ext}
    // (storage RLS grants clients read on their own bookingId folder)
    const ext  = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1]
    const path = `${bookingId}/${docType}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true })
    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    // Fetch previous path (to clean up the replaced file afterwards)
    const { data: existing } = await supabase
      .from('travel_documents')
      .select(cfg.column)
      .eq('booking_id', bookingId)
      .maybeSingle()
    const previousPath = (existing as Record<string, string | null> | null)?.[cfg.column]

    const { error: dbError } = await supabase
      .from('travel_documents')
      .upsert({ booking_id: bookingId, [cfg.column]: path }, { onConflict: 'booking_id' })
    if (dbError) {
      // Roll back the orphaned upload
      await supabase.storage.from(BUCKET).remove([path])
      return { success: false, error: `Database update failed: ${dbError.message}` }
    }

    if (previousPath && previousPath !== path) {
      await supabase.storage.from(BUCKET).remove([previousPath])
    }

    return { success: true, data: { path } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error during upload.' }
  }
}

/**
 * Remove one travel document (file + DB reference) for a booking.
 */
export async function removeTravelDocument(params: {
  accessToken: string
  bookingId: string
  docType: DocType
}): Promise<ActionResult> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }

    const bookingId = (params.bookingId || '').trim().toUpperCase()
    const cfg = DOC_CONFIG[params.docType]
    if (!cfg) return { success: false, error: 'Invalid document type.' }

    const { data: existing } = await supabase
      .from('travel_documents')
      .select(cfg.column)
      .eq('booking_id', bookingId)
      .maybeSingle()
    const path = (existing as Record<string, string | null> | null)?.[cfg.column]

    const { error: dbError } = await supabase
      .from('travel_documents')
      .update({ [cfg.column]: null })
      .eq('booking_id', bookingId)
    if (dbError) return { success: false, error: dbError.message }

    if (path) await supabase.storage.from(BUCKET).remove([path])

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error while removing document.' }
  }
}

/**
 * Update SDF and/or visa status for a booking (creates the record
 * if it doesn't exist yet).
 */
export async function updateTravelDocumentStatus(params: {
  accessToken: string
  bookingId: string
  sdfStatus?: string
  visaStatus?: string
}): Promise<ActionResult> {
  try {
    const supabase = adminClient()
    if (!(await verifyAdmin(supabase, params.accessToken))) {
      return { success: false, error: 'Unauthorized — admin access required.' }
    }

    const bookingId = (params.bookingId || '').trim().toUpperCase()
    if (!BOOKING_ID_RE.test(bookingId)) {
      return { success: false, error: 'Invalid booking ID. Expected format: ARB-2026-B010C9' }
    }

    const patch: Record<string, string> = { booking_id: bookingId }
    if (params.sdfStatus !== undefined) {
      if (!SDF_STATUSES.includes(params.sdfStatus as typeof SDF_STATUSES[number])) {
        return { success: false, error: `Invalid SDF status. Allowed: ${SDF_STATUSES.join(', ')}` }
      }
      patch.sdf_status = params.sdfStatus
    }
    if (params.visaStatus !== undefined) {
      if (!VISA_STATUSES.includes(params.visaStatus as typeof VISA_STATUSES[number])) {
        return { success: false, error: `Invalid visa status. Allowed: ${VISA_STATUSES.join(', ')}` }
      }
      patch.visa_status = params.visaStatus
    }
    if (!patch.sdf_status && !patch.visa_status) {
      return { success: false, error: 'Nothing to update.' }
    }

    const { error } = await supabase
      .from('travel_documents')
      .upsert(patch, { onConflict: 'booking_id' })
    if (error) return { success: false, error: error.message }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error while updating status.' }
  }
}
