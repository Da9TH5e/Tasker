'use client'
import { forwardRef } from 'react'
import TaskOverviewSlab from "@/components/ui/TaskOverviewSlab"

const TaskSlab = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right: 'clamp(-80px, -4vw, -20px)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        willChange: 'transform, opacity',
        // scale down on smaller screens
        scale: 'clamp(0.65, 0.7 + 0.2 * ((100vw - 768px) / 672), 1)',
        transformOrigin: 'right center',
      }}
    >
      <TaskOverviewSlab />
    </div>
  )
})

TaskSlab.displayName = 'TaskSlab'
export default TaskSlab