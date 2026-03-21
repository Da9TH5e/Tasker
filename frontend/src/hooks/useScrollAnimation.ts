import { useEffect, useRef, RefObject } from 'react'

interface ScrollRefs {
  taskSlabRef:    RefObject<HTMLDivElement | null>
  calSlabRef:     RefObject<HTMLDivElement | null>
  textSectionRef: RefObject<HTMLDivElement | null>
  featuresRef:    RefObject<HTMLDivElement | null>
  cardRefs:       [RefObject<HTMLDivElement | null>, RefObject<HTMLDivElement | null>, RefObject<HTMLDivElement | null>]
}

const clamp = (val: number, min = 0, max = 1) => Math.max(min, Math.min(max, val))

export function useScrollAnimation({
  taskSlabRef,
  calSlabRef,
  textSectionRef,
  featuresRef,
  cardRefs,
}: ScrollRefs) {
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY       = window.scrollY
      const vh            = window.innerHeight
      console.log('scrollY/vh =', (scrollY/vh).toFixed(2))
      const scrollingDown = scrollY > lastScrollY.current
      lastScrollY.current = scrollY

      // CalendarSlab — first (0vh → 30vh)
      if (calSlabRef.current) {
        const p = clamp((scrollY - 0) / (vh * 0.30))
        calSlabRef.current.dataset.p = scrollingDown
          ? String(Math.max(Number(calSlabRef.current.dataset.p ?? 0), p))
          : String(p)
        const fp = Number(calSlabRef.current.dataset.p)
        calSlabRef.current.style.transform = `translateY(calc(-50% + ${-fp * 120}px))`
        calSlabRef.current.style.opacity   = `${1 - fp}`
      }

      // TaskSlab — second (35vh → 65vh) ← big gap after cal
      if (taskSlabRef.current) {
        const p = clamp((scrollY - vh * 0.35) / (vh * 0.30))
        taskSlabRef.current.dataset.p = scrollingDown
          ? String(Math.max(Number(taskSlabRef.current.dataset.p ?? 0), p))
          : String(p)
        const fp = Number(taskSlabRef.current.dataset.p)
        taskSlabRef.current.style.transform = `translateY(calc(-50% + ${-fp * 140}px))`
        taskSlabRef.current.style.opacity   = `${1 - fp}`
      }

      // HeroText — last (65vh → 90vh) ← gap after task
      if (textSectionRef.current) {
        const p = clamp((scrollY - vh * 0.65) / (vh * 0.25))
        textSectionRef.current.dataset.p = scrollingDown
          ? String(Math.max(Number(textSectionRef.current.dataset.p ?? 0), p))
          : String(p)
        const fp = Number(textSectionRef.current.dataset.p)
        textSectionRef.current.style.transform = `translateY(calc(-50% + ${-fp * 70}px))`
        textSectionRef.current.style.opacity   = `${1 - fp}`
      }

      // FeaturesSection — fades in (85vh → 110vh)
      if (featuresRef.current) {
        const p = clamp((scrollY - vh * 0.85) / (vh * 0.25))
        featuresRef.current.style.opacity   = `${p}`
        featuresRef.current.style.transform = `translateY(${(1 - p) * 60}px)`
      }

      // Cards stagger in (95vh+)
      const delays = [0, 0.07, 0.14]
      cardRefs.forEach((ref, i) => {
        if (ref.current) {
          const p = clamp((scrollY - vh * (0.95 + delays[i])) / (vh * 0.20))
          ref.current.style.opacity   = `${p}`
          ref.current.style.transform = `translateY(${(1 - p) * 40}px)`
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [taskSlabRef, calSlabRef, textSectionRef, featuresRef, cardRefs])
}