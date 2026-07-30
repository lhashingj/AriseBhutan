import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { SampleItineraryDocument } from '@/utils/sampleItineraryDocument'
import { getTourBySlug } from '@/data/tours'

export async function GET() {
  const tour = getTourBySlug('classic-bhutan-cultural-tour')
  if (!tour) {
    return NextResponse.json({ error: 'Sample tour not found' }, { status: 404 })
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createElement(SampleItineraryDocument, { tour }) as any
    )
  } catch (renderErr) {
    console.error('[sample-itinerary] PDF render error:', renderErr)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename="Arise-Bhutan-5-Day-Sample-Itinerary.pdf"',
      'Content-Length':      String(pdfBuffer.length),
      'Cache-Control':       'public, max-age=86400',
    },
  })
}
