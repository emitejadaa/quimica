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

// ─── El reloj de la noche: arranca 21:00 y avanza de a 1 h hasta las 06:00 ───
export const NIGHT_START_HOUR = 21
export const NIGHT_HOURS = 9 // 21:00 → 06:00 (cierre del bar)

// "HH:MM" de reloj para `h` horas desde el inicio de la noche (admite fracciones).
export function clockLabel(h) {
  const tot = (((NIGHT_START_HOUR + Math.max(0, h)) % 24) + 24) % 24
  let hh = Math.floor(tot)
  let mm = Math.round((tot - hh) * 60)
  if (mm === 60) { mm = 0; hh = (hh + 1) % 24 }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

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

// Pico de absorción según qué tan lleno está el estómago (0 % vacío → 100 % lleno).
export function tpeakFromStomach(estomago) {
  if (typeof estomago === 'number') return 0.5 + Math.max(0, Math.min(100, estomago)) / 100
  return estomago === 'vacio' ? 0.5 : estomago === 'lleno' ? 1.5 : 1.0
}

// ─── Curva multi-dosis: cada ronda de la noche es una dosis en su propia hora ───
// Cada dosis absorbe (sube lineal hasta su pico en `tpeak` horas desde que se tomó);
// el hígado elimina a ritmo constante BETA mientras haya alcohol en sangre y no
// haya una dosis absorbiéndose (igual que el Widmark clásico de una dosis: primero
// sube al pico completo, después baja — estimación del lado seguro).
// doses = [{ t: horas desde el inicio de la noche, grams }]
// Devuelve { at(t), peak, tAtPeak, tZero } con t en horas desde el inicio.
export function buildBacSeries({ doses, peso, contextura, sexo, tpeak }) {
  const row = R_TABLE[contextura] || R_TABLE.Promedio
  const rFactor = row[sexo] ?? 0.7
  const peaks = (doses || [])
    .map((d) => ({ t: Math.max(0, d.t || 0), c: peso > 0 ? d.grams / (peso * rFactor) : 0 }))
    .filter((p) => p.c > 0)
    .sort((a, b) => a.t - b.t)
  if (!peaks.length) return { at: () => 0, peak: 0, tAtPeak: 0, tZero: 0 }

  const lastT = peaks[peaks.length - 1].t
  const totalC = peaks.reduce((a, p) => a + p.c, 0)
  const horizon = lastT + tpeak + totalC / BETA + 0.25
  const dt = 1 / 60 // paso de 1 minuto
  const n = Math.ceil(horizon / dt)
  const absorbed = (t) => {
    let a = 0
    for (const p of peaks) { if (t > p.t) a += p.c * Math.min(1, (t - p.t) / tpeak) }
    return a
  }
  const absorbingAt = (t) => peaks.some((p) => t > p.t && t < p.t + tpeak)
  const samples = new Float64Array(n + 1)
  let elim = 0, peak = 0, tAtPeak = 0, lastPos = 0
  for (let i = 0; i <= n; i++) {
    const t = i * dt
    const c = Math.max(0, absorbed(t) - elim)
    samples[i] = c
    if (c > peak) { peak = c; tAtPeak = t }
    if (c > 0) { lastPos = i; if (!absorbingAt(t)) elim += BETA * dt }
  }
  const tZero = Math.min(horizon, (lastPos + 1) * dt)
  const at = (t) => {
    if (!(t > 0)) return 0
    const x = t / dt, i = Math.floor(x)
    if (i >= n) return 0
    return samples[i] + (samples[i + 1] - samples[i]) * (x - i)
  }
  return { at, peak, tAtPeak, tZero }
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
// Umbrales en tragos estándar EN EL CUERPO (perfil de referencia, sin ficha todavía).
export const DRINK_LIMITS = { tipsy: 1.5, drunk: 3.5, vomit: 6, sleep: 9, dead: 12 }

// Eliminación del perfil de referencia del bar, en tragos estándar por hora:
// β × 70 kg × R promedio ÷ 10 g por trago ≈ 0,79 est./h.
export const STD_ELIM_PER_H = (BETA * 70 * R_TABLE.Promedio.M) / STD_GRAMS

// Tragos estándar que quedan en el cuerpo a la hora `nowH` de la noche:
// cada ronda suma lo suyo en su hora y el hígado descuenta a ritmo constante
// (solo mientras haya alcohol: si llega a 0, ahí se queda hasta la próxima ronda).
export function effectiveStdAt(consumed, nowH) {
  let body = 0, t = 0
  for (const round of consumed) {
    const h = round.hour || 0
    body = Math.max(0, body - STD_ELIM_PER_H * Math.max(0, h - t))
    body += totals(round.items).std
    t = h
  }
  return Math.max(0, body - STD_ELIM_PER_H * Math.max(0, nowH - t))
}

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

export function comma(n, dec = 1) {
  return Number(n).toFixed(dec).replace('.', ',')
}
