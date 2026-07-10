// Botella/lata cartoon dibujada en SVG a partir de un spec de marca.
import { memo } from 'react'
const INK = '#2b1c0e'
const VBW = 100, VBH = 160

function darken(hex, f = 0.72) {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = Math.round(parseInt(n.slice(0, 2), 16) * f)
  const g = Math.round(parseInt(n.slice(2, 4), 16) * f)
  const b = Math.round(parseInt(n.slice(4, 6), 16) * f)
  return `rgb(${r},${g},${b})`
}

function Label({ x, y, w, h, text, bg, ink }) {
  const fs = Math.min(15, (w * 1.7) / Math.max(4, text.length))
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={bg} stroke={INK} strokeWidth="2.4" />
      <line x1={x + 3} y1={y + 3.5} x2={x + w - 3} y2={y + 3.5} stroke={ink} strokeWidth="1" opacity="0.35" />
      <line x1={x + 3} y1={y + h - 3.5} x2={x + w - 3} y2={y + h - 3.5} stroke={ink} strokeWidth="1" opacity="0.35" />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fontSize={fs}
        fill={ink}
        textLength={text.length > 5 ? w - 8 : undefined}
        lengthAdjust="spacingAndGlyphs"
      >
        {text}
      </text>
    </g>
  )
}

function BottleForm({ s }) {
  const bodyX = s.slim ? 30 : s.wide ? 16 : 22
  const bodyW = VBW - bodyX * 2
  const bodyColor = s.clear ? s.liquid : s.glass
  const shoulderY = 48
  return (
    <g>
      {/* cuello con líquido visible si es vidrio transparente */}
      <rect x="42" y="10" width="16" height="40" rx="4" fill={bodyColor} stroke={INK} strokeWidth="3" />
      {/* tapa con filo inferior */}
      <rect x="38" y="4" width="24" height="12" rx="3" fill={s.cap} stroke={INK} strokeWidth="3" />
      <rect x="38" y="12.6" width="24" height="2.4" fill="rgba(0,0,0,.25)" />
      <rect x="41" y="6" width="4.5" height="7" rx="2" fill="#fff" opacity="0.35" />
      <path
        d={`M42 46 Q42 ${shoulderY} ${bodyX} 64 L${bodyX} 142 Q${bodyX} 152 ${bodyX + 10} 152 L${VBW - bodyX - 10} 152 Q${VBW - bodyX} 152 ${VBW - bodyX} 142 L${VBW - bodyX} 64 Q58 ${shoulderY} 58 46 Z`}
        fill={bodyColor}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* base 3D: media elipse de vidrio grueso */}
      <path d={`M${bodyX + 4} 149 Q50 155 ${VBW - bodyX - 4} 149`} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="3" strokeLinecap="round" />
      {/* brillo del hombro */}
      <path d={`M56 50 Q62 54 ${VBW - bodyX - 6} 62`} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.4" strokeLinecap="round" />
      <rect x={bodyX + 4} y="70" width="9" height="72" rx="4" fill="#fff" opacity="0.32" />
      <rect x={VBW - bodyX - 12} y="72" width="6" height="64" rx="3" fill={INK} opacity="0.12" />
      <Label x={bodyX + 8} y="88" w={bodyW - 16} h="34" text={s.label} bg={s.labelBg} ink={s.ink} />
    </g>
  )
}

function CanForm({ s }) {
  const x = s.slim ? 30 : 26
  const w = VBW - x * 2
  return (
    <g>
      <ellipse cx="50" cy="22" rx={w / 2} ry="7" fill={darken(s.glass, 0.6)} stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="21" rx={w / 2 - 5} ry="4.4" fill={darken(s.glass, 0.82)} />
      {/* anillo de apertura */}
      <circle cx="53" cy="20" r="3.6" fill="none" stroke="#cfd3da" strokeWidth="2.2" />
      <rect x="44" y="14" width="9" height="6" rx="2" fill="#cfd3da" stroke={INK} strokeWidth="2" />
      <path
        d={`M${x} 22 L${x} 146 Q${x} 154 ${x + 8} 154 L${VBW - x - 8} 154 Q${VBW - x} 154 ${VBW - x} 146 L${VBW - x} 22`}
        fill={s.glass}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* pliegue superior e inferior de la lata */}
      <line x1={x + 2} y1="30" x2={VBW - x - 2} y2="30" stroke="rgba(0,0,0,.2)" strokeWidth="2" />
      <path d={`M${x + 4} 150 Q50 154.5 ${VBW - x - 4} 150`} fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="2.6" strokeLinecap="round" />
      <rect x={x} y="70" width={w} height="34" fill={s.labelBg} opacity="0.92" />
      <line x1={x} y1="70" x2={VBW - x} y2="70" stroke={INK} strokeWidth="2" />
      <line x1={x} y1="104" x2={VBW - x} y2="104" stroke={INK} strokeWidth="2" />
      <text x="50" y="88" textAnchor="middle" dominantBaseline="central" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize={Math.min(18, (w * 1.7) / Math.max(4, s.label.length))} fill={s.ink} textLength={s.label.length > 5 ? w - 10 : undefined} lengthAdjust="spacingAndGlyphs">{s.label}</text>
      <rect x={x + 4} y="26" width="8" height="120" rx="4" fill="#fff" opacity="0.32" />
      <rect x={VBW - x - 10} y="30" width="5" height="112" rx="2.5" fill={INK} opacity="0.10" />
    </g>
  )
}

function WineForm({ s }) {
  const bodyX = s.wide ? 20 : 24
  const bodyColor = s.clear ? s.liquid : s.glass
  return (
    <g>
      <rect x="42" y="18" width="16" height="46" rx="3" fill={bodyColor} stroke={INK} strokeWidth="3" />
      {/* cápsula del corcho con anillo */}
      <rect x="41" y="8" width="18" height="16" rx="3" fill={s.cap} stroke={INK} strokeWidth="3" />
      <rect x="41" y="19" width="18" height="3" fill="rgba(0,0,0,.28)" />
      <rect x="43.5" y="10" width="4" height="9" rx="2" fill="#fff" opacity="0.3" />
      <path
        d={`M42 60 Q42 74 ${bodyX} 88 L${bodyX} 144 Q${bodyX} 152 ${bodyX + 8} 152 L${VBW - bodyX - 8} 152 Q${VBW - bodyX} 152 ${VBW - bodyX} 144 L${VBW - bodyX} 88 Q58 74 58 60 Z`}
        fill={bodyColor}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d={`M${bodyX + 4} 149 Q50 154 ${VBW - bodyX - 4} 149`} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="3" strokeLinecap="round" />
      <path d={`M58 64 Q66 74 ${VBW - bodyX - 5} 86`} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x={bodyX + 4} y="92" width="8" height="56" rx="4" fill="#fff" opacity="0.3" />
      <Label x={bodyX + 8} y="100" w={VBW - (bodyX + 8) * 2} h="34" text={s.label} bg={s.labelBg} ink={s.ink} />
    </g>
  )
}

function Bottle({ spec, h = 66, bob = false, bobDelay = 0, style }) {
  const w = h * (VBW / VBH)
  const s = spec
  const inner = s.form === 'can' ? <CanForm s={s} /> : s.form === 'wine' ? <WineForm s={s} /> : <BottleForm s={s} />
  return (
    <div
      style={{
        width: w,
        height: h,
        animation: bob ? `bottleBob ${(3 + (bobDelay % 4) * 0.45).toFixed(2)}s ease-in-out ${(bobDelay * 0.19).toFixed(2)}s infinite` : undefined,
        transformOrigin: 'bottom center',
        filter: 'drop-shadow(0 4px 3px rgba(0,0,0,.4))',
        ...style,
      }}
    >
      <svg viewBox={`0 0 ${VBW} ${VBH}`} width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        {inner}
      </svg>
    </div>
  )
}

export default memo(Bottle)
