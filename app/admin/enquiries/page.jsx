'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { RefreshCw, MessageSquare } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import AdminEnquirySection from '@/components/AdminEnquirySection'

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries]   = useState([])
  const [vouchers, setVouchers]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setRefreshing(true)
    const { data: { session } } = await supabase.auth.getSession()
    const jwt = session?.access_token

    const [{ data: enqs }, vouchersRes] = await Promise.all([
      supabase.from('itinerary_requests').select('*').order('submitted_at', { ascending: false }),
      jwt
        ? fetch('/api/admin/vouchers', { headers: { Authorization: `Bearer ${jwt}` } }).then(r => r.json()).catch(() => ({ vouchers: [] }))
        : Promise.resolve({ vouchers: [] }),
    ])

    setEnquiries(enqs || [])
    setVouchers(vouchersRes?.vouchers || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Enquiries</h1>
          <p className="text-stone-500 text-sm mt-0.5">Itinerary requests — create & send vouchers to clients</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-stone-500">
            <MessageSquare className="w-4 h-4" />
            {enquiries.length} total
          </span>
          <button onClick={load} disabled={refreshing}
            className="btn-outline text-sm gap-2 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <AdminEnquirySection enquiries={enquiries} vouchers={vouchers} onRefresh={load} />
    </div>
  )
}
