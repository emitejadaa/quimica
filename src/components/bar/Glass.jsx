import { byId } from '../../data/catalog.js'
import { byContainer } from '../../data/containers.js'

const INK = '#2b1c0e'

// Geometría por forma de recipiente. `poly` = silueta interior (en % del box) usada
// tanto para el clip-path del líquido como para el contorno cartoon (SVG polygon).
// Las siluetas tienen las esquinas inferiores redondeadas (vértices intermedios) para
// un look más suave. `w`/`h` = proporción dibujada (se multiplica por sizeK y scale).
const SHAPES = {
  // shot: bajo, ancho y macizo
  shot: { w: 132, h: 122, foot: 'base',
    poly: [[11, 10], [89, 10], [86, 74], [81, 90], [72, 96], [28, 96], [19, 90], [14, 74]] },
  // tumbler / vaso corto (rocks)
  tumbler: { w: 142, h: 150, foot: 'base',
    poly: [[12, 6], [88, 6], [85, 78], [79, 92], [69, 97], [31, 97], [21, 92], [15, 78]] },
  // highball / vaso alto y esbelto
  highball: { w: 112, h: 212, foot: 'base',
    poly: [[16, 4], [84, 4], [82, 86], [77, 95], [68, 98], [32, 98], [23, 95], [18, 86]] },
  // pint / vaso grande con panza suave
  pint: { w: 138, h: 224, foot: 'base',
    poly: [[19, 4], [81, 4], [84, 30], [82, 68], [77, 90], [69, 97], [31, 97], [23, 90], [18, 68], [16, 30]] },
  // copa de vino: bol + tallo
  wine: { w: 158, h: 150, foot: 'stem',
    poly: [[13, 6], [87, 6], [86, 26], [79, 47], [65, 66], [54, 76], [50, 78], [46, 76], [35, 66], [21, 47], [14, 26]] },
  // jarra grande con asa
  mug: { w: 164, h: 206, foot: 'base', handle: true,
    poly: [[12, 6], [88, 6], [88, 82], [84, 92], [76, 97], [24, 97], [16, 92], [12, 82]] },
  // botella
  bottleV: { w: 112, h: 240, foot: 'base', cap: true,
    poly: [[42, 4], [58, 4], [58, 15], [62, 20], [76, 33], [78, 42], [78, 87], [74, 94], [66, 97], [34, 97], [26, 94], [22, 87], [22, 42], [24, 33], [38, 20], [42, 15]] },
}

const BUBBLES = Array.from({ length: 10 }, (_, i) => ({
  left: 9 + i * 8.4,
  size: 4 + (i % 3) * 2,
  dur: (2.6 + (i % 4) * 0.6).toFixed(2),
  delay: (i * 0.3).toFixed(2),
}))

// gotitas de salpicadura al servir (salen en arco)
const SPLASH = Array.from({ length: 9 }, (_, i) => ({
  dx: (i - 4) * 8,
  size: 3 + (i % 3),
  dur: (0.55 + (i % 3) * 0.16).toFixed(2),
  delay: (i * 0.08).toFixed(2),
}))

// anillos concéntricos en la superficie del líquido mientras se sirve
const RIPPLES = [0, 0.45, 0.9]

export default function Glass({ added, container = 'grande', activeColor, pouring, dragOver, onClink, scale = 1 }) {
  const C = byContainer[container] || byContainer.grande
  const S = SHAPES[C.shape] || SHAPES.pint
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
  // boca del recipiente (aro elíptico) a partir de los dos vértices superiores
  const mouthCx = (S.poly[0][0] + S.poly[1][0]) / 2
  const mouthCy = (S.poly[0][1] + S.poly[1][1]) / 2
  const mouthRx = Math.abs(S.poly[1][0] - S.poly[0][0]) / 2
  const mouthRy = C.shape === 'bottleV' ? 1.5 : 2.6
  const surfaceTop = `calc(${100 - Math.min(94, fillPct)}% - 3px)`

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* chorro + salpicadura + anillos */}
      {pouring && (
        <>
          <div style={{
            position: 'absolute', top: -h * 0.24, left: '50%', transform: 'translateX(-50%)',
            width: 9, height: h * 0.26, zIndex: 4, borderRadius: 5,
            background: streamColor, opacity: 0.95,
            boxShadow: `0 0 8px ${streamColor}`,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 0 6px, transparent 6px 20px)',
            backgroundSize: '100% 20px', animation: 'streamFall .22s linear infinite, streamWiggle .5s ease-in-out infinite',
          }} />
          <div style={{ position: 'absolute', top: surfaceTop, left: '50%', width: mouthRx * 2 * (w / 100) * 0.8, height: 10, transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none' }}>
            {RIPPLES.map((d, i) => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${streamColor}`, opacity: 0.6,
                animation: `rippleOut 1s ease-out infinite`, animationDelay: `${d}s`,
              }} />
            ))}
          </div>
          {SPLASH.map((sp, i) => (
            <div key={i} style={{
              position: 'absolute', top: surfaceTop, left: '50%',
              width: sp.size, height: sp.size, borderRadius: '50%', background: streamColor, zIndex: 6,
              '--dx': `${sp.dx}px`, animation: `splashArc ${sp.dur}s ease-out infinite`, animationDelay: `${sp.delay}s`, pointerEvents: 'none',
            }} />
          ))}
        </>
      )}

      {/* sombra de contacto en el piso */}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        width: w * 0.9, height: 14, borderRadius: '50%', zIndex: 0,
        background: 'radial-gradient(closest-side, rgba(0,0,0,.42), transparent)',
      }} />

      <div style={{
        position: 'relative', width: w, height: h,
        animation: pouring ? 'pourJiggle .62s ease-in-out infinite' : undefined, transformOrigin: 'bottom center',
      }}>
        {/* interior recortado a la silueta */}
        <div
          onClick={onClink}
          title="¡chin chin!"
          style={{
            position: 'absolute', inset: 0, clipPath: clip, WebkitClipPath: clip, overflow: 'hidden', cursor: 'pointer',
            backgroundColor: 'rgba(228,242,252,.40)',
            backgroundImage: 'linear-gradient(102deg,rgba(255,255,255,.72) 0%,rgba(236,247,255,.34) 26%,rgba(214,235,250,.24) 52%,rgba(240,249,255,.36) 74%,rgba(255,255,255,.6) 100%)',
            boxShadow: 'inset 0 0 22px rgba(255,255,255,.5), inset 0 -14px 20px rgba(70,105,140,.2), inset 0 8px 14px rgba(255,255,255,.5)',
          }}
        >
          {layers.map((ly) => (
            <div key={ly.key} style={{
              position: 'absolute', left: 0, right: 0, bottom: `${ly.bottom}%`, height: `${ly.height}%`,
              background: ly.color,
              backgroundImage: 'linear-gradient(180deg,rgba(255,255,255,.14),rgba(0,0,0,.10))',
              transition: 'height .12s linear, bottom .12s linear',
            }} />
          ))}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 9, bottom: `calc(${fillPct}% - 4px)`,
              background: topColor, filter: 'brightness(1.18) saturate(1.12)',
              borderRadius: '50%', transition: 'bottom .12s linear',
              animation: pouring ? 'surfaceWave .7s ease-in-out infinite' : undefined,
            }} />
          )}
          {totalMl > 0 && BUBBLES.map((b, i) => (
            <div key={i} style={{
              position: 'absolute', bottom: 0, left: `${b.left}%`, width: b.size, height: b.size, borderRadius: '50%',
              background: 'rgba(255,255,255,.55)', animation: `bub ${b.dur}s linear infinite`, animationDelay: `${b.delay}s`,
            }} />
          ))}
          {garnish.map((g) => (
            <span key={g.i} style={{
              position: 'absolute', left: `${16 + (g.i % 4) * 22}%`, bottom: `calc(${Math.min(88, fillPct)}% - 16px)`,
              fontSize: 18, animation: `floatY ${2.4 + (g.i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${g.i * 0.25}s`,
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))', pointerEvents: 'none',
            }}>{g.emoji}</span>
          ))}
          {/* condensación sutil sólo sobre el líquido */}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.min(100, fillPct)}%`,
              pointerEvents: 'none', opacity: 0.32, mixBlendMode: 'screen',
              backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 0.7px, transparent 1.6px)',
              backgroundSize: '13px 17px', backgroundPosition: '0 0, 6px 8px',
            }} />
          )}
          {/* brillo vertical suave (izq) + reflejo fino (der) + blob especular */}
          <div style={{ position: 'absolute', top: '7%', left: '11%', width: 11, height: '72%', borderRadius: 999, background: 'linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.06))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '12%', right: '13%', width: 5, height: '58%', borderRadius: 999, background: 'linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,.03))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '10%', left: '24%', width: '20%', height: '15%', borderRadius: '50%', transform: 'rotate(18deg)', background: 'radial-gradient(closest-side,rgba(255,255,255,.6),transparent)', pointerEvents: 'none' }} />
        </div>

        {/* contorno cartoon + detalles */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={w} height={h}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {S.cap && (
            <>
              <rect x="41" y="-6" width="18" height="10" rx="2.4" fill="#3a2a18" stroke={INK} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
              <rect x="43.5" y="-4.5" width="4" height="7" rx="2" fill="#fff" opacity="0.28" />
            </>
          )}
          {/* contorno exterior grueso (borde cartoon) */}
          <polygon points={polyPts} fill="none" stroke={INK} strokeWidth="4.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* filo interior claro (da grosor de vidrio) */}
          <polygon points={polyPts} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* boca del recipiente (aro elíptico) */}
          <ellipse cx={mouthCx} cy={mouthCy} rx={mouthRx} ry={mouthRy}
            fill="rgba(224,244,255,.28)" stroke={INK} strokeWidth="3.4" vectorEffect="non-scaling-stroke" />
          <ellipse cx={mouthCx} cy={mouthCy - 0.4} rx={mouthRx * 0.82} ry={mouthRy * 0.7}
            fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* asa de la jarra */}
        {S.handle && (
          <svg viewBox="0 0 30 52" width={w * 0.36} height={h * 0.58}
            style={{ position: 'absolute', left: '82%', top: '20%', overflow: 'visible', pointerEvents: 'none' }}>
            <path d="M4 3 h6 a24 25 0 0 1 0 46 h-6" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 3 h6 a24 25 0 0 1 0 46 h-6" fill="none" stroke="#cfe8fb" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 5 h5 a20 21 0 0 1 0 42 h-5" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}

        {dragOver && (
          <div style={{ position: 'absolute', inset: -12, border: '3px dashed #ffd23f', borderRadius: 22, pointerEvents: 'none', animation: 'twinkle 1s ease-in-out infinite' }} />
        )}
      </div>

      {/* pie: copa lleva tallo+base, el resto un posavasos redondeado */}
      {S.foot === 'stem' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -2, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 8 * scale, height: h * 0.4, background: 'linear-gradient(90deg,rgba(255,255,255,.62),rgba(190,220,245,.14) 55%,rgba(255,255,255,.3))', border: `2.4px solid ${INK}`, borderTop: 'none', borderBottom: 'none' }} />
          <div style={{ width: w * 0.52, height: 11 * scale, background: 'radial-gradient(closest-side,rgba(255,255,255,.55),rgba(190,220,245,.16))', border: `2.6px solid ${INK}`, borderRadius: '50%' }} />
          <div style={{ width: w * 0.6, height: 13, marginTop: -3, background: 'linear-gradient(180deg,#a06a33,#7a4c20)', border: '3px solid #3d2410', borderRadius: 8, boxShadow: '0 5px 0 #3d2410' }} />
        </div>
      ) : (
        <div style={{ width: w * 1.1, height: 15, marginTop: -4, position: 'relative', zIndex: 1, background: 'linear-gradient(180deg,#b0763a,#7a4c20)', border: '3px solid #3d2410', borderRadius: 8, boxShadow: '0 6px 0 #3d2410, inset 0 2px 0 rgba(255,220,170,.3)' }} />
      )}
    </div>
  )
}
