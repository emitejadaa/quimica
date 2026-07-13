import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useBarState, mergeConsumed } from './logic/barState.js'
import { useSound } from './hooks/useSound.js'
import { useAchievements } from './hooks/useAchievements.js'
import { totals, stateFromStd, drunkFromStd, DRINK_LIMITS } from './logic/calc.js'
import { POKE_MS } from './components/avatar/pose.js'
import Hud from './components/Hud.jsx'
import Confetti from './components/Confetti.jsx'
import BarScreen from './components/bar/BarScreen.jsx'
import FormScreen from './components/form/FormScreen.jsx'
import ResultsScreen from './components/results/ResultsScreen.jsx'
import { AchievementsModal, AchievementToast } from './components/Achievements.jsx'
import { ACHIEVEMENTS } from './data/achievements.js'

const PANEL_BG = [
  'linear-gradient(180deg,#3a2410 0%,#4a2e14 46%,#2e1a08 46.5%,#241505 100%)',
  'linear-gradient(180deg,#33200e 0%,#4a2e14 52%,#241505 100%)',
  'linear-gradient(180deg,#1c1006 0%,#33200e 60%,#241505 100%)',
]
const PLANKS = 'repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 3px,transparent 3px 96px),radial-gradient(circle at 40% 8%,rgba(255,190,90,.16),transparent 45%)'

export default function App() {
  const [state, actions] = useBarState()
  const sound = useSound(state.muted)
  const { unlocked, toast, clearToast, sync: achSync, notePreset, noteAnalyze, noteEvent } = useAchievements()

  // sip = el personaje está tragando el vaso actual (drain 0..1, std interpolado)
  const [sip, setSip] = useState({ on: false, drain: 0, std: 0 })
  const [avMode, setAvMode] = useState('ok') // ok · vomit · sleep · dead
  const [poke, setPoke] = useState(null) // { kind, n } | null
  const [confetti, setConfetti] = useState({ on: false, seed: 0 })
  const [trophyOpen, setTrophyOpen] = useState(false)
  const [ambient, setAmbient] = useState(false)
  const [nightFade, setNightFade] = useState(null) // null · 'closing' · 'opening'
  const timers = useRef({ raf: 0, t1: 0, t2: 0, t3: 0, pk: 0, pk2: 0, gulp: 0, f1: 0, f2: 0 })
  const lastPoke = useRef(null)
  const pokeN = useRef(0)

  // Total ya tomado (todas las rondas fusionadas).
  const drankItems = useMemo(() => mergeConsumed(state.consumed), [state.consumed])
  const drankT = useMemo(() => totals(drankItems), [drankItems])

  // Logros: reevaluar cuando cambia el trago, el recipiente o las rondas.
  useEffect(() => {
    achSync({ added: state.added, container: state.container, rounds: state.consumed.length })
  }, [state.added, state.container, state.consumed.length, achSync])
  // Toast del logro nuevo: sonido + auto-cierre.
  useEffect(() => {
    if (!toast) return
    sound.tada()
    const id = setTimeout(clearToast, 2600)
    return () => clearTimeout(id)
  }, [toast, clearToast, sound])

  const onPreset = useCallback((preset) => notePreset(preset.id), [notePreset])

  const toggleAmbient = useCallback(() => {
    setAmbient((a) => { const n = !a; sound.ensure(); if (n) sound.ambientOn(); else sound.ambientOff(); return n })
  }, [sound])

  const fireConfetti = useCallback(() => {
    setConfetti((c) => ({ on: true, seed: c.seed + 1 }))
    clearTimeout(timers.current.t2)
    timers.current.t2 = setTimeout(() => setConfetti((c) => ({ ...c, on: false })), 1600)
  }, [])

  // Toque al personaje: reacción aleatoria (sin repetir la anterior).
  // Si ya está mareado, la mayoría de las veces se cae y se levanta.
  const onPoke = useCallback(() => {
    if (avMode === 'dead') { sound.thud(); return } // muerto no reacciona…
    if (avMode === 'sleep') { sound.pop(); setAvMode('ok'); return } // ¡se despierta!
    const drunk = drunkFromStd(drankT.std)
    let kind
    if (drunk > 0.35 && Math.random() < 0.6) {
      kind = 'fall'
    } else {
      const pool = ['jump', 'ouch', 'confused', 'ask'].filter((k) => k !== lastPoke.current)
      kind = pool[Math.floor(Math.random() * pool.length)]
    }
    lastPoke.current = kind
    if (kind === 'fall' || kind === 'ouch') sound.thud()
    if (kind === 'ask') sound.ding(); else sound.pop()
    if (kind === 'fall') { clearTimeout(timers.current.pk2); timers.current.pk2 = setTimeout(() => sound.pop(), 1900) } // se levanta
    pokeN.current += 1
    setPoke({ kind, n: pokeN.current })
    clearTimeout(timers.current.pk)
    timers.current.pk = setTimeout(() => setPoke(null), POKE_MS[kind] || 520)
  }, [sound, avMode, drankT.std])

  const goPhase = useCallback((p) => { sound.swoosh(); actions.setPhase(p) }, [sound, actions])

  // ── TOMAR: el personaje se toma el vaso actual, en tiempo real ──
  const startDrink = useCallback(() => {
    if (!state.added.length || sip.on || avMode === 'dead') return
    if (avMode === 'sleep') setAvMode('ok') // lo despierta el olorcito
    sound.ensure(); sound.swoosh()
    const glass = totals(state.added)
    const from = drankT.std
    const to = from + glass.std
    const dur = Math.max(1400, Math.min(3400, 1100 + glass.ml * 2.4))
    setSip({ on: true, drain: 0, std: from })
    // glup glup glup…
    clearInterval(timers.current.gulp)
    timers.current.gulp = setInterval(() => sound.gulp(), 430)
    setTimeout(() => sound.gulp(), 140)

    const t0 = performance.now()
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      setSip({ on: true, drain: k, std: from + (to - from) * k })
      if (k < 1) { timers.current.raf = requestAnimationFrame(step); return }
      // terminó el vaso
      clearInterval(timers.current.gulp)
      const roundStd = glass.std
      actions.consume()
      noteEvent('drink')
      if (roundStd < 0.05) noteEvent('zero')
      setSip({ on: false, drain: 0, std: to })
      // reacción según el total acumulado (el estado más grave gana)
      const st = stateFromStd(to)
      clearTimeout(timers.current.t1); clearTimeout(timers.current.t3)
      if (st === 'dead') {
        timers.current.t1 = setTimeout(() => { setAvMode('dead'); sound.dead(); noteEvent('dead') }, 650)
      } else if (st === 'sleep') {
        timers.current.t1 = setTimeout(() => { setAvMode('sleep'); sound.snore(); noteEvent('sleep') }, 700)
      } else if (st === 'vomit') {
        timers.current.t1 = setTimeout(() => {
          setAvMode('vomit'); sound.vomit(); noteEvent('vomit')
          timers.current.t3 = setTimeout(() => setAvMode('ok'), 2400)
        }, 550)
      } else if (to > DRINK_LIMITS.tipsy) {
        timers.current.t1 = setTimeout(() => sound.hic(), 420)
        if (to > 2.6) timers.current.t3 = setTimeout(() => sound.burp(), 950)
      } else {
        timers.current.t1 = setTimeout(() => sound.ding(), 300)
      }
    }
    timers.current.raf = requestAnimationFrame(step)
  }, [state.added, sip.on, avMode, drankT.std, sound, actions, noteEvent])

  // ── REINICIAR LA NOCHE: se duerme, la pantalla "parpadea" a negro,
  //    se resetea todo y despierta abriendo los ojos de a poco ──
  const resetNight = useCallback((doReset) => {
    if (nightFade) return
    sound.ensure()
    // si está despierto, primero se queda dormido; si está muerto/dormido queda como está
    if (avMode !== 'dead') { setAvMode('sleep'); sound.snore() }
    cancelAnimationFrame(timers.current.raf)
    clearInterval(timers.current.gulp)
    clearTimeout(timers.current.t1); clearTimeout(timers.current.t3)
    setNightFade('closing')
    clearTimeout(timers.current.f1); clearTimeout(timers.current.f2)
    timers.current.f1 = setTimeout(() => {
      // pantalla en negro: reset invisible del estado
      doReset()
      setAvMode('ok')
      setSip({ on: false, drain: 0, std: 0 })
      setNightFade('opening')
      sound.ding()
      timers.current.f2 = setTimeout(() => setNightFade(null), 3000)
    }, 2000)
  }, [nightFade, avMode, sound])

  // ── REVIVIR / empezar la noche de nuevo ──
  const revive = useCallback(() => {
    resetNight(() => { sound.tada(); actions.revive() })
  }, [resetNight, sound, actions])

  // ── CALCULAR: ir a la ficha con todo lo tomado ──
  const onCalc = useCallback(() => {
    if (!state.consumed.length) return
    sound.swoosh()
    actions.setPhase(1)
  }, [state.consumed.length, sound, actions])

  const onAnalyze = useCallback(() => {
    sound.tada(); fireConfetti(); noteAnalyze()
    achSync({ added: state.added, container: state.container, rounds: state.consumed.length })
    actions.analyze()
  }, [sound, actions, fireConfetti, noteAnalyze, achSync, state.added, state.container, state.consumed.length])

  const onOther = useCallback(() => {
    resetNight(() => actions.resetDrink())
  }, [resetNight, actions])

  useEffect(() => () => {
    const t = timers.current
    cancelAnimationFrame(t.raf); clearTimeout(t.t1); clearTimeout(t.t2); clearTimeout(t.t3)
    clearTimeout(t.pk); clearTimeout(t.pk2); clearTimeout(t.f1); clearTimeout(t.f2); clearInterval(t.gulp)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', fontFamily: 'Nunito, sans-serif', color: '#2b1c0e', background: '#241505' }}>
      <Hud
        phase={state.phase}
        setPhase={goPhase}
        canForm={state.consumed.length > 0 || state.analyzed}
        canResults={state.analyzed}
        muted={state.muted}
        toggleMute={actions.toggleMute}
        onTrophy={() => { sound.pop(); setTrophyOpen(true) }}
        achDone={unlocked.length}
        achTotal={ACHIEVEMENTS.length}
        ambient={ambient}
        toggleAmbient={toggleAmbient}
      />

      <div style={{
        display: 'flex', width: '300vw', height: '100%',
        transform: `translateX(${-state.phase * 100}vw)`,
        transition: 'transform .8s cubic-bezier(.7,0,.3,1)', willChange: 'transform',
      }}>
        {[0, 1, 2].map((p) => (
          <section key={p} style={{ width: '100vw', height: '100%', flex: '0 0 auto', position: 'relative', overflow: 'hidden', background: PANEL_BG[p] }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: PLANKS }} />
            <div style={{ position: 'relative', height: '100%' }}>
              {p === 0 && (
                <BarScreen
                  state={state} actions={actions} sound={sound}
                  sip={sip} avMode={avMode} drankT={drankT}
                  onDrink={startDrink} onCalc={onCalc} onRevive={revive}
                  onResetNight={() => resetNight(() => actions.resetDrink())}
                  poke={poke} onPoke={onPoke} onPreset={onPreset}
                />
              )}
              {p === 1 && <FormScreen state={state} actions={actions} sound={sound} drankT={drankT} onAnalyze={onAnalyze} onBack={() => goPhase(0)} />}
              {p === 2 && <ResultsScreen state={state} actions={actions} sound={sound} items={drankItems} onEditData={() => goPhase(1)} onOther={onOther} poke={poke} onPoke={onPoke} />}
            </div>
          </section>
        ))}
      </div>

      <Confetti on={confetti.on} seed={confetti.seed} />
      <AchievementToast toast={toast} />
      {trophyOpen && <AchievementsModal unlocked={unlocked} onClose={() => setTrophyOpen(false)} />}
      {nightFade && <NightBlink phase={nightFade} />}
    </div>
  )
}

// Overlay de "párpados": dos tapas negras que cierran la pantalla al dormirse
// y la abren parpadeando lento al despertar en la mañana siguiente.
function NightBlink({ phase }) {
  const lid = (top) => ({
    // 64% de alto y radio vertical 14%: aun con la curva, los dos párpados se solapan
    // en toda la pantalla (incluidos los bordes laterales) cuando están cerrados
    position: 'absolute', left: 0, right: 0, height: '64%',
    [top ? 'top' : 'bottom']: 0,
    background: '#0a0602',
    borderRadius: top ? '0 0 50% 50% / 0 0 14% 14%' : '50% 50% 0 0 / 14% 14% 0 0',
    transformOrigin: top ? 'center top' : 'center bottom',
    transform: 'scaleY(0)',
    animation: phase === 'closing'
      ? 'lidShut 1.5s .4s cubic-bezier(.65,0,.35,1) both'
      : 'lidOpen 2.9s ease-in-out both',
    willChange: 'transform',
  })
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, overflow: 'hidden' }}>
      <div style={lid(true)} />
      <div style={lid(false)} />
      {phase === 'closing' && (
        <div style={{
          position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)',
          fontSize: 44, animation: 'zzzFade 2s .5s ease both', pointerEvents: 'none',
        }}>💤</div>
      )}
    </div>
  )
}
