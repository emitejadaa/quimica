import { useState, useRef, useEffect } from 'react'
import { byId } from '../../data/catalog.js'
import { byContainer } from '../../data/containers.js'

const INK = '#2b1c0e'

// Geometría por forma de recipiente. `poly` = silueta interior (en % del box) usada
// tanto para el clip-path del líquido como para el contorno cartoon.
// Formas complejas (copa/jarra/botella) usan polígonos finos para curvas suaves.
const SHAPES = {
  // vaso de trago: base pesada y una leve curva de "vidrio grueso" abajo.
  shot: {
    w: 128, h: 150, foot: 'base',
    poly: [[13, 6], [87, 6], [85, 40], [83, 88], [82, 94], [18, 94], [17, 88], [15, 40]],
  },
  // highball con una entrada suave y paredes apenas cónicas.
  glass: {
    w: 128, h: 210, foot: 'base',
    poly: [[9, 3], [91, 3], [88, 24], [85, 60], [83, 92], [82, 97], [18, 97], [17, 92], [15, 60], [12, 24]],
  },
  // copa: bocha estilo tulipán, boca algo más angosta que el punto más ancho,
  // curva suave y fondo redondeado que baja a encontrarse con el tallo.
  wine: {
    w: 150, h: 150, foot: 'stem',
    poly: [[22, 4], [78, 4], [83, 12], [86, 22], [85, 34], [81, 47], [73, 60], [62, 72], [54, 82], [50, 86], [46, 82], [38, 72], [27, 60], [19, 47], [15, 34], [14, 22], [17, 12]],
  },
  // jarra de cerveza: leve barril, boca ancha y base gruesa; asa aparte.
  mug: {
    w: 168, h: 196, foot: 'base', handle: true,
    poly: [[12, 5], [88, 5], [91, 14], [92, 34], [90, 66], [88, 90], [86, 95], [14, 95], [12, 90], [10, 66], [8, 34], [9, 14]],
  },
  // botella: cuello esbelto, hombro curvo suave y cuerpo alto con base redondeada.
  bottleV: {
    w: 108, h: 232, foot: 'base', cap: true, label: true,
    poly: [[43, 2], [57, 2], [57, 27], [59, 32], [67, 39], [74, 46], [78, 54], [78, 90], [75, 95], [25, 95], [22, 90], [22, 54], [26, 46], [33, 39], [41, 32], [43, 27]],
  },
}

const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  left: 12 + i * 8.5, size: 4 + (i % 3) * 2, dur: (2.6 + (i % 4) * 0.6).toFixed(2), delay: (i * 0.32).toFixed(2),
}))
const SPLASH = Array.from({ length: 7 }, (_, i) => ({
  left: 34 + (i - 3) * 9, size: 3 + (i % 3), dur: (0.5 + (i % 3) * 0.18).toFixed(2), delay: (i * 0.09).toFixed(2),
}))

export default function Glass({ added, container = 'grande', activeColor, pouring, dragOver, onClink, scale = 1 }) {
  const C = byContainer[container] || byContainer.grande
  const S = SHAPES[C.shape] || SHAPES.glass
  const cap = C.cap
  const k = C.sizeK * scale
  const w = S.w * k
  const h = S.h * k

  const [cheers, setCheers] = useState(false)
  const cheerT = useRef(0)
  useEffect(() => () => clearTimeout(cheerT.current), [])
  const doCheers = () => {
    onClink && onClink()
    setCheers(true)
    clearTimeout(cheerT.current)
    cheerT.current = setTimeout(() => setCheers(false), 600)
  }

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
  const rimCx = (S.poly[0][0] + S.poly[1][0]) / 2
  const rimRx = Math.abs(S.poly[1][0] - S.poly[0][0]) / 2
  const rimCy = (S.poly[0][1] + S.poly[1][1]) / 2

  const motionAnim = pouring ? 'wobble .5s ease-in-out infinite'
    : cheers ? 'cheersTilt .6s ease'
      : 'vesselIdle 4.6s ease-in-out infinite'

  return (
    <div className="vessel" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* chorro + salpicadura */}
      {pouring && (
        <>
          <div style={{
            position: 'absolute', top: -h * 0.22, left: '50%', transform: 'translateX(-50%)',
            width: 8, height: h * 0.24, borderRadius: 4, background: streamColor, opacity: 0.9, zIndex: 6,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.35) 0 6px, transparent 6px 22px)',
            backgroundSize: '100% 22px', animation: 'streamFall .25s linear infinite',
          }} />
          {SPLASH.map((sp, i) => (
            <div key={i} style={{
              position: 'absolute', top: `calc(${100 - Math.min(88, fillPct)}% - 2px)`, left: `${sp.left}%`,
              width: sp.size, height: sp.size, borderRadius: '50%', background: streamColor, zIndex: 6,
              animation: `splash ${sp.dur}s ease-out infinite`, animationDelay: `${sp.delay}s`, pointerEvents: 'none',
            }} />
          ))}
        </>
      )}

      {/* cuerpo del recipiente (con animación e interacción) */}
      <div onClick={doCheers} title="¡chin chin! 🥂" style={{
        position: 'relative', width: w, height: h, cursor: 'pointer',
        animation: motionAnim, transformOrigin: 'bottom center', willChange: 'transform',
      }}>
        {/* interior recortado a la silueta */}
        <div style={{
          position: 'absolute', inset: 0, clipPath: clip, WebkitClipPath: clip, overflow: 'hidden',
          backgroundColor: 'rgba(214,232,246,.16)',
          backgroundImage: 'linear-gradient(104deg,rgba(255,255,255,.6),rgba(255,255,255,.14) 32%,rgba(255,255,255,.05) 58%,rgba(255,255,255,.44))',
        }}>
          {layers.map((ly) => (
            <div key={ly.key} style={{
              position: 'absolute', left: 0, right: 0, bottom: `${ly.bottom}%`, height: `${ly.height}%`,
              background: ly.color, transition: 'height .1s linear, bottom .1s linear',
            }} />
          ))}
          {/* superficie elíptica del líquido (3D) */}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', left: '50%', width: '128%', height: 12, bottom: `calc(${fillPct}% - 6px)`,
              transform: 'translateX(-50%)', borderRadius: '50%',
              background: topColor, filter: 'brightness(1.16) saturate(1.12)',
              boxShadow: `0 -1px 4px ${topColor}`, transition: 'bottom .1s linear',
              animation: totalMl > 0 ? 'surfaceSlosh 3.4s ease-in-out infinite' : undefined,
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
          {/* sombreado cilíndrico (bordes oscuros → volumen 3D) */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(90deg,rgba(0,0,0,.22) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 80%,rgba(0,0,0,.24) 100%)' }} />
          {/* condensación */}
          {totalMl > 0 && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5, mixBlendMode: 'screen',
              backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 0.7px, transparent 1.4px)',
              backgroundSize: '11px 15px', backgroundPosition: '0 0, 5px 7px',
            }} />
          )}
          {/* brillo especular */}
          <div style={{ position: 'absolute', top: '7%', left: '11%', width: '11%', height: '74%', borderRadius: 40, background: 'linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.04))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '10%', right: '13%', width: '5%', height: '58%', borderRadius: 40, background: 'linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.02))', pointerEvents: 'none' }} />
        </div>

        {/* contorno cartoon + detalles */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={w} height={h}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {S.cap && (
            <>
              {/* corcho */}
              <rect x="45" y="-9" width="10" height="11" rx="2.5" fill="#c79a5b" stroke={INK} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
              <line x1="47" y1="-4" x2="53" y2="-4" stroke="rgba(0,0,0,.22)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              {/* foil dorado envolviendo el cuello */}
              <path d="M40 2 h20 v8 a3 3 0 0 1 -3 3 h-14 a3 3 0 0 1 -3 -3 z" fill="#caa23a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <line x1="41" y1="7" x2="59" y2="7" stroke="rgba(0,0,0,.20)" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
            </>
          )}
          <polygon points={polyPts} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* facetas de la jarra de cerveza (aro del borde + estrías de vidrio) */}
          {C.shape === 'mug' && (
            <>
              <line x1="11" y1="16" x2="89" y2="16" stroke="rgba(0,0,0,.15)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
              {[24, 40, 56, 72].map((x) => (
                <line key={x} x1={x} y1="21" x2={x} y2="90" stroke="rgba(255,255,255,.13)" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
              ))}
            </>
          )}
          {/* etiqueta cartoon de la botella */}
          {S.label && (
            <>
              <rect x="29" y="60" width="42" height="26" rx="3" fill="rgba(255,246,224,.94)" stroke={INK} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
              <line x1="35" y1="69" x2="65" y2="69" stroke="rgba(43,28,14,.5)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <line x1="35" y1="76" x2="58" y2="76" stroke="rgba(43,28,14,.3)" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </>
          )}
          {/* boca / aro elíptico */}
          <ellipse cx={rimCx} cy={rimCy} rx={rimRx} ry={C.shape === 'bottleV' ? 1.7 : 2.7}
            fill="rgba(255,255,255,.18)" stroke={INK} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* asa de la jarra */}
        {S.handle && (
          <svg viewBox="0 0 32 54" width={w * 0.36} height={h * 0.58}
            style={{ position: 'absolute', left: '82%', top: '19%', overflow: 'visible', pointerEvents: 'none' }}>
            <path d="M4 3 h6 a24 26 0 0 1 0 48 h-6" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 3 h6 a24 26 0 0 1 0 48 h-6" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        )}

        {dragOver && (
          <div style={{ position: 'absolute', inset: -10, border: '3px dashed #ffd23f', borderRadius: 20, pointerEvents: 'none', animation: 'twinkle 1s ease-in-out infinite' }} />
        )}
      </div>

      {/* pie: copa lleva tallo+base, el resto un posavasos; con sombra al piso */}
      {S.foot === 'stem' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -2 }}>
          <div style={{ width: 8 * scale, height: h * 0.4, background: 'linear-gradient(90deg,rgba(255,255,255,.15),rgba(255,255,255,.55),rgba(255,255,255,.12))', border: `2.4px solid ${INK}`, borderTop: 'none', borderBottom: 'none' }} />
          <div style={{ width: w * 0.52, height: 11 * scale, background: 'radial-gradient(circle at 45% 30%,rgba(255,255,255,.6),rgba(255,255,255,.12))', border: `2.6px solid ${INK}`, borderRadius: '50%' }} />
          <div style={{ width: w * 0.42, height: 9, marginTop: 1, borderRadius: '50%', background: 'rgba(0,0,0,.32)', filter: 'blur(2px)' }} />
        </div>
      ) : (
        <>
          <div style={{ width: w * 1.1, height: 14, marginTop: -3, background: 'linear-gradient(180deg,#a06a33,#7a4c20)', border: '3px solid #3d2410', borderRadius: 6, boxShadow: '0 6px 0 #3d2410' }} />
          <div style={{ width: w * 0.9, height: 9, marginTop: 5, borderRadius: '50%', background: 'rgba(0,0,0,.30)', filter: 'blur(2px)' }} />
        </>
      )}
    </div>
  )
}
