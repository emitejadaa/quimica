import { memo } from 'react'
import { byId } from '../../data/catalog.js'

function Recipe({ added, bumpMl, remove }) {
  return (
    <div style={{
      background: '#2f3e34', border: '4px solid #8a5a2b', borderRadius: 12, padding: '8px 11px',
      boxShadow: 'inset 0 0 24px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 17, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
        📋 Tu receta <span style={{ flex: 1, borderBottom: '2px dashed rgba(255,255,255,.25)' }} />
      </div>
      {added.length === 0 ? (
        <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 15, color: 'rgba(255,255,255,.55)', marginTop: 5 }}>
          todavía no serviste nada…
        </div>
      ) : (
        <div className="scroll-y" style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5, maxHeight: 148 }}>
          {added.map((it) => {
            const d = byId[it.id]
            if (!d) return null
            const isExtra = d.cat === 'extra'
            return (
              <div key={it.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Patrick Hand, cursive', fontSize: 16,
                color: '#fff', borderBottom: '1.5px dashed rgba(255,255,255,.14)', padding: '2px 0 4px',
              }}>
                <span style={{ fontSize: 15 }}>{isExtra ? d.emoji : '🍶'}</span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.5)', background: isExtra ? '#dfe7ef' : d.bottle.liquid }} />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                {isExtra ? (
                  <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>×{it.n || 1}</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span onClick={() => bumpMl(it.id, -15)} style={stepBtn}>−</span>
                    <span style={{ minWidth: 52, textAlign: 'center', color: '#ffd23f' }}>{Math.round(it.ml)} ml</span>
                    <span onClick={() => bumpMl(it.id, +15)} style={stepBtn}>+</span>
                  </span>
                )}
                <span onClick={() => remove(it.id)} style={{ color: '#ff8a8a', cursor: 'pointer', fontWeight: 900, padding: '0 3px', fontFamily: 'Nunito, sans-serif', fontSize: 14 }}>✕</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default memo(Recipe)

const stepBtn = {
  width: 21, height: 21, borderRadius: '50%', border: '2px solid rgba(255,255,255,.7)', display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 900, fontSize: 14, lineHeight: 1,
}
