'use client'

import { Task } from '@/lib/api'
import { Pencil, Trash2, Clock } from 'lucide-react'

interface Props {
  task: Task
  index: number
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, index, onToggle, onEdit, onDelete }: Props) {
  const statusColor = {
    done:        { bg:'rgba(13,148,136,0.1)',  border:'rgba(13,148,136,0.25)',  text:'#0d9488'  },
    in_progress: { bg:'rgba(147,51,234,0.1)',  border:'rgba(147,51,234,0.25)',  text:'#9333ea'  },
    pending:     { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.25)',  text:'#f59e0b'  },
  }[task.status]

  const statusLabel = {
    done:        'Done',
    in_progress: 'In Progress',
    pending:     'Pending',
  }[task.status]

    const getTimeAgo = (date: string) => {
    const now = new Date()  // use new Date() instead of Date.now()
    const diff = now.getTime() - new Date(date).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins  < 1)  return 'just now'
    if (mins  < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
    }

  return (
    <div
      style={{
        display:'flex', alignItems:'center', gap:14,
        padding:'14px 18px',
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.06)',
        borderRadius:14,
        transition:'all 0.2s',
        // staggered fade in — each card appears 80ms after previous
        animation:'fadeSlideIn 0.4s ease forwards',
        animationDelay:`${index * 0.08}s`,

      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
      }}
    >

      {/* Toggle circle */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width:22, height:22, borderRadius:'50%', flexShrink:0,
          border:`2px solid ${task.status==='done' ? '#0d9488' : 'rgba(255,255,255,0.2)'}`,
          background: task.status==='done' ? 'rgba(13,148,136,0.2)' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'all 0.2s', padding:0,
        }}
      >
        {task.status === 'done' && (
          <svg width="11" height="11" viewBox="0 0 11 11">
            <path d="M2 5.5l2.5 2.5L9 3" stroke="#0d9488" strokeWidth="2"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title + meta */}
      <div style={{flex:1, minWidth:0}}>
        <div style={{
          fontSize:15, fontWeight:500,
          color: task.status==='done' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
          textDecoration: task.status==='done' ? 'line-through' : 'none',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          transition:'all 0.2s',
        }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{
            fontSize:12, color:'rgba(255,255,255,0.25)',
            marginTop:2, whiteSpace:'nowrap',
            overflow:'hidden', textOverflow:'ellipsis',
          }}>
            {task.description}
          </div>
        )}
        <div style={{
          display:'flex', alignItems:'center', gap:4,
          marginTop:4, fontSize:11, color:'rgba(255,255,255,0.2)',
        }}>
          <Clock size={10}/>
          {getTimeAgo(task.createdAt)}
        </div>
      </div>

      {/* Status badge */}
      <div style={{
        fontSize:11, padding:'3px 10px', borderRadius:20,
        whiteSpace:'nowrap', flexShrink:0,
        background: statusColor.bg,
        border:`1px solid ${statusColor.border}`,
        color: statusColor.text,
      }}>
        {statusLabel}
      </div>

      {/* Action buttons */}
      <div style={{display:'flex', gap:6, flexShrink:0}}>
        <button
          onClick={() => onEdit(task)}
          style={{
            width:32, height:32, borderRadius:8, border:'none',
            background:'rgba(255,255,255,0.05)',
            color:'rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all 0.2s', padding:0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(147,51,234,0.15)'
            e.currentTarget.style.color = '#9333ea'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <Pencil size={13}/>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            width:32, height:32, borderRadius:8, border:'none',
            background:'rgba(255,255,255,0.05)',
            color:'rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all 0.2s', padding:0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <Trash2 size={13}/>
        </button>
      </div>

    </div>
  )
}