const COLORS = ['#ffd23f', '#e8563f', '#7ec26a', '#5aa7d6', '#ffedd0']

export default function Confetti({ on, seed = 0 }) {
  if (!on) return null
  const pieces = Array.from({ length: 34 }, (_, i) => {
    const rn = (seed * 37 + i * 13) % 100
    return {
      left: (i * 2.9 + (rn % 6)).toFixed(1),
      top: 6 + (rn % 22),
      w: 7 + (i % 3) * 3,
      h: 5 + ((i + 1) % 3) * 3,
      color: COLORS[i % 5],
      round: i % 2 ? '50%' : '2px',
      dur: (1 + (rn % 40) / 55).toFixed(2),
      delay: ((i % 6) * 0.06).toFixed(2),
    }
  })
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 85, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((c, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${c.left}%`, top: `${c.top}%`, width: c.w, height: c.h,
          background: c.color, border: '2px solid #2b1c0e', borderRadius: c.round,
          animation: `confettiFall ${c.dur}s ease-in forwards`, animationDelay: `${c.delay}s`,
        }} />
      ))}
    </div>
  )
}
