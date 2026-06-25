import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function getAdmin(req: NextRequest) {
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!jwt) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
  if (!user) return null
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'ADMIN' ? user : null
}

export async function GET(req: NextRequest) {
  if (!await getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('vouchers')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vouchers: data })
}

export async function POST(req: NextRequest) {
  if (!await getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { enquiryId, formData } = await req.json()
  if (!enquiryId || !formData) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('vouchers')
    .upsert(
      { enquiry_id: enquiryId, form_data: formData, updated_at: new Date().toISOString() },
      { onConflict: 'enquiry_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ voucher: data })
}

export async function DELETE(req: NextRequest) {
  if (!await getAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { enquiryId } = await req.json()
  if (!enquiryId) return NextResponse.json({ error: 'Missing enquiryId' }, { status: 400 })

  const { error } = await supabaseAdmin.from('vouchers').delete().eq('enquiry_id', enquiryId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
