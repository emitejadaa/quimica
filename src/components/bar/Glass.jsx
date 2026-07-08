import { byId } from '../../data/catalog.js'
import { byContainer } from '../../data/containers.js'

const INK = '#2b1c0e'

// Geometría por forma de recipiente. `poly` = silueta interior (en % del box) usada
// tanto para el clip-path del líquido como para el contorno cartoon (SVG polygon).
// base = ancho/alto dibujado (se multiplica por sizeK del recipiente y por scale).
const SHAPES = {
  shot: { w: 92, h: 112, poly: [[14, 8], [86, 8], [80, 94], [20, 94]], foot: 'base' },
  glass: { w: 128, h: 214, poly: [[9, 3], [91, 3], [82, 97], [18, 97]], foot: 'base' },
  wine: { w: 150, h: 150, poly: [[12, 5], [88, 5], [85, 30], [74, 55], [58, 73], [50, 78], [42, 73], [26, 55], [15, 30]], foot: 'stem' },
  mug: { w: 150, h: 202, poly: [[10, 5], [90, 5], [90, 95], [10, 95]], foot: 'base', handle: true },
  bottleV: { w: 104, h: 244, poly: [[41, 3], [59, 3], [59, 17], [79, 34], [79, 93], [21, 93], [21, 34], [41, 17]], foot: 'base', cap: true },
}

const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  left: 10 + i * 9,
  size: 4 + (i % 3) * 2,
  dur: (2.6 + (i % 4) * 0.6).toFixed(2),
  delay: (i * 0.32).toFixed(2),
}))

// gotitas de salpicadura al servir
const SPLASH = Array.from({ length: 7 }, (_, i) => ({
  left: 34 + (i - 3) * 9,
  size: 3 + (i % 3),
  dur: (0.5 + (i % 3) * 0.18).toFixed(2),
  delay: (i * 0.09).toFixed(2),
}))

export default function Glass({ added, container = 'grande', activeColor, pouring, dragOver, onClink, scale = 1 }) {
  const C = byContainer[container] || byContainer.grande
  const S = SHAPES[C.shape] || SHAPES.glass
  const cap = C.cap
  const k = C.sizeK * scale
  const w = S.w * k
  const h = S.h * k

  const liquids = added.filter((it) => byId[it.id]?.cat !== 'extra' && it.ml > 0)
  const extras = added.filter((it) => byId[it.id]?.cat === 'extra')
  const totalMl = liquids.reduce((a, it) => a + it.ml, 0)
  const fillPct = Math.min(100, (totalMl / cap) * 100)
  const topColor = liquids.length ? byId[liquids[liquids.length - 1].id].bottle.liquid : 'transparent'
  const streamColor = activeColor || topColor || '#cfe8ff'

  let cum = 0
  const layers = liquids.map((it, i) => {
    const bottom = (cum / cap) * 100
    const height = (it.ml / cap) * 100
    cum += it.ml
    return { key: it.id, bottom, height, color: byId[it.id].bottle.liquid, first: i === 0 }
  })

  const garnish = []
  extras.forEach((it) => {
    const d = byId[it.id]
    for (let n = 0; n < (it.n || 1); n++) garnish.push({ emoji: d.emoji, i: garnish.length })
  })

  const clip = `polygon(${S.poly.map(([x, y]) => `${x}% ${y}%`).join(',')})`
  const polyPts = S.poly.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* chorro + salpicadura */}
      {pouring && (
        <>
          <div style={{
            position: 'absolute', top: -h * 0.22, left: '50%', transform: 'translateX(-50%)',
            width: 8, height: h * 0.24, borderRadius: 4, background: streamColor, opacity: 0.9, zIndex: 4,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.35) 0 6px, transparent 6px 22px)',
            backgroundSize: '100% 22px', animation: 'streamFall .25s linear infinite',
          }} />
          {SPLASH.map((sp, i) => (
            <div key={i} style={{
              position: 'absolute', top: `calc(${100 - Math.min(88, fillPct)}% - 2px)`, left: `${sp.left}%`,
              width: sp.size, height: sp.size, borderRadius: '50%', background: streamColor, zIndex: 5,
              animation: `splash ${sp.dur}s ease-out infinite`, animationDelay: `${sp.delay}s`, pointerEvents: 'none',
            }} />
          ))}
        </>
      )}

      <div style={{ position: 'relative', width: w, height: h }}>
        {/* interior recortado a la silueta */}
        <div
          onClick={onClink}
          title="¡chin chin!"
          style={{
            position: 'absolute', inset: 0, clipPath: clip, WebkitClipPath: clip, overflow: 'hidden', cursor: 'pointer',
            backgroundColor: 'rgba(214,232,246,.14)',
            backgroundImage: 'linear-gradient(104deg,rgba(255,255,255,.62),rgba(255,255,255,.16) 30%,rgba(255,255,255,.06) 56%,rgba(255,255,255,.46))',
            boxShadow: 'inset 0 0 22px rgba(255,255,255,.35)',
            animation: pouring ? 'wobble .5s ease-in-out infinite' : undefined, transformOrigin: 'bottom center',
          }}
        >
          {layers.map((ly) => (
            <div key={ly.key} style={{
              position: 'absolute', left: 0, right: 0, bottom: `${ly.bottom}%`, height: `${ly.height}%`,
              background: ly.color, transition: 'height .1s linear, bottom .1s linear',
            }} />
          ))}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 8, bottom: `calc(${fillPct}% - 4px)`,
              background: topColor, filter: 'brightness(1.14) saturate(1.1)', transition: 'bottom .1s linear',
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
              position: 'absolute', left: `${16 + (g.i % 4) * 22}%`, bottom: `calc(${Math.min(88, fillPct)}% - 16px)`,
              fontSize: 18, animation: `floatY ${2.4 + (g.i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${g.i * 0.25}s`,
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))', pointerEvents: 'none',
            }}>{g.emoji}</span>
          ))}
          {/* condensación cuando hay líquido */}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5, mixBlendMode: 'screen',
              backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 0.7px, transparent 1.4px)',
              backgroundSize: '11px 15px', backgroundPosition: '0 0, 5px 7px',
            }} />
          )}
          {/* brillo vertical */}
          <div style={{ position: 'absolute', top: '6%', left: '9%', width: 10, height: '76%', borderRadius: 8, background: 'linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,255,255,.03))', pointerEvents: 'none' }} />
        </div>

        {/* contorno cartoon + detalles */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={w} height={h}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {S.cap && <rect x="40" y="-3" width="20" height="8" rx="1.8" fill="#3a2a18" stroke={INK} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />}
          <polygon points={polyPts} fill="none" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* boca del recipiente (aro elíptico) */}
          <ellipse
            cx={(S.poly[0][0] + S.poly[1][0]) / 2}
            cy={(S.poly[0][1] + S.poly[1][1]) / 2}
            rx={Math.abs(S.poly[1][0] - S.poly[0][0]) / 2}
            ry={C.shape === 'bottleV' ? 1.6 : 2.6}
            fill="rgba(255,255,255,.16)" stroke={INK} strokeWidth="2.4" vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* asa de la jarra */}
        {S.handle && (
          <svg viewBox="0 0 30 52" width={w * 0.34} height={h * 0.56}
            style={{ position: 'absolute', left: '84%', top: '20%', overflow: 'visible', pointerEvents: 'none' }}>
            <path d="M4 4 h5 a22 24 0 0 1 0 44 h-5" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 4 h5 a22 24 0 0 1 0 44 h-5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}

        {dragOver && (
          <div style={{ position: 'absolute', inset: -10, border: '3px dashed #ffd23f', borderRadius: 20, pointerEvents: 'none', animation: 'twinkle 1s ease-in-out infinite' }} />
        )}
      </div>

      {/* pie: copa lleva tallo+base, el resto un posavasos */}
      {S.foot === 'stem' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -2 }}>
          <div style={{ width: 7 * scale, height: h * 0.42, background: 'linear-gradient(90deg,rgba(255,255,255,.5),rgba(255,255,255,.12))', border: `2px solid ${INK}`, borderTop: 'none', borderBottom: 'none' }} />
          <div style={{ width: w * 0.5, height: 10 * scale, background: 'linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,.12))', border: `2.4px solid ${INK}`, borderRadius: '50%' }} />
          <div style={{ width: w * 0.62, height: 12, marginTop: -3, background: 'linear-gradient(180deg,#a06a33,#7a4c20)', border: '3px solid #3d2410', borderRadius: 6, boxShadow: '0 6px 0 #3d2410' }} />
        </div>
      ) : (
        <div style={{ width: w * 1.12, height: 14, marginTop: -3, background: 'linear-gradient(180deg,#a06a33,#7a4c20)', border: '3px solid #3d2410', borderRadius: 6, boxShadow: '0 6px 0 #3d2410' }} />
      )}
    </div>
  )
}
