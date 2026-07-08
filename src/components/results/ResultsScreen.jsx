import { useState, useMemo, useCallback } from 'react'
import { byId } from '../../data/catalog.js'
import { TIERS } from '../../data/content.js'
import {
  totals, widmark, tpeakFromStomach, timeToZero, bacAt, levelFromBac, tierIdx, fmtH, comma,
} from '../../logic/calc.js'
import Avatar from '../avatar/Avatar.jsx'
import BacCurve from './BacCurve.jsx'
import StatGrid from './StatGrid.jsx'
import RotatingCard from './RotatingCard.jsx'
import ShareCard from './ShareCard.jsx'

const INK = '#2b1c0e'

export default function ResultsScreen({ state, actions, sound, items, onEditData, onOther, poke, onPoke }) {
  const { peso, sexo, contextura, estomago, horas, factSeed } = state
  const added = items // todo lo que TOMÓ (rondas fusionadas)
  const t = useMemo(() => totals(added), [added])
  const { rFactor, Cpeak, rLabel } = useMemo(() => widmark({ grams: t.grams, peso, contextura, sexo }), [t.grams, peso, contextura, sexo])
  const tpeak = tpeakFromStomach(estomago)
  const tZero = timeToZero(Cpeak, tpeak)
  const Cnow = bacAt(horas, Cpeak, tpeak)
  const noAlc = t.grams < 0.3

  const [scrub, setScrub] = useState({ t: horas, bac: Cnow })
  // callback estable + bail-out: evita el loop de renders (efecto→setState→efecto…)
  const onScrub = useCallback((tt, bac) => {
    setScrub((prev) => (prev.t === tt && prev.bac === bac ? prev : { t: tt, bac }))
  }, [])
  const nowTier = tierIdx(scrub.bac)
  const T = TIERS[nowTier]
  const drunk = Math.min(1, levelFromBac(scrub.bac) / 6)
  const drunkQ = Math.round(drunk * 16) / 16 // cuantizado para el avatar (memo)
  // el avatar entra en modo especial según el tramo de la curva
  const avatarMode = nowTier >= 6 ? 'dead' : nowTier >= 5 ? 'sleep' : 'ok'

  const canDrive = Cpeak < 0.02
    ? { value: '✅ Sí · 0,0', danger: false }
    : Cpeak >= 0.5
      ? { value: '🚫 No · +0,5 g/L', danger: true }
      : { value: '⚠️ Bajo 0,5 igual riesgo', danger: true }

  const names = added.filter((it) => byId[it.id]?.cat !== 'extra').map((it) => byId[it.id].name).join(' + ') || 'trago sin alcohol'

  const stats = [
    { icon: '🥃', label: 'Graduación', value: `${comma(t.abv)}°` },
    { icon: '🍸', label: 'Tragos est.', value: comma(t.std) },
    { icon: '⚗️', label: 'Alcohol', value: `${comma(t.grams)} g` },
    { icon: '⏱', label: 'Volver a 0,0', value: noAlc ? '🎉 ya' : fmtH(tZero) },
    { icon: '🚗', label: '¿Manejar?', value: canDrive.value, danger: canDrive.danger },
    { icon: '🔥', label: 'Calorías', value: `${Math.round(t.kcal)}` },
    { icon: '📏', label: 'Volumen', value: `${Math.round(t.ml)} ml` },
    { icon: '🍬', label: 'Azúcar', value: `${Math.round(t.sugar)} g` },
  ]

  const cardData = {
    names, abv: comma(t.abv), bacPeak: comma(Cpeak, 2), std: comma(t.std), grams: comma(t.grams),
    kcal: Math.round(t.kcal), ml: Math.round(t.ml), sugar: Math.round(t.sugar),
    tierFace: TIERS[tierIdx(Cpeak)].face, tierLabel: TIERS[tierIdx(Cpeak)].l, tierColor: TIERS[tierIdx(Cpeak)].bd,
  }

  return (
    <div className="scroll-y" style={{ height: '100%', padding: '72px 16px 14px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 14, maxWidth: 1080, margin: '0 auto', alignItems: 'stretch', flexWrap: 'wrap', height: '100%' }} className="res-wrap">
        {/* IZQUIERDA: personaje + héroe */}
        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#2b1c0e', border: '4px dashed #8a5a2b', borderRadius: 18, padding: 12, minHeight: 0 }}>
            <Avatar fear={0} drunk={drunkQ} mode={avatarMode} scale={0.95} accent="#ffb03a" bump={poke} onPoke={onPoke} />
            <div style={{ width: 180, height: 18, background: 'linear-gradient(180deg,#8a5a2b,#5d3a19)', border: '3px solid #3d2410', borderRadius: '50%', marginTop: -6 }} />
            <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 13, color: '#e8c58f', marginTop: 6 }}>tocá al personaje 👆 · movés la curva y lo ves cambiar</div>
          </div>
          <div style={{ background: T.bg, border: `4px solid ${T.bd}`, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>{T.face}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 40, color: T.bd, lineHeight: 1 }}>{comma(scrub.bac, 2)}</span>
                <span style={{ fontWeight: 800, fontSize: 12, color: T.tx }}>g/L · {fmtH(scrub.t)}</span>
              </div>
              <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 15, color: T.tx }}>{T.l}</div>
              <div style={{ fontSize: 12, color: T.tx, opacity: 0.85 }}>{T.b} · pico ≈ {comma(Cpeak, 2)} g/L</div>
            </div>
          </div>
        </div>

        {/* DERECHA: curva + stats + tarjeta */}
        <div style={{ flex: '1 1 420px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 150 }}>
            <BacCurve Cpeak={Cpeak} tpeak={tpeak} tZero={tZero} horasNow={horas} onScrub={onScrub} />
          </div>
          <StatGrid stats={stats} />
          <RotatingCard seed={factSeed} onNext={() => { sound.pop(); actions.nextFact() }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div onClick={onEditData} className="btn-cartoon" style={btnWood}>← Cambiar datos</div>
            <ShareCard data={cardData} />
            <div onClick={onOther} className="btn-cartoon" style={{ ...btnWood, flex: 1, minWidth: 140, textAlign: 'center', background: '#ffb03a', color: INK }}>↩ Empezar otra noche</div>
          </div>
          <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 13, color: '#e8c58f', textAlign: 'center' }}>
            🧮 Widmark: {comma(t.grams)} g ÷ ({peso} kg × {String(rFactor).replace('.', ',')}) — cuerpo {rLabel}. La única alcoholemia segura para manejar es <b style={{ color: '#ffd23f' }}>0,0</b>.
          </div>
        </div>
      </div>
    </div>
  )
}

const btnWood = {
  flex: '0 0 auto', background: '#8a5a2b', color: '#ffedd0', border: '3px solid #3d2410', borderRadius: 12,
  padding: '9px 14px', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 5px 0 #3d2410',
}
