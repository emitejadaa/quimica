import { memo } from 'react'
import { CATALOG, TABS, MAX_EXTRAS } from '../../data/catalog.js'
import Bottle from './Bottle.jsx'

const INK = '#2b1c0e'

function ExtraIcon({ emoji }) {
  return (
    <div style={{ position: 'relative', width: 46, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', bottom: 0, width: 44, height: 22, background: 'linear-gradient(180deg,#fff6e6,#e8d9bd)', border: `2.4px solid ${INK}`, borderRadius: '50% 50% 10px 10px / 14px 14px 9px 9px' }} />
      <span style={{ position: 'relative', fontSize: 25, marginBottom: 3, filter: 'drop-shadow(0 2px 1px rgba(0,0,0,.3))' }}>{emoji}</span>
    </div>
  )
}

function ShelfBase({ tab, setTab, onBottleDown, extrasInfo }) {
  const items = CATALOG.filter((d) => d.cat === tab)
  const exFull = (extrasInfo?.used || 0) >= MAX_EXTRAS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
        {TABS.map((t) => {
          const on = t.id === tab
          return (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              position: 'relative', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12,
              border: '3px solid #3d2410', borderRadius: 10, padding: '6px 10px 5px', cursor: 'pointer',
              marginTop: 5, transition: 'transform .12s',
              background: on ? '#ffb03a' : '#ffedd0', color: on ? INK : '#6b4020',
              boxShadow: '0 4px 0 #3d2410', opacity: on ? 1 : 0.82,
            }}>
              <span style={{ position: 'absolute', top: -5, left: '50%', width: 7, height: 7, marginLeft: -3, borderRadius: '50%', background: '#1c1006', border: '2px solid #caa06a' }} />
              {t.emoji} {t.label}
            </div>
          )
        })}
      </div>

      <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 14, color: '#e8c58f', margin: '0 2px 6px' }}>
        {tab === 'extra'
          ? <>Decoran y dan gusto — NO bajan el alcohol. Máx {MAX_EXTRAS}.{exFull && ' · ¡ya pusiste 2!'}</>
          : <>Arrastrá la botella al vaso 🫳 y mantenela para servir.</>}
      </div>

      <div className="scroll-y" style={{
        flex: 1, minHeight: 0, background: 'rgba(0,0,0,.16)', borderRadius: 12, padding: '8px 8px 4px',
        backgroundImage: 'repeating-linear-gradient(180deg,transparent 0 116px,#33200e 116px 126px)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(88px,1fr))', gap: 2, alignItems: 'end' }}>
          {items.map((d, i) => {
            const isExtra = d.cat === 'extra'
            const n = extrasInfo?.counts?.[d.id] || 0
            const disabled = isExtra && exFull && n === 0
            return (
              <div key={d.id} data-id={d.id} onPointerDown={disabled ? undefined : onBottleDown} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '6px 2px 12px',
                cursor: disabled ? 'not-allowed' : 'grab', touchAction: 'none', position: 'relative',
                opacity: disabled ? 0.4 : 1, userSelect: 'none',
              }}>
                {isExtra ? <ExtraIcon emoji={d.emoji} /> : <Bottle spec={d.bottle} h={64} />}
                <div style={{ fontWeight: 800, fontSize: 11, color: '#ffedd0', textAlign: 'center', lineHeight: 1.05, marginTop: 2 }}>{d.name}</div>
                <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 11.5, color: '#d9b98c', lineHeight: 1 }}>
                  {isExtra ? (n ? `puesto ×${n}` : 'a gusto') : `${d.abv}° · ${d.variety || ''}`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(ShelfBase)
