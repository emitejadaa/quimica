// Slider con perilla grande arrastrable (emoji) y relleno animado.
export default function GameSlider({ min, max, step, value, onChange, knob, fill = '#b3541e', label }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ position: 'relative', height: 44, display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 14, borderRadius: 999, background: '#e8d6bd', border: '3px solid #3d2410', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${fill},#ffb03a)`, transition: 'width .08s' }} />
      </div>
      <div style={{
        position: 'absolute', left: `calc(${pct}% )`, transform: 'translateX(-50%)', width: 38, height: 38,
        borderRadius: '50%', background: '#fff6e6', border: '3px solid #3d2410', boxShadow: '0 3px 0 #3d2410',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, pointerEvents: 'none',
      }}>{knob}</div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onInput={(e) => onChange(+e.target.value)}
        aria-label={label}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
      />
    </div>
  )
}
