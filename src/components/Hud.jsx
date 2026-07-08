const PHASES = [
  { p: 0, icon: '🍹', title: 'El bar' },
  { p: 1, icon: '📋', title: 'Tus datos' },
  { p: 2, icon: '🔬', title: 'Análisis' },
]

export default function Hud({ phase, setPhase, canForm, canResults, muted, toggleMute }) {
  const enabled = (p) => p === 0 || (p === 1 && canForm) || (p === 2 && canResults)
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60, display: 'flex',
      alignItems: 'flex-start', justifyContent: 'space-between', padding: '0 14px', pointerEvents: 'none',
    }}>
      {/* cartel colgante */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', gap: 26 }}>
          <div style={{ width: 3, height: 12, background: '#caa06a' }} />
          <div style={{ width: 3, height: 12, background: '#caa06a' }} />
        </div>
        <div style={{
          background: 'linear-gradient(180deg,#8a5a2b,#6b4020)', border: '3px solid #3d2410', borderRadius: 12,
          padding: '7px 20px 8px', boxShadow: '0 6px 0 #3d2410,0 12px 22px rgba(0,0,0,.5)',
          animation: 'signSwing 5s ease-in-out infinite', transformOrigin: 'top center', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 'clamp(18px,2.6vw,24px)', color: '#ffedd0', letterSpacing: '-.4px', lineHeight: 1, textShadow: '0 2px 0 #3d2410' }}>
            <span style={{ display: 'inline-block', animation: 'titleBop 2.6s ease-in-out infinite' }}>🍹</span> Armá tu trago
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {PHASES.map((ph) => {
            const on = phase === ph.p
            const en = enabled(ph.p)
            return (
              <div
                key={ph.p}
                onClick={() => en && setPhase(ph.p)}
                title={ph.title}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: '3px solid #3d2410', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 4px 0 #3d2410',
                  background: on ? '#ffb03a' : '#ffedd0', cursor: en ? 'pointer' : 'not-allowed',
                  opacity: en ? 1 : 0.45, transition: 'transform .1s',
                }}
              >{ph.icon}</div>
            )
          })}
        </div>
        <div
          onClick={toggleMute}
          style={{
            width: 38, height: 38, borderRadius: '50%', background: '#ffedd0', border: '3px solid #3d2410',
            boxShadow: '0 4px 0 #3d2410', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, cursor: 'pointer',
          }}
        >{muted ? '🔕' : '🔔'}</div>
      </div>
    </div>
  )
}
