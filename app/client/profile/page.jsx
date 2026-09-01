'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import {
  Camera, Save, Loader2, Check, Lock, Mail,
  User, Phone, Globe, CreditCard, Calendar, Heart,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import CountrySelect from '@/components/CountrySelect'
import PhoneInput from '@/components/PhoneInput'

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:placeholder:text-stone-500'

function SuccessBanner({ msg }) {
  if (!msg) return null
  return (
    <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl px-3 py-2 flex items-center gap-1.5">
      <Check className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  )
}

function ErrorBanner({ msg }) {
  if (!msg) return null
  return (
    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-3 py-2">{msg}</p>
  )
}

export default function ClientProfilePage() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [form, setForm] = useState({
    name: '', phone: '', nationality: '',
    passport_number: '', passport_expiry: '', emergency_contact: '',
  })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveErr, setSaveErr]   = useState('')

  const fileRef = useRef(null)
  const [uploading, setUploading]   = useState(false)
  const [avatarErr, setAvatarErr]   = useState('')
  const [avatarPreview, setPreview] = useState(null)

  const [newEmail, setNewEmail]     = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg]     = useState('')
  const [emailErr, setEmailErr]     = useState('')

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
      setForm({
        name:              data.name              || '',
        phone:             data.phone             || '',
        nationality:       data.nationality       || '',
        passport_number:   data.passport_number   || '',
        passport_expiry:   data.passport_expiry   || '',
        emergency_contact: data.emergency_contact || '',
      })
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function saveProfile() {
    setSaving(true); setSaveErr(''); setSaved(false)
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('profiles').update({
      name:              form.name.trim(),
      phone:             form.phone.trim(),
      nationality:       form.nationality.trim(),
      passport_number:   form.passport_number.trim(),
      passport_expiry:   form.passport_expiry   || null,
      emergency_contact: form.emergency_contact.trim(),
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
    setEmailMsg('Confirmation emails sent — check both your old and new inbox to confirm the change.')
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
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-amber-100 dark:border-stone-800 rounded-2xl px-6 py-5 transition-colors duration-300">
        <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">Arise Bhutan · Client Portal</p>
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">My Profile</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage your account details and travel documents.</p>
      </div>

      {/* ── Avatar ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h2 className="font-semibold text-stone-900 dark:text-stone-50">Profile Picture</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-amber-600">
                  {profile?.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center shadow-sm transition-colors disabled:opacity-60"
              title="Upload photo"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div>
            <p className="font-semibold text-stone-800 dark:text-stone-100">{profile?.name || 'Your Name'}</p>
            <p className="text-stone-500 dark:text-stone-400 text-xs">{profile?.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1.5"
            >
              Upload new photo
            </button>
            <p className="text-[11px] text-stone-400 mt-0.5">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>
        {avatarErr && <p className="text-xs text-red-600 mt-3">{avatarErr}</p>}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      {/* ── Personal Information ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h2 className="font-semibold text-stone-900 dark:text-stone-50">Personal Information</h2>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" /> Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" /> Phone Number
              </label>
              <PhoneInput
                id="phone"
                value={form.phone}
                onChange={(v) => setForm(f => ({ ...f, phone: v }))}
                placeholder="Phone number"
                defaultCountryName={form.nationality}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-400" /> Nationality
              </label>
              <CountrySelect
                id="nationality"
                value={form.nationality}
                onChange={(v) => setForm(f => ({ ...f, nationality: v }))}
                placeholder="Search country…"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" /> Passport Number
              </label>
              <input
                value={form.passport_number}
                onChange={(e) => setForm(f => ({ ...f, passport_number: e.target.value }))}
                className={inputCls}
                placeholder="e.g. A1234567"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" /> Passport Expiry
              </label>
              <input
                type="date"
                value={form.passport_expiry}
                onChange={(e) => setForm(f => ({ ...f, passport_expiry: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-stone-400" /> Emergency Contact
              </label>
              <input
                value={form.emergency_contact}
                onChange={(e) => setForm(f => ({ ...f, emergency_contact: e.target.value }))}
                className={inputCls}
                placeholder="Name & phone number"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <ErrorBanner msg={saveErr} />
          <SuccessBanner msg={saved ? 'Profile saved successfully!' : ''} />
          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* ── Security ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 space-y-7 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h2 className="font-semibold text-stone-900 dark:text-stone-50">Security</h2>
        </div>

        {/* Change Email */}
        <div className="pb-7 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">Change Email Address</p>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Current: <strong className="text-stone-700 dark:text-stone-200">{profile?.email}</strong>
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
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">Change Password</p>
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
          <button
            onClick={updatePassword}
            disabled={pwSaving}
            className="btn-primary mt-3 text-sm"
          >
            {pwSaving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
              : <><Lock className="w-4 h-4" /> Update Password</>}
          </button>
        </div>
      </div>
    </div>
  )
}
