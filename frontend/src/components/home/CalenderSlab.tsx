import { forwardRef } from 'react'
import CalendarSlabUI from "@/components/ui/CalenderSlab"

const CalendarSlab = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right: 'clamp(160px, 22vw, 320px)',
        top: 'clamp(68%, 74%, 78%)',
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        willChange: 'transform, opacity',
        transformOrigin: 'right center',
      }}
    >
      <CalendarSlabUI />
    </div>
  )
})

CalendarSlab.displayName = 'CalendarSlab'
export default CalendarSlab