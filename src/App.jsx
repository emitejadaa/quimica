import { useRef, useState, useEffect, useCallback } from 'react'
import { useBarState } from './logic/barState.js'
import { useSound } from './hooks/useSound.js'
import { useAchievements } from './hooks/useAchievements.js'
import { totals, drunkFromStd } from './logic/calc.js'
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
  const { unlocked, toast, clearToast, sync: achSync, notePreset, noteAnalyze } = useAchievements()

  const [mix, setMix] = useState({ on: false, drinking: false, drunk: 0 })
  const [poke, setPoke] = useState(false)
  const [confetti, setConfetti] = useState({ on: false, seed: 0 })
  const [trophyOpen, setTrophyOpen] = useState(false)
  const [ambient, setAmbient] = useState(false)
  const timers = useRef({ raf: 0, t1: 0, t2: 0, pk: 0 })

  // Logros: reevaluar cuando cambia el trago o el recipiente.
  useEffect(() => { achSync({ added: state.added, container: state.container }) }, [state.added, state.container, achSync])
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
    sound.pop()
    setPoke(true)
    clearTimeout(timers.current.pk)
    timers.current.pk = setTimeout(() => setPoke(false), 520)
  }, [sound])

  const goPhase = useCallback((p) => { sound.swoosh(); actions.setPhase(p) }, [sound, actions])

  const startMix = useCallback(() => {
    if (!state.added.length) return
    sound.ensure(); sound.swoosh()
    const target = drunkFromStd(totals(state.added).std)
    setMix({ on: true, drinking: true, drunk: 0 })
    setTimeout(() => sound.gulp(), 180)
    clearTimeout(timers.current.t1)
    timers.current.t1 = setTimeout(() => {
      setMix((m) => ({ ...m, drinking: false }))
      if (target > 0.25) sound.hic()
      const t0 = performance.now()
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1000)
        setMix((m) => ({ ...m, drunk: target * k }))
        if (k < 1) timers.current.raf = requestAnimationFrame(step)
        else {
          clearTimeout(timers.current.t2)
          timers.current.t2 = setTimeout(() => {
            fireConfetti()
            actions.setPhase(1)
            setMix({ on: false, drinking: false, drunk: 0 })
          }, 480)
        }
      }
      timers.current.raf = requestAnimationFrame(step)
    }, 720)
  }, [state.added, sound, actions, fireConfetti])

  const onAnalyze = useCallback(() => { sound.tada(); fireConfetti(); noteAnalyze(); achSync({ added: state.added, container: state.container }); actions.analyze() }, [sound, actions, fireConfetti, noteAnalyze, achSync, state.added, state.container])

  useEffect(() => () => {
    const t = timers.current
    cancelAnimationFrame(t.raf); clearTimeout(t.t1); clearTimeout(t.t2); clearTimeout(t.pk)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', fontFamily: 'Nunito, sans-serif', color: '#2b1c0e', background: '#241505' }}>
      <Hud
        phase={state.phase}
        setPhase={goPhase}
        canForm={state.added.length > 0}
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
              {p === 0 && <BarScreen state={state} actions={actions} sound={sound} mix={mix} onMix={startMix} poke={poke} onPoke={onPoke} onPreset={onPreset} />}
              {p === 1 && <FormScreen state={state} actions={actions} sound={sound} onAnalyze={onAnalyze} onBack={() => goPhase(0)} />}
              {p === 2 && <ResultsScreen state={state} actions={actions} sound={sound} onEditData={() => goPhase(1)} onOther={() => { sound.swoosh(); actions.resetDrink() }} poke={poke} onPoke={onPoke} />}
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
