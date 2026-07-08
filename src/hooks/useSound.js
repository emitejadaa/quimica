import { useRef, useEffect, useMemo } from 'react'

// Sintetizador WebAudio (sin assets). Beeps y ruido para el chorro.
export function useSound(muted) {
  const mutedRef = useRef(muted)
  useEffect(() => { mutedRef.current = muted }, [muted])

  const ref = useRef({ ac: null, nb: null, pour: null, bubT: null, amb: null })

  const api = useMemo(() => {
    const ensure = () => {
      const st = ref.current
      if (!st.ac) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (AC) st.ac = new AC()
      }
      if (st.ac && st.ac.state === 'suspended') st.ac.resume()
      return st.ac
    }
    const beep = (f0, f1, dur, type = 'triangle', vol = 0.12) => {
      if (mutedRef.current) return
      const ac = ensure(); if (!ac) return
      const o = ac.createOscillator(), g = ac.createGain()
      o.type = type
      o.frequency.setValueAtTime(f0, ac.currentTime)
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), ac.currentTime + dur)
      g.gain.setValueAtTime(vol, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur)
      o.connect(g); g.connect(ac.destination)
      o.start(); o.stop(ac.currentTime + dur + 0.02)
    }
    const noiseBuf = () => {
      const st = ref.current, ac = st.ac
      if (!st.nb) {
        const b = ac.createBuffer(1, ac.sampleRate * 1.2, ac.sampleRate)
        const d = b.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
        st.nb = b
      }
      return st.nb
    }
    const bubble = () => beep(500 + Math.random() * 500, 1400, 0.06, 'sine', 0.05)
    return {
      ensure,
      pop: () => beep(300, 900, 0.09, 'triangle', 0.14),
      ding: () => { beep(880, 880, 0.25, 'sine', 0.1); beep(1320, 1320, 0.35, 'sine', 0.06) },
      swoosh: () => beep(180, 700, 0.35, 'sawtooth', 0.05),
      tada: () => { beep(523, 523, 0.16, 'triangle', 0.12); setTimeout(() => beep(659, 659, 0.16, 'triangle', 0.12), 130); setTimeout(() => beep(784, 784, 0.3, 'triangle', 0.14), 260) },
      clink: () => { beep(1250, 950, 0.12, 'sine', 0.1); beep(1900, 1500, 0.2, 'sine', 0.06) },
      gulp: () => beep(220, 90, 0.16, 'sine', 0.16),
      hic: () => { beep(700, 300, 0.1, 'square', 0.08); setTimeout(() => beep(500, 900, 0.08, 'sine', 0.06), 90) },
      burp: () => { beep(140, 60, 0.28, 'sawtooth', 0.12); setTimeout(() => beep(110, 70, 0.18, 'square', 0.07), 120) },
      // arcada: ruido filtrado descendente + blub grave
      vomit: () => {
        if (mutedRef.current) return
        const ac = ensure(); if (!ac) return
        const src = ac.createBufferSource(); src.buffer = noiseBuf()
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2
        bp.frequency.setValueAtTime(900, ac.currentTime)
        bp.frequency.exponentialRampToValueAtTime(120, ac.currentTime + 0.55)
        const g = ac.createGain(); g.gain.setValueAtTime(0.14, ac.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6)
        src.connect(bp); bp.connect(g); g.connect(ac.destination)
        src.start(); src.stop(ac.currentTime + 0.65)
        beep(300, 70, 0.5, 'sawtooth', 0.09)
        setTimeout(() => beep(180, 60, 0.3, 'triangle', 0.08), 260)
      },
      snore: () => {
        beep(90, 60, 0.55, 'sawtooth', 0.07)
        setTimeout(() => beep(70, 95, 0.4, 'sine', 0.06), 650)
      },
      // KO: trombón triste descendente
      dead: () => {
        beep(392, 392, 0.28, 'triangle', 0.12)
        setTimeout(() => beep(370, 370, 0.28, 'triangle', 0.12), 300)
        setTimeout(() => beep(349, 349, 0.3, 'triangle', 0.12), 600)
        setTimeout(() => beep(330, 165, 0.8, 'triangle', 0.13), 900)
      },
      thud: () => beep(90, 40, 0.12, 'square', 0.1),
      bubble,
      // El tono del chorro depende del tamaño del recipiente: chico = más agudo.
      pourStart: (cap = 500) => {
        if (mutedRef.current) return
        const ac = ensure(); const st = ref.current
        if (!ac || st.pour) return
        const k = Math.max(0, Math.min(1, cap / 1000))
        const freq = 480 + 780 * (1 - k) // 45ml→~1225 · 1000ml→~480
        const src = ac.createBufferSource(); src.buffer = noiseBuf(); src.loop = true
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.8
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, ac.currentTime)
        g.gain.exponentialRampToValueAtTime(0.08, ac.currentTime + 0.12)
        src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start()
        st.pour = { src, g }
        st.bubT = setInterval(bubble, cap < 120 ? 220 : 350)
      },
      pourStop: () => {
        const st = ref.current
        if (st.bubT) { clearInterval(st.bubT); st.bubT = null }
        if (!st.pour) return
        const ac = st.ac, { src, g } = st.pour; st.pour = null
        try { g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15); src.stop(ac.currentTime + 0.2) } catch (e) {}
      },
      // Pad ambiente lo-fi de bar (drone cálido + murmullo). Toggle propio, ignora el mute de SFX.
      ambientOn: () => {
        const ac = ensure(); const st = ref.current
        if (!ac || st.amb) return
        const t = ac.currentTime
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(0.05, t + 1.6)
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520
        const drone = ac.createOscillator(); drone.type = 'sine'; drone.frequency.value = 55
        const fifth = ac.createOscillator(); fifth.type = 'triangle'; fifth.frequency.value = 82.4; fifth.detune.value = -6
        const murmur = ac.createBufferSource(); murmur.buffer = noiseBuf(); murmur.loop = true
        const mbp = ac.createBiquadFilter(); mbp.type = 'bandpass'; mbp.frequency.value = 320; mbp.Q.value = 0.6
        const mg = ac.createGain(); mg.gain.value = 0.18
        murmur.connect(mbp); mbp.connect(mg); mg.connect(g)
        drone.connect(lp); fifth.connect(lp); lp.connect(g); g.connect(ac.destination)
        const lfo = ac.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.11
        const lfoG = ac.createGain(); lfoG.gain.value = 0.02; lfo.connect(lfoG); lfoG.connect(g.gain)
        drone.start(); fifth.start(); murmur.start(); lfo.start()
        st.amb = { g, nodes: [drone, fifth, murmur, lfo] }
      },
      ambientOff: () => {
        const st = ref.current
        if (!st.amb) return
        const ac = st.ac, { g, nodes } = st.amb; st.amb = null
        try {
          g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8)
          nodes.forEach((n) => { try { n.stop(ac.currentTime + 0.9) } catch (e) {} })
        } catch (e) {}
      },
    }
  }, [])

  useEffect(() => () => { api.pourStop(); api.ambientOff() }, [api])
  return api
}
