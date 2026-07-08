import { ACHIEVEMENTS } from '../data/achievements.js'

const INK = '#3d2410'

// Galería de stickers (modal). Los bloqueados se ven apagados.
export function AchievementsModal({ unlocked, onClose }) {
  const has = (id) => unlocked.includes(id)
  const done = ACHIEVEMENTS.filter((a) => has(a.id)).length
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,12,4,.62)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="scroll-y" style={{
        width: 'min(560px,94vw)', maxHeight: '86vh', background: 'linear-gradient(180deg,#fff6e6,#f0dcc0)',
        border: `5px solid ${INK}`, borderRadius: 20, boxShadow: `0 12px 0 ${INK},0 30px 50px rgba(0,0,0,.5)`,
        padding: '16px 18px 20px', animation: 'popIn .3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 24, color: INK }}>🏆 Tus stickers</div>
            <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 15, color: '#7a5228' }}>{done} de {ACHIEVEMENTS.length} desbloqueados</div>
          </div>
          <div onClick={onClose} style={{
            width: 38, height: 38, borderRadius: '50%', background: '#ffb03a', border: `3px solid ${INK}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', boxShadow: `0 4px 0 ${INK}`,
          }}>✕</div>
        </div>

        {/* barra de progreso */}
        <div style={{ height: 12, borderRadius: 999, background: 'rgba(0,0,0,.12)', border: `2px solid ${INK}`, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', width: `${(done / ACHIEVEMENTS.length) * 100}%`, background: 'linear-gradient(90deg,#ffb03a,#ffd23f)', transition: 'width .4s ease' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const on = has(a.id)
            return (
              <div key={a.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3,
                background: on ? '#fff' : 'rgba(0,0,0,.05)', border: `3px solid ${on ? '#e0a91e' : 'rgba(61,36,16,.3)'}`,
                borderRadius: 14, padding: '10px 8px 11px', filter: on ? 'none' : 'grayscale(1)', opacity: on ? 1 : 0.55,
                boxShadow: on ? '0 4px 0 #e0a91e' : 'none',
              }}>
                <div style={{ fontSize: 34, lineHeight: 1 }}>{on ? a.icon : '🔒'}</div>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 13, color: INK }}>{a.name}</div>
                <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 12.5, color: '#7a5228', lineHeight: 1.1 }}>{a.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Cartelito que aparece al desbloquear un logro.
export function AchievementToast({ toast }) {
  if (!toast) return null
  return (
    <div key={toast.seed} style={{
      position: 'fixed', top: 74, left: '50%', transform: 'translateX(-50%)', zIndex: 320, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(180deg,#fff6e6,#f6e4c4)',
      border: `4px solid ${INK}`, borderRadius: 14, padding: '8px 16px 9px', boxShadow: `0 6px 0 ${INK},0 16px 26px rgba(0,0,0,.4)`,
      animation: 'toastPop 2.6s ease forwards',
    }}>
      <div style={{ fontSize: 32 }}>{toast.icon}</div>
      <div>
        <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 13, color: '#b76b0e', lineHeight: 1 }}>¡STICKER NUEVO!</div>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 16, color: INK, lineHeight: 1.1 }}>{toast.name}</div>
      </div>
    </div>
  )
}
