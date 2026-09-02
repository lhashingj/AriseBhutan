'use client'

import { useState } from 'react'

const MAX_CHARS = 220

/** Review quote that truncates long text behind a "Show more…" toggle so cards stay a consistent height. */
export default function ExpandableReviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > MAX_CHARS
  const shown = !isLong || expanded ? text : text.slice(0, MAX_CHARS).trimEnd() + '…'

  return (
    <div className="mb-5 flex-1">
      <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed italic">
        &ldquo;{shown}&rdquo;
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="mt-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs hover:underline"
        >
          {expanded ? 'Show less' : 'Show more…'}
        </button>
      )}
    </div>
  )
}
