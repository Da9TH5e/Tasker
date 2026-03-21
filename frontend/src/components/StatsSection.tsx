'use client'

import { useRef, useEffect, useState } from 'react'
import { Task } from '@/lib/api'
import { Lock, TrendingUp, Calendar } from 'lucide-react'

interface Props {
  allTasks: Task[]
  todayTasks: Task[]
  todayCompleted: Task[]
  completedCount: number
  inProgressCount: number
  pendingCount: number
  totalCount: number
  unlocked: boolean
}

// animated ring component
function Ring({
  radius, stroke, color, progress, delay = 0
}: {
  radius: number
  stroke: number
  color: string
  progress: number  // 0 to 1
  delay?: number
}) {
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(progress, 1))
  const center = 110  // svg center

  return (
    <>
      {/* track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        opacity={0.12}
      />
      {/* fill */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${center}px ${center}px`,
          transition: `stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        }}
        ref={el => {
          if (el) {
            // trigger animation after mount
            setTimeout(() => {
              el.style.strokeDashoffset = String(offset)
            }, 100)
          }
        }}
      />
    </>
  )
}

export default function StatsSection({
  allTasks, todayTasks, todayCompleted,
  completedCount, inProgressCount, pendingCount,
  totalCount, unlocked,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // trigger ring animation when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // monthly breakdown — last 6 months
  const getMonthlyData = () => {
    const months: { label: string; completed: number; total: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString('default', { month: 'short' })
      const year  = d.getFullYear()
      const month = d.getMonth()
      const monthTasks = allTasks.filter(t => {
        const td = new Date(t.createdAt)
        return td.getMonth() === month && td.getFullYear() === year
      })
      months.push({
        label,
        total:     monthTasks.length,
        completed: monthTasks.filter(t => t.status === 'done').length,
      })
    }
    return months
  }

  const monthlyData  = getMonthlyData()
  const maxMonthVal  = Math.max(...monthlyData.map(m => m.total), 1)
  const completionRate = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0

  return (
    <div ref={sectionRef}>

      {/* ── Today's stats ──────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 16,
        }}>
          <Calendar size={15} style={{ color: '#0d9488' }}/>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Today
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label:'Created today',   value: todayTasks.length,     color:'#fff'    },
            { label:'Completed today', value: todayCompleted.length,  color:'#0d9488' },
            { label:'Completion rate', value: `${completionRate}%`,   color:'#9333ea' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '16px 20px',
            }}>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.3)',
                marginBottom: 6,
              }}>
                {s.label}
              </div>
              <div style={{
                fontSize: 28, fontWeight: 700, color: s.color,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Overall stats — locked until 3 completed ───────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, padding: 32,
        position: 'relative', overflow: 'hidden',
      }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 28,
        }}>
          <TrendingUp size={15} style={{ color: '#9333ea' }}/>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Overall
          </span>
          {!unlocked && (
            <div style={{
              marginLeft: 'auto', display: 'flex',
              alignItems: 'center', gap: 6,
              fontSize: 12, color: 'rgba(255,255,255,0.3)',
            }}>
              <Lock size={12}/>
              {3 - completedCount} more task{3 - completedCount !== 1 ? 's' : ''} to unlock
            </div>
          )}
        </div>

        {/* content — blurred when locked */}
        <div style={{
          filter: unlocked ? 'none' : 'blur(6px)',
          transition: 'filter 0.8s ease',
          pointerEvents: unlocked ? 'auto' : 'none',
          userSelect: unlocked ? 'auto' : 'none',
        }}>
          <div style={{
            display: 'flex', gap: 48,
            alignItems: 'center', flexWrap: 'wrap',
          }}>

            {/* Activity rings */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                {visible && unlocked && (
                  <>
                    {/* outer — completed */}
                    <Ring
                      radius={90} stroke={14} color="#0d9488"
                      progress={totalCount > 0 ? completedCount / totalCount : 0}
                      delay={0}
                    />
                    {/* middle — in progress */}
                    <Ring
                      radius={68} stroke={14} color="#9333ea"
                      progress={totalCount > 0 ? inProgressCount / totalCount : 0}
                      delay={0.2}
                    />
                    {/* inner — pending */}
                    <Ring
                      radius={46} stroke={14} color="#f59e0b"
                      progress={totalCount > 0 ? pendingCount / totalCount : 0}
                      delay={0.4}
                    />
                  </>
                )}
                {/* placeholder rings when locked */}
                {!unlocked && (
                  <>
                    <circle cx="110" cy="110" r={90} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14"/>
                    <circle cx="110" cy="110" r={68} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14"/>
                    <circle cx="110" cy="110" r={46} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14"/>
                  </>
                )}
              </svg>

              {/* center text */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 32, fontWeight: 700, color: '#fff',
                }}>
                  {completionRate}%
                </span>
                <span style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.3)',
                }}>
                  completed
                </span>
              </div>
            </div>

            {/* Legend + monthly chart */}
            <div style={{ flex: 1, minWidth: 200 }}>

              {/* ring legend */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: 14, marginBottom: 28,
              }}>
                {[
                  { color:'#0d9488', label:'Completed',   value: completedCount,  pct: totalCount > 0 ? Math.round(completedCount/totalCount*100)  : 0 },
                  { color:'#9333ea', label:'In Progress', value: inProgressCount, pct: totalCount > 0 ? Math.round(inProgressCount/totalCount*100) : 0 },
                  { color:'#f59e0b', label:'Pending',     value: pendingCount,    pct: totalCount > 0 ? Math.round(pendingCount/totalCount*100)    : 0 },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: item.color, flexShrink: 0,
                    }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: 4,
                      }}>
                        <span style={{
                          fontSize: 12, color: 'rgba(255,255,255,0.5)',
                        }}>
                          {item.label}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: item.color,
                        }}>
                          {item.value} · {item.pct}%
                        </span>
                      </div>
                      {/* progress bar */}
                      <div style={{
                        height: 4, borderRadius: 2,
                        background: `${item.color}20`,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          background: item.color,
                          width: visible && unlocked ? `${item.pct}%` : '0%',
                          transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
                        }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* monthly bar chart */}
              <div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.3)',
                  marginBottom: 10, textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Monthly breakdown
                </div>
                <div style={{
                  display: 'flex', gap: 8,
                  alignItems: 'flex-end', height: 60,
                }}>
                  {monthlyData.map((m, i) => (
                    <div key={i} style={{
                      flex: 1, display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}>
                      <div style={{
                        width: '100%', borderRadius: 4,
                        background: 'rgba(255,255,255,0.06)',
                        position: 'relative', overflow: 'hidden',
                        height: 44,
                      }}>
                        {/* total bar */}
                        <div style={{
                          position: 'absolute', bottom: 0,
                          width: '100%', borderRadius: 4,
                          background: 'rgba(13,148,136,0.2)',
                          height: visible && unlocked
                            ? `${(m.total / maxMonthVal) * 100}%`
                            : '0%',
                          transition: `height 1s ease ${i * 0.1}s`,
                        }}/>
                        {/* completed bar */}
                        <div style={{
                          position: 'absolute', bottom: 0,
                          width: '100%', borderRadius: 4,
                          background: '#0d9488',
                          height: visible && unlocked
                            ? `${(m.completed / maxMonthVal) * 100}%`
                            : '0%',
                          transition: `height 1s ease ${i * 0.1 + 0.2}s`,
                        }}/>
                      </div>
                      <span style={{
                        fontSize: 9, color: 'rgba(255,255,255,0.25)',
                      }}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* lock overlay */}
        {!unlocked && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12, borderRadius: 20,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={20} style={{ color: 'rgba(255,255,255,0.4)' }}/>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
            }}>
              Complete {3 - completedCount} more task{3 - completedCount !== 1 ? 's' : ''} to unlock
            </div>
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.25)',
            }}>
              Statistics unlock after 3 completed tasks
            </div>
            {/* progress dots */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < completedCount
                    ? '#0d9488'
                    : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s',
                }}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}