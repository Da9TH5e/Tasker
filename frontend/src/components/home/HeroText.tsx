import { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import StarBorder from "@/components/StarBorder"
import { TypingAnimation } from "@/components/ui/typing-animation"

const HeroText = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-logo     { animation: fadeInLeft 0.5s ease forwards; animation-delay: 0.0s; opacity: 0; }
        .hero-badge    { animation: fadeInLeft 0.6s ease forwards; animation-delay: 0.15s; opacity: 0; }
        .hero-title    { animation: fadeInLeft 0.7s ease forwards; animation-delay: 0.3s;  opacity: 0; }
        .hero-subtitle { animation: fadeInLeft 0.7s ease forwards; animation-delay: 0.5s;  opacity: 0; }
        .hero-btn-1    { animation: fadeInUp  0.6s ease forwards; animation-delay: 0.65s;  opacity: 0; }
        .hero-btn-2    { animation: fadeInUp  0.6s ease forwards; animation-delay: 0.8s;   opacity: 0; }
      `}</style>

      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: 'clamp(24px, 6vw, 80px)',
          top: '42%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          maxWidth: 'clamp(280px, 38vw, 480px)',
          willChange: 'transform, opacity',
        }}
      >
        {/* logo + app name */}
        <div className="hero-logo flex items-center gap-3 mb-6">
          <img
            src="/tasker-logo-icy.png"
            alt=""
            width={36}
            height={36}
            style={{ display: 'block' }}
            />
          <span style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#cedadb',
            letterSpacing: '-0.02em',
          }}>
            Tasker
          </span>
        </div>

        {/* badge pill */}
        <div className="hero-badge inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#cedadb]" />
          <span className="text-[#cedadb] text-sm font-medium">Simple. Fast. Productive.</span>
        </div>

        {/* title */}
        <h1
          className="hero-title font-bold text-[#cedadb] leading-tight mb-4 tracking-tight"
          style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
        >
          Manage tasks<br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#6dadbe] to-[#12768a]">
            without chaos
          </span>
        </h1>

        {/* subtitle */}
        <div className="hero-subtitle">
          <TypingAnimation
            className="text-white/40 leading-relaxed mb-8"
            style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }}
          >
            Create, organize, and complete tasks with a clean interface that gets out of your way.
          </TypingAnimation>
        </div>

        {/* buttons */}
        <div className="flex gap-3 flex-wrap">
          <div className="hero-btn-1">
            <StarBorder
              as="button"
              color="cyan"
              speed="5s"
              onClick={() => navigate('/register')}
              className="hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Get Started
            </StarBorder>
          </div>
          <div className="hero-btn-2">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 border border-white/10 hover:border-white/25 text-white/60 hover:text-white/90 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  )
})

HeroText.displayName = 'HeroText'
export default HeroText