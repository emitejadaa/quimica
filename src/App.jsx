import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useBarState, mergeConsumed } from './logic/barState.js'
import { useSound } from './hooks/useSound.js'
import { useAchievements } from './hooks/useAchievements.js'
import { totals, stateFromStd, DRINK_LIMITS } from './logic/calc.js'
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
  const [poke, setPoke] = useState(false)
  const [confetti, setConfetti] = useState({ on: false, seed: 0 })
  const [trophyOpen, setTrophyOpen] = useState(false)
  const [ambient, setAmbient] = useState(false)
  const timers = useRef({ raf: 0, t1: 0, t2: 0, t3: 0, pk: 0, gulp: 0 })

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

  const onPoke = useCallback(() => {
    if (avMode === 'dead') { sound.thud(); return } // muerto no reacciona…
    if (avMode === 'sleep') { sound.pop(); setAvMode('ok'); return } // ¡se despierta!
    sound.pop()
    setPoke(true)
    clearTimeout(timers.current.pk)
    timers.current.pk = setTimeout(() => setPoke(false), 520)
  }, [sound, avMode])

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

  // ── REVIVIR / empezar la noche de nuevo ──
  const revive = useCallback(() => {
    sound.tada()
    actions.revive()
    setAvMode('ok')
    setSip({ on: false, drain: 0, std: 0 })
  }, [sound, actions])

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
    sound.swoosh()
    actions.resetDrink()
    setAvMode('ok')
    setSip({ on: false, drain: 0, std: 0 })
  }, [sound, actions])

  useEffect(() => () => {
    const t = timers.current
    cancelAnimationFrame(t.raf); clearTimeout(t.t1); clearTimeout(t.t2); clearTimeout(t.t3); clearTimeout(t.pk); clearInterval(t.gulp)
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
    </div>
  )
}
