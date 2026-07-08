// Cálculo puro: gramos de etanol, ABV, nutrición, Widmark y curva de alcoholemia.
import { byId, STD_GRAMS } from '../data/catalog.js'

const ETHANOL_DENSITY = 0.789

// Factor de distribución R (Widmark) por contextura × sexo.
export const R_TABLE = {
  Astenico: { M: 0.85, F: 0.76, label: 'asténico' },
  Atletico: { M: 0.76, F: 0.67, label: 'atlético' },
  Picnico: { M: 0.64, F: 0.58, label: 'pícnico' },
  Promedio: { M: 0.75, F: 0.67, label: 'promedio' },
}

export const BETA = 0.15 // g/L por hora (eliminación)

export function itemGrams(item) {
  const d = byId[item.id]
  if (!d || !item.ml) return 0
  return item.ml * (d.abv / 100) * ETHANOL_DENSITY
}

// Totales de la receta actual.
export function totals(added) {
  let ml = 0, grams = 0, abvNum = 0, kcal = 0, sugar = 0
  for (const it of added) {
    const d = byId[it.id]
    if (!d) continue
    if (d.cat === 'extra') {
      const n = it.n || 1
      kcal += (d.kcalEach || 0) * n
      sugar += (d.sugarEach || 0) * n
    } else {
      ml += it.ml || 0
      grams += itemGrams(it)
      abvNum += (it.ml || 0) * d.abv
      kcal += ((it.ml || 0) * (d.kcal100 || 0)) / 100
      sugar += ((it.ml || 0) * (d.sugar100 || 0)) / 100
    }
  }
  const abv = ml > 0 ? abvNum / ml : 0
  const std = grams / STD_GRAMS
  return { ml, grams, abv, kcal, sugar, std }
}

// Widmark: C = gramos / (peso × R)
export function widmark({ grams, peso, contextura, sexo }) {
  const row = R_TABLE[contextura] || R_TABLE.Promedio
  const rFactor = row[sexo] ?? 0.7
  const Cpeak = peso > 0 ? grams / (peso * rFactor) : 0
  return { rFactor, Cpeak, rLabel: row.label }
}

export function tpeakFromStomach(estomago) {
  return estomago === 'vacio' ? 0.5 : estomago === 'lleno' ? 1.5 : 1.0
}

// Curva: sube lineal hasta el pico, luego baja a ritmo BETA.
export function bacAt(t, Cpeak, tpeak) {
  if (t <= 0) return 0
  if (t <= tpeak) return Cpeak * (t / tpeak)
  return Math.max(0, Cpeak - BETA * (t - tpeak))
}

export function timeToZero(Cpeak, tpeak) {
  return Cpeak > 0 ? tpeak + Cpeak / BETA : 0
}

// Nivel de intoxicación CONTINUO (0..6) alineado con los tiers.
const BAC_BREAKS = [0, 0.05, 0.3, 0.5, 1.0, 2.0, 3.0]
export function levelFromBac(c) {
  if (c <= 0) return 0
  for (let i = 0; i < BAC_BREAKS.length - 1; i++) {
    const lo = BAC_BREAKS[i], hi = BAC_BREAKS[i + 1]
    if (c < hi) return i + (c - lo) / (hi - lo)
  }
  return 6
}
export function tierIdx(c) {
  return Math.min(6, Math.floor(levelFromBac(c)))
}

// "Miedo" en el bar según la fuerza del trago (tragos estándar en el vaso).
export function dreadFromStd(std) {
  return Math.max(0, Math.min(1, std / 4))
}

// ─── Modo bar: el personaje toma rondas y se va poniendo peor en tiempo real ───
// Umbrales en tragos estándar acumulados (perfil de referencia, sin ficha todavía).
export const DRINK_LIMITS = { tipsy: 1.5, drunk: 3.5, vomit: 6, sleep: 9, dead: 12 }

// Mareo continuo 0..1 para la pose del avatar en el bar (1 = colapso).
export function drunkFromStd(std) {
  return Math.max(0, Math.min(1, std / DRINK_LIMITS.dead))
}

// Estado discreto según lo tomado: ok · vomit · sleep · dead.
export function stateFromStd(std) {
  if (std >= DRINK_LIMITS.dead) return 'dead'
  if (std >= DRINK_LIMITS.sleep) return 'sleep'
  if (std >= DRINK_LIMITS.vomit) return 'vomit'
  return 'ok'
}

export function fmtH(h) {
  if (h <= 0) return '—'
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60)
  if (hh <= 0) return mm + ' min'
  return hh + ' h' + (mm ? ' ' + mm + ' min' : '')
}

export function comma(n, dec = 1) {
  return Number(n).toFixed(dec).replace('.', ',')
}
