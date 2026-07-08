import { useRef, useState, useEffect, useCallback, useId } from 'react'
import { bacAt, fmtH, comma } from '../../logic/calc.js'

// Coordenadas normalizadas 0..100 (el SVG se estira con preserveAspectRatio="none";
// los strokes se mantienen parejos con vector-effect; los markers redondos van como overlays HTML).
const PX0 = 4, PX1 = 97, PY0 = 8, PY1 = 84

export default function BacCurve({ Cpeak, tpeak, tZero, horasNow, onScrub }) {
  const plotRef = useRef(null)
  const rafRef = useRef(0)
  const uid = useId().replace(/:/g, '')
  const [t, setT] = useState(horasNow)
  const [playing, setPlaying] = useState(false)

  const tEnd = Math.max(tZero, horasNow, 1) * 1.05
  const ymax = Math.max(Cpeak * 1.18, 0.6)
  const X = (tt) => PX0 + (tt / tEnd) * (PX1 - PX0)
  const Y = (c) => PY1 - (Math.min(c, ymax) / ymax) * (PY1 - PY0)

  const N = 60
  const pts = []
  for (let i = 0; i <= N; i++) { const tt = (tEnd * i) / N; pts.push(`${X(tt).toFixed(2)},${Y(bacAt(tt, Cpeak, tpeak)).toFixed(2)}`) }
  const line = pts.join(' ')
  const area = `${X(0)},${PY1} ${line} ${X(tEnd)},${PY1}`
  const showLimit = 0.5 < ymax
  const y05 = Y(0.5)
  const bacT = bacAt(t, Cpeak, tpeak)

  const report = useCallback((tt) => onScrub && onScrub(tt, bacAt(tt, Cpeak, tpeak)), [onScrub, Cpeak, tpeak])
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
      {/* header con LECTURA FIJA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, color: '#fff', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 16 }}>📈 Alcohol en sangre · <span style={{ color: '#ffd23f' }}>arrastrá la línea</span></span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ background: '#14100a', border: '2.5px solid #ffd23f', borderRadius: 999, padding: '3px 12px', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14, color: '#ffd23f', whiteSpace: 'nowrap' }}>
            ⏱ {fmtH(t)} · {comma(bacT, 2)} g/L
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
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {showLimit && <line x1={PX0} y1={y05} x2={PX1} y2={y05} stroke="#ff8a8a" strokeWidth="1.4" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
          <polygon points={area} fill={`url(#area${uid})`} />
          <polyline points={line} fill="none" stroke="#ffd23f" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <line x1={X(t)} y1={PY0} x2={X(t)} y2={PY1} stroke="#ffd23f" strokeWidth="1.6" opacity="0.85" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* overlays HTML (redondos, sin distorsión) */}
        {showLimit && <div style={{ position: 'absolute', left: '1%', top: `${y05}%`, transform: 'translateY(-115%)', fontSize: 10, fontWeight: 800, color: '#ff8a8a', pointerEvents: 'none' }}>0,5 límite</div>}
        {/* pico */}
        <div style={dot(X(tpeak), Y(Cpeak), { width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2.5px solid #ffb03a', boxSizing: 'border-box' })} />
        <div style={{ position: 'absolute', left: `${X(tpeak)}%`, top: `${Y(Cpeak)}%`, transform: 'translate(-50%,-190%)', fontSize: 10, fontWeight: 800, color: '#fff', pointerEvents: 'none', whiteSpace: 'nowrap' }}>pico {comma(Cpeak, 2)}</div>
        {/* handle scrubber */}
        <div style={dot(X(t), Y(bacT), { width: 18, height: 18, borderRadius: '50%', background: '#fff6e6', border: '3px solid #e08a1e', boxSizing: 'border-box', boxShadow: '0 0 8px rgba(255,210,63,.8)' })} />
        {/* labels ejes */}
        <div style={{ position: 'absolute', left: `${PX0}%`, bottom: -2, fontSize: 10, color: '#cfe3d4', pointerEvents: 'none' }}>empezó</div>
        <div style={{ position: 'absolute', right: '2%', bottom: -2, fontSize: 10, color: '#cfe3d4', pointerEvents: 'none' }}>{fmtH(tEnd)}</div>
      </div>
    </div>
  )
}
