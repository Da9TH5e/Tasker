import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import DomeGallery from '@/components/DomeGallery'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Gallery fills the entire background */}
      <div aria-hidden="true" inert style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
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
        minHeight: '100svh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(3, 10, 10, 0.78)',
          border: '2px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: 'clamp(22px, 6vw, 36px)',
          boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'fadeUpFromBottom 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>

          <Link to="/" className="mb-7 inline-flex items-center gap-2.5 text-sm tracking-[0.32em] text-[#cedadb] uppercase" aria-label="Tasker home">
            <img src="/tasker-logo.png" alt="" width={24} height={24} />
            Tasker
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}