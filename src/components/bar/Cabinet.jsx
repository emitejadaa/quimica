// Mueble/alacena de madera cartoon. Arranca CERRADO con dos puertas y pomos.
// Al tocar una puerta se abre hacia AFUERA (se pliega a los costados, fuera del mueble)
// dejando un pequeño margen visible para volver a tocarla y cerrar.
// Cerrado: tiembla al pasar el mouse (invita a abrir).

const INK = '#3d2410'
// Ángulo de apertura: menor a 90° para que la cara de la puerta siga MIRANDO al
// usuario (más de 90° + backface oculto = puerta invisible). Así queda entreabierta,
// sobresaliendo un poco hacia afuera y dando una superficie clara para volver a cerrar.
const OPEN_ANGLE = 76 // grados

function Door({ side, open, onOpen, onClose }) {
  const left = side === 'left'
  return (
    <div
      onClick={() => (open ? onClose() : onOpen())}
      title={open ? 'Cerrar el mueble' : 'Abrir el mueble'}
      className={`cab-door${open ? '' : ' cab-closed'}`}
      style={{
        position: 'absolute', top: 0, bottom: 0, width: '50%', [left ? 'left' : 'right']: 0,
        transformOrigin: left ? 'left center' : 'right center',
        // abierta: se pliega y además se desliza hacia afuera para sobresalir del
        // marco y despejar el interior, dejando la cara visible para volver a cerrar.
        transform: open
          ? `translateX(${left ? '-12%' : '12%'}) rotateY(${left ? OPEN_ANGLE : -OPEN_ANGLE}deg)`
          : 'rotateY(0deg)',
        transition: 'transform .9s cubic-bezier(.5,.05,.2,1), box-shadow .9s ease',
        cursor: 'pointer', zIndex: 6, borderRadius: left ? '16px 5px 5px 16px' : '5px 16px 16px 5px',
        backgroundColor: '#5d3a19',
        backgroundImage: [
          'linear-gradient(180deg,rgba(255,236,200,.16),rgba(0,0,0,.28))',
          'repeating-linear-gradient(180deg,rgba(0,0,0,.14) 0 1px,transparent 1px 3px)',
          'repeating-linear-gradient(90deg,rgba(0,0,0,.10) 0 3px,transparent 3px 30px)',
        ].join(','),
        border: `4px solid ${INK}`,
        boxShadow: open
          ? '0 10px 26px rgba(0,0,0,.5)'
          : `inset 0 0 0 3px rgba(255,220,170,.12), inset 0 0 34px rgba(0,0,0,.42), 0 6px 14px rgba(0,0,0,.35)`,
        boxSizing: 'border-box', overflow: 'hidden', backfaceVisibility: 'hidden',
      }}
    >
      {/* panel tallado (doble bisel) */}
      <div style={{ position: 'absolute', inset: 12, borderRadius: 9, border: '3px solid rgba(0,0,0,.30)', boxShadow: 'inset 0 0 0 2px rgba(255,224,170,.10), inset 0 2px 8px rgba(0,0,0,.35)' }} />
      <div style={{ position: 'absolute', inset: 20, borderRadius: 6, border: '2px solid rgba(255,224,170,.08)' }} />
      {/* emblema grabado */}
      <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, textAlign: 'center', fontSize: 30, opacity: 0.14, filter: 'grayscale(1)' }}>🍸</div>
      {/* placa + pomo */}
      <div style={{
        position: 'absolute', top: '50%', [left ? 'right' : 'left']: 6, transform: 'translateY(-50%)',
        width: 15, height: 34, borderRadius: 8, background: 'linear-gradient(180deg,#3a2410,#25160b)', border: '2px solid #1c1006',
      }} />
      <div style={{
        position: 'absolute', top: '50%', [left ? 'right' : 'left']: 8, transform: 'translateY(-50%)',
        width: 20, height: 20, borderRadius: '50%',
        background: 'radial-gradient(circle at 34% 28%,#ffe9a8,#d1a13a 55%,#8a5f19)',
        border: `2.5px solid ${INK}`, boxShadow: '0 3px 5px rgba(0,0,0,.5), inset 0 -2px 3px rgba(0,0,0,.4)',
      }} />
    </div>
  )
}

export default function Cabinet({ open, onOpen, onClose, children }) {
  return (
    // sin overflow: las puertas pueden plegarse hacia afuera del mueble
    <div className="cabinet-frame" style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', perspective: 1700 }}>
      {/* interior del mueble */}
      <div style={{
        position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRadius: 12, background: 'linear-gradient(180deg,#4a2c12,#3a2210)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,.5)', pointerEvents: open ? 'auto' : 'none',
      }}>
        {/* luz cálida que "sale" al abrir */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: open ? 1 : 0, transition: 'opacity .9s ease .2s',
          background: 'radial-gradient(130% 90% at 50% -5%,rgba(255,201,120,.30),transparent 62%)',
        }} />
        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '10px 12px',
          opacity: open ? 1 : 0, transition: 'opacity .5s ease .35s' }}>
          {children}
        </div>
      </div>

      <Door side="left" open={open} onOpen={onOpen} onClose={onClose} />
      <Door side="right" open={open} onOpen={onOpen} onClose={onClose} />
    </div>
  )
}
