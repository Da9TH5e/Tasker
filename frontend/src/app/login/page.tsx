// src/app/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { setTokens, setUser } from '@/lib/auth'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import DomeGallery from '@/components/DomeGallery'
import { RippleButton } from '@/components/ui/ripple-button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.login(email, password)
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Gallery fills the entire background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <DomeGallery
          fit={0.6}
          minRadius={600}
          maxVerticalRotationDeg={0}
          segments={34}
          dragDampening={2}
        />
      </div>

      {/* Frosted glass layer over the entire gallery */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: 'rgba(6, 0, 16, 0.35)',
      }} />

      {/* Corner vignette — four corners darken heavily */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 70% at 0% 0%,    rgba(0,0,0,0.92) 0%, transparent 70%),
          radial-gradient(ellipse 70% 70% at 100% 0%,  rgba(0,0,0,0.92) 0%, transparent 70%),
          radial-gradient(ellipse 70% 70% at 0% 100%,  rgba(0,0,0,0.92) 0%, transparent 70%),
          radial-gradient(ellipse 70% 70% at 100% 100%,rgba(0,0,0,0.92) 0%, transparent 70%)
        `,
      }} />

      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#18181b',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
          borderRadius: '10px'
        }
      }}/>

      {/* Card floats above everything */}
      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(3, 10, 10, 0.78)',
          border: '2px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: 36,
          boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'fadeUpFromBottom 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>

          {/* logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="text-[#cedadb]"/>
            <span style={{
              fontSize: 15,
              letterSpacing: '0.54em',
              textTransform: 'uppercase',
              color: '#cedadb',
              fontWeight: 400,
              marginBottom: 12,
              textAlign: 'center',
              display: 'block',
            }}>
              Tasker
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back
          </h1>
          <p className="text-[#cedadb] text-sm mb-8">
            Sign in to your account to continue
          </p>

          {/* email */}
          <div className="mb-4">
            <label className="text-[#cedadb] text-sm mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
          <div className="mb-6">
            <label className="text-[#cedadb] text-sm mb-1.5 block">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* submit */}
          <RippleButton
            onClick={handleLogin}
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
            {loading ? 'Signing in...' : 'Sign in'}
          </RippleButton>

          {/* register link */}
          <p className="text-center text-zinc-500 text-sm">
            Don&apos;t have an account?{' '}
            <span
              onClick={() => router.push('/register')}
              className="text-[#12768a] hover:text-[#6dadbe] cursor-pointer transition-colors"
            >
              Create one
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}