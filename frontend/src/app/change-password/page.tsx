import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/AuthLayout'
import { RippleButton } from '@/components/ui/ripple-button'
import { authAPI } from '@/lib/api'
import { clearAuth } from '@/lib/auth'

const inputClass = 'mt-1.5 block w-full rounded-[10px] border border-white/[0.08] bg-white/5 px-3.5 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-teal-500/50'

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const result = await authAPI.changePassword(newPassword)
      clearAuth()
      setNewPassword('')
      setConfirmation('')
      setMessage(result.message)
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.error ?? 'Something went wrong. Try again.' : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-2xl font-bold text-white">Change password</h1>
      {message ? (
        <p role="status" className="mb-8 text-sm text-[#cedadb]">{message}</p>
      ) : (
        <form onSubmit={submit} className="mt-6">
          <label className="mb-4 block text-sm text-[#cedadb]">
            New password
            <input className={inputClass} type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
          </label>
          <label className="mb-4 block text-sm text-[#cedadb]">
            Confirm new password
            <input className={inputClass} type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required />
          </label>
          {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
          <RippleButton type="submit" disabled={loading} className="mb-5 h-auto w-full rounded-[10px] border border-[#12768a] bg-[#0b3f43] py-[11px] text-[15px] font-semibold text-white hover:bg-[#0d5a5f]">
            {loading ? 'Updating…' : 'Update password'}
          </RippleButton>
        </form>
      )}
      <p className="text-center text-sm">
        <Link to={message ? "/login" : "/dashboard"} className="text-[#6dadbe] transition-colors hover:text-white">
          {message ? "Back to sign in" : "Back to dashboard"}
        </Link>
      </p>
    </AuthLayout>
  )
}
