import { byId, GLASS_CAP } from '../../data/catalog.js'

const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  left: 10 + i * 9,
  size: 4 + (i % 3) * 2,
  dur: (2.6 + (i % 4) * 0.6).toFixed(2),
  delay: (i * 0.32).toFixed(2),
}))

export default function Glass({ added, activeId, pouring, dragOver, onClink, w = 150, h = 250 }) {
  const liquids = added.filter((it) => byId[it.id]?.cat !== 'extra' && it.ml > 0)
  const extras = added.filter((it) => byId[it.id]?.cat === 'extra')
  const totalMl = liquids.reduce((a, it) => a + it.ml, 0)
  const fillPct = Math.min(100, (totalMl / GLASS_CAP) * 100)
  const topColor = liquids.length ? byId[liquids[liquids.length - 1].id].bottle.liquid : 'transparent'
  const streamColor = activeId ? byId[activeId]?.bottle?.liquid || '#cfe8ff' : topColor

  let cum = 0
  const layers = liquids.map((it, i) => {
    const bottom = (cum / GLASS_CAP) * 100
    const height = (it.ml / GLASS_CAP) * 100
    cum += it.ml
    return { key: it.id, bottom, height, color: byId[it.id].bottle.liquid, first: i === 0 }
  })

  const garnish = []
  extras.forEach((it) => {
    const d = byId[it.id]
    for (let k = 0; k < (it.n || 1); k++) garnish.push({ emoji: d.emoji, i: garnish.length })
  })

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {pouring && (
        <div style={{
          position: 'absolute', top: -h * 0.22, left: '50%', transform: 'translateX(-50%)',
          width: 8, height: h * 0.24, borderRadius: 4, background: streamColor, opacity: 0.9, zIndex: 4,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.35) 0 6px, transparent 6px 22px)',
          backgroundSize: '100% 22px', animation: 'streamFall .25s linear infinite',
        }} />
      )}
      <div
        onClick={onClink}
        title="¡chin chin!"
        style={{
          position: 'relative', width: w, height: h, borderRadius: '14px 14px 24px 24px', cursor: 'pointer',
          background: 'linear-gradient(100deg,rgba(255,255,255,.5),rgba(255,255,255,.12) 32%,rgba(255,255,255,.04) 62%,rgba(255,255,255,.36))',
          border: '2.5px solid rgba(255,240,215,.5)', overflow: 'visible',
          boxShadow: 'inset 0 0 18px rgba(255,255,255,.5),0 16px 36px rgba(0,0,0,.4)',
          animation: pouring ? 'wobble .5s ease-in-out infinite, pourGlow .6s ease infinite' : undefined,
          transformOrigin: 'bottom center',
        }}
      >
        <div style={{ position: 'absolute', inset: 3, borderRadius: '12px 12px 20px 20px', overflow: 'hidden' }}>
          {layers.map((ly) => (
            <div key={ly.key} style={{
              position: 'absolute', left: 0, right: 0, bottom: `${ly.bottom}%`, height: `${ly.height}%`,
              background: ly.color, borderRadius: ly.first ? '0 0 11px 11px' : 0,
              transition: 'height .1s linear, bottom .1s linear',
            }} />
          ))}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: -3, right: -3, height: 10, bottom: `calc(${fillPct}% - 5px)`,
              background: topColor, borderRadius: '50%', filter: 'brightness(1.12) saturate(1.1)',
              boxShadow: `0 0 8px ${topColor}`, transition: 'bottom .1s linear',
            }} />
          )}
          {totalMl > 0 && BUBBLES.map((b, i) => (
            <div key={i} style={{
              position: 'absolute', bottom: 0, left: `${b.left}%`, width: b.size, height: b.size, borderRadius: '50%',
              background: 'rgba(255,255,255,.5)', animation: `bub ${b.dur}s linear infinite`, animationDelay: `${b.delay}s`,
            }} />
          ))}
          {garnish.map((g) => (
            <span key={g.i} style={{
              position: 'absolute', left: `${14 + (g.i % 4) * 24}%`, bottom: `calc(${Math.min(90, fillPct)}% - 18px)`,
              fontSize: 20, animation: `floatY ${2.4 + (g.i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${g.i * 0.25}s`,
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))', pointerEvents: 'none',
            }}>{g.emoji}</span>
          ))}
        </div>
        {dragOver && (
          <div style={{ position: 'absolute', inset: -10, border: '3px dashed #ffd23f', borderRadius: 20, pointerEvents: 'none', animation: 'twinkle 1s ease-in-out infinite' }} />
        )}
        {/* aro y brillos */}
        <div style={{ position: 'absolute', top: -7, left: -2, right: -2, height: 16, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 8, left: 9, width: 12, height: '78%', borderRadius: 8, background: 'linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,255,255,.04))', pointerEvents: 'none' }} />
      </div>
      {/* base/posavasos */}
      <div style={{ width: w * 1.25, height: 15, marginTop: -4, background: 'linear-gradient(180deg,#a06a33,#7a4c20)', border: '3px solid #3d2410', borderRadius: 6, boxShadow: '0 6px 0 #3d2410' }} />
    </div>
  )
}
