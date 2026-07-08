import { useId, memo } from 'react'
import { poseFromState, bodyAnim, mix, lerp } from './pose.js'

const INK = '#241a12'
const VBW = 220, VBH = 290

function Arm({ x, angle, skin, ink, sleeve }) {
  return (
    <g transform={`rotate(${angle} ${x} 172)`}>
      <rect x={x - 9} y="166" width="18" height="18" rx="8" fill={sleeve} stroke={ink} strokeWidth="3.2" />
      <rect x={x - 7} y="180" width="15" height="32" rx="7.5" fill={skin} stroke={ink} strokeWidth="3.2" />
      <circle cx={x + 0.5} cy="216" r="10" fill={skin} stroke={ink} strokeWidth="3.2" />
      <ellipse cx={x - 3} cy="213" rx="2.6" ry="3.4" fill="rgba(0,0,0,.10)" />
    </g>
  )
}

function Eye({ cx, p, ink }) {
  const eyeStyle = p.canBlink
    ? { transformBox: 'fill-box', transformOrigin: 'center', animation: `blink ${(4 + cx % 2).toFixed(1)}s ease-in-out infinite` }
    : { transformBox: 'fill-box', transformOrigin: 'center', transform: `scaleY(${p.eyeOpen})`, transition: 'transform .18s ease' }
  return (
    <g style={eyeStyle}>
      <ellipse cx={cx} cy="94" rx="14" ry="16.5" fill="#fff" stroke={ink} strokeWidth="3.2" />
      {p.xeyes ? (
        <g stroke={ink} strokeWidth="3.6" strokeLinecap="round">
          <line x1={cx - 7} y1="86" x2={cx + 7} y2="102" />
          <line x1={cx + 7} y1="86" x2={cx - 7} y2="102" />
        </g>
      ) : (
        <g transform={`translate(${p.pupilDX} ${p.pupilDY})`}>
          <circle cx={cx} cy="96" r="8.5" fill="#6b4a2a" />
          <circle cx={cx} cy="96" r="4.6" fill={ink} />
          <circle cx={cx - 3} cy="92" r="2.6" fill="#fff" />
        </g>
      )}
    </g>
  )
}

function Brow({ cx, dir, p, ink }) {
  const y = 66 - p.browRaise
  const ang = dir * (-p.browWorry * 20 + p.browDrunk * 10)
  return (
    <g transform={`translate(${cx} ${y}) rotate(${ang})`} style={{ transition: 'transform .18s ease' }}>
      <rect x="-13" y="-3.5" width="26" height="7" rx="3.5" fill="#8a5a2b" stroke={ink} strokeWidth="2" />
    </g>
  )
}

function Mouth({ p, ink }) {
  if (p.mouthOpen > 0.28) {
    const rx = lerp(9, 15, p.mouthOpen)
    const ry = lerp(6, 17, p.mouthOpen)
    const cy = 130 + ry * 0.2
    return (
      <g>
        <ellipse cx="110" cy={cy} rx={rx} ry={ry} fill="#6e241a" stroke={ink} strokeWidth="3.2" />
        <path d={`M${110 - rx + 2} ${cy - ry + 3} Q110 ${cy - ry + 1} ${110 + rx - 2} ${cy - ry + 3}`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="110" cy={cy + ry * 0.42} rx={rx * 0.62} ry={ry * 0.4} fill="#d9605a" />
      </g>
    )
  }
  const cy = 128 + p.mouthCurve * 15
  return (
    <g>
      <path d={`M92 128 Q110 ${cy} 128 128`} fill="none" stroke={ink} strokeWidth="4.4" strokeLinecap="round" />
      {p.mouthCurve > 0.2 && <path d={`M99 ${128 + p.mouthCurve * 6} Q110 ${cy + 3} 121 ${128 + p.mouthCurve * 6}`} fill="none" stroke="#e88" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />}
    </g>
  )
}

function Drop({ x, y, delay }) {
  return (
    <path d={`M${x} ${y} q-5 7 0 12 q5 -5 0 -12 z`} fill="#8fd4ff" stroke={INK} strokeWidth="2"
      style={{ animation: 'sweatDrop 1.4s ease-in infinite', animationDelay: `${delay}s`, transformOrigin: `${x}px ${y}px` }} />
  )
}

function AvatarBase({ fear = 0, drunk = 0, drinking = false, scale = 1, accent = '#ffb03a', bump = false, bubble = null, onPoke }) {
  const p = poseFromState({ fear, drunk, drinking })
  const anim = bodyAnim({ fear, drunk, drinking, bump })
  const uid = useId().replace(/:/g, '')
  const skin = '#f6c98a'
  const skinLo = mix('#f6c98a', '#c98a4b', 0.5)
  const hairLo = mix(accent, '#a85a10', 0.55)
  const shirt = '#e8563f'
  const shirtLo = mix(shirt, '#8a1f14', 0.5)
  const W = 150 * scale, H = 205 * scale
  const shadowRx = lerp(52, 70, drunk)
  // brazos en reposo pegados al cuerpo; solo el derecho sube con el vaso al tomar
  const armL = 11
  const armR = drinking ? -124 : -11

  return (
    <div onClick={onPoke} style={{ position: 'relative', width: W, height: H, cursor: onPoke ? 'pointer' : 'default', flex: '0 0 auto' }}>
      {bubble && (
        <div style={{
          position: 'absolute', top: -4 * scale, left: '60%', background: '#fff6e6', border: `${2.4 * scale}px solid ${INK}`,
          borderRadius: `${12 * scale}px ${12 * scale}px ${12 * scale}px 2px`, padding: `${3 * scale}px ${9 * scale}px`,
          fontFamily: 'Patrick Hand, cursive', fontSize: 15 * scale, zIndex: 9, whiteSpace: 'nowrap', color: INK,
        }}>{bubble}</div>
      )}
      <div style={{ width: '100%', height: '100%', animation: anim, transformOrigin: 'bottom center', willChange: 'transform' }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <radialGradient id={`skin${uid}`} cx="42%" cy="34%" r="72%">
              <stop offset="0%" stopColor="#ffe6c0" />
              <stop offset="100%" stopColor={skin} />
            </radialGradient>
            <linearGradient id={`hair${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={mix(accent, '#fff', 0.25)} />
              <stop offset="100%" stopColor={hairLo} />
            </linearGradient>
            <linearGradient id={`shirt${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={mix(shirt, '#fff', 0.12)} />
              <stop offset="100%" stopColor={shirtLo} />
            </linearGradient>
          </defs>

          {/* sombra */}
          <ellipse cx="110" cy="280" rx={shadowRx} ry="11" fill="rgba(0,0,0,.30)" />

          {/* piernas + zapatos */}
          <rect x="92" y="228" width="15" height="34" rx="7" fill="#3f4a5c" stroke={INK} strokeWidth="3.2" />
          <rect x="113" y="228" width="15" height="34" rx="7" fill="#3f4a5c" stroke={INK} strokeWidth="3.2" />
          <ellipse cx="97" cy="264" rx="15" ry="8" fill="#2b3240" stroke={INK} strokeWidth="3" />
          <ellipse cx="123" cy="264" rx="15" ry="8" fill="#2b3240" stroke={INK} strokeWidth="3" />
          <ellipse cx="93" cy="261" rx="5" ry="2.4" fill="rgba(255,255,255,.3)" />
          <ellipse cx="119" cy="261" rx="5" ry="2.4" fill="rgba(255,255,255,.3)" />

          {/* brazos detrás */}
          <Arm x={72} angle={armL} skin={skin} sleeve={shirt} ink={INK} />
          <Arm x={148} angle={armR} skin={skin} sleeve={shirt} ink={INK} />

          {/* cuerpo (remera) */}
          <path d="M64 172 Q66 160 80 158 L140 158 Q154 160 156 172 L150 232 Q150 240 138 240 L82 240 Q70 240 70 232 Z"
            fill={`url(#shirt${uid})`} stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
          {/* sombra lateral del cuerpo */}
          <path d="M156 172 L150 232 Q150 240 138 240 L126 240 L134 172 Z" fill="rgba(0,0,0,.12)" />
          {/* cuello */}
          <rect x="97" y="150" width="26" height="18" rx="4" fill={skinLo} stroke={INK} strokeWidth="3" />
          {/* collar + moñito */}
          <path d="M92 158 L110 172 L98 176 Z" fill="#fff6e6" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M128 158 L110 172 L122 176 Z" fill="#fff6e6" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M102 170 L110 176 L102 182 Z" fill={accent} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M118 170 L110 176 L118 182 Z" fill={accent} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="110" cy="176" r="3.4" fill={hairLo} stroke={INK} strokeWidth="2" />
          {/* botones */}
          <circle cx="110" cy="196" r="2.6" fill="rgba(0,0,0,.25)" />
          <circle cx="110" cy="212" r="2.6" fill="rgba(0,0,0,.25)" />

          {/* CABEZA */}
          <g transform={`rotate(${p.headTilt} 110 100)`} style={{ transition: 'transform .25s ease', transformBox: 'fill-box' }}>
            {/* orejas */}
            <circle cx="46" cy="100" r="10" fill={skin} stroke={INK} strokeWidth="3.2" />
            <circle cx="174" cy="100" r="10" fill={skin} stroke={INK} strokeWidth="3.2" />
            <circle cx="46" cy="100" r="4" fill="rgba(0,0,0,.12)" />
            <circle cx="174" cy="100" r="4" fill="rgba(0,0,0,.12)" />
            {/* cara */}
            <ellipse cx="110" cy="96" rx="66" ry="61" fill={`url(#skin${uid})`} stroke={INK} strokeWidth="3.6" />
            {/* sombra de mentón */}
            <path d="M58 118 Q110 168 162 118 Q150 152 110 154 Q70 152 58 118 Z" fill="rgba(0,0,0,.06)" />
            {/* tinte verde náusea */}
            {p.green > 0 && <ellipse cx="110" cy="112" rx="60" ry="48" fill="#7fae5a" opacity={p.green * 0.42} style={{ mixBlendMode: 'multiply' }} />}
            {/* pelo */}
            <path d="M44 84 Q40 30 110 30 Q180 30 176 84 Q170 60 150 58 Q158 44 140 40 Q150 56 120 54 Q128 38 104 40 Q112 54 84 56 Q92 44 74 50 Q84 60 60 62 Q50 66 44 84 Z"
              fill={`url(#hair${uid})`} stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
            {/* cachetes */}
            <ellipse cx="72" cy="118" rx="13" ry="8" fill="#ff8a7a" opacity={p.blush} />
            <ellipse cx="148" cy="118" rx="13" ry="8" fill="#ff8a7a" opacity={p.blush} />
            {/* pecas */}
            <g fill="#c98a5a" opacity="0.5"><circle cx="70" cy="112" r="1.5" /><circle cx="76" cy="116" r="1.3" /><circle cx="150" cy="112" r="1.5" /><circle cx="144" cy="116" r="1.3" /></g>
            {/* cejas */}
            <Brow cx={84} dir={1} p={p} ink={INK} />
            <Brow cx={136} dir={-1} p={p} ink={INK} />
            {/* ojos */}
            <Eye cx={84} p={p} ink={INK} />
            <Eye cx={136} p={p} ink={INK} />
            {/* nariz */}
            <path d="M105 106 Q110 116 115 106" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
            {/* boca */}
            <Mouth p={p} ink={INK} />
            {/* sudor */}
            {Array.from({ length: p.sweatN }).map((_, i) => (
              <Drop key={i} x={i % 2 ? 168 : 50} y={72 + i * 8} delay={i * 0.4} />
            ))}
          </g>

          {/* vaso al tomar */}
          {drinking && (
            <g transform="translate(120 108) rotate(30)">
              <rect x="0" y="-4" width="28" height="36" rx="5" fill="rgba(220,240,255,.55)" stroke={INK} strokeWidth="3" />
              <rect x="3" y="6" width="22" height="20" rx="3" fill={accent} opacity="0.9" />
              <rect x="5" y="-1" width="5" height="26" rx="2.5" fill="rgba(255,255,255,.6)" />
            </g>
          )}

          {/* símbolos flotantes */}
          {p.floats.map((f, i) => (
            <text key={f.key} x={f.x} y={f.y} fontSize="24"
              style={{ animation: `floatY ${2 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>{f.c}</text>
          ))}
        </svg>
      </div>
    </div>
  )
}

const Avatar = memo(AvatarBase)
export default Avatar
