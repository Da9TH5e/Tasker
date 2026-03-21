'use client'

function TaskOverviewSlab() {
  const tasks = [
    { title:'Login',                    time:'2 hours ago', status:'Done',        done:true  },
    { title:'Create Tasks',             time:'Today',       status:'In progress', done:false },
    { title:'Complete the given tasks', time:'Tomorrow',    status:'Pending',     done:false },
    { title:'Mark them as done',        time:'This week',   status:'Pending',     done:false },
  ]

  return (
    <div style={{
      animation: 'slideInFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, float 5s ease-in-out 0.8s infinite',
      opacity: 0,
    }}>
    <div style={{ animation: 'float 5s ease-in-out infinite' }}>
      <div
        className="absolute top-1/2 z-10"
        style={{
          right: '-20px',
          transform: 'translateY(-50%) perspective(1000px) rotateY(-15deg) rotateX(3deg)',
          transformOrigin: 'center center',
          filter: 'drop-shadow(-24px 32px 48px rgba(0,0,0,0.6)) drop-shadow(-4px 8px 20px rgba(18,118,138,0.2))',
        }}
      >
        <div className="absolute rounded-2xl" style={{ inset:0, transform:'translate(8px,8px)', zIndex:0 }}/>
        <div className="absolute rounded-2xl" style={{ inset:0, transform:'translate(4px,4px)', background:'rgba(255,255,255,0.02)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', zIndex:1 }}/>

        <div style={{
          width:'420px', minHeight:'500px',
          background:'rgba(255,255,255,0.04)',
          backdropFilter:'blur(19px)', WebkitBackdropFilter:'blur(19px)',
          border:'2px solid rgba(255,255,255,0.15)',
          borderRadius:'16px', overflow:'hidden',
          position:'relative', zIndex:2,
        }}>
          {/* Title bar */}
          <div style={{ background:'rgba(255,255,255,0.09)', padding:'10px 14px', display:'flex', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', alignItems:'center', gap:'6px' }}>
            <div style={{width:9,height:9,borderRadius:'50%',background:'#ef4444'}}/>
            <div style={{width:9,height:9,borderRadius:'50%',background:'#f59e0b'}}/>
            <div style={{width:9,height:9,borderRadius:'50%',background:'#22c55e'}}/>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginLeft:8}}>TaskFlow — Dashboard</span>
          </div>

          {/* Search + New */}
          <div style={{padding:'10px 14px 6px',display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}>
            <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'6px 10px',fontSize:11,color:'rgba(255,255,255,0.25)',border:'1px solid rgba(255,255,255,0.06)'}}>Search tasks...</div>
            <div style={{padding:'8px',border:'1px solid rgba(18,118,138,0.25)',borderRadius:'10px',background:'rgba(18,118,138,0.25)',fontSize:11,color:'#67e8f9',fontWeight:500}}>+ New</div>
          </div>

          {/* Filter pills */}
          <div style={{padding:'4px 14px 8px',display:'flex',gap:5}}>
            {['All','Pending','In Progress','Done'].map((f,i) => (
              <div key={f} style={{
                fontSize:10, padding:'3px 9px', borderRadius:20,
                background: i===0 ? 'rgba(18,118,138,0.2)' : 'transparent',
                color:       i===0 ? '#67e8f9' : 'rgba(255,255,255,0.25)',
                border:      i===0 ? '1px solid rgba(18,118,138,0.3)' : 'none',
              }}>{f}</div>
            ))}
          </div>

          {/* Task rows — staggered fade in */}
          {tasks.map((task, index) => (
            <div key={task.title} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'9px 14px',
              borderBottom:'1px solid rgba(255,255,255,0.035)',
              background: task.done ? 'rgba(18,118,138,0.03)' : 'transparent',
              // each row fades in 150ms after the previous one
              animation: 'fadeSlideIn 0.5s ease forwards',
              animationDelay: `${0.2 + index * 0.15}s`,
              opacity: 0, // hidden until animation runs
            }}>
              <div style={{
                width:16, height:16, borderRadius:'50%', flexShrink:0,
                border:`1.5px solid ${task.done ? '#0d9488' : 'rgba(255,255,255,0.2)'}`,
                background: task.done ? 'rgba(13,148,136,0.15)' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {task.done && (
                  <svg width="9" height="9" viewBox="0 0 9 9">
                    <path d="M1.5 4.5l2 2L7.5 2" stroke="#0d9488" strokeWidth="1.5"
                          fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              <div style={{flex:1}}>
                <div style={{
                  fontSize:12, fontFamily:'system-ui',
                  color: task.done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)',
                  textDecoration: task.done ? 'line-through' : 'none',
                }}>{task.title}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:1}}>{task.time}</div>
              </div>

              <div style={{
                fontSize:10, padding:'2px 7px', borderRadius:20, whiteSpace:'nowrap',
                background: task.status==='Done' ? 'rgba(34,197,94,0.1)' : task.status==='In progress' ? 'rgba(234,179,8,0.1)' : 'rgba(148,163,184,0.1)',
                color:      task.status==='Done' ? '#4ade80'             : task.status==='In progress' ? '#facc15'             : '#94a3b8',
                border: `1px solid ${task.status==='Done' ? 'rgba(34,197,94,0.2)' : task.status==='In progress' ? 'rgba(234,179,8,0.2)' : 'rgba(148,163,184,0.15)'}`,
              }}>{task.status}</div>
            </div>
          ))}

          {/* Footer */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            padding:'9px 14px', display:'flex',
            justifyContent:'space-between', alignItems:'center',
            borderTop:'1px solid rgba(255,255,255,0.04)',
            background:'rgba(255,255,255,0.02)',
          }}>
            <span style={{fontSize:10,color:'rgba(255,255,255,0.2)'}}>5 tasks · 1 completed</span>
            <span style={{fontSize:10,color:'rgba(18,118,138,0.6)'}}>View all →</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default TaskOverviewSlab