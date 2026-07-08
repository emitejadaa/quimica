import { useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { totals, dreadFromStd, comma } from '../../logic/calc.js'
import { byId, GLASS_CAP } from '../../data/catalog.js'
import { usePointerPour } from '../../hooks/usePointerPour.js'
import Avatar from '../avatar/Avatar.jsx'
import Glass from './Glass.jsx'
import Shelf from './Shelf.jsx'
import Recipe from './Recipe.jsx'
import Presets from './Presets.jsx'
import Bottle from './Bottle.jsx'

const INK = '#2b1c0e'

export default function BarScreen({ state, actions, sound, mix, onMix, poke, onPoke }) {
  const { added, tab } = state
  const t = useMemo(() => totals(added), [added])
  const { draggingId, dragOver, pouring, onBottleDown, ghostRef, glassRef } =
    usePointerPour({ pour: actions.pour, addExtra: actions.addExtra, sound, added })

  const extrasSig = added.filter((it) => byId[it.id]?.cat === 'extra').map((it) => `${it.id}:${it.n || 1}`).join(',')
  const extrasInfo = useMemo(() => {
    const counts = {}; let used = 0
    for (const it of added) { const d = byId[it.id]; if (d?.cat === 'extra') { counts[it.id] = it.n || 1; used += it.n || 1 } }
    return { counts, used }
  }, [extrasSig]) // eslint-disable-line react-hooks/exhaustive-deps

  const setTab = useCallback((v) => { sound.pop(); actions.setTab(v) }, [sound, actions])
  const onPick = useCallback((p) => { sound.pop(); actions.loadPreset(p) }, [sound, actions])
  const bumpMl = useCallback((id, d) => { sound.bubble(); actions.bumpMl(id, d) }, [sound, actions])
  const removeItem = useCallback((id) => { sound.pop(); actions.remove(id) }, [sound, actions])

  const dread = dreadFromStd(t.std)
  const dreadQ = Math.round(dread * 12) / 12 // cuantizado → el avatar (memo) no re-renderiza cada frame
  const full = t.ml >= GLASS_CAP - 1
  const av = mix.on
    ? { fear: 0, drunk: mix.drunk, drinking: mix.drinking }
    : { fear: dreadQ, drunk: 0, drinking: false }
  const caption = added.length === 0 ? 'este serías vos · tocame 👆'
    : dread > 0.66 ? '¡uh… es mucho! 😨' : dread > 0.33 ? 'ehh… tranqui 😟' : '¡buena esa! 🙂'

  const ghostDrink = draggingId ? byId[draggingId] : null
  const ghostIsExtra = ghostDrink?.cat === 'extra'

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%', padding: '80px 16px 14px', boxSizing: 'border-box' }} className="bar-wrap">
      {/* IZQUIERDA */}
      <div style={{ flex: '0 0 40%', minWidth: 300, display: 'flex', flexDirection: 'column', minHeight: 0 }} className="bar-left">
        <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 15, color: '#e8c58f', marginBottom: 2 }}>tu vaso 🍹</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, minHeight: 0 }}>
          <div ref={glassRef} style={{ position: 'relative' }}>
            <Glass added={added} activeId={pouring ? draggingId : null} pouring={pouring} dragOver={dragOver} onClink={() => sound.clink()} w={130} h={220} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar {...av} scale={0.62} accent="#ffb03a" bubble={dread > 0.33 && !mix.on ? '¡hip!' : null} bump={poke} onPoke={onPoke} />
            <div style={{ width: 70, height: 11, background: '#8a5a2b', border: '3px solid #3d2410', borderRadius: 5 }} />
            <div style={{ width: 42, height: 30, background: '#6b4020', border: '3px solid #3d2410', borderTop: 'none', borderRadius: '0 0 6px 6px' }} />
            <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 13, color: '#e8c58f', marginTop: 4, textAlign: 'center', maxWidth: 120, lineHeight: 1.15 }}>{caption}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', margin: '6px 0', fontWeight: 800, fontSize: 12 }}>
          <span style={badge}>{added.length} ingred.</span>
          <span style={badge}>{Math.round(t.ml)} / {GLASS_CAP} ml</span>
          <span style={{ ...badge, background: full ? '#fde4e4' : '#ffedd0', color: full ? '#a51a2c' : INK }}>
            {full ? '🚱 lleno' : t.abv > 0 ? `${comma(t.abv)}°` : 'sin alcohol'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div onClick={() => added.length && onMix()} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            background: added.length ? '#ffb03a' : '#8a7a60', border: '3px solid #3d2410', borderRadius: 16,
            padding: 12, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: INK,
            cursor: added.length ? 'pointer' : 'not-allowed', boxShadow: '0 6px 0 #3d2410', opacity: added.length ? 1 : 0.6,
          }}>
            <span style={{ fontSize: 21 }}>🛎️</span> ¡Mezclar!
          </div>
          <div onClick={() => { sound.swoosh(); actions.clear() }} title="Vaciar el vaso" style={{
            flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#ffedd0', border: '3px solid #3d2410', borderRadius: 14, padding: '6px 13px',
            fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: '0 5px 0 #3d2410',
          }}>
            <span style={{ fontSize: 19 }}>🪣</span>Vaciar
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0,
        background: 'linear-gradient(180deg,#5d3a19,#4a2c12)', border: '4px solid #3d2410', borderRadius: 18,
        padding: 12, boxShadow: '0 10px 0 #2a1707,0 22px 40px rgba(0,0,0,.45)' }} className="bar-right">
        <Presets onPick={onPick} />
        <Shelf tab={tab} setTab={setTab} onBottleDown={onBottleDown} extrasInfo={extrasInfo} />
        <Recipe added={added} bumpMl={bumpMl} remove={removeItem} />
      </div>

      {/* GHOST del drag (portal a body para que no lo recorte el mundo) */}
      {draggingId && createPortal(
        <div ref={ghostRef} style={{ position: 'fixed', left: -999, top: -999, zIndex: 200, pointerEvents: 'none', transform: 'translate(-50%,-58%)', willChange: 'left,top' }}>
          <div style={{ transform: dragOver && !ghostIsExtra ? 'rotate(-116deg) translateY(-6px)' : 'rotate(-8deg)', transition: 'transform .18s ease', transformOrigin: '60% 70%' }}>
            {ghostIsExtra
              ? <div style={{ fontSize: 40, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,.5))' }}>{ghostDrink.emoji}</div>
              : <Bottle spec={ghostDrink.bottle} h={84} />}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

const badge = { background: '#ffedd0', border: '2px solid #3d2410', borderRadius: 999, padding: '3px 10px' }
