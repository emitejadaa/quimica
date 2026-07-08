import { byId, isFizzy, isBeer } from '../../data/catalog.js'
import { byContainer } from '../../data/containers.js'

const INK = '#2b1c0e'

// Geometría por forma de recipiente. `poly` = silueta interior (en % del box) usada
// tanto para el clip-path del líquido como para el contorno cartoon (SVG polygon).
// Las siluetas tienen las esquinas inferiores redondeadas (vértices intermedios) para
// un look más suave. `w`/`h` = proporción dibujada (se multiplica por sizeK y scale).
const SHAPES = {
  shot: { w: 132, h: 122, foot: 'base',
    poly: [[11, 10], [89, 10], [86, 74], [81, 90], [72, 96], [28, 96], [19, 90], [14, 74]] },
  tumbler: { w: 142, h: 150, foot: 'base',
    poly: [[12, 6], [88, 6], [85, 78], [79, 92], [69, 97], [31, 97], [21, 92], [15, 78]] },
  highball: { w: 112, h: 212, foot: 'base',
    poly: [[16, 4], [84, 4], [82, 86], [77, 95], [68, 98], [32, 98], [23, 95], [18, 86]] },
  pint: { w: 138, h: 224, foot: 'base',
    poly: [[19, 4], [81, 4], [84, 30], [82, 68], [77, 90], [69, 97], [31, 97], [23, 90], [18, 68], [16, 30]] },
  wine: { w: 158, h: 150, foot: 'stem',
    poly: [[13, 6], [87, 6], [86, 26], [79, 47], [65, 66], [54, 76], [50, 78], [46, 76], [35, 66], [21, 47], [14, 26]] },
  mug: { w: 164, h: 206, foot: 'base', handle: true,
    poly: [[12, 6], [88, 6], [88, 82], [84, 92], [76, 97], [24, 97], [16, 92], [12, 82]] },
  bottleV: { w: 112, h: 240, foot: 'base', cap: true,
    poly: [[42, 4], [58, 4], [58, 15], [62, 20], [76, 33], [78, 42], [78, 87], [74, 94], [66, 97], [34, 97], [26, 94], [22, 87], [22, 42], [24, 33], [38, 20], [42, 15]] },
}

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  left: 8 + i * 7.2,
  size: 4 + (i % 3) * 2,
  dur: (2.4 + (i % 4) * 0.6).toFixed(2),
  delay: (i * 0.26).toFixed(2),
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

// gotas de condensación que resbalan por el vaso frío
const DRIPS = [
  { left: 22, top: 16, len: 16, dur: 3.4, delay: 0.2 },
  { left: 38, top: 30, len: 22, dur: 4.6, delay: 1.4 },
  { left: 64, top: 12, len: 18, dur: 3.9, delay: 0.8 },
  { left: 78, top: 36, len: 20, dur: 5.1, delay: 2.1 },
  { left: 50, top: 46, len: 14, dur: 4.2, delay: 3.0 },
]

// Cubito de hielo cartoon (reemplaza el emoji 🧊)
function IceCube({ s = 20 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.28))' }}>
      <path d="M4 8 L12 4 L20 8 L20 17 L12 21 L4 17 Z" fill="rgba(214,240,255,.72)" stroke="rgba(255,255,255,.9)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 8 L12 12 L20 8" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 12 L12 21" fill="none" stroke="rgba(120,170,205,.6)" strokeWidth="1.2" />
      <path d="M6 9 L9 11" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

// Rodaja de cítrico cartoon (reemplaza el emoji 🍋)
function CitrusSlice({ s = 22, rind = '#e8c020', pulp = '#ffe873' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))' }}>
      <circle cx="12" cy="12" r="10.5" fill={rind} stroke="#b7920f" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="8" fill={pulp} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <line key={i} x1="12" y1="12" x2={12 + Math.cos(a) * 7.6} y2={12 + Math.sin(a) * 7.6} stroke="#f2c235" strokeWidth="1.1" />
      })}
      <circle cx="12" cy="12" r="1.8" fill="#fff6cf" />
      <circle cx="9" cy="8.5" r="1.4" fill="#fff" opacity="0.55" />
    </svg>
  )
}

function Garnish({ id, emoji, i }) {
  const style = {
    position: 'absolute', left: `${16 + (i % 4) * 22}%`, bottom: `calc(var(--gy) - 16px)`,
    animation: `floatY ${2.4 + (i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.25}s`, pointerEvents: 'none',
  }
  if (id === 'hielo') return <span style={style}><IceCube /></span>
  if (id === 'limon') return <span style={style}><CitrusSlice rind="#e8c020" pulp="#ffe873" /></span>
  return <span style={{ ...style, fontSize: 18, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))' }}>{emoji}</span>
}

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
  const topId = liquids.length ? liquids[liquids.length - 1].id : null
  const topColor = topId ? byId[topId].bottle.liquid : 'transparent'
  const streamColor = activeColor || topColor || '#cfe8ff'
  const anyFizzy = liquids.some((it) => isFizzy(it.id))
  const beerTop = topId && isBeer(topId)

  // Mezcla suave entre capas: un único gradiente con zonas de transición en cada borde.
  const gradStops = []
  if (liquids.length && totalMl > 0) {
    gradStops.push(`${byId[liquids[0].id].bottle.liquid} 0%`)
    let acc = 0
    for (let i = 0; i < liquids.length - 1; i++) {
      acc += liquids[i].ml
      const p = (acc / totalMl) * 100
      gradStops.push(`${byId[liquids[i].id].bottle.liquid} ${Math.max(0, p - 5).toFixed(1)}%`)
      gradStops.push(`${byId[liquids[i + 1].id].bottle.liquid} ${Math.min(100, p + 5).toFixed(1)}%`)
    }
    gradStops.push(`${byId[liquids[liquids.length - 1].id].bottle.liquid} 100%`)
  }
  const liquidGradient = `linear-gradient(to top, ${gradStops.join(', ')})`

  // sal/azúcar no flotan: van escarchados en el borde (rimExtra). El resto flota.
  const garnish = []
  extras.forEach((it) => {
    if (it.id === 'sal' || it.id === 'azucar') return
    const d = byId[it.id]
    for (let n = 0; n < (it.n || 1); n++) garnish.push({ id: it.id, emoji: d.emoji, i: garnish.length })
  })
  const rimExtra = extras.find((e) => e.id === 'sal' || e.id === 'azucar')

  const clip = `polygon(${S.poly.map(([x, y]) => `${x}% ${y}%`).join(',')})`
  const polyPts = S.poly.map(([x, y]) => `${x},${y}`).join(' ')
  const mouthCx = (S.poly[0][0] + S.poly[1][0]) / 2
  const mouthCy = (S.poly[0][1] + S.poly[1][1]) / 2
  const mouthRx = Math.abs(S.poly[1][0] - S.poly[0][0]) / 2
  const mouthRy = C.shape === 'bottleV' ? 1.5 : 2.6
  const surfaceTop = `calc(${100 - Math.min(94, fillPct)}% - 3px)`
  const foamH = Math.max(9, h * 0.06)
  const bubbleSet = anyFizzy ? BUBBLES : BUBBLES.slice(0, 3)

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
          {/* líquido con mezcla suave entre capas */}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fillPct}%`,
              background: liquidGradient, transition: 'height .12s linear',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,.14),rgba(0,0,0,.10))' }} />
            </div>
          )}
          {/* superficie del líquido */}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 9, bottom: `calc(${fillPct}% - 4px)`,
              background: topColor, filter: 'brightness(1.18) saturate(1.12)',
              borderRadius: '50%', transition: 'bottom .12s linear',
              animation: pouring ? 'surfaceWave .7s ease-in-out infinite' : undefined,
            }} />
          )}
          {/* espuma de cerveza sobre la superficie */}
          {beerTop && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: `calc(${fillPct}% - 3px)`, height: foamH,
              borderRadius: '48% 48% 40% 40% / 70% 70% 30% 30%',
              background: 'radial-gradient(circle at 30% 35%, #fffef9, #f3e7cf)',
              backgroundImage: 'radial-gradient(rgba(255,255,255,.95) 1.3px, transparent 2px), radial-gradient(rgba(210,190,150,.5) 1px, transparent 2px)',
              backgroundSize: '7px 7px, 9px 9px', backgroundPosition: '0 0, 4px 3px',
              boxShadow: 'inset 0 2px 3px rgba(255,255,255,.9), 0 1px 2px rgba(120,90,40,.25)',
              transition: 'bottom .12s linear', animation: 'foamSettle 2.4s ease-in-out infinite',
            }} />
          )}
          {/* burbujas: muchas y vivas si hay gas, pocas y lentas si es quieta */}
          {totalMl > 0 && bubbleSet.map((b, i) => (
            <div key={i} style={{
              position: 'absolute', bottom: 0, left: `${b.left}%`, width: b.size, height: b.size, borderRadius: '50%',
              background: 'rgba(255,255,255,.55)',
              animation: `bub ${(anyFizzy ? +b.dur : +b.dur * 1.7).toFixed(2)}s linear infinite`, animationDelay: `${b.delay}s`,
            }} />
          ))}
          {/* garnish (hielo/cítrico dibujados, resto emoji) */}
          <div style={{ position: 'absolute', inset: 0, '--gy': `${Math.min(88, fillPct)}%`, pointerEvents: 'none' }}>
            {garnish.map((g) => <Garnish key={g.i} {...g} />)}
          </div>
          {/* condensación: textura sutil + gotas que resbalan */}
          {totalMl > 0 && (
            <>
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.min(100, fillPct)}%`,
                pointerEvents: 'none', opacity: 0.26, mixBlendMode: 'screen',
                backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 0.7px, transparent 1.6px)',
                backgroundSize: '13px 17px', backgroundPosition: '0 0, 6px 8px',
              }} />
              {DRIPS.map((d, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${d.left}%`, top: `${d.top}%`, width: 4, height: 5,
                  borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  background: 'linear-gradient(180deg,rgba(255,255,255,.85),rgba(210,235,250,.5))',
                  '--len': `${d.len}px`, animation: `dripDown ${d.dur}s ease-in ${d.delay}s infinite`, pointerEvents: 'none',
                }} />
              ))}
            </>
          )}
          {/* borde escarchado (sal/azúcar): costra de cristales en el filo del vaso */}
          {rimExtra && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(16, h * 0.11), pointerEvents: 'none',
              backgroundImage: rimExtra.id === 'sal'
                ? 'radial-gradient(rgba(255,255,255,.98) 2px, transparent 2.8px), radial-gradient(rgba(214,232,245,.9) 1.6px, transparent 2.4px), linear-gradient(180deg,rgba(238,247,255,.7),rgba(238,247,255,0))'
                : 'radial-gradient(rgba(255,255,255,.95) 1.7px, transparent 2.5px), radial-gradient(rgba(255,246,214,.9) 1.3px, transparent 2.1px), linear-gradient(180deg,rgba(255,252,240,.72),rgba(255,252,240,0))',
              backgroundSize: '7px 7px, 9px 8px, 100% 100%', backgroundPosition: '0 0, 4px 4px, 0 0',
              WebkitMaskImage: 'radial-gradient(120% 100% at 50% -10%, #000 60%, transparent 80%)', maskImage: 'radial-gradient(120% 100% at 50% -10%, #000 60%, transparent 80%)',
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
          <polygon points={polyPts} fill="none" stroke={INK} strokeWidth="4.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <polygon points={polyPts} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
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
