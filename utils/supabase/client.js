import { createClient } from '@supabase/supabase-js'

// Lazy proxy — createClient() is deferred until the first property access.
// This prevents the Supabase SDK from throwing during Next.js static analysis
// when env vars are not present (build environment without .env.local).
let _client = null

function getClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return _client
}

export const supabase = new Proxy(
  {},
  { get: (_t, prop) => getClient()[prop] }
)
