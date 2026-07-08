import { FACTS, KIND_STYLE } from '../../data/content.js'

export default function RotatingCard({ seed, onNext }) {
  const f = FACTS[((seed % FACTS.length) + FACTS.length) % FACTS.length]
  const k = KIND_STYLE[f.kind]
  return (
    <div style={{ background: k.bg, border: `3px solid ${k.bd}`, borderRadius: 14, padding: '9px 12px', boxShadow: `0 5px 0 ${k.bd}`, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 12, color: k.tx }}>{k.icon} {k.title}</div>
        <button onClick={onNext} style={{ background: '#fff', border: `2px solid ${k.bd}`, borderRadius: 999, padding: '2px 9px', fontSize: 12, fontWeight: 800, color: k.tx, cursor: 'pointer', fontFamily: 'Fredoka, sans-serif' }}>🔀 otra</button>
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.4, marginTop: 3, color: '#2b1c0e' }}>
        {f.kind === 'mito' ? <><b>“{f.t}”</b> → {f.v}</> : f.t}
      </div>
    </div>
  )
}
