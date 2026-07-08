import { useReducer, useCallback, useMemo } from 'react'
import { byId, MAX_EXTRAS } from '../data/catalog.js'
import { capOf, DEFAULT_CONTAINER } from '../data/containers.js'

const initial = {
  added: [], // [{ id, ml, n }]  liquidos: ml>0 · extras: ml=0, n=cantidad
  tab: 'preparado',
  container: DEFAULT_CONTAINER,
  cabinetOpen: false,
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
  const cap = capOf(s.container)
  switch (a.type) {
    case 'pour': {
      const room = cap - liquidsMl(s.added)
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
    case 'pourPreset': {
      const room = cap - liquidsMl(s.added)
      if (room <= 0) return s
      const add = Math.min(a.ml, room)
      if (add <= 0) return s
      const totalP = a.preset.parts.reduce((x, pp) => x + pp.p, 0) || 1
      const added = s.added.slice()
      for (const part of a.preset.parts) {
        const portion = add * (part.p / totalP)
        const idx = added.findIndex((x) => x.id === part.id)
        if (idx >= 0) added[idx] = { ...added[idx], ml: added[idx].ml + portion }
        else added.push({ id: part.id, ml: portion, n: 1 })
      }
      return { ...s, added }
    }
    case 'bumpMl': {
      const idx = s.added.findIndex((x) => x.id === a.id)
      if (idx < 0) return s
      const others = liquidsMl(s.added) - s.added[idx].ml
      let ml = s.added[idx].ml + a.delta
      ml = Math.max(0, Math.min(ml, cap - others))
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
    case 'container': {
      const newCap = capOf(a.id)
      const cur = liquidsMl(s.added)
      let added = s.added
      if (cur > newCap && cur > 0) {
        const k = newCap / cur
        added = s.added.map((it) => (isExtra(it.id) ? it : { ...it, ml: it.ml * k }))
      }
      return { ...s, container: a.id, added }
    }
    case 'cabinet':
      return { ...s, cabinetOpen: a.value }
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
    pourPreset: (preset, ml) => dispatch({ type: 'pourPreset', preset, ml }),
    bumpMl: (id, delta) => dispatch({ type: 'bumpMl', id, delta }),
    addExtra: (id) => dispatch({ type: 'addExtra', id }),
    remove: (id) => dispatch({ type: 'remove', id }),
    clear: () => dispatch({ type: 'clear' }),
    setContainer: (id) => dispatch({ type: 'container', id }),
    setCabinet: (value) => dispatch({ type: 'cabinet', value }),
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
