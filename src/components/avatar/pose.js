// Traduce dos ejes continuos (fear, drunk) en parámetros de pose interpolados.
// fear  = anticipación/miedo (mientras armás el trago con más alcohol)
// drunk = efecto del alcohol ya tomado (mareo → náusea)

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t

function hex(c) {
  const h = c.replace('#', '')
  const n = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
}
export function mix(c1, c2, t) {
  const a = hex(c1), b = hex(c2)
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`
}

export function poseFromState({ fear = 0, drunk = 0, drinking = false } = {}) {
  fear = clamp(fear)
  drunk = clamp(drunk)
  const dHigh = clamp((drunk - 0.58) / 0.42) // náusea/estupor
  const green = clamp((drunk - 0.66) / 0.34)

  const eyeOpen = clamp(1 + fear * 0.24 - drunk * 0.66, 0.14, 1.28)
  const canBlink = eyeOpen > 0.82 && !drinking
  const pupilDX = 0
  const pupilDY = drunk * 3 - fear * 2
  const browRaise = fear * 8 - drunk * 3
  const browWorry = fear
  const browDrunk = dHigh
  const blush = clamp(drunk * 0.9 + fear * 0.18, 0, 1)
  const sweatN = (fear > 0.28 ? 1 : 0) + (fear > 0.62 ? 1 : 0) + (dHigh > 0.4 ? 1 : 0)
  const mouthOpen = clamp(fear * 0.32 + dHigh * 0.9, 0, 1)
  const mouthCurve = clamp(0.7 - fear * 1.45 + drunk * 0.4 - dHigh * 1.7, -1, 1)
  const handRaise = fear
  const headTilt = drinking ? -17 : lerp(0, 7, dHigh)
  const xeyes = drunk > 0.92

  const floats = []
  if (fear > 0.72) floats.push({ c: '❕', x: 168, y: 34, key: 'excl' })
  if (drunk > 0.48 && drunk < 0.88) floats.push({ c: '💫', x: 168, y: 26, key: 'dizzy' })
  if (drunk >= 0.88) floats.push({ c: '🌀', x: 168, y: 26, key: 'spin' })

  return {
    fear, drunk, dHigh, green, eyeOpen, canBlink, pupilDX, pupilDY,
    browRaise, browWorry, browDrunk, blush, sweatN, mouthOpen, mouthCurve,
    handRaise, headTilt, xeyes, floats,
  }
}

// Animación CSS del cuerpo según el estado.
export function bodyAnim({ fear = 0, drunk = 0, drinking = false, bump = false }) {
  if (bump) return 'pokeJump .5s ease'
  if (drinking) return 'avDrink 1s ease'
  if (fear > 0.5) return 'avScared .32s ease-in-out infinite'
  if (drunk > 0.8) return 'avWoozy .9s ease-in-out infinite'
  if (drunk > 0.42) return 'avSway 1.5s ease-in-out infinite'
  if (drunk > 0.14) return 'avSway 2.6s ease-in-out infinite'
  return 'avIdle 3.8s ease-in-out infinite'
}
