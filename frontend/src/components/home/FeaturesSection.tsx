'use client'
import { RefObject } from 'react'

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Create and organize tasks in seconds. No bloat, no friction — just you and your work.',
    accent: '#12768a',
  },
  {
    icon: '🗓',
    title: 'Smart Scheduling',
    desc: 'Visual calendar view keeps your deadlines front and center so nothing slips through.',
    accent: '#6dadbe',
  },
  {
    icon: '🎯',
    title: 'Goal Tracking',
    desc: 'Set time goals, beat them, and watch your productivity streak grow over time.',
    accent: '#0d9488',
  },
]

interface Props {
  sectionRef: RefObject<HTMLDivElement | null>
  cardRefs:   [RefObject<HTMLDivElement | null>, RefObject<HTMLDivElement | null>, RefObject<HTMLDivElement | null>]
}

export default function FeaturesSection({ sectionRef, cardRefs }: Props) {
  return (
    <div
      ref={sectionRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 clamp(16px, 4vw, 48px)',
        opacity: 0,
        willChange: 'transform, opacity',
        pointerEvents: 'none',
      }}
    >
      <p style={{
        fontSize: 12, letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#12768a', fontWeight: 600, marginBottom: 12,
      }}>
        Why Tasker
      </p>

      <h2 style={{
        fontSize: 'clamp(24px, 3.5vw, 42px)',
        fontWeight: 800, color: '#cedadb',
        marginBottom: 'clamp(32px, 5vh, 56px)',
        textAlign: 'center', lineHeight: 1.2,
      }}>
        Everything you need.<br/>
        <span style={{ color: '#12768a' }}>Nothing you do not.</span>
      </h2>

      <div style={{
        display: 'flex',
        gap: 'clamp(12px, 2vw, 24px)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        pointerEvents: 'auto',
        width: '100%',
        maxWidth: 960,
      }}>
        {features.map((f, i) => (
          <div
            key={i}
            ref={cardRefs[i]}
            style={{
              flex: '1 1 clamp(220px, 26vw, 280px)',
              maxWidth: 300,
              padding: 'clamp(20px, 2.5vw, 32px)',
              background: 'rgba(3,10,10,0.7)',
              border: `1px solid ${f.accent}33`,
              borderRadius: 20,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              opacity: 0,
              willChange: 'transform, opacity',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${f.accent}88`
              e.currentTarget.style.boxShadow   = `0 0 40px ${f.accent}22`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = `${f.accent}33`
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            <div style={{
              fontSize: 28, marginBottom: 16,
              width: 52, height: 52,
              background: `${f.accent}18`,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {f.icon}
            </div>
            <h3 style={{
              fontSize: 'clamp(15px, 1.3vw, 18px)',
              fontWeight: 700, color: '#cedadb', marginBottom: 10,
            }}>
              {f.title}
            </h3>
            <p style={{
              fontSize: 'clamp(13px, 1vw, 14px)',
              color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
            }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}