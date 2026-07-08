// Mueble/alacena de madera cartoon. Arranca CERRADO con dos puertas y pomos.
// Al tocar una puerta/pomo se abren HACIA AFUERA con animación 3D: giran más allá de
// la perpendicular y quedan plegadas a los costados, con un pequeño margen por fuera
// del mueble, sin tapar el interior. Tocarlas de nuevo las cierra.

const INK = '#3d2410'
const OPEN_DEG = 93 // ángulo de apertura (apenas >90 → la puerta queda al filo, por fuera del mueble)

function Door({ side, open, onOpen, onClose }) {
  const left = side === 'left'
  // Giro hacia afuera + un pequeño desplazamiento hacia el costado (margen por fuera).
  const openT = `translateX(${left ? -2 : 2}px) rotateY(${left ? -OPEN_DEG : OPEN_DEG}deg)`
  return (
    <div
      onClick={() => (open ? onClose() : onOpen())}
      title={open ? 'Cerrar el mueble' : 'Abrir el mueble'}
      style={{
        position: 'absolute', top: 0, bottom: 0, width: '50%', [left ? 'left' : 'right']: 0,
        transformOrigin: left ? 'left center' : 'right center',
        transform: open ? openT : 'translateX(0) rotateY(0deg)',
        transition: 'transform .85s cubic-bezier(.6,0,.25,1)',
        cursor: 'pointer', zIndex: 6, borderRadius: left ? '14px 4px 4px 14px' : '4px 14px 14px 4px',
        backgroundColor: '#5d3a19',
        backgroundImage: 'linear-gradient(180deg,rgba(255,255,255,.10),rgba(0,0,0,.25)),repeating-linear-gradient(180deg,rgba(0,0,0,.16) 0 2px,transparent 2px 26px)',
        border: `4px solid ${INK}`,
        boxShadow: open
          ? `${left ? 14 : -14}px 0 26px rgba(0,0,0,.5)`
          : 'inset 0 0 0 3px rgba(255,220,170,.10), inset 0 0 30px rgba(0,0,0,.4)',
        boxSizing: 'border-box', overflow: 'hidden',
      }}
    >
      {/* marco tallado */}
      <div style={{ position: 'absolute', inset: 12, border: '3px solid rgba(0,0,0,.28)', borderRadius: 8, boxShadow: 'inset 0 0 0 2px rgba(255,220,170,.08)' }} />
      {/* sombra que proyecta el interior sobre la cara de la puerta al abrir (da profundidad) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: open ? 1 : 0, transition: 'opacity .5s ease',
        background: `linear-gradient(${left ? 90 : 270}deg, rgba(0,0,0,.42), transparent 55%)`,
      }} />
      {/* pomo */}
      <div style={{
        position: 'absolute', top: '50%', [left ? 'right' : 'left']: 10, transform: 'translateY(-50%)',
        width: 20, height: 20, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%,#ffe08a,#c9962f 60%,#8a5f19)',
        border: `3px solid ${INK}`, boxShadow: '0 3px 5px rgba(0,0,0,.5)',
      }} />
      <div style={{
        position: 'absolute', top: 'calc(50% + 14px)', [left ? 'right' : 'left']: 16,
        width: 8, height: 22, borderRadius: 4, background: 'linear-gradient(180deg,#c9962f,#8a5f19)', border: `2px solid ${INK}`,
      }} />
    </div>
  )
}

export default function Cabinet({ open, onOpen, onClose, children }) {
  return (
    // overflow visible = las puertas pueden abrirse hacia afuera del mueble.
    // El interior tiene su propio recorte para que el fondo/luz no se desborden.
    <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', perspective: 9000, perspectiveOrigin: '50% 40%', overflow: 'visible', borderRadius: 12 }}>
      {/* interior del mueble */}
      <div style={{
        position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRadius: 12, background: 'linear-gradient(180deg,#4a2c12,#3a2210)',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        {/* luz cálida que "sale" al abrir */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: open ? 1 : 0, transition: 'opacity .9s ease .2s',
          background: 'radial-gradient(120% 80% at 50% 0%,rgba(255,196,110,.28),transparent 60%)',
        }} />
        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          padding: open ? '10px 16px' : 10, transition: 'padding .6s ease',
          opacity: open ? 1 : 0, transitionProperty: 'opacity,padding', transitionDuration: '.5s,.6s', transitionDelay: '.35s,0s' }}>
          {children}
        </div>
      </div>

      <Door side="left" open={open} onOpen={onOpen} onClose={onClose} />
      <Door side="right" open={open} onOpen={onOpen} onClose={onClose} />
    </div>
  )
}
