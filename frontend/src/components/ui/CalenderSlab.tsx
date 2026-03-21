'use client'

function CalendarSlab() {
  return (
    <div style={{
        animation: 'fadeUpFromBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards, float 5s ease-in-out 1.2s infinite',
        opacity: 0, // hidden until animation starts
    }}>
        <div style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1.5s' }}>
        <div style={{
            transform:'perspective(1000px) rotateY(14deg) rotateX(-4deg)',
            transformOrigin:'center center',
            alignSelf:'flex-end',
            marginRight: 60,
            filter:'drop-shadow(14px 22px 36px rgba(0,0,0,0.7)) drop-shadow(3px 5px 14px rgba(18,118,138,0.18))',
        }}>
            <div style={{position:'relative',
                backdropFilter:'blur(14px)',
                WebkitBackdropFilter:'blur(14px)',
            }}>

                {/* Thickness layers — mirrored for opposite tilt */}
                <div style={{position:'absolute',inset:0,transform:'translate(-6px,6px)',background:'rgba(255,255,255,0.01)', backdropFilter:'blur(24px)',
                WebkitBackdropFilter:'blur(24px)'}}/>
                <div style={{position:'absolute',inset:0,transform:'translate(-3px,3px)',background:'rgba(255,255,255,0.01)', backdropFilter:'blur(24px)',
                WebkitBackdropFilter:'blur(24px)'}}/>

                {/* Glass face */}
                <div style={{
                width:190, position:'relative', zIndex:2,
                background:'rgba(255,255,255,0.05)',
                backdropFilter:'blur(20px)',
                WebkitBackdropFilter:'blur(20px)',
                border:'2px solid rgba(255,255,255,0.12)',
                borderRadius:12, overflow:'hidden',
                }}>
                {/* Title bar */}
                <div style={{background:'rgba(255,255,255,0.13)',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'7px 10px',display:'flex',alignItems:'center',gap:4}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#ef4444'}}/>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#f59e0b'}}/>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e'}}/>
                    <span style={{fontSize:9,color:'rgba(255,255,255,0.25)',marginLeft:5,fontFamily:'system-ui'}}>Due Date</span>
                </div>

                {/* Month header */}
                <div style={{padding:'8px 10px 3px',display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:'system-ui'}}>
                    <span style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.8)'}}>March 2026</span>
                    <div style={{display:'flex',gap:3}}>
                    {['‹','›'].map(a => (
                        <div key={a} style={{width:16,height:16,borderRadius:4,background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'rgba(255,255,255,0.35)'}}>{a}</div>
                    ))}
                    </div>
                </div>

                {/* Day labels */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0 6px',gap:1}}>
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                    <div key={i} style={{height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'rgba(255,255,255,0.2)',fontFamily:'system-ui'}}>{d}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'1px 6px 6px',gap:1}}>
                    {[null,null,null,null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d,i) => (
                    <div key={i} style={{
                        width:24,height:24,borderRadius:5,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:10,fontFamily:'system-ui',
                        background:d===19?'rgba(18,118,138,0.3)':d===20||d===21?'rgba(18,118,138,0.12)':'transparent',
                        border:d===19?'1px solid rgba(18,118,138,0.5)':'none',
                        color:d===19?'#67e8f9':d===20||d===21?'rgba(255,255,255,0.7)':d===null?'transparent':'rgba(255,255,255,0.45)',
                        fontWeight:d===19?600:400,
                    }}>{d}</div>
                    ))}
                </div>

                {/* Divider */}
                <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'0 10px'}}/>

                {/* Time picker */}
                <div style={{padding:'8px 10px'}}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',marginBottom:5,fontFamily:'system-ui'}}>Due time</div>
                    <div style={{display:'flex',gap:4,alignItems:'center'}}>
                    <div style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'5px 6px',textAlign:'center',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.8)',fontFamily:'system-ui'}}>09</div>
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:13,fontWeight:600}}>:</span>
                    <div style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'5px 6px',textAlign:'center',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.8)',fontFamily:'system-ui'}}>00</div>
                    <div style={{background:'rgba(18,118,138,0.15)',border:'1px solid rgba(18,118,138,0.25)',borderRadius:6,padding:'5px 7px',fontSize:9,color:'#67e8f9',fontWeight:500,fontFamily:'system-ui'}}>AM</div>
                    </div>
                </div>

                {/* Set button */}
                <div style={{padding:'0 10px 10px'}}>
                    <div style={{background:'rgba(18,118,138,0.25)',border:'1px solid rgba(18,118,138,0.35)',borderRadius:7,padding:6,textAlign:'center',fontSize:10,fontWeight:600,color:'#67e8f9',fontFamily:'system-ui'}}>
                    Set due date
                    </div>
                </div>

                </div>
            </div>
            </div>
        </div>
    </div>
  )
}

export default CalendarSlab