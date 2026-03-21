'use client'

import { useEffect, useRef } from 'react'
import Grainient from "../../components/Grainient"
import Image from 'next/image'
import TaskOverviewSlab from "../../components/ui/TaskOverviewSlab"
import CalendarSlab from "../../components/ui/CalenderSlab"
import './styles/home.css'
import StarBorder from "../../components/StarBorder"
import { TypingAnimation } from "@/components/ui/typing-animation"
import ClickSpark from "@/components/ClickSpark"
import AboutSection from '@/components/home/AboutSection'

function HomePage() {
  const heroRef        = useRef<HTMLDivElement>(null)
  const taskSlabRef    = useRef<HTMLDivElement>(null)
  const calSlabRef     = useRef<HTMLDivElement>(null)
  const textSectionRef = useRef<HTMLDivElement>(null)
  const featuresRef    = useRef<HTMLDivElement>(null)
  const card1Ref       = useRef<HTMLDivElement>(null)
  const card2Ref       = useRef<HTMLDivElement>(null)
  const card3Ref       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const vh      = window.innerHeight

      // --- task slab: starts moving up + fading after 10% scroll ---
      if (taskSlabRef.current) {
        const progress = Math.max(0, Math.min(1, (scrollY - vh * 0.05) / (vh * 0.4)))
        taskSlabRef.current.style.transform  = `translateY(calc(-50% + ${-progress * 120}px))`
        taskSlabRef.current.style.opacity    = `${1 - progress}`
      }

      // --- calendar slab: slightly delayed ---
      if (calSlabRef.current) {
        const progress = Math.max(0, Math.min(1, (scrollY - vh * 0.12) / (vh * 0.35)))
        calSlabRef.current.style.transform   = `translateY(calc(-50% + ${-progress * 100}px))`
        calSlabRef.current.style.opacity     = `${1 - progress}`
      }

      // --- text section: fades out last ---
      if (textSectionRef.current) {
        const progress = Math.max(0, Math.min(1, (scrollY - vh * 0.25) / (vh * 0.3)))
        textSectionRef.current.style.transform = `translateY(${-progress * 60}px)`
        textSectionRef.current.style.opacity   = `${1 - progress}`
      }

      // --- features section: fades in ---
      if (featuresRef.current) {
        const progress = Math.max(0, Math.min(1, (scrollY - vh * 0.4) / (vh * 0.3)))
        featuresRef.current.style.opacity    = `${progress}`
        featuresRef.current.style.transform  = `translateY(${(1 - progress) * 60}px)`
      }

      // staggered cards
      const cardRefs   = [card1Ref, card2Ref, card3Ref]
      const cardDelays = [0, 0.08, 0.16]
      cardRefs.forEach((ref, i) => {
        if (ref.current) {
          const progress = Math.max(0, Math.min(1, (scrollY - vh * (0.45 + cardDelays[i])) / (vh * 0.25)))
          ref.current.style.opacity   = `${progress}`
          ref.current.style.transform = `translateY(${(1 - progress) * 40}px)`
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <div className="w-screen h-screen">
      <ClickSpark sparkColor='#fff' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>

        {/* scrollable container — 2 screens tall so there's room to scroll */}
        <div style={{ width: '100vw', height: '200vh', position: 'relative' }}>

          {/* sticky hero that pins while scrolling */}
          <div ref={heroRef} style={{
            position: 'sticky',
            top: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
          }}>
            {/* background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Grainient
                color1="#12768a"
                color2="#030a0a"
                color3="#6dadbe"
                timeSpeed={0.25}
                colorBalance={0.48}
                warpStrength={0.65}
                warpFrequency={2}
                warpSpeed={1.2}
                warpAmplitude={50}
                blendAngle={5}
                blendSoftness={0.4}
                rotationAmount={500}
                noiseScale={2}
                grainAmount={0}
                grainScale={3.7}
                grainAnimated={false}
                contrast={1.5}
                gamma={1}
                saturation={1}
                centerX={0}
                centerY={0}
                zoom={0.9}
              />
            </div>

            {/* text section */}
            <div
              ref={textSectionRef}
              className="absolute left-16 z-10 max-w-md"
              style={{
                top: '30%',
                transform: 'translateY(-50%)',
                transition: 'none',
                willChange: 'transform, opacity',
              }}
            >

              <div className="hero-logo flex items-center gap-3 mb-5">
                <Image
                  src="/logo.svg"
                  alt="Tasker logo"
                  width={32}
                  height={32}
                  style={{ display: 'block' }}
                />
                <span style={{
                  paddingLeft: '20px',
                  paddingTop: '10px', 
                  fontSize: 22, letterSpacing: '0.54em',
                  textTransform: 'uppercase',
                  color: '#cedadb', fontWeight: 500, marginBottom: 12,
                }}>
                  Tasker
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#cedadb]"></div>
                <span className="text-[#cedadb] text-sm font-medium">Simple. Fast. Productive.</span>
              </div>

              <h1 className="text-5xl font-bold text-[#cedadb] leading-tight mb-4 tracking-tight">
                Manage tasks<br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#6dadbe] to-[#12768a]">
                  without chaos
                </span>
              </h1>

              <TypingAnimation className="text-white/40 text-lg leading-relaxed mb-8">
                Create, organize, and complete tasks with a clean interface that gets out of your way.
              </TypingAnimation>

              <div className="flex gap-3">
                <StarBorder
                  as="button"
                  color="cyan"
                  speed="5s"
                  onClick={() => window.location.href = '/register'}
                  className="hover:scale-105 active:scale-95 transition-transform duration-200"
                >
                  Get Started
                </StarBorder>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 border border-white/10 hover:border-white/25 text-white/60 hover:text-white/90 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  Sign in
                </button>
              </div>
            </div>

            {/* task slab */}
            <div
              ref={taskSlabRef}
              style={{
                position: 'absolute',
                right: -55,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 24,
                willChange: 'transform, opacity',
                transition: 'none',
              }}
            >
              <TaskOverviewSlab />
            </div>

            {/* calendar slab */}
            <div
              ref={calSlabRef}
              style={{
                position: 'absolute',
                right: 305,
                top: '76%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 24,
                willChange: 'transform, opacity',
                transition: 'none',
              }}
            >
              <CalendarSlab />
            </div>

            {/* features section — overlays hero as you scroll */}
            <div
              ref={featuresRef}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                willChange: 'transform, opacity',
                pointerEvents: 'none',
              }}
            >
              <p style={{
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#12768a', fontWeight: 600, marginBottom: 12,
              }}>
                Why Tasker
              </p>
              <h2 style={{
                fontSize: 40, fontWeight: 800, color: '#cedadb',
                marginBottom: 56, textAlign: 'center', lineHeight: 1.2,
              }}>
                Everything you need.<br/>
                <span style={{ color: '#12768a' }}>Nothing you dont.</span>
              </h2>

              <div style={{
                display: 'flex', gap: 24,
                pointerEvents: 'auto',
              }}>
                {features.map((f, i) => {
                  const refs = [card1Ref, card2Ref, card3Ref]
                  return (
                    <div
                      key={i}
                      ref={refs[i]}
                      style={{
                        width: 280, padding: '32px 28px',
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
                        e.currentTarget.style.boxShadow  = `0 0 40px ${f.accent}22`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = `${f.accent}33`
                        e.currentTarget.style.boxShadow  = 'none'
                      }}
                    >
                      <div style={{
                        fontSize: 32, marginBottom: 16,
                        width: 56, height: 56,
                        background: `${f.accent}18`,
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {f.icon}
                      </div>
                      <h3 style={{
                        fontSize: 18, fontWeight: 700,
                        color: '#cedadb', marginBottom: 10,
                      }}>
                        {f.title}
                      </h3>
                      <p style={{
                        fontSize: 14, color: 'rgba(255,255,255,0.4)',
                        lineHeight: 1.6,
                      }}>
                        {f.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>{/* end sticky hero */}

        </div>{/* end scroll container */}

      </ClickSpark>
      <AboutSection />
    </div>
  )
}

export default HomePage