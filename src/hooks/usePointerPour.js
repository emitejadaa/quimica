import { useRef, useState, useEffect, useCallback } from 'react'
import { byId, GLASS_CAP } from '../data/catalog.js'

const POUR_RATE = 210 // ml/s mientras se mantiene la botella sobre el vaso
const TAP_MS = 220
const TAP_SPLASH = 22

// Servir ARRASTRANDO la botella al vaso: mientras el "ghost" está sobre el vaso,
// se sirve según se mantiene. Soltás y corta. Nada de medidas fijas por defecto.
export function usePointerPour({ pour, addExtra, sound, added }) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [pouring, setPouring] = useState(false)

  const addedRef = useRef(added)
  useEffect(() => { addedRef.current = added }, [added])
  const ghostRef = useRef(null)
  const glassRef = useRef(null)
  const st = useRef({ id: null, x: 0, y: 0, sx: 0, sy: 0, t0: 0, over: false, raf: 0, last: 0, poured: 0, acc: 0, lastDispatch: 0 })

  const roomNow = () =>
    GLASS_CAP - addedRef.current.reduce((a, it) => a + (byId[it.id]?.cat === 'extra' ? 0 : it.ml || 0), 0)

  const posGhost = () => {
    const el = ghostRef.current, s = st.current
    if (el) { el.style.left = s.x + 'px'; el.style.top = s.y + 'px' }
  }
  const overGlass = () => {
    const el = glassRef.current, s = st.current
    if (!el) return false
    const r = el.getBoundingClientRect()
    return s.x > r.left - 42 && s.x < r.right + 42 && s.y > r.top - 70 && s.y < r.bottom + 24
  }

  const stopFlow = useCallback(() => {
    const s = st.current
    if (s.raf) cancelAnimationFrame(s.raf)
    s.raf = 0
    if (s.id && s.acc > 0 && roomNow() > 0) { pour(s.id, s.acc); s.poured += s.acc; s.acc = 0 }
    sound.pourStop()
    setPouring(false)
  }, [sound, pour])

  // Acumula por frame pero despacha a ~30fps: menos re-renders, igual de fluido.
  const flowTick = useCallback((ts) => {
    const s = st.current
    if (!s.id || !s.over) return
    if (!s.last) { s.last = ts; s.lastDispatch = ts }
    const dt = Math.min(0.05, (ts - s.last) / 1000)
    s.last = ts
    if (roomNow() > 0) {
      s.acc += POUR_RATE * dt
      if (ts - s.lastDispatch >= 32 && s.acc > 0) {
        pour(s.id, s.acc); s.poured += s.acc; s.acc = 0; s.lastDispatch = ts
      }
      s.raf = requestAnimationFrame(flowTick)
    } else {
      stopFlow() // lleno: corta
    }
  }, [pour, stopFlow])

  const startFlow = useCallback(() => {
    const s = st.current
    if (s.raf || roomNow() <= 0) return
    s.last = 0
    sound.pourStart()
    setPouring(true)
    s.raf = requestAnimationFrame(flowTick)
  }, [sound, flowTick])

  const onMove = useCallback((e) => {
    const s = st.current
    if (!s.id) return
    s.x = e.clientX; s.y = e.clientY
    posGhost()
    const over = overGlass()
    if (over !== s.over) {
      s.over = over
      setDragOver(over)
      const d = byId[s.id]
      if (over && d?.cat !== 'extra') startFlow()
      else stopFlow()
    }
  }, [startFlow, stopFlow])

  const onUp = useCallback(() => {
    const s = st.current
    if (!s.id) { return }
    stopFlow()
    const d = byId[s.id]
    const dist = Math.hypot(s.x - s.sx, s.y - s.sy)
    const tap = Date.now() - s.t0 < TAP_MS && dist < 12
    if (d?.cat === 'extra') {
      if (s.over || tap) { sound.pop(); addExtra(s.id) }
    } else if (s.over) {
      if (s.poured < TAP_SPLASH && roomNow() > 0) { pour(s.id, Math.max(6, TAP_SPLASH - s.poured)); sound.ding() }
      else sound.ding()
    }
    s.id = null; s.over = false; s.poured = 0
    setDraggingId(null); setDragOver(false)
  }, [stopFlow, addExtra, pour, sound])

  const onBottleDown = useCallback((e) => {
    const id = e.currentTarget.dataset.id
    const d = byId[id]
    if (!d) return
    if (e.cancelable) e.preventDefault()
    sound.ensure(); sound.pop()
    const s = st.current
    s.id = id; s.x = e.clientX; s.y = e.clientY; s.sx = e.clientX; s.sy = e.clientY
    s.t0 = Date.now(); s.over = false; s.poured = 0; s.acc = 0; s.lastDispatch = 0; s.last = 0
    setDraggingId(id); setDragOver(false)
    requestAnimationFrame(posGhost)
  }, [sound])

  useEffect(() => {
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (st.current.raf) cancelAnimationFrame(st.current.raf)
    }
  }, [onMove, onUp])

  return { draggingId, dragOver, pouring, onBottleDown, ghostRef, glassRef }
}
