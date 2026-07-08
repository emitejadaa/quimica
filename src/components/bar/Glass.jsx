import { useRef, useState, useCallback } from 'react'
import { byId, isFizzy, isBeer } from '../../data/catalog.js'
import { byContainer } from '../../data/containers.js'

const INK = '#2b1c0e'

// ─── Geometría: siluetas CURVAS muestreadas de béziers ───
// Cada forma define su lado derecho (de arriba hacia abajo) con comandos
// ['l',x,y] recta · ['q',cx,cy,x,y] curva. El lado izquierdo se espeja y se
// arma un anillo denso que sirve para el clip-path del líquido, el contorno
// SVG y para calcular el ancho real del vaso a cualquier altura (superficie).
function sampleQ(p0, c, p1, n = 7) {
  const pts = []
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t
    pts.push([
      u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
    ])
  }
  return pts
}

function mkPoly(right) {
  const pts = [[right[0][1], right[0][2]]]
  let cur = pts[0]
  for (let i = 1; i < right.length; i++) {
    const cmd = right[i]
    if (cmd[0] === 'l') { pts.push([cmd[1], cmd[2]]); cur = [cmd[1], cmd[2]] }
    else { const seg = sampleQ(cur, [cmd[1], cmd[2]], [cmd[3], cmd[4]]); pts.push(...seg); cur = seg[seg.length - 1] }
  }
  const left = pts.map(([x, y]) => [100 - x, y])
  // anillo horario: tope izq → tope der → pared der ↓ → fondo → pared izq ↑
  return [left[0], ...pts, ...left.slice(1).reverse()]
}

// mitad del ancho del vaso a una altura y (en % del box) — para la elipse de superficie
function halfWidthAt(poly, y) {
  let right = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]
    if ((y1 <= y && y2 >= y) || (y2 <= y && y1 >= y)) {
      const t = (y - y1) / ((y2 - y1) || 1e-9)
      right = Math.max(right, Math.abs(x1 + (x2 - x1) * t - 50))
    }
  }
  return right || 30
}

const SHAPES = {
  // vasito de shot: paredes gruesas, base pesada
  shot: { w: 132, h: 122, foot: 'base', rimRy: 3.4, floorY: 74,
    poly: mkPoly([['s', 82, 6], ['q', 78, 48, 76, 74], ['q', 75, 90, 62, 93]]) },
  // vaso chico recto con leve conicidad
  tumbler: { w: 142, h: 150, foot: 'base', rimRy: 3.2, floorY: 88,
    poly: mkPoly([['s', 85, 5], ['q', 83, 50, 80, 80], ['q', 79, 93, 68, 96]]) },
  // vaso alto fino con cintura sutil
  highball: { w: 112, h: 212, foot: 'base', rimRy: 2.6,
    poly: mkPoly([['s', 82, 4], ['q', 77, 45, 78, 84], ['q', 78, 94, 66, 96.5]]) },
  // pinta: panza arriba, taper abajo
  pint: { w: 138, h: 224, foot: 'base', rimRy: 3, bulge: true,
    poly: mkPoly([['s', 83, 4], ['q', 88, 16, 85, 28], ['q', 78, 62, 74, 86], ['q', 73, 95, 62, 97]]) },
  // copa: cáliz redondeado + tallo
  wine: { w: 158, h: 150, foot: 'stem', rimRy: 4,
    poly: mkPoly([['s', 84, 6], ['q', 89, 22, 86, 36], ['q', 80, 58, 64, 72], ['q', 56, 77, 51, 78]]) },
  // jarra robusta con facetas y asa
  mug: { w: 164, h: 206, foot: 'base', handle: true, rimRy: 3.2, facets: true,
    poly: mkPoly([['s', 87, 5], ['l', 87.5, 45], ['l', 87, 82], ['q', 87, 94, 74, 96.5]]) },
  // botella con hombros curvos y tapa
  bottleV: { w: 112, h: 240, foot: 'base', cap: true, rimRy: 1.4, neck: true,
    poly: mkPoly([['s', 57, 3], ['l', 57, 15], ['q', 58, 24, 70, 31], ['q', 77, 36, 78, 44], ['l', 78, 86], ['q', 77, 95, 64, 97]]) },
}

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  left: 26 + (i * 4.3) % 48,
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
  { left: 30, top: 16, len: 16, dur: 3.4, delay: 0.2 },
  { left: 42, top: 30, len: 22, dur: 4.6, delay: 1.4 },
  { left: 62, top: 12, len: 18, dur: 3.9, delay: 0.8 },
  { left: 72, top: 36, len: 20, dur: 5.1, delay: 2.1 },
  { left: 52, top: 46, len: 14, dur: 4.2, delay: 3.0 },
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
    position: 'absolute', left: `${28 + (i % 4) * 15}%`, bottom: `calc(var(--gy) - 16px)`,
    animation: `floatY ${2.4 + (i % 3) * 0.5}s ease-in-out ${i * 0.25}s infinite`, pointerEvents: 'none',
  }
  if (id === 'hielo') return <span style={style}><IceCube /></span>
  if (id === 'limon') return <span style={style}><CitrusSlice rind="#e8c020" pulp="#ffe873" /></span>
  return <span style={{ ...style, fontSize: 18, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))' }}>{emoji}</span>
}

export default function Glass({ added, container = 'grande', activeColor, pouring, dragOver, onClink, scale = 1, drain = 0 }) {
  const C = byContainer[container] || byContainer.grande
  const S = SHAPES[C.shape] || SHAPES.pint
  const cap = C.cap
  const k = C.sizeK * scale
  const w = S.w * k
  const h = S.h * k

  // wobble al tocar el vaso (¡chin chin!)
  const [wobble, setWobble] = useState(false)
  const wobT = useRef({ raf: 0, t: 0 })
  const clink = useCallback(() => {
    onClink && onClink()
    setWobble(false)
    cancelAnimationFrame(wobT.current.raf)
    clearTimeout(wobT.current.t)
    wobT.current.raf = requestAnimationFrame(() => setWobble(true))
    wobT.current.t = setTimeout(() => setWobble(false), 560)
  }, [onClink])

  const liquids = added.filter((it) => byId[it.id]?.cat !== 'extra' && it.ml > 0)
  const extras = added.filter((it) => byId[it.id]?.cat === 'extra')
  const totalMl = liquids.reduce((a, it) => a + it.ml, 0)
  const rawFill = Math.min(100, (totalMl / cap) * 100)
  const fillPct = rawFill * (1 - Math.max(0, Math.min(1, drain))) // drenado al tomar
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

  const clip = `polygon(${S.poly.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`
  const polyPts = S.poly.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const mouthCy = S.poly[0][1]
  const mouthRx = Math.abs(50 - S.poly[0][0])
  const mouthRy = S.rimRy
  const surfaceY = 100 - Math.min(94, fillPct) // % del box donde queda la superficie
  const surfHalf = halfWidthAt(S.poly, Math.max(surfaceY, mouthCy + 1))
  const surfW = (surfHalf * 2 - 2) * (w / 100)
  const foamH = Math.max(9, h * 0.06)
  const bubbleSet = anyFizzy ? BUBBLES : BUBBLES.slice(0, 3)

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* chorro + salpicadura + anillos */}
      {pouring && (
        <>
          <div style={{
            position: 'absolute', top: -h * 0.24, left: '50%', transform: 'translateX(-50%)',
            width: 9, height: h * 0.26 + (surfaceY / 100) * h * 0.72, zIndex: 4, borderRadius: 5,
            background: streamColor, opacity: 0.95,
            boxShadow: `0 0 8px ${streamColor}`,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 0 6px, transparent 6px 20px)',
            backgroundSize: '100% 20px', animation: 'streamFall .22s linear infinite, streamWiggle .5s ease-in-out infinite',
          }} />
          <div style={{ position: 'absolute', top: `${surfaceY}%`, left: '50%', width: surfW * 0.8, height: 10, transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none' }}>
            {RIPPLES.map((d, i) => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${streamColor}`, opacity: 0.6,
                animation: `rippleOut 1s ease-out ${d}s infinite`,
              }} />
            ))}
          </div>
          {SPLASH.map((sp, i) => (
            <div key={i} style={{
              position: 'absolute', top: `${surfaceY}%`, left: '50%',
              width: sp.size, height: sp.size, borderRadius: '50%', background: streamColor, zIndex: 6,
              '--dx': `${sp.dx}px`, animation: `splashArc ${sp.dur}s ease-out ${sp.delay}s infinite`, pointerEvents: 'none',
            }} />
          ))}
        </>
      )}

      {/* sombra de contacto + luz caústica teñida por el trago */}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        width: w * 0.9, height: 14, borderRadius: '50%', zIndex: 0,
        background: 'radial-gradient(closest-side, rgba(0,0,0,.42), transparent)',
      }} />
      {totalMl > 0 && (
        <div style={{
          position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
          width: w * 0.64, height: 9, borderRadius: '50%', zIndex: 0,
          background: `radial-gradient(closest-side, ${topColor}, transparent)`, opacity: 0.4, filter: 'blur(1px)',
          transition: 'opacity .3s ease',
        }} />
      )}

      <div style={{
        position: 'relative', width: w, height: h,
        animation: wobble ? 'glassWobble .55s cubic-bezier(.36,.07,.19,.97)' : pouring ? 'pourJiggle .62s ease-in-out infinite' : undefined,
        transform: dragOver && !pouring ? 'scale(1.025)' : undefined, transition: 'transform .2s ease',
        transformOrigin: 'bottom center',
      }}>
        {/* interior recortado a la silueta */}
        <div
          onClick={clink}
          title="¡chin chin!"
          style={{
            position: 'absolute', inset: 0, clipPath: clip, WebkitClipPath: clip, overflow: 'hidden', cursor: 'pointer',
            backgroundColor: 'rgba(228,242,252,.38)',
            backgroundImage: 'linear-gradient(102deg,rgba(255,255,255,.74) 0%,rgba(236,247,255,.30) 24%,rgba(210,232,248,.18) 50%,rgba(240,249,255,.34) 76%,rgba(255,255,255,.62) 100%)',
            boxShadow: 'inset 0 0 22px rgba(255,255,255,.5), inset -10px -6px 18px rgba(70,105,140,.22), inset 10px 8px 16px rgba(255,255,255,.5)',
          }}
        >
          {/* líquido con mezcla suave entre capas */}
          {totalMl > 0 && fillPct > 0.4 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fillPct}%`,
              background: liquidGradient, transition: 'height .12s linear',
            }}>
              {/* volumen: más oscuro a la derecha, brillito a la izquierda */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,.14),rgba(0,0,0,.10)),linear-gradient(90deg,rgba(255,255,255,.10),transparent 30%,transparent 68%,rgba(0,0,0,.14))' }} />
            </div>
          )}
          {/* superficie del líquido: elipse del ancho REAL del vaso a esa altura */}
          {totalMl > 0 && fillPct > 0.4 && (
            <div style={{
              position: 'absolute', left: '50%', width: surfW, height: 10, marginLeft: -surfW / 2,
              bottom: `calc(${fillPct}% - 5px)`,
              background: `radial-gradient(ellipse at 42% 38%, rgba(255,255,255,.34), transparent 60%), ${topColor}`,
              filter: 'brightness(1.16) saturate(1.1)',
              borderRadius: '50%', transition: 'bottom .12s linear, width .12s linear',
              boxShadow: 'inset 0 -2px 3px rgba(0,0,0,.18)',
              animation: pouring ? 'surfaceWave .7s ease-in-out infinite' : undefined,
            }} />
          )}
          {/* espuma de cerveza sobre la superficie */}
          {beerTop && fillPct > 0.4 && (
            <div style={{
              position: 'absolute', left: '50%', width: surfW + 8, marginLeft: -(surfW + 8) / 2, bottom: `calc(${fillPct}% - 3px)`, height: foamH,
              borderRadius: '48% 48% 40% 40% / 70% 70% 30% 30%',
              background: 'radial-gradient(circle at 30% 35%, #fffef9, #f3e7cf)',
              backgroundImage: 'radial-gradient(rgba(255,255,255,.95) 1.3px, transparent 2px), radial-gradient(rgba(210,190,150,.5) 1px, transparent 2px)',
              backgroundSize: '7px 7px, 9px 9px', backgroundPosition: '0 0, 4px 3px',
              boxShadow: 'inset 0 2px 3px rgba(255,255,255,.9), 0 1px 2px rgba(120,90,40,.25)',
              transition: 'bottom .12s linear, width .12s linear', animation: 'foamSettle 2.4s ease-in-out infinite',
            }} />
          )}
          {/* burbujas: muchas y vivas si hay gas, pocas y lentas si es quieta */}
          {totalMl > 0 && fillPct > 3 && bubbleSet.map((b, i) => (
            <div key={i} style={{
              position: 'absolute', bottom: 0, left: `${b.left}%`, width: b.size, height: b.size, borderRadius: '50%',
              background: 'rgba(255,255,255,.55)', boxShadow: 'inset -1px -1px 1px rgba(0,0,0,.08)',
              animation: `bub ${(anyFizzy ? +b.dur : +b.dur * 1.7).toFixed(2)}s linear ${b.delay}s infinite`,
            }} />
          ))}
          {/* garnish (hielo/cítrico dibujados, resto emoji) */}
          <div style={{ position: 'absolute', inset: 0, '--gy': `${Math.min(88, fillPct)}%`, pointerEvents: 'none' }}>
            {garnish.map((g) => <Garnish key={g.i} {...g} />)}
          </div>
          {/* condensación: textura sutil + gotas que resbalan */}
          {totalMl > 0 && fillPct > 5 && (
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
          {/* brillo vertical curvo (izq) + reflejo fino (der) + blob especular */}
          <div style={{ position: 'absolute', top: '8%', left: '16%', width: 10, height: '68%', borderRadius: 999, transform: 'rotate(2.5deg)', background: 'linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.05))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '13%', right: '18%', width: 5, height: '54%', borderRadius: 999, transform: 'rotate(-2deg)', background: 'linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,.02))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '10%', left: '26%', width: '18%', height: '13%', borderRadius: '50%', transform: 'rotate(18deg)', background: 'radial-gradient(closest-side,rgba(255,255,255,.62),transparent)', pointerEvents: 'none' }} />
        </div>

        {/* contorno cartoon + detalles 3D por recipiente */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={w} height={h}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {S.cap && (
            <>
              <rect x="41" y="-6.5" width="18" height="11" rx="2.6" fill="#3a2a18" stroke={INK} strokeWidth="2.8" vectorEffect="non-scaling-stroke" />
              <rect x="41" y="-1.4" width="18" height="2.2" fill="rgba(0,0,0,.28)" />
              <rect x="43.5" y="-5" width="4" height="7" rx="2" fill="#fff" opacity="0.3" />
            </>
          )}
          {/* contorno principal + doble línea interior de brillo */}
          <polygon points={polyPts} fill="none" stroke={INK} strokeWidth="4.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <polygon points={polyPts} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* boca: elipse 3D con labio interior */}
          <ellipse cx="50" cy={mouthCy} rx={mouthRx} ry={mouthRy}
            fill="rgba(210,236,252,.30)" stroke={INK} strokeWidth="3.6" vectorEffect="non-scaling-stroke" />
          <ellipse cx="50" cy={mouthCy + 0.3} rx={mouthRx * 0.84} ry={mouthRy * 0.62}
            fill="rgba(120,160,190,.14)" stroke="rgba(255,255,255,.65)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          {/* piso grueso de vidrio */}
          {S.floorY && (
            <>
              <ellipse cx="50" cy={S.floorY} rx={halfWidthAt(S.poly, S.floorY) - 3.5} ry="2.6"
                fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.6)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              <ellipse cx="50" cy={(S.floorY + 96) / 2} rx={halfWidthAt(S.poly, S.floorY) - 6} ry="1.6"
                fill="rgba(190,220,245,.28)" vectorEffect="non-scaling-stroke" />
            </>
          )}
          {/* facetas de la jarra */}
          {S.facets && (
            <g stroke="rgba(255,255,255,.34)" strokeWidth="2.4" vectorEffect="non-scaling-stroke">
              <line x1="26" y1="10" x2="26" y2="90" />
              <line x1="42" y1="9" x2="42" y2="93" />
              <line x1="58" y1="9" x2="58" y2="93" />
              <line x1="74" y1="10" x2="74" y2="90" />
            </g>
          )}
          {/* anillo del cuello de la botella + brillo del hombro */}
          {S.neck && (
            <>
              <line x1="42.6" y1="15" x2="57.4" y2="15" stroke={INK} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
              <path d="M60 24 Q68 28 72 34" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </>
          )}
          {/* brillo de la panza de la pinta */}
          {S.bulge && (
            <path d="M79 14 Q82 20 80 27" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          )}
          {/* destellos cuando está vacío e impecable */}
          {totalMl === 0 && (
            <g fill="#fff">
              <path d="M24 22 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" opacity="0.9" style={{ animation: 'twinkle 1.8s ease-in-out infinite' }} />
              <path d="M72 40 l1.1 2.8 2.8 1.1 -2.8 1.1 -1.1 2.8 -1.1 -2.8 -2.8 -1.1 2.8 -1.1 Z" opacity="0.75" style={{ animation: 'twinkle 2.3s ease-in-out .6s infinite' }} />
            </g>
          )}
        </svg>

        {/* asa de la jarra */}
        {S.handle && (
          <svg viewBox="0 0 30 52" width={w * 0.36} height={h * 0.58}
            style={{ position: 'absolute', left: '84%', top: '20%', overflow: 'visible', pointerEvents: 'none' }}>
            <path d="M4 3 h6 a24 25 0 0 1 0 46 h-6" fill="none" stroke={INK} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 3 h6 a24 25 0 0 1 0 46 h-6" fill="none" stroke="#cfe8fb" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 5 h5 a20 21 0 0 1 0 42 h-5" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}

        {dragOver && (
          <div style={{ position: 'absolute', inset: -12, border: '3px dashed #ffd23f', borderRadius: 22, pointerEvents: 'none', animation: 'twinkle 1s ease-in-out infinite' }} />
        )}
      </div>

      {/* pie: copa lleva tallo+base, el resto un posavasos redondeado */}
      {S.foot === 'stem' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -h * 0.215, position: 'relative', zIndex: 1 }}>
          <svg width={w * 0.6} height={h * 0.46} viewBox="0 0 60 46" style={{ display: 'block', overflow: 'visible' }}>
            <path d="M27.6 0 Q29 12 24 22 Q20 28 20 31 L40 31 Q40 28 36 22 Q31 12 32.4 0 Z"
              fill="rgba(228,242,252,.55)" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
            <ellipse cx="30" cy="34" rx="17" ry="5" fill="rgba(228,242,252,.6)" stroke={INK} strokeWidth="2.8" />
            <ellipse cx="26" cy="32.6" rx="6" ry="1.6" fill="#fff" opacity="0.7" />
            <line x1="28.6" y1="4" x2="27" y2="18" stroke="#fff" strokeWidth="1.8" opacity="0.8" strokeLinecap="round" />
          </svg>
          <div style={{ width: w * 0.58, height: 12, marginTop: -6, background: 'linear-gradient(180deg,#a06a33,#7a4c20)', border: '3px solid #3d2410', borderRadius: 8, boxShadow: '0 5px 0 #3d2410' }} />
        </div>
      ) : (
        <div style={{
          width: w * 1.08, height: 15, marginTop: -4, position: 'relative', zIndex: 1,
          background: 'linear-gradient(180deg,#b0763a,#7a4c20)', border: '3px solid #3d2410', borderRadius: 8,
          boxShadow: '0 6px 0 #3d2410, inset 0 2px 0 rgba(255,220,170,.3)',
          backgroundImage: 'linear-gradient(180deg,#b0763a,#7a4c20),repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 2px,transparent 2px 14px)',
        }} />
      )}
    </div>
  )
}
