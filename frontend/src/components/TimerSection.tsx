import { useState, useEffect, useRef } from 'react'
import { Task, timerAPI, TimerEntry } from '@/lib/api'
import { Play, Square, RotateCcw, Clock, Trophy, Target } from 'lucide-react'

interface Props {
  tasks: Task[]
}

const formatTime = (seconds: number): string => {
  if (seconds < 0) seconds = 0
  if (seconds < 60)   return `${seconds}s`
  const mins  = Math.floor(seconds / 60)
  const secs  = seconds % 60
  if (mins < 60) return `${mins}m ${secs.toString().padStart(2,'0')}s`
  const hours = Math.floor(mins / 60)
  const rem   = mins % 60
  return `${hours}h ${rem.toString().padStart(2,'0')}m`
}

export default function TimerSection({ tasks }: Props) {
  const [mounted,        setMounted]        = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [dropdownOpen,   setDropdownOpen]   = useState(false)
  const [running,        setRunning]        = useState(false)
  const [elapsed,        setElapsed]        = useState(0)
  const [entries,        setEntries]        = useState<TimerEntry[]>([])
  const [stats,          setStats]          = useState({ total:0, avgDuration:0, fastest:0, goalsBeaten:0 })
  const [lastResult,     setLastResult]     = useState<'beat' | 'missed' | null>(null)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const dropdownRef  = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const load = async () => {
      try {
        const [e, s] = await Promise.all([
          timerAPI.getAll(),
          timerAPI.getStats(),
        ])
        setEntries(e)
        setStats(s)
      } catch {
        console.error('Failed to load timer data')
      }
    }
    load()
  }, [mounted])

  // tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const selectedTask = tasks.find(t => t.id === selectedTaskId)
  const timeGoal     = selectedTask?.timeGoal || null
  const remaining    = timeGoal ? timeGoal - elapsed : null
  const overTime     = remaining !== null && remaining < 0
  const progress     = timeGoal
    ? Math.min(elapsed / timeGoal, 1)
    : Math.min(elapsed / 3600, 1)

  const handleStart = () => {
    if (!selectedTaskId) return
    setElapsed(0)
    setLastResult(null)
    setRunning(true)
  }

  const handleStop = async () => {
    setRunning(false)
    if (elapsed < 1) return
    try {
      const entry = await timerAPI.save(selectedTaskId, elapsed)
      setEntries(prev => [entry, ...prev.slice(0, 19)])
      if (entry.beatGoal === true)  setLastResult('beat')
      if (entry.beatGoal === false) setLastResult('missed')
      const newStats = await timerAPI.getStats()
      setStats(newStats)
    } catch {
      console.error('Failed to save timer entry')
    }
    setElapsed(0)
  }

  const handleReset = () => {
    setRunning(false)
    setElapsed(0)
    setLastResult(null)
  }

  const ringColor = overTime ? '#ef4444'
    : running ? '#0d9488'
    : 'rgba(13,148,136,0.4)'

  const radius        = 80
  const circumference = 2 * Math.PI * radius
  const dashOffset    = circumference * (1 - progress)

  return (
    <div style={{
      background:'rgba(255,255,255,0.02)',
      border:'1px solid rgba(255,255,255,0.06)',
      borderRadius:20, padding:'clamp(16px, 4vw, 32px)',
    }}>

      {/* result banner */}
      {lastResult && (
        <div style={{
          marginBottom:20, padding:'12px 16px',
          borderRadius:12, display:'flex', alignItems:'center', gap:10,
          background: lastResult==='beat'
            ? 'rgba(13,148,136,0.15)'
            : 'rgba(239,68,68,0.15)',
          border: `1px solid ${lastResult==='beat'
            ? 'rgba(13,148,136,0.3)'
            : 'rgba(239,68,68,0.3)'}`,
          animation:'fadeSlideIn 0.3s ease forwards',
        }}>
          {lastResult === 'beat'
            ? <Trophy size={16} style={{color:'#0d9488'}}/>
            : <Target  size={16} style={{color:'#ef4444'}}/>
          }
          <span style={{
            fontSize:14, fontWeight:600,
            color: lastResult==='beat' ? '#0d9488' : '#ef4444',
          }}>
            {lastResult==='beat'
              ? `🎉 Goal beaten! Finished in ${formatTime(elapsed || entries[0]?.duration || 0)}`
              : `⏱ Goal missed — took ${formatTime(entries[0]?.duration || 0)}`
            }
          </span>
        </div>
      )}

      <div style={{
        display:'flex', gap:'clamp(20px, 5vw, 48px)',
        alignItems:'center', flexWrap:'wrap',
      }}>

        {/* timer ring */}
        <div style={{
          display:'flex', flexDirection:'column',
          alignItems:'center', gap:20, flex:'0 0 auto',
        }}>
          <div style={{position:'relative', width:200, height:200}}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={radius}
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
              <circle cx="100" cy="100" r={radius}
                fill="none" stroke={ringColor} strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transform:'rotate(-90deg)',
                  transformOrigin:'100px 100px',
                  transition: running ? 'stroke-dashoffset 1s linear, stroke 0.3s' : 'stroke 0.3s',
                }}
              />
            </svg>

            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:4,
            }}>
              {timeGoal && running ? (
                <>
                  <span style={{
                    fontSize:13, color: overTime ? '#ef4444' : 'rgba(255,255,255,0.4)',
                    fontWeight:500,
                  }}>
                    {overTime ? 'over by' : 'remaining'}
                  </span>
                  <span style={{
                    fontSize:32, fontWeight:700, fontFamily:'monospace',
                    color: overTime ? '#ef4444' : '#fff',
                    transition:'color 0.3s',
                  }}>
                    {formatTime(Math.abs(remaining!))}
                  </span>
                  <span style={{fontSize:11, color:'rgba(255,255,255,0.2)'}}>
                    elapsed: {formatTime(elapsed)}
                  </span>
                </>
              ) : (
                <>
                  <span style={{
                    fontSize:36, fontWeight:700, fontFamily:'monospace',
                    color: running ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition:'color 0.3s',
                    fontVariantNumeric:'tabular-nums',
                  }}>
                    {formatTime(elapsed)}
                  </span>
                  {timeGoal && !running && (
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>
                      goal: {formatTime(timeGoal)}
                    </span>
                  )}
                  {running && (
                    <span style={{fontSize:11, color:'#0d9488'}}>
                      recording...
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* controls */}
          <div style={{display:'flex', gap:10}}>
            {!running ? (
              <button
                onClick={handleStart}
                disabled={!selectedTaskId}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 24px',
                  background: selectedTaskId ? '#12768a' : 'rgba(13,148,166,0.2)',
                  border:'none', borderRadius:12,
                  color: selectedTaskId ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontSize:14, fontWeight:600,
                  cursor: selectedTaskId ? 'pointer' : 'not-allowed',
                  transition:'all 0.2s',
                }}
              >
                <Play size={15}/>
                Start
              </button>
            ) : (
              <button
                onClick={handleStop}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 24px',
                  background:'rgba(239,68,68,0.2)',
                  border:'1px solid rgba(239,68,68,0.3)',
                  borderRadius:12, color:'#ef4444',
                  fontSize:14, fontWeight:600, cursor:'pointer',
                }}
              >
                <Square size={15}/>
                Stop
              </button>
            )}
            <button
              onClick={handleReset}
              style={{
                width:40, height:40, borderRadius:12,
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.08)',
                color:'rgba(255,255,255,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', padding:0,
              }}
            >
              <RotateCcw size={15}/>
            </button>
          </div>
        </div>

        {/* right side */}
        <div style={{flex:'1 1 240px', minWidth:0}}>

          {/* task selector */}
          <div style={{marginBottom:20}}>
            <label style={{
              display:'block', fontSize:12,
              color:'rgba(255,255,255,0.35)', marginBottom:8,
            }}>
              Select task to time
            </label>

            {/* custom dropdown */}
            <div ref={dropdownRef} style={{position:'relative'}}>
              {/* trigger */}
              <div
                onClick={() => !running && setDropdownOpen(o => !o)}
                style={{
                  width:'100%', boxSizing:'border-box',
                  background:'rgba(3,10,10,0.85)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius: dropdownOpen ? '10px 10px 0 0' : 10,
                  padding:'9px 14px',
                  color: selectedTaskId ? '#f4f4f5' : 'rgba(255,255,255,0.3)',
                  fontSize:14, cursor: running ? 'not-allowed' : 'pointer',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  userSelect:'none',
                  transition:'border-radius 0.15s',
                }}
              >
                <span style={{
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>
                  {selectedTask
                    ? `${selectedTask.title}${selectedTask.timeGoal ? ` (goal: ${formatTime(selectedTask.timeGoal)})` : ''}`
                    : '— pick a task —'}
                </span>
                <span style={{
                  color:'rgba(255,255,255,0.3)', fontSize:10,
                  marginLeft:8, flexShrink:0,
                }}>
                  {dropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* options list */}
              {dropdownOpen && (
                <div style={{
                  position:'absolute', top:'100%', left:0, right:0, zIndex:50,
                  background:'rgba(3,10,10,0.95)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderTop:'none',
                  borderRadius:'0 0 10px 10px',
                  overflow:'hidden',
                  maxHeight:200, overflowY:'auto',
                }}>
                  {/* placeholder option */}
                  <div
                    onClick={() => { setSelectedTaskId(''); setDropdownOpen(false) }}
                    style={{
                      padding:'9px 14px', fontSize:14,
                      color:'rgba(255,255,255,0.3)',
                      cursor:'pointer',
                      background: !selectedTaskId ? 'rgba(13,148,136,0.1)' : 'transparent',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = !selectedTaskId ? 'rgba(13,148,136,0.1)' : 'transparent')}
                  >
                    — pick a task —
                  </div>

                  {tasks
                    .filter(t => t.status !== 'done')
                    .map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTaskId(t.id); setDropdownOpen(false) }}
                        style={{
                          padding:'9px 14px', fontSize:14,
                          color: t.id === selectedTaskId ? '#0d9488' : 'rgba(255,255,255,0.7)',
                          cursor:'pointer',
                          background: t.id === selectedTaskId ? 'rgba(13,148,136,0.1)' : 'transparent',
                          transition:'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = t.id === selectedTaskId ? 'rgba(13,148,136,0.1)' : 'transparent')}
                      >
                        {t.title}{t.timeGoal ? ` (goal: ${formatTime(t.timeGoal)})` : ''}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* show goal if task has one */}
            {selectedTask?.timeGoal && (
              <div style={{
                marginTop:8, fontSize:12,
                color:'rgba(255,255,255,0.3)',
                display:'flex', alignItems:'center', gap:6,
              }}>
                <Target size={11} style={{color:'#0d9488'}}/>
                Goal: {formatTime(selectedTask.timeGoal)}
                {' '}— can you beat it?
              </div>
            )}
          </div>

          {/* stats cards */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { label:'Sessions',     value: mounted ? stats.total       : 0,  color:'#fff'    },
              { label:'Avg time',     value: mounted && stats.total > 0 ? formatTime(stats.avgDuration) : '—', color:'#0d9488' },
              { label:'Goals beaten', value: mounted ? stats.goalsBeaten : 0,  color:'#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{
                flex:1, background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:12, padding:'12px 16px',
              }}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:4}}>
                  {s.label}
                </div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* recent sessions */}
          {mounted && entries.length > 0 && (
            <div>
              <div style={{
                fontSize:12, color:'rgba(255,255,255,0.3)',
                marginBottom:8,
              }}>
                Recent sessions
              </div>
              <div style={{
                display:'flex', flexDirection:'column', gap:6,
                maxHeight:160, overflowY:'auto',
              }}>
                {entries.slice(0,5).map((entry, i) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center',
                    justifyContent:'space-between',
                    padding:'8px 12px',
                    background:'rgba(255,255,255,0.03)',
                    borderRadius:8, fontSize:12,
                  }}>
                    <div style={{
                      color:'rgba(255,255,255,0.6)',
                      whiteSpace:'nowrap', overflow:'hidden',
                      textOverflow:'ellipsis', maxWidth:160,
                    }}>
                      {entry.task.title}
                    </div>
                    <div style={{
                      display:'flex', alignItems:'center',
                      gap:8, flexShrink:0, marginLeft:8,
                    }}>
                      {entry.beatGoal === true && (
                        <Trophy size={10} style={{color:'#f59e0b'}}/>
                      )}
                      <span style={{
                        color: entry.beatGoal === true  ? '#0d9488'
                             : entry.beatGoal === false ? '#ef4444'
                             : 'rgba(255,255,255,0.5)',
                        fontWeight:600,
                        display:'flex', alignItems:'center', gap:4,
                      }}>
                        <Clock size={10}/>
                        {formatTime(entry.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}