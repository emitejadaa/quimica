import { memo } from 'react'
import { clockLabel, NIGHT_START_HOUR, NIGHT_HOURS } from '../logic/calc.js'

const INK = '#2b1c0e'

// Ángulos ACUMULADOS (sin módulo) para `h` horas desde el inicio de la noche:
// así la transición CSS siempre gira hacia adelante al avanzar la hora.
export const hourDegAt = (h) => (NIGHT_START_HOUR % 12) * 30 + h * 30
export const minuteDegAt = (h) => h * 360

// Carita de reloj analógico cartoon (marco de madera + agujas de hora y minutos).
// `sweep` activa la transición: al sumar 1 h el minutero da una vuelta completa.
export const ClockFace = memo(function ClockFace({ hourDeg, minuteDeg, size = 80, sweep = false }) {
  const trans = sweep ? 'transform .9s cubic-bezier(.55,.05,.35,1.12)' : undefined
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      {/* marco de madera */}
      <circle cx="50" cy="50" r="47" fill="#8a5a2b" stroke="#3d2410" strokeWidth="5" />
      <path d="M14 38 A38 38 0 0 1 38 13" fill="none" stroke="rgba(255,235,200,.35)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="50" r="38.5" fill="#fff6e6" stroke="#3d2410" strokeWidth="3.2" />
      {/* marcas horarias */}
      {[...Array(12)].map((_, i) => (
        <line key={i} x1="50" y1="15.5" x2="50" y2={i % 3 === 0 ? 22.5 : 19.5}
          stroke={INK} strokeWidth={i % 3 === 0 ? 3.4 : 2} strokeLinecap="round"
          transform={`rotate(${i * 30} 50 50)`} opacity={i % 3 === 0 ? 1 : 0.5} />
      ))}
      {/* aguja de hora */}
      <g style={{ transform: `rotate(${hourDeg}deg)`, transformOrigin: '50px 50px', transition: trans }}>
        <line x1="50" y1="55" x2="50" y2="31" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* aguja de minutos */}
      <g style={{ transform: `rotate(${minuteDeg}deg)`, transformOrigin: '50px 50px', transition: trans }}>
        <line x1="50" y1="56.5" x2="50" y2="20.5" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="50" r="4.8" fill="#ffb03a" stroke={INK} strokeWidth="2.6" />
      {/* brillito del vidrio */}
      <path d="M27 33 Q33 23 44 19" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    </svg>
  )
})

// Reloj de pared del bar: colgado de su clavito, se toca para avanzar +1 h.
// A las 06:00 el bar cierra y el reloj deja de avanzar.
export const BarWallClock = memo(function BarWallClock({ hoursPassed, onAdvance, disabled }) {
  const closed = hoursPassed >= NIGHT_HOURS
  const canTap = !closed && !disabled
  return (
    <div
      onClick={canTap ? onAdvance : undefined}
      title={closed ? 'El bar cerró a las 06:00 · reiniciá la noche para volver a empezar' : 'Tocá el reloj para que pase una hora'}
      className={canTap ? 'btn-cartoon' : undefined}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: canTap ? 'pointer' : 'default', pointerEvents: 'auto',
        filter: closed ? 'saturate(.7) brightness(.92)' : undefined,
      }}
    >
      {/* clavito y colgador */}
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3d2410', boxShadow: '0 1px 0 rgba(255,235,200,.25)' }} />
      <div style={{ width: 3, height: 5, background: '#3d2410', marginTop: -1 }} />
      <div style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.45))', marginTop: -2 }}>
        <ClockFace sweep hourDeg={hourDegAt(hoursPassed)} minuteDeg={minuteDegAt(hoursPassed)} size={84} />
      </div>
      {/* etiqueta con la hora y la acción */}
      <div style={{
        marginTop: -7, display: 'flex', alignItems: 'center', gap: 6,
        background: closed ? '#c9b8e8' : '#ffb03a', color: INK, border: '2.5px solid #3d2410',
        borderRadius: 999, padding: '2px 11px', boxShadow: '0 3px 0 #3d2410',
        fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
        animation: canTap ? 'fillPulse 2.6s ease-in-out infinite' : undefined,
      }}>
        <span style={{ fontSize: 13 }}>{clockLabel(hoursPassed)}</span>
        <span style={{ fontWeight: 600, fontSize: 11 }}>{closed ? '🌙 cerramos' : '👆 +1 h'}</span>
      </div>
    </div>
  )
})
