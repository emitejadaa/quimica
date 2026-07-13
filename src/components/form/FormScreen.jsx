import { fmtH } from '../../logic/calc.js'
import GameSlider from './GameSlider.jsx'

const INK = '#2b1c0e'

// Transición compartida del símbolo de género: rotación con anticipación y rebote.
const SYM_T = { transition: 'transform .55s cubic-bezier(.6,-.3,.3,1.35)' }

function BodySilhouette({ peso, sexo, estomago }) {
  // ancho del torso escala con el peso (35..110)
  const f = 0.62 + ((peso - 35) / 75) * 0.85
  // el torso se "llena" de naranja de abajo hacia arriba según el estómago (y 112 → 44)
  const lvl = Math.max(0, Math.min(1, (estomago ?? 50) / 100))
  const fillTop = 112 - 68 * lvl
  const torso = `M${60 - 22 * f} 60 Q${60 - 26 * f} 46 ${60 - 10} 44 L${60 + 10} 44 Q${60 + 26 * f} 46 ${60 + 22 * f} 60 L${60 + 18 * f} 104 Q${60 + 18 * f} 112 ${60 + 10} 112 L${60 - 10} 112 Q${60 - 18 * f} 112 ${60 - 18 * f} 104 Z`
  const male = sexo === 'M'
  return (
    <svg viewBox="0 0 120 130" width="88" height="95" style={{ display: 'block' }}>
      <defs><clipPath id="torsoFill"><path d={torso} /></clipPath></defs>
      <ellipse cx="60" cy="124" rx={26 * f} ry="6" fill="rgba(0,0,0,.18)" />
      <circle cx="60" cy="24" r="16" fill="#ffb03a" stroke={INK} strokeWidth="3.4" />
      <g clipPath="url(#torsoFill)">
        <rect x="0" y="40" width="120" height="76" fill="#fff" />
        <rect x="0" y={fillTop} width="120" height="80" fill="#ffb03a" style={{ transition: 'y .25s ease' }} />
        <rect x="0" y={fillTop - 1} width="120" height="3" fill="#f29a2e" opacity={lvl > 0.03 && lvl < 0.97 ? 1 : 0} style={{ transition: 'y .25s ease, opacity .2s' }} />
      </g>
      <path d={torso} fill="none" stroke={INK} strokeWidth="3.4" strokeLinejoin="round" />
      {/* símbolo del género: al cambiar, la flecha ♂ barre girando y muta en la cruz de ♀ */}
      <g transform="translate(60 78)">
        <circle r="8.2" fill="rgba(255,246,230,.9)" stroke={INK} strokeWidth="2.6" />
        <g transform={`rotate(${male ? -45 : 90})`} style={SYM_T}>
          <line x1="8.2" y1="0" x2="16.6" y2="0" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <g transform={male ? 'translate(14.4 -2.3) rotate(42)' : 'translate(12.4 0) rotate(90)'} style={SYM_T}>
            <line x1="-3.6" y1="0" x2="3.6" y2="0" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <g transform={male ? 'translate(14.4 2.3) rotate(-42)' : 'translate(12.4 0) rotate(90)'} style={SYM_T}>
            <line x1="-3.6" y1="0" x2="3.6" y2="0" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  )
}

const CONTEXTURA_FIG = {
  Astenico: 'M60 20 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 M52 40 L52 96 L58 96 L58 62 L62 62 L62 96 L68 96 L68 40 Z',
  Atletico: 'M60 20 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M40 44 Q60 36 80 44 L74 96 L64 96 L60 66 L56 96 L46 96 Z',
  Picnico: 'M60 22 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0 M42 52 Q42 40 60 40 Q78 40 78 52 Q82 96 68 96 L52 96 Q38 96 42 52 Z',
  Promedio: 'M60 20 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M46 44 Q60 38 74 44 L70 96 L62 96 L60 68 L58 96 L50 96 Z',
}

function ContexturaFig({ id, on }) {
  return (
    <svg viewBox="0 0 120 104" width="46" height="40"><path d={CONTEXTURA_FIG[id]} fill={on ? '#ffedd0' : '#b98a4a'} stroke={on ? '#ffedd0' : INK} strokeWidth="3" strokeLinejoin="round" /></svg>
  )
}

function Stomach({ level }) {
  const fill = 0.08 + 0.84 * level
  return (
    <svg viewBox="0 0 60 60" width="40" height="40">
      <defs><clipPath id="st"><path d="M22 8 Q40 6 42 24 Q52 30 44 44 Q36 56 22 50 Q10 46 12 32 Q10 16 22 8 Z" /></clipPath></defs>
      <g clipPath="url(#st)">
        <rect x="0" y="0" width="60" height="60" fill="#fff" />
        <rect x="0" y={60 - 60 * fill} width="60" height={60 * fill} fill="#ff9d4a" style={{ transition: 'all .2s' }} />
      </g>
      <path d="M22 8 Q40 6 42 24 Q52 30 44 44 Q36 56 22 50 Q10 46 12 32 Q10 16 22 8 Z" fill="none" stroke={INK} strokeWidth="3.2" />
    </svg>
  )
}

export default function FormScreen({ state, actions, sound, drankT, onAnalyze, onBack }) {
  const set = (f, v) => { sound.pop(); actions.set(f, v) }
  const seg = (on) => ({
    border: `3px solid ${INK}`, borderRadius: 12, padding: '8px 6px', fontFamily: 'Fredoka, sans-serif',
    fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: `0 3px 0 ${INK}`, textAlign: 'center', lineHeight: 1.1,
    background: on ? INK : '#fff', color: on ? '#ffedd0' : INK, transition: 'transform .1s',
  })

  return (
    <div className="scroll-y" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '78px 14px 16px' }}>
      <div style={{ width: 'min(660px,100%)', background: '#c98a4b', border: '4px solid #3d2410', borderRadius: 20, padding: 9, boxShadow: '0 12px 0 #2a1707,0 26px 44px rgba(0,0,0,.5)', animation: 'popIn .3s ease' }}>
        <div style={{ width: 120, height: 22, background: '#8a5a2b', border: '3px solid #3d2410', borderRadius: 8, margin: '-22px auto 4px', boxShadow: '0 3px 0 #3d2410' }} />
        <div style={{ background: '#fff6e6', border: '3px solid #3d2410', borderRadius: 12, padding: '14px 16px 16px' }}>
          <div style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 15, color: '#8a6a45' }}>ficha del cliente · paso 2 de 3 🧬</div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>Contanos un poco de vos</div>
          {drankT && drankT.ml > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, background: '#ffedd0',
              border: `2.5px solid ${INK}`, borderRadius: 999, padding: '3px 12px', fontFamily: 'Fredoka, sans-serif',
              fontWeight: 600, fontSize: 12.5,
            }}>
              🍸 vas a analizar todo lo que tomó: <b>{Math.round(drankT.ml)} ml · {drankT.std.toFixed(1).replace('.', ',')} tragos est.</b>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 12 }}>
            {/* COLUMNA A */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={lbl}>⚖️ Peso corporal</span>
                  <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 20, color: '#b3541e' }}>{state.peso} kg</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BodySilhouette peso={state.peso} sexo={state.sexo} estomago={state.estomago} />
                  <div style={{ flex: 1 }}>
                    <GameSlider min={35} max={110} step={1} value={state.peso} onChange={(v) => actions.set('peso', v)} knob="⚖️" label="peso" />
                  </div>
                </div>
              </div>
              <div>
                <div style={lbl}>🧬 Sexo biológico <span style={{ fontWeight: 400, fontSize: 11, color: '#8a6a45' }}>(% de agua corporal)</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                  <button onClick={() => set('sexo', 'M')} style={seg(state.sexo === 'M')}>♂ Masculino</button>
                  <button onClick={() => set('sexo', 'F')} style={seg(state.sexo === 'F')}>♀ Femenino</button>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={lbl}>🍽️ ¿Cómo está tu estómago?</span>
                  <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 20, color: '#b3541e' }}>{state.estomago}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Stomach level={state.estomago / 100} />
                  <div style={{ flex: 1 }}>
                    <GameSlider min={0} max={100} step={5} value={state.estomago} onChange={(v) => actions.set('estomago', v)} knob="🍽️" label="estómago" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Patrick Hand, cursive', fontSize: 12, color: '#8a6a45', marginTop: -4 }}>
                      <span>vacío</span><span>lleno</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA B */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={lbl}>💪 Contextura física</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                  {[['Astenico', 'Asténico', 'delgado, alto'], ['Atletico', 'Atlético', 'musculoso'], ['Picnico', 'Pícnico', 'robusto, bajo'], ['Promedio', 'Promedio', 'estándar']].map(([v, l, s]) => (
                    <button key={v} onClick={() => set('contextura', v)} style={{ ...seg(state.contextura === v), display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ContexturaFig id={v} on={state.contextura === v} />
                      <span><b>{l}</b><span style={{ display: 'block', fontWeight: 600, fontSize: 10.5, opacity: 0.7 }}>{s}</span></span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={lbl}>⏳ ¿Hace cuánto empezaste?</span>
                  <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 18, color: '#b3541e' }}>{fmtH(state.horas)}</span>
                </div>
                <GameSlider min={0} max={6} step={0.25} value={state.horas} onChange={(v) => actions.set('horas', v)} knob={state.horas < 3 ? '☀️' : '🌙'} label="horas" />
              </div>
              <button onClick={onAnalyze} style={{ marginTop: 'auto', width: '100%', background: INK, color: '#ffedd0', border: `3px solid ${INK}`, borderRadius: 15, padding: 13, fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 5px 0 #14100a' }}>
                🧪 Analizar mi trago →
              </button>
            </div>
          </div>
        </div>
        <div onClick={onBack} style={{ margin: '10px auto 0', width: 'fit-content', background: '#8a5a2b', color: '#ffedd0', border: '3px solid #3d2410', borderRadius: 12, padding: '7px 16px', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 5px 0 #3d2410' }}>← volver al bar</div>
      </div>
    </div>
  )
}

const lbl = { fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 2 }
