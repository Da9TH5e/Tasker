// src/app/dashboard/page

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tasksAPI, authAPI, Task } from '@/lib/api'
import { getUser, clearAuth } from '@/lib/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  CheckSquare, LogOut, Plus, Search,
  Clock, BarChart2, LayoutDashboard
} from 'lucide-react'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import TimerSection from '@/components/TimerSection'
import StatsSection from '@/components/StatsSection'
import Aurora from '@/components/Aurora'


const AVATAR_COLORS = [
  { bg: 'rgba(13,148,136,0.2)',  border: 'rgba(13,148,136,0.4)',  text: '#0d9488' },  // teal
  { bg: 'rgba(147,51,234,0.2)',  border: 'rgba(147,51,234,0.4)',  text: '#9333ea' },  // purple
  { bg: 'rgba(245,158,11,0.2)',  border: 'rgba(245,158,11,0.4)',  text: '#f59e0b' },  // amber
  { bg: 'rgba(239,68,68,0.2)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },  // red
  { bg: 'rgba(59,130,246,0.2)',  border: 'rgba(59,130,246,0.4)',  text: '#3b82f6' },  // blue
  { bg: 'rgba(236,72,153,0.2)',  border: 'rgba(236,72,153,0.4)',  text: '#ec4899' },  // pink
  { bg: 'rgba(34,197,94,0.2)',   border: 'rgba(34,197,94,0.4)',   text: '#22c55e' },  // green
]

const getAvatarColor = (email: string) => {
  const index = email.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]!
}

const glassSlab: React.CSSProperties = {
  background: 'rgba(3, 10, 10, 0.55)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: '28px 32px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)',
  marginBottom: 24,
}

const slabLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 20,
  color: 'rgba(255,255,255,0.25)',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  // ── Task state ────────────────────────────────────────────────
  const [tasks,      setTasks]      = useState<Task[]>([])
  const [allTasks,   setAllTasks]   = useState<Task[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [refreshKey, setRefreshKey] = useState(0)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // ── Fetch paginated tasks ─────────────────────────────────────
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const data = await tasksAPI.getAll({
          page,
          limit: 10,
          status: filter === 'all' ? undefined : filter,
          search: search || undefined,
        })
        setTasks(data.tasks)
        setTotalPages(data.pagination.totalPages)
      } catch {
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    const timeout = setTimeout(fetchTasks, search ? 400 : 0)
    return () => clearTimeout(timeout)
  }, [page, filter, search, refreshKey])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await tasksAPI.getAll({ limit: 1000 })
        setAllTasks(data.tasks)
      } catch {
        console.error('Failed to fetch all tasks for stats')
      }
    }
    fetchAll()
  }, [tasks])

  // ── Task actions ──────────────────────────────────────────────
  const handleToggle = async (id: string) => {
    try {
      const updated = await tasksAPI.toggle(id)
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
      toast.success(updated.status === 'done' ? 'Task completed! 🎉' : 'Task reopened')
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await tasksAPI.delete(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleSave = async (data: {
    title: string
    description?: string
    status?: string
    timeGoal?: number | null
  }) => {
    try {
      if (editingTask) {
        const updated = await tasksAPI.update(editingTask.id, data)
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t))
        toast.success('Task updated!')
      } else {
        await tasksAPI.create(data)
        setRefreshKey(prev => prev + 1)
        toast.success('Task created!')
      }
      setModalOpen(false)
      setEditingTask(null)
    } catch {
      toast.error('Failed to save task')
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  // ── Stats ─────────────────────────────────────────────────────
  const completedCount  = allTasks.filter(t => t.status === 'done').length
  const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length
  const pendingCount    = allTasks.filter(t => t.status === 'pending').length
  const totalCount      = allTasks.length
  const statsUnlocked   = completedCount >= 3

  const avatarColor = getAvatarColor(user?.email || 'a')

  const today          = new Date().toDateString()
  const todayTasks     = allTasks.filter(t => new Date(t.createdAt).toDateString() === today)
  const todayCompleted = allTasks.filter(t =>
    t.status === 'done' && new Date(t.updatedAt).toDateString() === today
  )

  return (
    <div className="min-h-screen bg-[#030a0a] text-zinc-100" style={{ position: 'relative' }}>

      {/* ── Aurora background ──────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <Aurora
          colorStops={["#0b3f43", "#12768a", "#6dadbe"]}
          blend={0.8}
          amplitude={1.0}
          speed={0.7}
        />
      </div>

      {/* ── Everything above the aurora ────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#18181b', color: '#f4f4f5',
            border: '1px solid #cedadb', borderRadius: '10px',
          }
        }}/>

        {/* ── Navbar ─────────────────────────────────────────────── */}
        <nav style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(9,9,11,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div className="flex items-center gap-2">
            <div className="text-[#cedadb]"/>
            <span style={{
              fontSize: 15,
              paddingTop: '5px',
              letterSpacing: '0.54em',
              textTransform: 'uppercase',
              color: '#cedadb',
              fontWeight: 400,
              marginBottom: 12,
              textAlign: 'center',
              display: 'block',
            }}>
              Tasker
            </span>
          </div>
          <div className="flex items-center gap-3">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: avatarColor.bg,
            border: `1px solid ${avatarColor.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: avatarColor.text,
            flexShrink: 0,
          }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>

          {/* email — hidden on small screens */}

          {/* logout — icon only with tooltip */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s', padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            <LogOut size={14}/>
          </button>
        </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* ════════════════════════════════════════════════════════
              SLAB 1 — Overview stats
          ════════════════════════════════════════════════════════ */}
          <div style={glassSlab}>
            <div style={slabLabel}>
              <LayoutDashboard size={13}/>
              Overview
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total',       value: totalCount,      color: '#fff'    },
                { label: 'Completed',   value: completedCount,  color: '#0d9488' },
                { label: 'In Progress', value: inProgressCount, color: '#9333ea' },
                { label: 'Pending',     value: pendingCount,    color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '16px 20px',
                }}>
                  <div className="text-zinc-500 text-xs mb-1">{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              SLAB 2 — My Tasks
          ════════════════════════════════════════════════════════ */}
          <div style={glassSlab}>
            <div style={{ ...slabLabel, marginBottom: 0 }}>
              <CheckSquare size={13}/>
              My Tasks
            </div>

            {/* header row */}
            <div className="flex items-center justify-between mt-5 mb-5">
              <h2 className="text-xl font-bold text-white">Tasks</h2>
              <button
                onClick={() => { setEditingTask(null); setModalOpen(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0b3f43] border-2
                           hover:bg-[#12768a] text-[#cedadb] rounded-xl text-sm
                           font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={16}/>
              </button>
            </div>

            {/* search + filters */}
            <div className="flex flex-col gap-3 mb-6">
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.25)',
                }}/>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search tasks..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: '9px 14px 9px 36px',
                    color: '#f4f4f5', fontSize: 14, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.4)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'all',         label: 'All'         },
                  { key: 'pending',     label: 'Pending'     },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'done',        label: 'Done'        },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => { setFilter(f.key); setPage(1) }}
                    style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 13,
                      border: filter === f.key
                        ? '1px solid rgba(20,184,166,0.4)'
                        : '1px solid rgba(255,255,255,0.07)',
                      background: filter === f.key
                        ? 'rgba(20,184,166,0.15)'
                        : 'transparent',
                      color: filter === f.key ? '#0d9488' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* task list */}
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    height: 72, borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}/>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <CheckSquare size={40} className="text-zinc-700"/>
                <p className="text-zinc-500 text-sm">
                  {search || filter !== 'all'
                    ? 'No tasks match your filter'
                    : 'No tasks yet — create your first one!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm border border-white/10
                             disabled:opacity-30 hover:border-white/25 transition-colors"
                >
                  Previous
                </button>
                <span className="text-zinc-500 text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg text-sm border border-white/10
                             disabled:opacity-30 hover:border-white/25 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════
              SLAB 3 — Timer
          ════════════════════════════════════════════════════════ */}
          <div style={glassSlab}>
            <div style={slabLabel}>
              <Clock size={13}/>
              Timer
            </div>
            <TimerSection tasks={allTasks}/>
          </div>

          {/* ════════════════════════════════════════════════════════
              SLAB 4 — Statistics
          ════════════════════════════════════════════════════════ */}
          <div style={{ ...glassSlab, marginBottom: 0 }}>
            <div style={slabLabel}>
              <BarChart2 size={13}/>
              Statistics
            </div>
            <StatsSection
              allTasks={allTasks}
              todayTasks={todayTasks}
              todayCompleted={todayCompleted}
              completedCount={completedCount}
              inProgressCount={inProgressCount}
              pendingCount={pendingCount}
              totalCount={totalCount}
              unlocked={statsUnlocked}
            />
          </div>

          <div className="pb-20"/>
        </div>
      </div>

      {/* ── Task Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <TaskModal
          key={editingTask?.id || 'new'}
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}