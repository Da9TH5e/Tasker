'use client'

import { useRef } from 'react'
import ClickSpark from "@/components/ClickSpark"
import HeroBackground from "@/components/home/HeroBackground"
import HeroText from "@/components/home/HeroText"
import TaskSlab from "@/components/home/TaskSlab"
import CalendarSlab from "@/components/home/CalenderSlab"
import FeaturesSection from "@/components/home/FeaturesSection"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import './styles/home.css'

export default function HomePage() {
  const textSectionRef = useRef<HTMLDivElement>(null)
  const taskSlabRef    = useRef<HTMLDivElement>(null)
  const calSlabRef     = useRef<HTMLDivElement>(null)
  const featuresRef    = useRef<HTMLDivElement>(null)
  const card1Ref       = useRef<HTMLDivElement>(null)
  const card2Ref       = useRef<HTMLDivElement>(null)
  const card3Ref       = useRef<HTMLDivElement>(null)

  useScrollAnimation({
    taskSlabRef,
    calSlabRef,
    textSectionRef,
    featuresRef,
    cardRefs: [card1Ref, card2Ref, card3Ref],
  })

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      {/* 250vh tall scroll container — window/body scrolls this */}
      <div style={{
        width: '100vw',
        height: '250vh',
        position: 'relative',
        overflowX: 'hidden',
      }}>

        {/* sticky hero — pins at top while outer div scrolls */}
        <div style={{
          position: 'sticky',
          top: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}>
          <HeroBackground />
          <HeroText     ref={textSectionRef} />
          <TaskSlab     ref={taskSlabRef} />
          <CalendarSlab ref={calSlabRef} />
          <FeaturesSection
            sectionRef={featuresRef}
            cardRefs={[card1Ref, card2Ref, card3Ref]}
          />
        </div>

      </div>
    </ClickSpark>
  )
}