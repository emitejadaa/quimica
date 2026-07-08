import { memo } from 'react'

const INK = '#2b1c0e'

// Ícono de un pre-armado: un vaso servido con el color del trago, pajita y
// sombrillita. Se usa en la estantería (pestaña Pre-armados) y como "ghost"
// mientras se arrastra al vaso.
function MixGlass({ color = '#c8102e', h = 62 }) {
  const w = h * 0.72
  return (
    <div style={{ width: w, height: h, filter: 'drop-shadow(0 4px 3px rgba(0,0,0,.4))' }}>
      <svg viewBox="0 0 46 64" width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        {/* líquido */}
        <path d="M8 14 L32 14 L27 50 Q27 54 23 54 L17 54 Q13 54 13 50 Z" fill={color} opacity="0.92" />
        {/* superficie */}
        <ellipse cx="20" cy="15" rx="11.5" ry="2.6" fill="#fff" opacity="0.4" />
        {/* vaso (contorno) con boca 3D */}
        <path d="M7 12 L33 12 L27 51 Q27 56 22 56 L18 56 Q13 56 13 51 Z" fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <ellipse cx="20" cy="12" rx="13" ry="2.6" fill="rgba(224,244,255,.35)" stroke={INK} strokeWidth="2.2" />
        {/* brillo */}
        <rect x="11" y="17" width="3" height="28" rx="1.5" fill="#fff" opacity="0.45" />
        {/* burbujita */}
        <circle cx="24" cy="30" r="1.6" fill="#fff" opacity="0.6" />
        <circle cx="21" cy="40" r="1.2" fill="#fff" opacity="0.5" />
        {/* pajita */}
        <line x1="27" y1="4" x2="23" y2="32" stroke="#ff5b6e" strokeWidth="3" strokeLinecap="round" />
        <line x1="27" y1="4" x2="23" y2="32" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3" />
        {/* sombrillita */}
        <g transform="rotate(-24 12 8)">
          <path d="M12 8 L4 14 Q12 10 20 14 Z M4 14 Q8 6 12 3 Q16 6 20 14 Q12 8 4 14 Z" fill="#ffd23f" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 3 Q8 8 4 14 M12 3 Q16 8 20 14" fill="none" stroke="#e8563f" strokeWidth="1.4" />
          <line x1="12" y1="6" x2="15" y2="20" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

export default memo(MixGlass)
