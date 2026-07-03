import {
  GoogleGenAI,
  Type,
  type Content,
  type Part,
  type FunctionDeclaration,
} from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { KNOWLEDGE_BASE } from '@/data/knowledgeBase'

/**
 * Arise Bhutan Assistant — /api/chat
 *
 * Gemini-powered travel concierge (free tier) with Supabase tool
 * access. Streams NDJSON events to the chat widget:
 *   {type:'text', text}          — incremental assistant text
 *   {type:'booking_card', card}  — interactive travel-documents card
 *   {type:'done'} | {type:'error', error}
 *
 * Function calling lets the model look up a booking by reference
 * (ARB-2026-XXXXXX) or list the signed-in visitor's own bookings.
 * Document download links are 15-minute signed URLs from the private
 * travel-documents bucket, delivered only inside UI cards (never as
 * raw text).
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// gemini-1.5-flash and gemini-2.0-flash are retired (2.0 shut down
// June 2026); gemini-2.5-flash is the current stable free-tier model.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const BOOKING_ID_RE = /^ARB-\d{4}-[A-Z0-9]{6}$/
const SIGNED_URL_TTL = 15 * 60 // 15 minutes
const MAX_TOOL_ROUNDS = 4

const SYSTEM_PROMPT = `You are the Arise Bhutan Assistant — the premium digital concierge of Arise Bhutan Tours & Travels (arisebhutan.com), a DOT-licensed private tour operator in Paro, Bhutan.

VOICE & STYLE
- Open first conversations warmly with "Kuzuzangpo la!" (Bhutanese greeting); sprinkle it naturally but not in every reply.
- Warm, gracious, quietly luxurious — like a concierge at a heritage lodge. Never pushy.
- Keep replies concise (under ~150 words), formatted with short paragraphs, **bold** highlights, and bullet lists where helpful.
- Link to website pages with markdown links using the paths in the knowledge base, e.g. [Adventure Builder](/adventure-builder).
- Answer from the knowledge base with authority. If something isn't covered, say so honestly and offer the concierge team on WhatsApp (+975 77 319 405).

BOOKING & DOCUMENT LOOKUPS
- When a visitor provides a booking reference (format ARB-YYYY-XXXXXX), call lookup_booking with it.
- When a signed-in visitor asks about "my booking", "my documents", "my visa", "my trip" etc. without a reference, call list_my_bookings first; if they have exactly one booking, look it up directly.
- After lookup_booking succeeds, an interactive card with document download buttons and status badges is AUTOMATICALLY shown to the visitor beneath your reply — so do NOT write out URLs or repeat every field. Briefly summarise the trip, mention the SDF/visa status in plain words, and point them to the card below.
- If the visitor is not signed in and gives no reference, ask for the booking reference from their confirmation email.
- Never invent booking data. If a lookup fails, say the reference wasn't found and suggest double-checking it.

SAFETY
- Only discuss the booking the tool returned. Do not speculate about other travellers' data.

<knowledge_base>
${KNOWLEDGE_BASE}
</knowledge_base>`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type DocumentCard = {
  ref: string
  tour: string
  status: string
  sdf_status: string
  visa_status: string
  documents: { key: string; label: string; url: string }[]
  itineraryUrl: string
}

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'lookup_booking',
    description:
      'Look up an Arise Bhutan booking by its reference (format ARB-YYYY-XXXXXX). Returns the tour summary, booking status, SDF payment status, visa clearance status, and which travel documents (flight tickets, visa letter, entrance QR) are available. An interactive download card is automatically displayed to the visitor when documents exist.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        booking_reference: {
          type: Type.STRING,
          description: "The booking reference, e.g. 'ARB-2026-B010C9'",
        },
      },
      required: ['booking_reference'],
    },
  },
  {
    name: 'list_my_bookings',
    description:
      "List the signed-in visitor's own bookings (reference, tour name, status). Use when a signed-in visitor asks about their trip or documents without giving a booking reference. Fails if the visitor is not signed in.",
  },
]

/** Resolve the signed-in user (or null) from a Supabase access token. */
async function resolveUser(accessToken: string | null | undefined) {
  if (!accessToken) return null
  try {
    const supabase = adminSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) return null
    return { id: user.id, email: (user.email || '').toLowerCase() }
  } catch {
    return null
  }
}

/** Look up one booking + travel documents; returns [modelResult, card|null]. */
async function execLookupBooking(
  bookingReferenceRaw: string
): Promise<[Record<string, unknown>, DocumentCard | null]> {
  const ref = (bookingReferenceRaw || '').trim().toUpperCase()
  if (!BOOKING_ID_RE.test(ref)) {
    return [{ found: false, error: 'Invalid reference format. Expected ARB-YYYY-XXXXXX.' }, null]
  }

  const supabase = adminSupabase()
  const { data: itin } = await supabase
    .from('itineraries')
    .select('booking_reference, status, tour_summary, client_info')
    .eq('booking_reference', ref)
    .maybeSingle()

  if (!itin) {
    return [{ found: false, error: `No booking found for ${ref}.` }, null]
  }

  const { data: docs } = await supabase
    .from('travel_documents')
    .select('*')
    .eq('booking_id', ref)
    .maybeSingle()

  const documents: DocumentCard['documents'] = []
  if (docs) {
    const slots: [string, string, string | null][] = [
      ['flight_tickets', 'Flight Tickets (PDF)', docs.flight_tickets_url],
      ['visa_file', 'Visa Clearance Letter (PDF)', docs.visa_file_url],
      ['entrance_qr', 'Monument Entrance QR Code', docs.entrance_qr_url],
    ]
    for (const [key, label, path] of slots) {
      if (!path) continue
      const { data: signed } = await supabase.storage
        .from('travel-documents')
        .createSignedUrl(path, SIGNED_URL_TTL)
      if (signed?.signedUrl) documents.push({ key, label, url: signed.signedUrl })
    }
  }

  const tour = itin.tour_summary?.tour_package || 'Custom Bhutan Itinerary'
  const card: DocumentCard = {
    ref,
    tour,
    status: itin.status || 'pending_review',
    sdf_status: docs?.sdf_status || 'PENDING',
    visa_status: docs?.visa_status || 'NOT_APPLIED',
    documents,
    itineraryUrl: `/itinerary/${ref}`,
  }

  const modelResult = {
    found: true,
    booking_reference: ref,
    tour,
    booking_status: card.status,
    guest_first_name: (itin.client_info?.guest_name || '').split(' ')[0] || null,
    duration_nights: itin.tour_summary?.duration_nights ?? null,
    departure_date: itin.tour_summary?.departure_date ?? null,
    sdf_status: card.sdf_status,
    visa_status: card.visa_status,
    available_documents: documents.map(d => d.label),
    note: 'An interactive card with secure download buttons is shown to the visitor automatically.',
  }

  return [modelResult, card]
}

/** List bookings belonging to the signed-in visitor. */
async function execListMyBookings(
  user: { id: string; email: string } | null
): Promise<Record<string, unknown>> {
  if (!user) {
    return {
      error:
        'Visitor is not signed in. Ask for their booking reference (ARB-…) instead, or invite them to sign in at /login.',
    }
  }

  const supabase = adminSupabase()
  const [{ data: byOwner }, { data: memberships }] = await Promise.all([
    supabase
      .from('itineraries')
      .select('booking_reference, status, tour_summary')
      .or(`user_id.eq.${user.id},client_info->>email.eq.${user.email}`),
    supabase.from('booking_guests').select('booking_id').or(`user_id.eq.${user.id},email.eq.${user.email}`),
  ])

  const refs = new Set<string>()
  const bookings: { booking_reference: string; tour: string; status: string }[] = []
  for (const it of byOwner || []) {
    if (!it.booking_reference || refs.has(it.booking_reference)) continue
    refs.add(it.booking_reference)
    bookings.push({
      booking_reference: it.booking_reference,
      tour: it.tour_summary?.tour_package || 'Custom Bhutan Itinerary',
      status: it.status,
    })
  }

  const memberRefs = (memberships || []).map(m => m.booking_id).filter(r => r && !refs.has(r))
  if (memberRefs.length > 0) {
    const { data: memberItins } = await supabase
      .from('itineraries')
      .select('booking_reference, status, tour_summary')
      .in('booking_reference', memberRefs)
    for (const it of memberItins || []) {
      if (refs.has(it.booking_reference)) continue
      refs.add(it.booking_reference)
      bookings.push({
        booking_reference: it.booking_reference,
        tour: it.tour_summary?.tour_package || 'Custom Bhutan Itinerary',
        status: it.status,
      })
    }
  }

  return { count: bookings.length, bookings }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI assistant not configured — GEMINI_API_KEY missing.' }),
      { status: 503, headers: { 'content-type': 'application/json' } }
    )
  }

  let body: { messages?: ChatMessage[]; accessToken?: string | null }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const history = (body.messages || [])
    .filter(m => m && typeof m.content === 'string' && m.content.trim() && (m.role === 'user' || m.role === 'assistant'))
    .slice(-24) // keep the last 24 turns
    .map<Content>(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return new Response(JSON.stringify({ error: 'The last message must be from the user.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const user = await resolveUser(body.accessToken)
  const ai = new GoogleGenAI({ apiKey })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (evt: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(JSON.stringify(evt) + '\n'))

      try {
        const contents: Content[] = [...history]
        const systemInstruction = `${SYSTEM_PROMPT}\n\n${
          user
            ? `The visitor is signed in (email: ${user.email}). You may call list_my_bookings for them.`
            : 'The visitor is NOT signed in. list_my_bookings will fail — ask for a booking reference instead.'
        }`

        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          const result = await ai.models.generateContentStream({
            model: MODEL,
            contents,
            config: {
              systemInstruction,
              maxOutputTokens: 1024,
              tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
              // Skip Gemini 2.5 "thinking" for snappy concierge replies
              thinkingConfig: { thinkingBudget: 0 },
            },
          })

          const modelParts: Part[] = []
          const functionCalls: { name: string; args: Record<string, unknown> }[] = []

          for await (const chunk of result) {
            const parts = chunk.candidates?.[0]?.content?.parts || []
            for (const part of parts) {
              modelParts.push(part)
              if (part.text && !part.thought) send({ type: 'text', text: part.text })
              if (part.functionCall?.name) {
                functionCalls.push({
                  name: part.functionCall.name,
                  args: (part.functionCall.args as Record<string, unknown>) || {},
                })
              }
            }
          }

          if (functionCalls.length === 0) break

          contents.push({ role: 'model', parts: modelParts })

          const responseParts: Part[] = []
          for (const fc of functionCalls) {
            let response: Record<string, unknown>
            try {
              if (fc.name === 'lookup_booking') {
                const [modelResult, card] = await execLookupBooking(
                  String(fc.args.booking_reference || '')
                )
                response = modelResult
                if (card) send({ type: 'booking_card', card })
              } else if (fc.name === 'list_my_bookings') {
                response = await execListMyBookings(user)
              } else {
                response = { error: `Unknown tool: ${fc.name}` }
              }
            } catch (err) {
              response = { error: `Tool failed: ${err instanceof Error ? err.message : 'unknown error'}` }
            }
            responseParts.push({ functionResponse: { name: fc.name, response } })
          }
          contents.push({ role: 'user', parts: responseParts })
        }

        send({ type: 'done' })
      } catch (err) {
        console.error('[/api/chat]', err)
        send({ type: 'error', error: 'The assistant hit a snag. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-cache',
      'x-accel-buffering': 'no',
    },
  })
}
