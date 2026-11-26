import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/AuthLayout'
import { RippleButton } from '@/components/ui/ripple-button'
import { authAPI } from '@/lib/api'
import { clearAuth } from '@/lib/auth'

const inputClass = 'mt-1.5 block w-full rounded-[10px] border border-white/[0.08] bg-white/5 px-3.5 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-teal-500/50'
const buttonClass = 'mb-5 h-auto w-full rounded-[10px] border border-[#12768a] bg-[#0b3f43] py-[11px] text-[15px] font-semibold text-white hover:bg-[#0d5a5f]'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const resend = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'resend'
    const requestCode = !message || resend
    setError('')
    if (!requestCode && password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      if (requestCode) {
        const result = await authAPI.requestRecoveryCode(email.trim())
        setMessage(result.message)
      } else {
        const result = await authAPI.resetPassword(email.trim(), code, password)
        clearAuth()
        toast.success(result.message)
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.error ?? 'Something went wrong. Try again.' : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-2xl font-bold text-white">Forgot password?</h1>
      <p role="status" className="mb-6 text-sm text-[#cedadb]">
        {message || 'Enter your account email to request a verification code.'}
      </p>
      <form onSubmit={submit}>
        <label className="mb-4 block text-sm text-[#cedadb]">
          Email
          <input className={inputClass} type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} readOnly={Boolean(message)} maxLength={254} required />
        </label>
        {message && (
          <>
            <label className="mb-4 block text-sm text-[#cedadb]">
              Verification code
              <input className={inputClass} type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} pattern="[0-9]{8}" maxLength={8} required />
            </label>
            <label className="mb-4 block text-sm text-[#cedadb]">
              New password
              <input className={inputClass} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
            </label>
            <label className="mb-4 block text-sm text-[#cedadb]">
              Confirm new password
              <input className={inputClass} type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required />
            </label>
          </>
        )}
        {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
        <RippleButton type="submit" disabled={busy} className={buttonClass}>
          {busy ? 'Please wait…' : message ? 'Reset password' : 'Send verification code'}
        </RippleButton>
        {message && (
          <div className="mb-4 flex justify-center gap-4 text-sm text-[#6dadbe]">
            <button type="submit" value="resend" formNoValidate disabled={busy} className="hover:text-white">Resend code</button>
            <button type="button" disabled={busy} onClick={() => { setMessage(''); setError(''); setCode(''); setPassword(''); setConfirmation('') }} className="hover:text-white">Change email</button>
          </div>
        )}
      </form>
      <p className="text-center text-sm"><Link to="/login" className="text-[#6dadbe] hover:text-white">Back to sign in</Link></p>
    </AuthLayout>
  )
}
