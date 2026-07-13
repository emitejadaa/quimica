import { useState, useRef, useLayoutEffect, useCallback } from 'react'

// Escala uniformemente un grupo para que LLENE el área disponible.
// Mide el contenedor (boxRef) y el tamaño natural del grupo (groupRef) con un
// ResizeObserver y devuelve un factor `scale` que se aplica como transform al
// grupo. Así el vaso + el personaje ocupan todo el alto/ancho disponible y se
// adaptan solos a cualquier resolución, sin dejar espacio de sobra.
export function useFitScale({ min = 0.6, max = 1.85, pad = 0.94 } = {}) {
  const boxRef = useRef(null)    // área disponible (no se transforma)
  const groupRef = useRef(null)  // grupo a escalar (su tamaño de layout es el "natural")
  const [scale, setScale] = useState(1)

  const measure = useCallback(() => {
    const box = boxRef.current, group = groupRef.current
    if (!box || !group) return
    const availW = box.clientWidth, availH = box.clientHeight
    // offset* no lo afecta el transform: siempre es el tamaño natural del grupo.
    const natW = group.offsetWidth, natH = group.offsetHeight
    if (!natW || !natH || !availW || !availH) return
    const fit = Math.min((availW * pad) / natW, (availH * pad) / natH)
    const next = Math.max(min, Math.min(max, fit))
    setScale((prev) => (Math.abs(next - prev) < 0.005 ? prev : next))
  }, [min, max, pad])

  useLayoutEffect(() => {
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    // observar el grupo capta los cambios de recipiente (cambia la silueta/alto),
    // observar el box capta los cambios de viewport/panel.
    if (boxRef.current) ro.observe(boxRef.current)
    if (groupRef.current) ro.observe(groupRef.current)
    return () => ro.disconnect()
  }, [measure])

  return { boxRef, groupRef, scale }
}
