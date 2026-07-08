import { useRef, useState, useEffect, useCallback } from 'react'
import { byId } from '../data/catalog.js'
import { byPreset } from '../data/presets.js'

// El chorro arranca lento y acelera mientras se mantiene (de RATE_MIN a RATE_MAX).
// Servido más pausado que antes, pero conserva la aceleración al sostener.
const RATE_MIN = 22 // ml/s al empezar a servir
const RATE_MAX = 150 // ml/s al mantener
const ACCEL_T = 2.9 // s hasta llegar al máximo
const TAP_MS = 220
const TAP_SPLASH = 18

// Servir ARRASTRANDO la botella (o un pre-armado) al vaso: mientras el "ghost" está
// sobre el vaso, se sirve según se mantiene. Soltás y corta. Nada de medidas fijas.
// `cap` es el tope del recipiente elegido (cambia según el vaso).
export function usePointerPour({ pour, pourPreset, addExtra, sound, added, cap, onPresetPour }) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [pouring, setPouring] = useState(false)

  const addedRef = useRef(added)
  useEffect(() => { addedRef.current = added }, [added])
  const capRef = useRef(cap)
  useEffect(() => { capRef.current = cap }, [cap])
  const ghostRef = useRef(null)
  const glassRef = useRef(null)
  const st = useRef({ id: null, kind: 'drink', preset: null, x: 0, y: 0, sx: 0, sy: 0, t0: 0, over: false, raf: 0, last: 0, poured: 0, acc: 0, lastDispatch: 0 })

  const roomNow = () =>
    capRef.current - addedRef.current.reduce((a, it) => a + (byId[it.id]?.cat === 'extra' ? 0 : it.ml || 0), 0)

  const dispatchPour = (ml) => {
    const s = st.current
    if (s.kind === 'preset') { pourPreset(s.preset, ml); onPresetPour && onPresetPour(s.preset) }
    else pour(s.id, ml)
  }

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
    if (s.id && s.acc > 0 && roomNow() > 0) { dispatchPour(s.acc); s.poured += s.acc; s.acc = 0 }
    sound.pourStop()
    setPouring(false)
  }, [sound, pour, pourPreset])

  // Acumula por frame pero despacha a ~30fps: menos re-renders, igual de fluido.
  const flowTick = useCallback((ts) => {
    const s = st.current
    if (!s.id || !s.over) return
    if (!s.last) { s.last = ts; s.lastDispatch = ts }
    if (!s.flowStart) s.flowStart = ts
    const dt = Math.min(0.05, (ts - s.last) / 1000)
    s.last = ts
    if (roomNow() > 0) {
      const elapsed = (ts - s.flowStart) / 1000
      const rate = RATE_MIN + (RATE_MAX - RATE_MIN) * Math.min(1, elapsed / ACCEL_T)
      s.acc += rate * dt
      if (ts - s.lastDispatch >= 32 && s.acc > 0) {
        dispatchPour(s.acc); s.poured += s.acc; s.acc = 0; s.lastDispatch = ts
      }
      s.raf = requestAnimationFrame(flowTick)
    } else {
      stopFlow() // lleno: corta
    }
  }, [pour, pourPreset, stopFlow])

  const startFlow = useCallback(() => {
    const s = st.current
    if (s.raf || roomNow() <= 0) return
    s.last = 0; s.flowStart = 0
    sound.pourStart(capRef.current)
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
      if (over && s.kind !== 'extra') startFlow()
      else stopFlow()
    }
  }, [startFlow, stopFlow])

  const onUp = useCallback(() => {
    const s = st.current
    if (!s.id) { return }
    stopFlow()
    const dist = Math.hypot(s.x - s.sx, s.y - s.sy)
    const tap = Date.now() - s.t0 < TAP_MS && dist < 12
    if (s.kind === 'extra') {
      if (s.over || tap) { sound.pop(); addExtra(s.id) }
    } else if (s.over) {
      if (s.poured < TAP_SPLASH && roomNow() > 0) { dispatchPour(Math.max(6, TAP_SPLASH - s.poured)); sound.ding() }
      else sound.ding()
    }
    s.id = null; s.over = false; s.poured = 0; s.preset = null
    setDraggingId(null); setDragOver(false)
  }, [stopFlow, addExtra, pour, pourPreset, sound])

  const onBottleDown = useCallback((e) => {
    const el = e.currentTarget
    const id = el.dataset.id
    const isPreset = el.dataset.preset === '1'
    const d = isPreset ? byPreset[id] : byId[id]
    if (!d) return
    if (e.cancelable) e.preventDefault()
    sound.ensure(); sound.pop()
    const s = st.current
    s.id = id
    s.kind = isPreset ? 'preset' : (d.cat === 'extra' ? 'extra' : 'drink')
    s.preset = isPreset ? d : null
    s.x = e.clientX; s.y = e.clientY; s.sx = e.clientX; s.sy = e.clientY
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
