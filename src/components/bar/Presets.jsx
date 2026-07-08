import { memo } from 'react'
import { PRESETS } from '../../data/presets.js'

// Tragos clásicos de un toque.
function Presets({ onPick }) {
  return (
    <div>
      <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 14, color: '#e8c58f', margin: '0 2px 4px' }}>
        🍸 clásicos de un toque
      </div>
      <div className="scroll-x" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p)}
            style={{
              flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, background: '#ffedd0',
              border: '3px solid #3d2410', borderRadius: 999, padding: '5px 12px 5px 8px', cursor: 'pointer',
              fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#2b1c0e',
              boxShadow: '0 4px 0 #3d2410', whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: p.tint, border: '2px solid #3d2410', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(Presets)
