import { useReducer, useCallback, useMemo } from 'react'
import { byId, GLASS_CAP, MAX_EXTRAS } from '../data/catalog.js'

const initial = {
  added: [], // [{ id, ml, n }]  liquidos: ml>0 · extras: ml=0, n=cantidad
  tab: 'cerveza',
  phase: 0, // 0 bar · 1 ficha · 2 análisis
  peso: 70,
  sexo: 'M',
  contextura: 'Promedio',
  estomago: 'algo',
  horas: 1,
  analyzed: false,
  factSeed: 0,
  muted: false,
}

const isExtra = (id) => byId[id]?.cat === 'extra'
export const liquidsMl = (added) => added.reduce((a, it) => a + (isExtra(it.id) ? 0 : it.ml || 0), 0)
export const extraCount = (added) => added.reduce((a, it) => a + (isExtra(it.id) ? it.n || 1 : 0), 0)

function reducer(s, a) {
  switch (a.type) {
    case 'pour': {
      const room = GLASS_CAP - liquidsMl(s.added)
      if (room <= 0) return s
      const add = Math.min(a.ml, room)
      if (add <= 0) return s
      const idx = s.added.findIndex((x) => x.id === a.id)
      let added
      if (idx >= 0) {
        added = s.added.slice()
        added[idx] = { ...added[idx], ml: added[idx].ml + add }
      } else {
        added = [...s.added, { id: a.id, ml: add, n: 1 }]
      }
      return { ...s, added }
    }
    case 'bumpMl': {
      const idx = s.added.findIndex((x) => x.id === a.id)
      if (idx < 0) return s
      const others = liquidsMl(s.added) - s.added[idx].ml
      let ml = s.added[idx].ml + a.delta
      ml = Math.max(0, Math.min(ml, GLASS_CAP - others))
      let added = s.added.slice()
      if (ml < 5) added = added.filter((_, j) => j !== idx)
      else added[idx] = { ...added[idx], ml }
      return { ...s, added }
    }
    case 'addExtra': {
      if (extraCount(s.added) >= MAX_EXTRAS) return s
      const idx = s.added.findIndex((x) => x.id === a.id)
      let added
      if (idx >= 0) {
        added = s.added.slice()
        added[idx] = { ...added[idx], n: (added[idx].n || 1) + 1 }
      } else {
        added = [...s.added, { id: a.id, ml: 0, n: 1 }]
      }
      return { ...s, added }
    }
    case 'remove':
      return { ...s, added: s.added.filter((x) => x.id !== a.id) }
    case 'clear':
      return { ...s, added: [] }
    case 'preset': {
      const added = []
      let cur = 0
      for (const it of a.preset.items) {
        const room = GLASS_CAP - cur
        const ml = Math.max(0, Math.min(it.ml, room))
        if (ml > 0) { added.push({ id: it.id, ml, n: 1 }); cur += ml }
      }
      let ex = 0
      for (const id of a.preset.extras || []) {
        if (ex >= MAX_EXTRAS) break
        added.push({ id, ml: 0, n: 1 }); ex++
      }
      return { ...s, added, tab: 'cerveza' }
    }
    case 'set':
      return { ...s, [a.field]: a.value }
    case 'tab':
      return { ...s, tab: a.value }
    case 'phase':
      return { ...s, phase: a.value }
    case 'analyze':
      return { ...s, phase: 2, analyzed: true, factSeed: s.factSeed + 1 }
    case 'nextFact':
      return { ...s, factSeed: s.factSeed + 1 }
    case 'toggleMute':
      return { ...s, muted: !s.muted }
    case 'resetDrink':
      return { ...s, added: [], phase: 0, analyzed: false }
    default:
      return s
  }
}

export function useBarState() {
  const [state, dispatch] = useReducer(reducer, initial)

  const actions = useMemo(() => ({
    pour: (id, ml) => dispatch({ type: 'pour', id, ml }),
    bumpMl: (id, delta) => dispatch({ type: 'bumpMl', id, delta }),
    addExtra: (id) => dispatch({ type: 'addExtra', id }),
    remove: (id) => dispatch({ type: 'remove', id }),
    clear: () => dispatch({ type: 'clear' }),
    loadPreset: (preset) => dispatch({ type: 'preset', preset }),
    set: (field, value) => dispatch({ type: 'set', field, value }),
    setTab: (value) => dispatch({ type: 'tab', value }),
    setPhase: (value) => dispatch({ type: 'phase', value }),
    analyze: () => dispatch({ type: 'analyze' }),
    nextFact: () => dispatch({ type: 'nextFact' }),
    toggleMute: () => dispatch({ type: 'toggleMute' }),
    resetDrink: () => dispatch({ type: 'resetDrink' }),
  }), [])

  return [state, actions]
}
