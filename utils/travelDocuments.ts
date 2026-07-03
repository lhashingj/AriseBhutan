/**
 * Travel Documents — client-side helpers
 *
 * Files live in the PRIVATE `travel-documents` storage bucket, so
 * they are served exclusively through short-lived signed URLs.
 * Storage RLS lets authenticated clients read only objects inside
 * their own booking-reference folder (admins can read everything),
 * which is what allows createSignedUrl to work from the browser.
 */

import { supabase } from '@/utils/supabase/client'

const BUCKET = 'travel-documents'
const SIGNED_URL_TTL_SECONDS = 15 * 60 // 15 minutes

export interface TravelDocumentRecord {
  id: string
  booking_id: string
  sdf_status: 'PENDING' | 'PAID' | 'APPROVED'
  visa_status: 'NOT_APPLIED' | 'PROCESSING' | 'ISSUED'
  visa_file_url: string | null
  flight_tickets_url: string | null
  entrance_qr_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Fetch the travel-documents record for one booking reference.
 * Returns null when no record exists (or RLS denies access).
 */
export async function fetchTravelDocuments(
  bookingId: string
): Promise<TravelDocumentRecord | null> {
  if (!bookingId) return null
  const { data, error } = await supabase
    .from('travel_documents')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle()
  if (error) return null
  return data as TravelDocumentRecord | null
}

/**
 * Create a 15-minute signed URL for a private document path.
 */
export async function getSignedDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not generate a secure download link.')
  }
  return data.signedUrl
}

/**
 * Securely download (or open) a private document in a new tab.
 * `filename` sets the suggested name in the browser's save dialog.
 */
export async function downloadTravelDocument(
  path: string,
  filename?: string
): Promise<void> {
  const signedUrl = await getSignedDocumentUrl(path)

  // Fetch as a blob so the download works cross-origin with a
  // proper filename instead of the hashed storage object name.
  const res = await fetch(signedUrl)
  if (!res.ok) throw new Error('Download failed — the link may have expired.')
  const blob = await res.blob()

  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename || path.split('/').pop() || 'document'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
