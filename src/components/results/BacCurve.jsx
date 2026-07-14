import { useRef, useState, useEffect, useCallback, useId } from 'react'
import { clockLabel, comma } from '../../logic/calc.js'
import { ClockFace, hourDegAt, minuteDegAt } from '../Clock.jsx'

// Coordenadas normalizadas 0..100 (el SVG se estira con preserveAspectRatio="none";
// los strokes se mantienen parejos con vector-effect; los markers redondos van como overlays HTML).
const PX0 = 4, PX1 = 97, PY0 = 8, PY1 = 84

// Curva de alcoholemia de la noche completa: cada ronda sube en su hora de reloj
// y el hígado va bajando la curva. El scrubber mueve un reloj animado (con minutero).
export default function BacCurve({ series, doses = [], hoursNow, onScrub }) {
  const plotRef = useRef(null)
  const rafRef = useRef(0)
  const uid = useId().replace(/:/g, '')
  const [t, setT] = useState(hoursNow)
  const [playing, setPlaying] = useState(false)

  // si la hora del bar cambió (volvió y siguió la noche), el scrubber salta a "ahora"
  useEffect(() => { setT(hoursNow) }, [hoursNow])

  const tEnd = Math.max(series.tZero, hoursNow, 1) * 1.05
  const ymax = Math.max(series.peak * 1.18, 0.6)
  const X = (tt) => PX0 + (tt / tEnd) * (PX1 - PX0)
  const Y = (c) => PY1 - (Math.min(c, ymax) / ymax) * (PY1 - PY0)

  const N = 140
  const pts = []
  for (let i = 0; i <= N; i++) { const tt = (tEnd * i) / N; pts.push(`${X(tt).toFixed(2)},${Y(series.at(tt)).toFixed(2)}`) }
  const line = pts.join(' ')
  const area = `${X(0)},${PY1} ${line} ${X(tEnd)},${PY1}`
  const showLimit = 0.5 < ymax
  const y05 = Y(0.5)
  const bacT = series.at(t)

  // grilla de horas de reloj (21:00, 22:00, …) con etiquetas espaciadas según el rango
  const hourStep = tEnd > 14 ? 3 : tEnd > 7 ? 2 : 1
  const gridHours = []
  for (let h = 0; h <= Math.floor(tEnd); h++) gridHours.push(h)

  const report = useCallback((tt) => onScrub && onScrub(tt, series.at(tt)), [onScrub, series])
  useEffect(() => { report(t) }, [t, report])

  const setFromX = (clientX) => {
    const el = plotRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const pctX = ((clientX - r.left) / r.width) * 100
    setT(Math.max(0, Math.min(tEnd, ((pctX - PX0) / (PX1 - PX0)) * tEnd)))
  }
  const onDown = (e) => { setPlaying(false); e.currentTarget.setPointerCapture?.(e.pointerId); setFromX(e.clientX) }
  const onMove = (e) => { if (e.buttons) setFromX(e.clientX) }

  const play = () => {
    if (playing) { setPlaying(false); cancelAnimationFrame(rafRef.current); return }
    setPlaying(true)
    const t0 = performance.now()
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 8000)
      setT(k * tEnd)
      if (k < 1) rafRef.current = requestAnimationFrame(step)
      else setPlaying(false)
    }
    rafRef.current = requestAnimationFrame(step)
  }
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const dot = (leftPct, topPct, extra) => ({
    position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', ...extra,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'linear-gradient(180deg,#2f3e34,#26332b)', border: '4px solid #8a5a2b', borderRadius: 16, padding: '8px 12px 10px', boxShadow: 'inset 0 0 26px rgba(0,0,0,.35)' }}>
      {/* header: reloj animado que sigue al scrubber + lectura fija */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, color: '#fff', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 16 }}>📈 Alcohol en sangre</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.4))' }}>
            <ClockFace hourDeg={hourDegAt(t)} minuteDeg={minuteDegAt(t)} size={44} />
          </div>
          <div style={{ background: '#14100a', border: '2.5px solid #ffd23f', borderRadius: 999, padding: '3px 12px', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14, color: '#ffd23f', whiteSpace: 'nowrap' }}>
            🕐 {clockLabel(t)} · {comma(bacT, 2)} g/L
          </div>
          <button onClick={play} style={{ background: '#ffb03a', border: '3px solid #14100a', borderRadius: 999, padding: '3px 12px', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 0 #14100a', whiteSpace: 'nowrap' }}>{playing ? '⏸' : '▶'}</button>
        </div>
      </div>

      {/* área del gráfico: ocupa TODO el espacio disponible */}
      <div ref={plotRef} onPointerDown={onDown} onPointerMove={onMove}
        style={{ position: 'relative', flex: 1, minHeight: 120, cursor: 'ew-resize', touchAction: 'none' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <defs>
            <linearGradient id={`area${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd23f" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffb03a" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {showLimit && <rect x={PX0} y={PY0} width={PX1 - PX0} height={y05 - PY0} fill="#e8384f" opacity="0.13" />}
          <rect x={PX0} y={showLimit ? y05 : PY0} width={PX1 - PX0} height={PY1 - (showLimit ? y05 : PY0)} fill="#2f9e44" opacity="0.12" />
          {/* grilla vertical: una línea por hora de reloj */}
          {gridHours.slice(1).map((h) => (
            <line key={h} x1={X(h)} y1={PY0} x2={X(h)} y2={PY1} stroke="rgba(255,255,255,.09)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {showLimit && <line x1={PX0} y1={y05} x2={PX1} y2={y05} stroke="#ff8a8a" strokeWidth="1.4" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
          {/* "ahora": la hora actual del reloj del bar */}
          <line x1={X(hoursNow)} y1={PY0} x2={X(hoursNow)} y2={PY1} stroke="#9fe3ff" strokeWidth="1.4" strokeDasharray="3 4" opacity="0.8" vectorEffect="non-scaling-stroke" />
          <polygon points={area} fill={`url(#area${uid})`} />
          <polyline points={line} fill="none" stroke="#ffd23f" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <line x1={X(t)} y1={PY0} x2={X(t)} y2={PY1} stroke="#ffd23f" strokeWidth="1.6" opacity="0.85" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* overlays HTML (redondos, sin distorsión) */}
        {showLimit && <div style={{ position: 'absolute', left: '1%', top: `${y05}%`, transform: 'translateY(-115%)', fontSize: 10, fontWeight: 800, color: '#ff8a8a', pointerEvents: 'none' }}>0,5 límite</div>}
        {/* etiqueta de "ahora" */}
        <div style={{ position: 'absolute', left: `${X(hoursNow)}%`, top: `${PY0}%`, transform: 'translate(-50%,-108%)', fontSize: 9.5, fontWeight: 800, color: '#9fe3ff', pointerEvents: 'none', whiteSpace: 'nowrap' }}>ahora</div>
        {/* rondas: en qué hora de reloj se tomó cada una */}
        {doses.map((d, i) => (
          <div key={i} title={`ronda de las ${clockLabel(d.t)}`} style={{ position: 'absolute', left: `${X(d.t)}%`, top: `${PY1}%`, transform: 'translate(-50%,-62%)', fontSize: 11, pointerEvents: 'none', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.6))' }}>🥃</div>
        ))}
        {/* pico */}
        <div style={dot(X(series.tAtPeak), Y(series.peak), { width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2.5px solid #ffb03a', boxSizing: 'border-box' })} />
        <div style={{ position: 'absolute', left: `${X(series.tAtPeak)}%`, top: `${Y(series.peak)}%`, transform: 'translate(-50%,-190%)', fontSize: 10, fontWeight: 800, color: '#fff', pointerEvents: 'none', whiteSpace: 'nowrap' }}>pico {comma(series.peak, 2)}</div>
        {/* handle scrubber */}
        <div style={dot(X(t), Y(bacT), { width: 18, height: 18, borderRadius: '50%', background: '#fff6e6', border: '3px solid #e08a1e', boxSizing: 'border-box', boxShadow: '0 0 8px rgba(255,210,63,.8)' })} />
        {/* eje X: horas de reloj */}
        {gridHours.filter((h) => h % hourStep === 0).map((h) => (
          <div key={h} style={{ position: 'absolute', left: `${X(h)}%`, bottom: -2, transform: h === 0 ? 'translateX(-12%)' : 'translateX(-50%)', fontSize: 9.5, color: '#cfe3d4', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{clockLabel(h)}</div>
        ))}
      </div>
    </div>
  )
}
