import { useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { totals, dreadFromStd, drunkFromStd, comma, DRINK_LIMITS } from '../../logic/calc.js'
import { byId } from '../../data/catalog.js'
import { CONTAINERS, byContainer, capOf } from '../../data/containers.js'
import { byPreset } from '../../data/presets.js'
import { usePointerPour } from '../../hooks/usePointerPour.js'
import Avatar from '../avatar/Avatar.jsx'
import Glass from './Glass.jsx'
import Shelf from './Shelf.jsx'
import Recipe from './Recipe.jsx'
import Cabinet from './Cabinet.jsx'
import Bottle from './Bottle.jsx'
import MixGlass from './MixGlass.jsx'

const INK = '#2b1c0e'

export default function BarScreen({ state, actions, sound, sip, avMode, drankT, onDrink, onCalc, onRevive, onResetNight, poke, onPoke, onPreset }) {
  const { added, tab, container, consumed } = state
  const t = useMemo(() => totals(added), [added])
  const cap = capOf(container)
  const dead = avMode === 'dead'
  const { draggingId, dragOver, pouring, onBottleDown, ghostRef, glassRef } =
    usePointerPour({ pour: actions.pour, pourPreset: actions.pourPreset, addExtra: actions.addExtra, sound, added, cap, onPresetPour: onPreset, disabled: sip.on || dead })

  const extrasSig = added.filter((it) => byId[it.id]?.cat === 'extra').map((it) => `${it.id}:${it.n || 1}`).join(',')
  const extrasInfo = useMemo(() => {
    const counts = {}; let used = 0
    for (const it of added) { const d = byId[it.id]; if (d?.cat === 'extra') { counts[it.id] = it.n || 1; used += it.n || 1 } }
    return { counts, used }
  }, [extrasSig]) // eslint-disable-line react-hooks/exhaustive-deps

  const setTab = useCallback((v) => { sound.pop(); actions.setTab(v) }, [sound, actions])
  const pickContainer = useCallback((id) => { sound.pop(); actions.setContainer(id) }, [sound, actions])
  const bumpMl = useCallback((id, d) => { sound.bubble(); actions.bumpMl(id, d) }, [sound, actions])
  const removeItem = useCallback((id) => { sound.pop(); actions.remove(id) }, [sound, actions])
  const openCabinet = useCallback(() => { sound.swoosh(); actions.setCabinet(true) }, [sound, actions])
  const closeCabinet = useCallback(() => { sound.pop(); actions.setCabinet(false) }, [sound, actions])

  const draggingPreset = draggingId ? byPreset[draggingId] : null

  // ── estado del personaje: miedo por lo servido + mareo por lo YA tomado ──
  const liveStd = sip.on ? sip.std : drankT.std
  const drunk = drunkFromStd(liveStd)
  const drunkQ = Math.round(drunk * 24) / 24
  const dread = dreadFromStd(t.std) * (1 - drunk * 0.8) // si ya está mareado, el miedo pesa menos
  const dreadQ = Math.round(dread * 12) / 12
  const full = t.ml >= cap - 1

  const topLiq = [...added].reverse().find((it) => byId[it.id]?.cat !== 'extra' && it.ml > 0)
  const drinkColor = topLiq ? byId[topLiq.id].bottle.liquid : '#e3a90f'

  const av = {
    mode: avMode,
    fear: sip.on ? 0 : dreadQ,
    drunk: drunkQ,
    drinking: sip.on,
    drinkK: sip.drain,
    drinkColor,
  }

  const caption = dead ? '☠️ demasiado alcohol… tocá revivir'
    : avMode === 'sleep' ? '😴 se durmió… tocalo para despertarlo'
      : avMode === 'vomit' ? '🤮 ¡puaj! (y ojo: vomitar NO baja la alcoholemia)'
        : sip.on ? '¡glup glup glup!'
          : liveStd >= DRINK_LIMITS.vomit * 0.75 ? '🥴 ya está muy mareado…'
            : liveStd >= DRINK_LIMITS.drunk ? '😵‍💫 se le nota bastante…'
              : liveStd >= DRINK_LIMITS.tipsy ? '¡hip! ya le pegó un poco 🙃'
                : added.length === 0 && consumed.length === 0 ? 'este serías vos · tocame 👆'
                  : dread > 0.66 ? '¡uh… eso es mucho! 😨' : dread > 0.33 ? 'ehh… tranqui 😟' : consumed.length ? '¿otra ronda? 🙂' : '¡buena esa! 🙂'

  const ghostDrink = draggingId ? byId[draggingId] : null
  const ghostIsExtra = ghostDrink?.cat === 'extra'
  const activeColor = ghostDrink?.bottle?.liquid || draggingPreset?.color || null
  const C = byContainer[container]

  const canDrink = added.length > 0 && !sip.on && !dead
  const canCalc = consumed.length > 0 && !sip.on

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%', padding: '80px 16px 14px', boxSizing: 'border-box', position: 'relative' }} className="bar-wrap">
      {/* ambiente: cartel de neón + brillo cálido (decoración de fondo) */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(60% 40% at 78% 12%,rgba(255,120,60,.12),transparent 60%)' }} />
      <BackBar />
      <div aria-hidden style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1, pointerEvents: 'none',
        fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 15, color: '#ff8ad6', letterSpacing: '1px',
        textShadow: '0 0 6px #ff2fae,0 0 14px #ff2fae,0 0 22px rgba(255,47,174,.6)',
        animation: 'neonFlicker 3.4s infinite',
      }}>🍸 COCKTAILS</div>

      {/* IZQUIERDA */}
      <div style={{ flex: '0 0 40%', minWidth: 300, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 2 }} className="bar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 15, color: '#e8c58f' }}>tu {C?.name?.toLowerCase() || 'vaso'} {C?.emoji || '🍹'}</div>
        </div>

        {/* selector de recipiente */}
        <div className="scroll-x" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, marginBottom: 2 }}>
          {CONTAINERS.map((c) => {
            const on = c.id === container
            return (
              <button key={c.id} onClick={() => pickContainer(c.id)} title={`${c.name} · ${c.cap} ml`} className="btn-cartoon" style={{
                flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1,
                background: on ? '#ffb03a' : '#ffedd0', border: '2.5px solid #3d2410', borderRadius: 10,
                padding: '4px 8px 3px', cursor: 'pointer', boxShadow: on ? '0 3px 0 #3d2410' : '0 2px 0 #3d2410',
                fontFamily: 'Fredoka, sans-serif', color: INK, transform: on ? 'translateY(-1px)' : 'none',
              }}>
                <span style={{ fontSize: 16 }}>{c.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>{c.cap >= 1000 ? '1 L' : `${c.cap}`}</span>
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, minHeight: 0 }}>
          <div ref={glassRef} data-glass="1" key={container} style={{ position: 'relative', animation: 'containerPop .42s cubic-bezier(.34,1.4,.5,1)' }}>
            <Glass added={added} container={container} activeColor={pouring ? activeColor : null} pouring={pouring} dragOver={dragOver} onClink={() => sound.clink()} scale={0.82} drain={sip.on ? sip.drain : 0} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar {...av} scale={0.58} accent="#ffb03a" bubble={!sip.on && avMode === 'ok' && dread > 0.33 ? '¿todo eso?' : null} poke={poke} onPoke={onPoke} />
            <div style={{ width: 66, height: 11, background: '#8a5a2b', border: '3px solid #3d2410', borderRadius: 5 }} />
            <div style={{ width: 40, height: 28, background: '#6b4020', border: '3px solid #3d2410', borderTop: 'none', borderRadius: '0 0 6px 6px' }} />
            <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 13, color: '#e8c58f', marginTop: 4, textAlign: 'center', maxWidth: 130, lineHeight: 1.15 }}>{caption}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', margin: '6px 0', fontWeight: 800, fontSize: 12 }}>
          <span style={badge}>{Math.round(t.ml)} / {cap} ml</span>
          <span style={{ ...badge, background: full ? '#fde4e4' : '#ffedd0', color: full ? '#a51a2c' : INK }}>
            {full ? '🚱 lleno' : t.abv > 0 ? `${comma(t.abv)}°` : 'sin alcohol'}
          </span>
          {/* lo que ya se tomó */}
          <span style={{
            ...badge,
            background: drankT.std >= DRINK_LIMITS.vomit ? '#fde4e4' : drankT.std >= DRINK_LIMITS.tipsy ? '#fff0d6' : '#ffedd0',
            color: drankT.std >= DRINK_LIMITS.vomit ? '#a51a2c' : INK,
          }}>
            🍸 tomó {consumed.length} {consumed.length === 1 ? 'ronda' : 'rondas'} · {comma(drankT.std)} est.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {dead ? (
            <div onClick={onRevive} className="btn-cartoon" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: '#7ec26a', border: '3px solid #3d2410', borderRadius: 16,
              padding: 12, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: INK,
              cursor: 'pointer', boxShadow: '0 6px 0 #3d2410', animation: 'fillPulse 1.4s ease-in-out infinite',
            }}>
              <span style={{ fontSize: 21 }}>⛑️</span> ¡Revivir!
            </div>
          ) : (
            <div onClick={() => canDrink && onDrink()} className={canDrink ? 'btn-cartoon' : undefined} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: canDrink ? '#ffb03a' : '#8a7a60', border: '3px solid #3d2410', borderRadius: 16,
              padding: 12, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: INK,
              cursor: canDrink ? 'pointer' : 'not-allowed', boxShadow: '0 6px 0 #3d2410', opacity: canDrink ? 1 : 0.6,
            }}>
              <span style={{ fontSize: 21 }}>{sip.on ? '😋' : '🥤'}</span> {sip.on ? 'Tomando…' : '¡Tomar!'}
            </div>
          )}
          <div onClick={() => canCalc && onCalc()} className={canCalc ? 'btn-cartoon' : undefined} title="Calcular el efecto de todo lo que tomó" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: canCalc ? '#7ec26a' : '#8a7a60', border: '3px solid #3d2410', borderRadius: 16,
            padding: 12, fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: INK,
            cursor: canCalc ? 'pointer' : 'not-allowed', boxShadow: '0 6px 0 #3d2410', opacity: canCalc ? 1 : 0.6,
          }}>
            <span style={{ fontSize: 20 }}>🧮</span> Calcular
          </div>
          <div onClick={() => { sound.swoosh(); actions.clear() }} title="Vaciar el vaso" className="btn-cartoon" style={{
            flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#ffedd0', border: '3px solid #3d2410', borderRadius: 14, padding: '6px 13px',
            fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: '0 5px 0 #3d2410',
          }}>
            <span style={{ fontSize: 19 }}>🗑️</span>Vaciar
          </div>
          <div onClick={onResetNight} title="Reiniciar la noche: se va a dormir y arranca de cero" className="btn-cartoon" style={{
            flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#c9b8e8', border: '3px solid #3d2410', borderRadius: 14, padding: '6px 13px',
            fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: '0 5px 0 #3d2410', color: INK,
          }}>
            <span style={{ fontSize: 19 }}>🌙</span>Reiniciar
          </div>
        </div>
      </div>

      {/* DERECHA: el mueble */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, position: 'relative', zIndex: 2,
        background: 'linear-gradient(180deg,#5d3a19,#4a2c12)', border: '4px solid #3d2410', borderRadius: 18,
        padding: 12, boxShadow: '0 10px 0 #2a1707,0 22px 40px rgba(0,0,0,.45)' }} className="bar-right">
        {/* cartel arriba del mueble */}
        <div style={{
          alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(180deg,#e0a24a,#c07f28)', color: '#2b1c0e', border: '3px solid #3d2410',
          borderRadius: 10, padding: '5px 16px', boxShadow: '0 4px 0 #3d2410', fontFamily: 'Patrick Hand, cursive',
          animation: state.cabinetOpen ? undefined : 'signSwing 4s ease-in-out infinite', transformOrigin: 'top center',
        }}>
          <span style={{ fontSize: 18 }}>🍸 La barra</span>
          <span style={{ fontSize: 15, opacity: 0.9 }}>{state.cabinetOpen ? '· ¡servite! 🍹' : '· tocá para abrir 👆'}</span>
        </div>
        <Cabinet open={state.cabinetOpen} onOpen={openCabinet} onClose={closeCabinet}>
          <Shelf tab={tab} setTab={setTab} onBottleDown={onBottleDown} extrasInfo={extrasInfo} />
        </Cabinet>
        <Recipe added={added} bumpMl={bumpMl} remove={removeItem} consumed={consumed} drankT={drankT} />
      </div>

      {/* GHOST del drag (portal a body para que no lo recorte el mundo) */}
      {draggingId && createPortal(
        <div ref={ghostRef} style={{ position: 'fixed', left: -999, top: -999, zIndex: 200, pointerEvents: 'none', transform: 'translate(-50%,-58%)', willChange: 'left,top' }}>
          <div style={{ transform: dragOver && !ghostIsExtra ? 'rotate(-116deg) translateY(-6px)' : 'rotate(-8deg)', transition: 'transform .18s ease', transformOrigin: '60% 70%' }}>
            {draggingPreset
              ? <MixGlass color={draggingPreset.color} h={80} />
              : ghostIsExtra
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

// Botellas de fondo en una estantería, difuminadas, para dar profundidad al bar.
const BACK_BOTTLES = [
  { c: '#c9962f', h: 66, w: 15 }, { c: '#8a3b1e', h: 78, w: 13 }, { c: '#6e1b34', h: 58, w: 16 },
  { c: '#3a6b3a', h: 84, w: 13 }, { c: '#a80c22', h: 64, w: 15 }, { c: '#e0a24a', h: 74, w: 14 },
  { c: '#4a2c12', h: 90, w: 12 }, { c: '#2a5a4a', h: 60, w: 16 }, { c: '#b5541c', h: 80, w: 13 },
  { c: '#7a1420', h: 68, w: 15 }, { c: '#d0a02a', h: 56, w: 16 }, { c: '#3a4a1e', h: 86, w: 12 },
  { c: '#8a5a1e', h: 72, w: 14 }, { c: '#a83b52', h: 62, w: 15 }, { c: '#1a6b3a', h: 82, w: 13 },
  { c: '#c07f28', h: 66, w: 15 }, { c: '#5a2418', h: 76, w: 13 }, { c: '#0a5c3a', h: 58, w: 16 },
]

function BackBar() {
  return (
    <div aria-hidden style={{
      position: 'absolute', top: 28, left: 0, right: 0, height: 118, zIndex: 1, pointerEvents: 'none',
      opacity: 0.5, filter: 'blur(1.4px)',
      maskImage: 'linear-gradient(180deg,#000 62%,transparent)', WebkitMaskImage: 'linear-gradient(180deg,#000 62%,transparent)',
    }}>
      {/* luces cálidas detrás de las botellas */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 30%,rgba(255,180,90,.5),transparent 22%),radial-gradient(circle at 52% 24%,rgba(255,150,70,.4),transparent 20%),radial-gradient(circle at 82% 32%,rgba(255,190,110,.45),transparent 22%)' }} />
      {/* fila de botellas sobre una repisa */}
      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {BACK_BOTTLES.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: b.w * 0.34, height: 10, background: b.c, filter: 'brightness(.8)', borderRadius: 2 }} />
            <div style={{ width: b.w, height: b.h, background: `linear-gradient(90deg,rgba(255,255,255,.35),${b.c} 40%,rgba(0,0,0,.3))`, borderRadius: '6px 6px 3px 3px' }} />
          </div>
        ))}
      </div>
      {/* repisa de madera */}
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 12, height: 9, background: 'linear-gradient(180deg,#7a4c20,#4a2c12)', borderRadius: 3, boxShadow: '0 3px 6px rgba(0,0,0,.4)' }} />
    </div>
  )
}
