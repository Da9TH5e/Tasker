'use client'

import { useState, useEffect, useRef } from 'react'
import { Task } from '@/lib/api'
import { X, Clock } from 'lucide-react'

interface Props {
  task: Task | null
  onSave: (data: {
    title: string
    description?: string
    status?: string
    timeGoal?: number | null
  }) => void
  onClose: () => void
}

function CustomSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: number
  options: { value: number; label: string }[]
  onChange: (val: number) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style>{`.cs-opts::-webkit-scrollbar{display:none}`}</style>

      {/* trigger */}
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(3,10,10,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: open ? '10px 10px 0 0' : 10,
          padding: '9px 14px',
          color: '#f4f4f5',
          fontSize: 14,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          userSelect: 'none',
          transition: 'border-radius 0.15s',
        }}
      >
        <span>{selected?.label ?? '—'}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginLeft: 8, flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>

      {/* options */}
      {open && (
        <div
          className="cs-opts"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
            background: 'rgba(3,10,10,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            maxHeight: 180, overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              style={{
                padding: '9px 14px', fontSize: 14,
                color: o.value === value ? '#0d9488' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                background: o.value === value ? 'rgba(13,148,136,0.1)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = o.value === value ? 'rgba(13,148,136,0.1)' : 'transparent')}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title,       setTitle]       = useState(task?.title        || '')
  const [description, setDescription] = useState(task?.description  || '')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'done'>(
    (task?.status as 'pending' | 'in_progress' | 'done') || 'pending'
  )
  const [goalHours, setGoalHours] = useState(
    task?.timeGoal ? Math.floor(task.timeGoal / 3600) : 0
  )
  const [goalMins, setGoalMins] = useState(
    task?.timeGoal ? Math.floor((task.timeGoal % 3600) / 60) : 0
  )
  const [useGoal, setUseGoal] = useState(!!task?.timeGoal)

  const handleSubmit = () => {
    if (!title.trim()) return
    const goalSeconds = useGoal && (goalHours > 0 || goalMins > 0)
      ? goalHours * 3600 + goalMins * 60
      : null
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      timeGoal: goalSeconds,
    })
  }

  const hourOptions   = Array.from({ length: 13 }, (_, i) => ({ value: i, label: `${i}h` }))
  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 45].map(m => ({ value: m, label: `${m}m` }))

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeSlideIn 0.2s ease forwards',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 28,
          animation: 'fadeUpFromBottom 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
            {task ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 13,
            color: 'rgba(255,255,255,0.4)', marginBottom: 6,
          }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="What needs to be done?"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 14px',
              color: '#f4f4f5', fontSize: 14, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 13,
            color: 'rgba(255,255,255,0.4)', marginBottom: 6,
          }}>
            Description{' '}
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>optional</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 14px',
              color: '#f4f4f5', fontSize: 14, outline: 'none',
              resize: 'vertical', fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* status */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 13,
            color: 'rgba(255,255,255,0.4)', marginBottom: 6,
          }}>
            Status
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'pending',     label: 'Pending',     color: '#f59e0b' },
              { value: 'in_progress', label: 'In Progress', color: '#9333ea' },
              { value: 'done',        label: 'Done',        color: '#0d9488' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value as 'pending' | 'in_progress' | 'done')}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: status === s.value
                    ? `1px solid ${s.color}`
                    : '1px solid rgba(255,255,255,0.08)',
                  background: status === s.value
                    ? `${s.color}22`
                    : 'rgba(255,255,255,0.03)',
                  color: status === s.value
                    ? s.color
                    : 'rgba(255,255,255,0.35)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* time goal */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 8,
          }}>
            <label style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Clock size={13} />
              Time goal{' '}
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>optional</span>
            </label>
            <button
              onClick={() => setUseGoal(!useGoal)}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: useGoal ? '#0d9488' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s', padding: 0,
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: '#fff', position: 'absolute',
                top: 3, transition: 'left 0.2s',
                left: useGoal ? 19 : 3,
              }} />
            </button>
          </div>

          {useGoal && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              animation: 'fadeSlideIn 0.2s ease forwards',
            }}>
              {/* hours */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                  Hours
                </div>
                <CustomSelect
                  value={goalHours}
                  options={hourOptions}
                  onChange={setGoalHours}
                />
              </div>

              <span style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 18, paddingTop: 16,
              }}>:</span>

              {/* minutes */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                  Minutes
                </div>
                <CustomSelect
                  value={goalMins}
                  options={minuteOptions}
                  onChange={setGoalMins}
                />
              </div>

              {/* preview */}
              {(goalHours > 0 || goalMins > 0) && (
                <div style={{
                  paddingTop: 16, fontSize: 12,
                  color: '#0d9488', whiteSpace: 'nowrap',
                }}>
                  = {goalHours > 0 ? `${goalHours}h ` : ''}{goalMins > 0 ? `${goalMins}m` : ''}
                </div>
              )}
            </div>
          )}
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: 'rgba(255,255,255,0.5)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            style={{
              flex: 2, padding: '10px',
              background: title.trim() ? '#0b3f43' : 'rgba(13,148,136,0.3)',
              border: 'none', borderRadius: 10,
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (title.trim()) e.currentTarget.style.background = '#034347' }}
            onMouseLeave={e => { if (title.trim()) e.currentTarget.style.background = '#12768a' }}
          >
            {task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  )
}