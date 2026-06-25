'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import {
  Camera, Save, Loader2, Check, Lock, Mail,
  User, Phone, Shield,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const inputCls = 'w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors bg-stone-800'

function SuccessBanner({ msg }) {
  if (!msg) return null
  return (
    <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
      <Check className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  )
}

function ErrorBanner({ msg }) {
  if (!msg) return null
  return (
    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{msg}</p>
  )
}

function Card({ children, title }) {
  return (
    <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <p className="font-semibold text-white">{title}</p>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  )
}

export default function AdminProfilePage() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveErr, setSaveErr]   = useState('')

  const fileRef = useRef(null)
  const [uploading, setUploading]   = useState(false)
  const [avatarErr, setAvatarErr]   = useState('')
  const [avatarPreview, setPreview] = useState(null)

  const [newEmail, setNewEmail]       = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg]       = useState('')
  const [emailErr, setEmailErr]       = useState('')

  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwSaving, setPwSaving]     = useState(false)
  const [pwMsg, setPwMsg]           = useState('')
  const [pwErr, setPwErr]           = useState('')

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (data) {
      setProfile(data)
      setForm({ name: data.name || '', phone: data.phone || '' })
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function saveProfile() {
    setSaving(true); setSaveErr(''); setSaved(false)
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('profiles').update({
      name:  form.name.trim(),
      phone: form.phone.trim(),
    }).eq('id', session.user.id)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setSaved(true)
    setProfile(prev => ({ ...prev, ...form }))
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setAvatarErr('Image must be under 2 MB'); return }

    setUploading(true); setAvatarErr('')
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    const { data: { session } } = await supabase.auth.getSession()
    const ext  = file.name.split('.').pop()
    const path = `${session.user.id}/avatar.${ext}`

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { setAvatarErr(upErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', session.user.id)
    setProfile(prev => ({ ...prev, avatar_url: url }))
    setUploading(false)
  }

  async function updateEmail() {
    if (!newEmail.trim()) { setEmailErr('Please enter a new email'); return }
    setEmailSaving(true); setEmailErr(''); setEmailMsg('')
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setEmailSaving(false)
    if (error) { setEmailErr(error.message); return }
    setEmailMsg('Confirmation emails sent — check both inboxes to confirm the change.')
    setNewEmail('')
  }

  async function updatePassword() {
    if (!newPw)              { setPwErr('Please enter a new password'); return }
    if (newPw.length < 8)   { setPwErr('Password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { setPwErr('Passwords do not match'); return }
    setPwSaving(true); setPwErr(''); setPwMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) { setPwErr(error.message); return }
    setPwMsg('Password updated successfully!')
    setNewPw(''); setConfirmPw('')
    setTimeout(() => setPwMsg(''), 4000)
  }

  const avatarSrc = avatarPreview || profile?.avatar_url || null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Admin Profile</h1>
        <p className="text-stone-400 text-sm mt-0.5">Manage your admin account details and credentials.</p>
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 w-fit">
        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Administrator Account</span>
      </div>

      {/* ── Avatar ── */}
      <Card title="Profile Picture">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-amber-400">
                  {profile?.name?.[0]?.toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-600 hover:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm transition-colors disabled:opacity-60"
              title="Upload photo"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div>
            <p className="font-semibold text-white">{profile?.name || 'Admin'}</p>
            <p className="text-stone-400 text-xs">{profile?.email}</p>
            <button onClick={() => fileRef.current?.click()} className="text-xs text-amber-400 hover:text-amber-300 font-medium mt-1.5">
              Upload new photo
            </button>
            <p className="text-[11px] text-stone-600 mt-0.5">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>
        {avatarErr && <p className="text-xs text-red-400 mt-1">{avatarErr}</p>}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </Card>

      {/* ── Admin Info ── */}
      <Card title="Admin Details">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-400 mb-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className={inputCls}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-400 mb-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className={inputCls}
              placeholder="+975 77 319 405"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1.5">Email (read-only here)</label>
          <input value={profile?.email || ''} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
          <p className="text-[11px] text-stone-600 mt-1">To change your email, use the Security section below.</p>
        </div>
        <div className="space-y-2">
          <ErrorBanner msg={saveErr} />
          <SuccessBanner msg={saved ? 'Details saved successfully!' : ''} />
          <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Details</>}
          </button>
        </div>
      </Card>

      {/* ── Security ── */}
      <Card title="Security">
        {/* Change Email */}
        <div className="pb-6 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-amber-400" />
            <p className="font-medium text-stone-200 text-sm">Change Email Address</p>
          </div>
          <p className="text-xs text-stone-500 mb-3">
            Current: <strong className="text-stone-300">{profile?.email}</strong>
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={`${inputCls} flex-1`}
              placeholder="New email address"
            />
            <button
              onClick={updateEmail}
              disabled={emailSaving}
              className="btn-primary text-sm whitespace-nowrap shrink-0"
            >
              {emailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <ErrorBanner msg={emailErr} />
            <SuccessBanner msg={emailMsg} />
          </div>
        </div>

        {/* Change Password */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-amber-400" />
            <p className="font-medium text-stone-200 text-sm">Change Password</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={inputCls}
              placeholder="New password (min. 8 characters)"
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={inputCls}
              placeholder="Confirm new password"
            />
          </div>
          <div className="mt-2 space-y-1">
            <ErrorBanner msg={pwErr} />
            <SuccessBanner msg={pwMsg} />
          </div>
          <button onClick={updatePassword} disabled={pwSaving} className="btn-primary mt-3 text-sm">
            {pwSaving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
              : <><Lock className="w-4 h-4" /> Update Password</>}
          </button>
        </div>
      </Card>
    </div>
  )
}
