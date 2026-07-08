import { useCallback, useRef, useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements.js'
import { byId, STD_GRAMS } from '../data/catalog.js'
import { capOf } from '../data/containers.js'

const K_UNLOCKED = 'att-ach-v2'
const K_TRIED = 'att-tried-v2'
const K_PRESETS = 'att-presets-v2'
const K_CONTAINERS = 'att-containers-v2'
const K_COUNTERS = 'att-counters-v2'

const load = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback } catch { return fallback }
}
const save = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ } }

// Logros con progreso persistido en localStorage. Devuelve la lista `unlocked`,
// `sync(ctx)` para reevaluar tras servir, `notePreset(id)` y `noteAnalyze()` para eventos.
export function useAchievements() {
  const [unlocked, setUnlocked] = useState(() => load(K_UNLOCKED, []))
  const [toast, setToast] = useState(null)

  const triedRef = useRef(new Set(load(K_TRIED, [])))
  const presetsRef = useRef(new Set(load(K_PRESETS, [])))
  const containersRef = useRef(new Set(load(K_CONTAINERS, [])))
  const countersRef = useRef({ analyze: 0, drinks: 0, vomit: 0, sleep: 0, dead: 0, zero: 0, ...load(K_COUNTERS, {}) })
  const unlockedRef = useRef(new Set(unlocked))
  const lastCtxRef = useRef({ added: [], container: 'grande', rounds: 0 })

  const commitNew = useCallback((newlyIds) => {
    if (!newlyIds.length) return
    newlyIds.forEach((id) => unlockedRef.current.add(id))
    const arr = [...unlockedRef.current]
    save(K_UNLOCKED, arr)
    setUnlocked(arr)
    const first = ACHIEVEMENTS.find((a) => a.id === newlyIds[0])
    if (first) setToast({ ...first, seed: Date.now() })
  }, [])

  const ctxNow = (added, container, rounds = 0) => {
    let ml = 0, grams = 0
    const liquids = []
    for (const it of added) {
      const d = byId[it.id]
      if (!d || d.cat === 'extra' || !(it.ml > 0)) continue
      ml += it.ml
      grams += it.ml * (d.abv / 100) * 0.789
      if (!liquids.includes(it.id)) liquids.push(it.id)
    }
    return {
      liquids, ml, cap: capOf(container), grams, std: grams / STD_GRAMS, container, rounds,
      tried: triedRef.current.size, presetsCount: presetsRef.current.size,
      containersCount: containersRef.current.size, analyzeCount: countersRef.current.analyze,
      drinks: countersRef.current.drinks || 0, vomit: countersRef.current.vomit || 0,
      sleep: countersRef.current.sleep || 0, dead: countersRef.current.dead || 0, zero: countersRef.current.zero || 0,
    }
  }

  const evaluate = useCallback((ctx) => {
    const newly = []
    for (const a of ACHIEVEMENTS) {
      if (unlockedRef.current.has(a.id)) continue
      let ok = false
      try { ok = a.check(ctx) } catch { ok = false }
      if (ok) newly.push(a.id)
    }
    commitNew(newly)
  }, [commitNew])

  // Reevalúa con el estado del trago actual y actualiza acumulados (bebidas y recipientes).
  const sync = useCallback(({ added, container, rounds = 0 }) => {
    lastCtxRef.current = { added, container, rounds }
    let served = false
    for (const it of added) {
      const d = byId[it.id]
      if (!d || d.cat === 'extra' || !(it.ml > 0)) continue
      served = true
      if (!triedRef.current.has(it.id)) { triedRef.current.add(it.id); save(K_TRIED, [...triedRef.current]) }
    }
    if (served && !containersRef.current.has(container)) {
      containersRef.current.add(container); save(K_CONTAINERS, [...containersRef.current])
    }
    evaluate(ctxNow(added, container, rounds))
  }, [evaluate])

  const notePreset = useCallback((id) => {
    if (presetsRef.current.has(id)) return
    presetsRef.current.add(id); save(K_PRESETS, [...presetsRef.current])
  }, [])

  const noteAnalyze = useCallback(() => {
    countersRef.current = { ...countersRef.current, analyze: (countersRef.current.analyze || 0) + 1 }
    save(K_COUNTERS, countersRef.current)
  }, [])

  // Eventos del personaje: drink (tomó una ronda), zero, vomit, sleep, dead.
  const noteEvent = useCallback((kind) => {
    const key = kind === 'drink' ? 'drinks' : kind
    countersRef.current = { ...countersRef.current, [key]: (countersRef.current[key] || 0) + 1 }
    save(K_COUNTERS, countersRef.current)
    const { added, container, rounds } = lastCtxRef.current
    evaluate(ctxNow(added, container, rounds))
  }, [evaluate])

  const clearToast = useCallback(() => setToast(null), [])

  return { unlocked, toast, clearToast, sync, notePreset, noteAnalyze, noteEvent }
}
