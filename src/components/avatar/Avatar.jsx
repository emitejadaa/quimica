import { useId, memo } from 'react'
import { poseFromState, bodyAnim, mix, lerp, clamp } from './pose.js'

const INK = '#241a12'
const VBW = 220, VBH = 290

function Arm({ x, angle, skin, ink, sleeve, wob }) {
  return (
    <g transform={`rotate(${angle} ${x} 172)`} style={{ transition: 'transform .3s ease' }}>
      <rect x={x - 9} y="166" width="18" height="18" rx="8" fill={sleeve} stroke={ink} strokeWidth="3.2" />
      <path d={`M${x - 9} 182 Q${x - 3} 180 ${x + 9} 182`} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="2" />
      <rect x={x - 7} y="180" width="15" height="32" rx="7.5" fill={skin} stroke={ink} strokeWidth="3.2"
        style={wob ? { transformBox: 'fill-box', transformOrigin: 'top center', animation: 'armWobble 1.1s ease-in-out infinite' } : undefined} />
      {/* mano con pulgar */}
      <circle cx={x + 0.5} cy="216" r="10" fill={skin} stroke={ink} strokeWidth="3.2" />
      <circle cx={x - 8} cy="212" r="4" fill={skin} stroke={ink} strokeWidth="2.4" />
      <path d={`M${x - 4} 214 q3 4 7 3`} fill="none" stroke="rgba(0,0,0,.16)" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
}

function Eye({ cx, p, ink, skin }) {
  const eyeStyle = p.canBlink
    ? { transformBox: 'fill-box', transformOrigin: 'center', animation: `blink ${(4 + (cx % 3)).toFixed(1)}s ease-in-out infinite` }
    : { transformBox: 'fill-box', transformOrigin: 'center', transform: `scaleY(${p.sleepLids ? 1 : p.eyeOpen})`, transition: 'transform .18s ease' }

  if (p.sleepLids) {
    // ojos cerrados plácidos: dos arcos con pestañitas
    return (
      <g>
        <path d={`M${cx - 13} 96 Q${cx} 106 ${cx + 13} 96`} fill="none" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
        <line x1={cx - 11} y1="100" x2={cx - 13} y2="104" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
        <line x1={cx + 11} y1="100" x2={cx + 13} y2="104" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    )
  }
  return (
    <g style={eyeStyle}>
      <ellipse cx={cx} cy="94" rx="14" ry="16.5" fill="#fff" stroke={ink} strokeWidth="3.2" />
      {p.xeyes ? (
        <g stroke={ink} strokeWidth="3.6" strokeLinecap="round">
          <line x1={cx - 7} y1="86" x2={cx + 7} y2="102" />
          <line x1={cx + 7} y1="86" x2={cx - 7} y2="102" />
        </g>
      ) : (
        <>
          <g transform={`translate(${p.pupilDX} ${p.pupilDY})`}>
            <circle cx={cx} cy="96" r="8.5" fill="#6b4a2a" />
            <circle cx={cx} cy="96" r="4.6" fill={ink} />
            <circle cx={cx - 3} cy="92" r="2.6" fill="#fff" />
            <circle cx={cx + 3.4} cy="99" r="1.3" fill="#fff" opacity="0.8" />
          </g>
          {/* párpado caído (borrachera): baja desde arriba */}
          {p.lidDroop > 0.04 && (
            <path
              d={`M${cx - 14.5} ${94 - 16} a14.5 17 0 0 1 29 0 l0 ${p.lidDroop * 17} q-14.5 ${6 * p.lidDroop} -29 0 Z`}
              fill={skin} stroke={ink} strokeWidth="2.4" style={{ transition: 'd .2s ease' }}
            />
          )}
        </>
      )}
    </g>
  )
}

function Brow({ cx, dir, p, ink }) {
  const y = 66 - p.browRaise
  const ang = dir * (-p.browWorry * 20 + p.browDrunk * 12)
  return (
    <g transform={`translate(${cx} ${y}) rotate(${ang})`} style={{ transition: 'transform .18s ease' }}>
      <path d="M-13 2 Q0 -4 13 2 L13 4.5 Q0 -0.5 -13 4.5 Z" fill="#8a5a2b" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    </g>
  )
}

function Mouth({ p, ink }) {
  if (p.tongue > 0) {
    // muerto: boca abierta con lengua colgando
    return (
      <g>
        <ellipse cx="110" cy="132" rx="11" ry="9" fill="#6e241a" stroke={ink} strokeWidth="3.2" />
        <path d="M104 136 Q104 150 111 152 Q118 150 116 138 Q113 141 104 136 Z" fill="#e87f8a" stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
        <line x1="110" y1="140" x2="110.5" y2="148" stroke="rgba(0,0,0,.25)" strokeWidth="1.6" />
      </g>
    )
  }
  if (p.mouthOpen > 0.28) {
    const rx = lerp(9, 16, p.mouthOpen)
    const ry = lerp(6, 18, p.mouthOpen)
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
      style={{ animation: `sweatDrop 1.4s ease-in ${delay}s infinite`, transformOrigin: `${x}px ${y}px` }} />
  )
}

// Partículas del vómito: arco verde saliendo de la boca (transitorio, ~2 s).
const VOMIT_DROPS = [
  { vx: -26, vy: 46, s: 5.5, dur: 0.55, delay: 0 },
  { vx: -38, vy: 52, s: 4, dur: 0.6, delay: 0.1 },
  { vx: -16, vy: 42, s: 6.5, dur: 0.5, delay: 0.18 },
  { vx: -32, vy: 58, s: 3.4, dur: 0.65, delay: 0.28 },
  { vx: -22, vy: 50, s: 5, dur: 0.58, delay: 0.36 },
  { vx: -42, vy: 44, s: 3, dur: 0.7, delay: 0.44 },
]

function VomitFX({ ink }) {
  return (
    <g>
      {/* chorro principal */}
      <path d="M100 142 Q76 150 66 186 Q64 194 70 196 Q80 196 84 178 Q92 156 104 152 Z"
        fill="#8fbf4a" stroke={ink} strokeWidth="2.8" strokeLinejoin="round" opacity="0.95"
        style={{ animation: 'vomitStream .5s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'top right' }} />
      {VOMIT_DROPS.map((d, i) => (
        <circle key={i} cx="100" cy="146" r={d.s} fill="#a4d05a" stroke={ink} strokeWidth="2"
          style={{ '--vx': `${d.vx}px`, '--vy': `${d.vy}px`, animation: `vomitDrop ${d.dur}s ease-in ${d.delay}s infinite` }} />
      ))}
      {/* charco */}
      <ellipse cx="64" cy="278" rx="26" ry="7" fill="#8fbf4a" stroke={ink} strokeWidth="2.6"
        style={{ animation: 'puddleGrow .9s ease-out forwards', transformBox: 'fill-box', transformOrigin: 'center' }} />
      <ellipse cx="56" cy="276.5" rx="5" ry="1.8" fill="#c8e88a" style={{ animation: 'puddleGrow 1.1s ease-out forwards', transformBox: 'fill-box', transformOrigin: 'center' }} />
    </g>
  )
}

function SleepFX({ ink }) {
  return (
    <g>
      {/* globo de ronquido en la nariz */}
      <circle cx="122" cy="114" r="7" fill="rgba(190,230,255,.75)" stroke={ink} strokeWidth="2.2"
        style={{ animation: 'snoreBubble 3.4s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: '30% 80%' }} />
      {[0, 1, 2].map((i) => (
        <text key={i} x={150 + i * 16} y={70 - i * 16} fontSize={15 + i * 4} fontFamily="Fredoka, sans-serif" fontWeight="700" fill="#9db8e8" stroke={ink} strokeWidth="0.8"
          style={{ animation: `zzz 2.6s ease-in-out ${i * 0.8}s infinite` }}>z</text>
      ))}
    </g>
  )
}

function AvatarBase({
  fear = 0, drunk = 0, drinking = false, drinkK = 0, drinkColor = '#e3a90f',
  mode = 'ok', scale = 1, accent = '#ffb03a', bump = false, bubble = null, onPoke,
}) {
  const p = poseFromState({ fear, drunk, drinking, mode })
  const anim = bodyAnim({ fear, drunk, drinking, bump, mode })
  const uid = useId().replace(/:/g, '')
  const dead = mode === 'dead'
  const skin = '#f6c98a'
  const skinLo = mix('#f6c98a', '#c98a4b', 0.5)
  const hairLo = mix(accent, '#a85a10', 0.55)
  const shirt = '#e8563f'
  const shirtLo = mix(shirt, '#8a1f14', 0.5)
  const W = 150 * scale, H = 205 * scale
  const shadowRx = lerp(52, 70, drunk)
  // brazos en reposo pegados al cuerpo; solo el derecho sube con el vaso al tomar
  const armL = mode === 'sleep' ? 16 : 11
  const armR = drinking ? -124 : mode === 'sleep' ? -16 : -11
  const liqH = 20 * (1 - clamp(drinkK)) // líquido del vasito mientras traga

  return (
    <div onClick={onPoke} style={{ position: 'relative', width: W, height: H, cursor: onPoke ? 'pointer' : 'default', flex: '0 0 auto' }}>
      {bubble && !dead && (
        <div style={{
          position: 'absolute', top: -4 * scale, left: '60%', background: '#fff6e6', border: `${2.4 * scale}px solid ${INK}`,
          borderRadius: `${12 * scale}px ${12 * scale}px ${12 * scale}px 2px`, padding: `${3 * scale}px ${9 * scale}px`,
          fontFamily: 'Patrick Hand, cursive', fontSize: 15 * scale, zIndex: 9, whiteSpace: 'nowrap', color: INK,
          animation: 'popIn .25s ease',
        }}>{bubble}</div>
      )}

      {/* fantasmita que sube cuando muere (fuera del cuerpo: no rota con la caída) */}
      {dead && (
        <div style={{ position: 'absolute', left: '30%', top: '8%', zIndex: 8, pointerEvents: 'none', animation: 'ghostRise 3s ease-in 0.9s infinite' }}>
          <svg width={34 * scale + 14} height={40 * scale + 14} viewBox="0 0 34 40">
            <path d="M17 2 Q30 4 30 20 L30 34 L25 30 L21 35 L17 30 L13 35 L9 30 L4 34 L4 20 Q4 4 17 2 Z"
              fill="rgba(255,255,255,.92)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="12" cy="16" r="2.4" fill={INK} />
            <circle cx="22" cy="16" r="2.4" fill={INK} />
            <path d="M13 23 Q17 26 21 23" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* sombra en el piso (fija, no rota con la caída) */}
      <div style={{
        position: 'absolute', bottom: 2 * scale, left: '50%', transform: 'translateX(-50%)',
        width: (dead ? 130 : shadowRx * 1.5) * scale, height: 14 * scale, borderRadius: '50%',
        background: 'rgba(0,0,0,.30)', transition: 'width .5s ease',
      }} />

      <div style={{ width: '100%', height: '100%', animation: anim, transformOrigin: '46% 96%', willChange: 'transform' }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} width={W} height={H}
          style={{ display: 'block', overflow: 'visible', filter: dead ? 'saturate(.55) brightness(.96)' : undefined, transition: 'filter .6s ease' }}>
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
            <linearGradient id={`jean${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a5870" />
              <stop offset="100%" stopColor="#38445a" />
            </linearGradient>
          </defs>

          {/* piernas + zapatillas con cordones */}
          <rect x="92" y="228" width="15" height="34" rx="7" fill={`url(#jean${uid})`} stroke={INK} strokeWidth="3.2" />
          <rect x="113" y="228" width="15" height="34" rx="7" fill={`url(#jean${uid})`} stroke={INK} strokeWidth="3.2" />
          <path d="M92 236 h15 M113 236 h15" stroke="rgba(0,0,0,.2)" strokeWidth="2" />
          <ellipse cx="97" cy="264" rx="15" ry="8" fill="#2b3240" stroke={INK} strokeWidth="3" />
          <ellipse cx="123" cy="264" rx="15" ry="8" fill="#2b3240" stroke={INK} strokeWidth="3" />
          <path d="M88 262 q4 -3 9 -2 M114 262 q4 -3 9 -2" stroke="#fff" strokeWidth="1.8" fill="none" opacity="0.7" strokeLinecap="round" />
          <ellipse cx="93" cy="261" rx="5" ry="2.4" fill="rgba(255,255,255,.3)" />
          <ellipse cx="119" cy="261" rx="5" ry="2.4" fill="rgba(255,255,255,.3)" />

          {/* brazos detrás */}
          <Arm x={72} angle={armL} skin={skin} sleeve={shirt} ink={INK} wob={p.drunk > 0.5 && !drinking && mode === 'ok'} />
          <Arm x={148} angle={armR} skin={skin} sleeve={shirt} ink={INK} wob={false} />

          {/* cuerpo (remera) */}
          <path d="M64 172 Q66 160 80 158 L140 158 Q154 160 156 172 L150 232 Q150 240 138 240 L82 240 Q70 240 70 232 Z"
            fill={`url(#shirt${uid})`} stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
          {/* sombra lateral + arrugas */}
          <path d="M156 172 L150 232 Q150 240 138 240 L126 240 L134 172 Z" fill="rgba(0,0,0,.12)" />
          <path d="M76 206 q8 4 16 1 M74 222 q7 4 14 2" stroke="rgba(0,0,0,.14)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* bolsillo */}
          <path d="M84 196 h20 v13 q0 4 -4 4 h-12 q-4 0 -4 -4 Z" fill="rgba(255,255,255,.16)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          {/* cinturón */}
          <rect x="72" y="236" width="76" height="9" rx="4" fill="#5a3a1c" stroke={INK} strokeWidth="2.6" />
          <rect x="103" y="235.5" width="14" height="10" rx="2.5" fill="#e0b34a" stroke={INK} strokeWidth="2.2" />
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
            {/* aureola (muerto) */}
            {p.halo && (
              <g style={{ animation: 'haloFloat 2.2s ease-in-out infinite' }}>
                <ellipse cx="110" cy="16" rx="26" ry="7.5" fill="none" stroke="#ffd23f" strokeWidth="6" opacity="0.95" />
                <ellipse cx="110" cy="16" rx="26" ry="7.5" fill="none" stroke="#fff6c0" strokeWidth="2" />
              </g>
            )}
            {/* orejas */}
            <circle cx="46" cy="100" r="10" fill={skin} stroke={INK} strokeWidth="3.2" />
            <circle cx="174" cy="100" r="10" fill={skin} stroke={INK} strokeWidth="3.2" />
            <path d="M43 98 q3 4 6 4 M171 98 q3 4 6 4" stroke="rgba(0,0,0,.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* cara */}
            <ellipse cx="110" cy="96" rx="66" ry="61" fill={`url(#skin${uid})`} stroke={INK} strokeWidth="3.6" />
            {/* sombra de mentón */}
            <path d="M58 118 Q110 168 162 118 Q150 152 110 154 Q70 152 58 118 Z" fill="rgba(0,0,0,.06)" />
            {/* tinte verde náusea */}
            {p.green > 0 && <ellipse cx="110" cy="112" rx="60" ry="48" fill="#7fae5a" opacity={p.green * 0.42} style={{ mixBlendMode: 'multiply', transition: 'opacity .4s ease' }} />}
            {/* pelo con más mechones + patillas */}
            <path d="M46 96 L46 112 Q50 104 54 98 Z M174 96 L174 112 Q170 104 166 98 Z" fill={`url(#hair${uid})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M44 84 Q40 30 110 30 Q180 30 176 84 Q170 60 150 58 Q158 44 140 40 Q150 56 120 54 Q128 38 104 40 Q112 54 84 56 Q92 44 74 50 Q84 60 60 62 Q50 66 44 84 Z"
              fill={`url(#hair${uid})`} stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
            {/* brillo del pelo */}
            <path d="M78 40 Q102 32 128 38" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="4" strokeLinecap="round" />
            <path d="M136 42 Q146 44 152 50" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="3" strokeLinecap="round" />
            {/* cachetes */}
            <ellipse cx="72" cy="118" rx="13" ry="8" fill="#ff8a7a" opacity={p.blush} style={{ transition: 'opacity .3s ease' }} />
            <ellipse cx="148" cy="118" rx="13" ry="8" fill="#ff8a7a" opacity={p.blush} style={{ transition: 'opacity .3s ease' }} />
            {/* pecas */}
            <g fill="#c98a5a" opacity="0.5"><circle cx="70" cy="112" r="1.5" /><circle cx="76" cy="116" r="1.3" /><circle cx="150" cy="112" r="1.5" /><circle cx="144" cy="116" r="1.3" /></g>
            {/* cejas */}
            <Brow cx={84} dir={1} p={p} ink={INK} />
            <Brow cx={136} dir={-1} p={p} ink={INK} />
            {/* ojos */}
            <Eye cx={84} p={p} ink={INK} skin={skin} />
            <Eye cx={136} p={p} ink={INK} skin={skin} />
            {/* nariz */}
            <path d="M105 106 Q110 116 115 106" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
            <path d="M107 112 q3 2 6 0" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="1.6" strokeLinecap="round" />
            {/* boca */}
            <Mouth p={p} ink={INK} />
            {/* baba (muy borracho o dormido) */}
            {p.drool > 0.05 && (
              <path d={`M97 ${134 + p.mouthCurve * 4} q-2 ${8 + p.drool * 10} 1 ${12 + p.drool * 12}`} fill="none"
                stroke="#bfe2f2" strokeWidth="3.4" strokeLinecap="round" opacity={0.5 + p.drool * 0.5}
                style={{ animation: 'droolDrip 2.6s ease-in-out infinite' }} />
            )}
            {/* sudor */}
            {Array.from({ length: p.sweatN }).map((_, i) => (
              <Drop key={i} x={i % 2 ? 168 : 50} y={72 + i * 8} delay={i * 0.4} />
            ))}
            {/* ronquido/zzz pegados a la cabeza */}
            {mode === 'sleep' && <SleepFX ink={INK} />}
          </g>

          {/* vaso al tomar: se inclina y el líquido baja con drinkK */}
          {drinking && (
            <g transform="translate(120 108) rotate(32)" style={{ animation: 'glassSip .6s ease-in-out infinite' }}>
              <rect x="3" y={2 + (20 - liqH)} width="22" height={Math.max(1.5, liqH + 4)} rx="3" fill={drinkColor} opacity="0.92" />
              <rect x="0" y="-4" width="28" height="36" rx="5" fill="rgba(220,240,255,.45)" stroke={INK} strokeWidth="3" />
              <ellipse cx="14" cy="-4" rx="14" ry="3.4" fill="rgba(255,255,255,.65)" stroke={INK} strokeWidth="2.2" />
              <rect x="5" y="-1" width="5" height="26" rx="2.5" fill="rgba(255,255,255,.6)" />
              {/* burbujitas del trago */}
              <circle cx="10" cy="8" r="1.6" fill="#fff" opacity="0.8" style={{ animation: 'bub 1s linear infinite' }} />
              <circle cx="19" cy="14" r="1.2" fill="#fff" opacity="0.7" style={{ animation: 'bub 1.3s linear .3s infinite' }} />
            </g>
          )}

          {/* vómito */}
          {mode === 'vomit' && <VomitFX ink={INK} />}

          {/* símbolos flotantes */}
          {p.floats.map((f, i) => (
            <text key={f.key} x={f.x} y={f.y} fontSize="24"
              style={{ animation: f.key === 'spin' || f.key === 'star' ? `starOrbit 2.4s linear ${i * 0.3}s infinite` : `floatY ${2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`, transformBox: 'fill-box', transformOrigin: 'center' }}>{f.c}</text>
          ))}
        </svg>
      </div>
    </div>
  )
}

const Avatar = memo(AvatarBase)
export default Avatar
