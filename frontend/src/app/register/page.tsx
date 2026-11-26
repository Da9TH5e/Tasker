// src/app/register/page.tsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '@/lib/api'
import { setTokens, setUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '@/components/AuthLayout'
import { RippleButton } from '@/components/ui/ripple-button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.register(email, password)
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
        <h1 className="text-2xl font-bold text-white mb-1">
          Create an account
        </h1>
        <p className="text-[#cedadb] text-sm mb-8">
          Start managing your tasks today
        </p>

        {/* email */}
        <div className="mb-4">
          <label htmlFor="email" className="text-[#cedadb] text-sm mb-1.5 block">Email</label>
          <input
            type="email"
            id="email"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 14px',
              color: '#f4f4f5', fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.5)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label htmlFor="password" className="text-[#cedadb] text-sm mb-1.5 block">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '10px 40px 10px 14px',
                color: '#f4f4f5', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.5)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0
              }}
            >
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {/* confirm password */}
        <div className="mb-6">
          <label className="text-[#cedadb] text-sm mb-1.5 block">
            Confirm password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 14px',
              color: '#f4f4f5', fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.5)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* submit */}
        <RippleButton
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', padding: '11px',
            background: loading ? 'rgba(11, 63, 67, 1)' : '#0b3f43',
            border: '1px solid rgba(18, 118, 138, 1)', borderRadius: 10,
            color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            marginBottom: 20,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d5a5f' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0b3f43' }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </RippleButton>

        {/* sign in link */}
        <p className="text-center text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6dadbe] hover:text-white transition-colors">Sign in</Link>
        </p>
    </AuthLayout>
  )
}
