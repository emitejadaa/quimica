import { useRef, useState } from 'react'

// Botón + tarjeta resumen exportable a PNG (html-to-image, import dinámico).
export default function ShareCard({ data }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)

  const download = async () => {
    setBusy(true)
    try {
      const { toPng } = await import('html-to-image')
      const node = ref.current
      // skipFonts evita el fetch CORS a Google Fonts que rompía la exportación.
      const url = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: '#241505',
        width: node.offsetWidth,
        height: node.offsetHeight,
      })
      const a = document.createElement('a')
      a.download = 'mi-trago.png'
      a.href = url
      a.click()
    } catch (e) {
      console.error('ShareCard export error:', e)
      alert('No se pudo generar la imagen 😔 (revisá la consola)')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={download} disabled={busy} style={{
        background: '#2b1c0e', color: '#ffedd0', border: '3px solid #14100a', borderRadius: 12, padding: '9px 14px',
        fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, cursor: busy ? 'wait' : 'pointer', boxShadow: '0 5px 0 #14100a',
      }}>{busy ? '⏳ generando…' : '📸 Descargar tarjeta'}</button>

      {/* tarjeta oculta que se exporta */}
      <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <div ref={ref} style={{
          width: 460, padding: 26, background: 'linear-gradient(180deg,#3a2410,#241505)', fontFamily: 'Nunito, sans-serif', color: '#ffedd0',
        }}>
          <div style={{ background: '#fff6e6', color: '#2b1c0e', border: '4px solid #3d2410', borderRadius: 20, padding: 22, boxShadow: '0 10px 0 #3d2410' }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 26 }}>🍹 Mi trago</div>
            <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 18, color: '#8a6a45', marginTop: 2 }}>{data.names}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0' }}>
              <div style={{ fontSize: 64, lineHeight: 1 }}>{data.tierFace}</div>
              <div>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 44, color: data.tierColor, lineHeight: 1 }}>{data.bacPeak} <span style={{ fontSize: 20 }}>g/L</span></div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{data.tierLabel}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['🥃 Graduación', `${data.abv}°`], ['🍸 Tragos est.', data.std], ['⚗️ Alcohol', `${data.grams} g`], ['🔥 Calorías', `${data.kcal} kcal`], ['📏 Volumen', `${data.ml} ml`], ['🍬 Azúcar', `${data.sugar} g`]].map(([l, v]) => (
                <div key={l} style={{ background: '#fff', border: '3px solid #3d2410', borderRadius: 12, padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#8a6a45' }}>{l}</div>
                  <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'Patrick Hand, cursive', fontSize: 15, color: '#8a6a45' }}>
              Armá tu trago · +18 · esto es educativo, no una invitación a tomar
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
