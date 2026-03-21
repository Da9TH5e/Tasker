'use client'
import Grainient from "../../components/Grainient"

export default function HeroBackground() {
  return (
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
  )
}