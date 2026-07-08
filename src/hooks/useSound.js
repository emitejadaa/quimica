import { useRef, useEffect, useMemo } from 'react'

// Sintetizador WebAudio (sin assets). Beeps y ruido para el chorro.
export function useSound(muted) {
  const mutedRef = useRef(muted)
  useEffect(() => { mutedRef.current = muted }, [muted])

  const ref = useRef({ ac: null, nb: null, pour: null, bubT: null })

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
      bubble,
      pourStart: () => {
        if (mutedRef.current) return
        const ac = ensure(); const st = ref.current
        if (!ac || st.pour) return
        const src = ac.createBufferSource(); src.buffer = noiseBuf(); src.loop = true
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 750; bp.Q.value = 0.8
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, ac.currentTime)
        g.gain.exponentialRampToValueAtTime(0.08, ac.currentTime + 0.12)
        src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start()
        st.pour = { src, g }
        st.bubT = setInterval(bubble, 350)
      },
      pourStop: () => {
        const st = ref.current
        if (st.bubT) { clearInterval(st.bubT); st.bubT = null }
        if (!st.pour) return
        const ac = st.ac, { src, g } = st.pour; st.pour = null
        try { g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15); src.stop(ac.currentTime + 0.2) } catch (e) {}
      },
    }
  }, [])

  useEffect(() => () => { api.pourStop() }, [api])
  return api
}
