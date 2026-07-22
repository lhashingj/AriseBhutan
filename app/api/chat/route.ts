import { isRateLimited, getClientIp, rateLimitResponse } from '@/utils/rateLimit'

const SYSTEM_PROMPT = `You are the Arise Bhutan Assistant — a warm, knowledgeable travel concierge for Arise Bhutan Tours & Travels (arisebhutan.com), a DOT-licensed tour operator based in Paro, Bhutan.

Your role is dual:
1. BHUTAN TRAVEL EXPERT: Answer any question about Bhutan tours, visa, SDF fees, trekking, festivals, destinations, pricing, and booking with complete authority.
2. GENERAL KNOWLEDGE ASSISTANT: Answer ANY general knowledge question confidently and helpfully, just like ChatGPT. You are NOT limited to Bhutan topics.

ARISE BHUTAN FACTS:
- Licensed by Bhutan DOT. Based in Nyamaizampa, Paro 12001, Bhutan
- Contact: +975 77 319 405 | arisebhutan@gmail.com | WhatsApp: +975 77 319 405 or +61 435 341 033 (Australia)
- SDF fee: USD $100/person/night (SAARC: INR 1200/person/night)
- SAARC nations (India, Bangladesh, Maldives): no visa, only entry permit — we handle it
- Other nationalities: Tourist Visa required — we handle the full application
- Hotel tiers: Standard (3-star), Deluxe (4-star boutique), Luxury (heritage resorts)
- All packages FULLY PRIVATE — no group tours
- Pricing per person/night all-inclusive: Standard USD 200-300, Deluxe USD 350-500, Luxury USD 500-700+
- Best seasons: Spring (Mar-May) rhododendrons & Paro Tshechu; Autumn (Sep-Nov) Himalayan views & Thimphu Tshechu
- 2026 Festival Dates (exact): Punakha Drubchen Feb 22–24 | Punakha Tshechu Feb 26–28 | Chhorten Kora Mar 3 & Mar 19 | Paro Tshechu Mar 29–Apr 2 | Rhododendron Festival Apr 13 | Ura Yakchoe Apr 28–May 2 | Nimalung Tshechu Jun 22–24 | Kurjey Tshechu Jun 24 | Thimphu Drubchen Sep 17 | Wangdue Tshechu Sep 19–21 | Thimphu Tshechu Sep 21–23 | Gangtey Tshechu Sep 24–26 | Jambay Lhakhang Drup Oct 26–29 | Black-Necked Crane Festival Nov 11 | Trashigang Tshechu Nov 18–20 | Trongsa Tshechu Dec 17–21
- Full festival calendar available at: /festival-calendar on the website
- Destinations: Paro (Tiger's Nest, 3120m), Thimphu, Punakha, Bumthang
- Trekking: Druk Path (5 days), Jomolhari (8 days), Snowman (25 days)
- Flights: Paro Airport (PBH) via Druk Air / Bhutan Airlines from Bangkok, Singapore, Delhi, Kolkata, Kathmandu
- Payment: 30% deposit, 70% due 30 days before arrival; USD or INR bank transfer
- Cancellation: 30+ days full refund minus fees; 15-30 days 50%; under 15 days non-refundable
- Bhutan is world's only carbon-negative country; SDF funds healthcare, education, conservation

Keep responses warm, concise (under 150 words), and helpful. Use Kuzuzangpo occasionally.`

export async function POST(req: Request) {
  if (isRateLimited(`chat:${getClientIp(req)}`, 20, 10 * 60_000)) {
    return rateLimitResponse()
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI assistant not configured — GOOGLE_GENERATIVE_AI_API_KEY missing in Vercel env vars.' }),
      { status: 503, headers: { 'content-type': 'application/json' } }
    )
  }

  try {
    const { messages } = await req.json()

    // Convert our {role,content} messages to Gemini format
    // Gemini uses "user" and "model" roles (not "assistant")
    const contents = messages
      .filter((m: any) => m.content && m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const body = {
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    }

    // Call Gemini REST API directly — streaming SSE
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error('[/api/chat] Gemini error', geminiRes.status, errBody)
      return new Response(
        JSON.stringify({ error: `Gemini API error ${geminiRes.status}: ${errBody.slice(0, 200)}` }),
        { status: 502, headers: { 'content-type': 'application/json' } }
      )
    }

    // Pipe the SSE stream back to the client — we pass it through as-is
    // Client will parse the SSE events
    return new Response(geminiRes.body, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
        'x-accel-buffering': 'no',
      },
    })
  } catch (err: any) {
    console.error('[/api/chat]', err)
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Unknown error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
