// Traduce dos ejes continuos (fear, drunk) + un modo discreto en parámetros de pose.
// fear  = anticipación/miedo (mientras armás el trago con más alcohol)
// drunk = efecto del alcohol ya tomado (0 sobrio → 1 colapso)
// mode  = 'ok' | 'vomit' | 'sleep' | 'dead' (estados especiales que pisan la pose)

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

export function poseFromState({ fear = 0, drunk = 0, drinking = false, mode = 'ok', poke = null } = {}) {
  fear = clamp(fear)
  drunk = clamp(drunk)
  const dMid = clamp((drunk - 0.3) / 0.4) // ya se le nota
  const dHigh = clamp((drunk - 0.55) / 0.45) // náusea/estupor
  let green = clamp((drunk - 0.48) / 0.4)

  let eyeOpen = clamp(1 + fear * 0.24 - drunk * 0.72, 0.14, 1.28)
  // párpados caídos progresivos cuando el alcohol pega
  let lidDroop = clamp(dMid * 0.55 + dHigh * 0.35)
  let canBlink = eyeOpen > 0.82 && !drinking
  const pupilDX = drinking ? -1.5 : Math.sin(drunk * 9) * dMid * 2.2
  const pupilDY = drunk * 3.4 - fear * 2
  let browRaise = fear * 8 - drunk * 4
  let browWorry = fear
  let browDrunk = dHigh
  let blush = clamp(drunk * 1.1 + fear * 0.18, 0, 1)
  let sweatN = (fear > 0.28 ? 1 : 0) + (fear > 0.62 ? 1 : 0) + (dHigh > 0.4 ? 1 : 0)
  let mouthOpen = clamp(fear * 0.32 + dHigh * 0.7, 0, 1)
  let mouthCurve = clamp(0.7 - fear * 1.45 + drunk * 0.5 - dHigh * 1.9, -1, 1)
  let headTilt = drinking ? -16 : lerp(0, 8, dHigh) + Math.sin(drunk * 7) * dMid * 2
  let xeyes = false
  let tongue = 0 // 0 nada · 1 colgando (muerto)
  let drool = dHigh > 0.55 && !drinking ? clamp((dHigh - 0.55) / 0.45) : 0
  let sleepLids = false
  let halo = false
  let lookAround = false

  const floats = []
  if (mode === 'ok') {
    if (fear > 0.72 && !drinking) floats.push({ c: '❕', x: 172, y: 30, key: 'excl' })
    if (drunk > 0.34 && drunk < 0.62) floats.push({ c: '💫', x: 170, y: 24, key: 'dizzy' })
    if (drunk >= 0.62) floats.push({ c: '🌀', x: 170, y: 24, key: 'spin' })
    if (drunk >= 0.78) floats.push({ c: '⭐', x: 44, y: 30, key: 'star' })
  }

  // reacción al toque: pisa la cara un ratito (solo despierto y sin estar tragando)
  if (poke && mode === 'ok' && !drinking) {
    if (poke === 'ouch') {
      eyeOpen = 0.14; canBlink = false; lidDroop = 0
      browWorry = 1; browRaise = -3
      mouthOpen = 0.1; mouthCurve = -1
      floats.length = 0
      floats.push({ c: '💢', x: 170, y: 26, key: 'ouch' })
    } else if (poke === 'confused') {
      canBlink = false; lookAround = true
      eyeOpen = clamp(eyeOpen + 0.15, 0.3, 1.28); lidDroop = clamp(lidDroop * 0.4)
      browRaise = 7; browWorry = 0.4
      mouthOpen = 0.34; mouthCurve = -0.2
      floats.length = 0
      floats.push({ c: '❓', x: 170, y: 26, key: 'huh' })
    } else if (poke === 'ask') {
      canBlink = false
      browRaise = 8; browWorry = 0
      mouthOpen = 0; mouthCurve = clamp(mouthCurve + 0.7, 0.6, 1)
    } else if (poke === 'fall') {
      canBlink = false; eyeOpen = 0.55; lidDroop = clamp(lidDroop + 0.25)
      browDrunk = 1; browWorry = 0.5
      mouthOpen = 0.5; mouthCurve = -0.6
      floats.length = 0
      floats.push({ c: '🌀', x: 170, y: 24, key: 'spin' })
      floats.push({ c: '⭐', x: 44, y: 30, key: 'star' })
    }
  }

  if (mode === 'vomit') {
    eyeOpen = 0.12; canBlink = false; lidDroop = 0
    green = 1; blush = 0.3
    browWorry = 1; browRaise = -2; browDrunk = 1
    mouthOpen = 1; mouthCurve = -1
    headTilt = 16; sweatN = 2; drool = 0
  } else if (mode === 'sleep') {
    sleepLids = true; eyeOpen = 0; canBlink = false; lidDroop = 1
    browRaise = -3; browWorry = 0; browDrunk = 0.4
    mouthOpen = 0.34; mouthCurve = 0.15
    headTilt = 13; sweatN = 0; blush = clamp(blush, 0, 0.6); drool = 0.7
  } else if (mode === 'dead') {
    xeyes = true; canBlink = false; lidDroop = 0
    green = 0.25; blush = 0
    browRaise = 4; browWorry = 0.4; browDrunk = 0
    mouthOpen = 0.55; mouthCurve = -0.8
    headTilt = -6; sweatN = 0; tongue = 1; drool = 0; halo = true
  }

  return {
    fear, drunk, dMid, dHigh, green, eyeOpen, canBlink, pupilDX, pupilDY,
    browRaise, browWorry, browDrunk, blush, sweatN, mouthOpen, mouthCurve,
    headTilt, xeyes, tongue, drool, lidDroop, sleepLids, halo, lookAround, floats, mode,
  }
}

// Duración de cada reacción al toque (ms): la usa App para cortar el estado.
export const POKE_MS = { jump: 520, ouch: 950, confused: 1600, ask: 1700, fall: 2600 }

// Animación CSS del cuerpo según el estado.
export function bodyAnim({ fear = 0, drunk = 0, drinking = false, poke = null, mode = 'ok' }) {
  if (mode === 'dead') return 'avDead 1.15s cubic-bezier(.55,-0.2,.65,1.1) forwards'
  if (poke && !drinking && mode === 'ok') {
    if (poke === 'ouch') return 'pokeOuch .95s ease'
    if (poke === 'confused') return 'pokeConfused 1.6s ease-in-out'
    if (poke === 'ask') return 'pokeAsk 1.7s ease-in-out'
    if (poke === 'fall') return 'pokeFall 2.6s cubic-bezier(.55,0,.45,1)'
    return 'pokeJump .5s ease'
  }
  if (poke) return 'pokeJump .5s ease'
  if (mode === 'vomit') return 'avVomit .52s ease-in-out infinite'
  if (mode === 'sleep') return 'avSleep 3.4s ease-in-out infinite'
  if (drinking) return 'avGlug .6s ease-in-out infinite'
  if (fear > 0.5) return 'avScared .32s ease-in-out infinite'
  if (drunk > 0.72) return 'avWoozy .85s ease-in-out infinite'
  if (drunk > 0.5) return 'avWoozy 1.35s ease-in-out infinite'
  if (drunk > 0.3) return 'avSway 1.7s ease-in-out infinite'
  if (drunk > 0.1) return 'avSway 2.7s ease-in-out infinite'
  return 'avIdle 3.8s ease-in-out infinite'
}
