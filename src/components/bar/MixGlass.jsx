import { memo } from 'react'

const INK = '#2b1c0e'

// Ícono de un pre-armado: un vaso servido con el color del trago. Se usa en la
// estantería (pestaña Pre-armados) y como "ghost" mientras se arrastra al vaso.
function MixGlass({ color = '#c8102e', h = 62 }) {
  const w = h * 0.62
  return (
    <div style={{ width: w, height: h, filter: 'drop-shadow(0 4px 3px rgba(0,0,0,.4))' }}>
      <svg viewBox="0 0 40 64" width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        {/* líquido */}
        <path d="M8 12 L32 12 L27 50 Q27 54 23 54 L17 54 Q13 54 13 50 Z" fill={color} opacity="0.92" />
        {/* superficie */}
        <ellipse cx="20" cy="13" rx="12" ry="2.6" fill="#fff" opacity="0.35" />
        {/* vaso (contorno) */}
        <path d="M7 11 L33 11 L27 51 Q27 56 22 56 L18 56 Q13 56 13 51 Z" fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        {/* brillo */}
        <rect x="11" y="16" width="3" height="30" rx="1.5" fill="#fff" opacity="0.4" />
        {/* pajita */}
        <line x1="26" y1="6" x2="22" y2="34" stroke="#ff5b6e" strokeWidth="3" strokeLinecap="round" />
        <line x1="26" y1="6" x2="22" y2="34" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3" />
      </svg>
    </div>
  )
}

export default memo(MixGlass)
