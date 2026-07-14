// Logros / stickers. `check(ctx)` recibe el contexto del trago actual + acumulados.
// ctx = { liquids:[ids con líquido], ml, cap, grams, std, container, rounds,
//         tried, presetsCount, containersCount, analyzeCount, drinks, vomit, sleep, dead, zero, close }
// hard = true → no se puede desbloquear por accidente (requiere intención/insistencia).
export const ACHIEVEMENTS = [
  { id: 'primer', icon: '🍹', name: 'Primer trago', desc: 'Serviste tu primera bebida.', check: (c) => c.liquids.length >= 1 },
  { id: 'fondo', icon: '🥤', name: 'Fondo blanco', desc: 'El personaje se tomó su primer vaso.', check: (c) => c.drinks >= 1 },
  { id: 'coctelero', icon: '🍸', name: 'Coctelero', desc: '3 bebidas en el mismo vaso.', check: (c) => c.liquids.length >= 3 },
  { id: 'sommelier', icon: '🍷', name: 'Sommelier', desc: 'Serviste algo en la copa.', check: (c) => c.container === 'copa' && c.ml > 0 },
  { id: 'tanque', icon: '🍺', name: 'Sed de campeón', desc: 'Usaste la jarra de 750 ml.', check: (c) => c.container === 'jarra' && c.ml > 0 },
  { id: 'shot', icon: '🥃', name: '¡Shot!', desc: 'Serviste en el vaso de shot.', check: (c) => c.container === 'shot' && c.ml > 0 },
  { id: 'lleno', icon: '🌊', name: 'Hasta el borde', desc: 'Llenaste el recipiente al tope.', check: (c) => c.ml > 0 && c.ml >= c.cap - 1 },
  { id: 'barman', icon: '🧉', name: 'Barman', desc: 'Serviste un pre-armado clásico.', check: (c) => c.presetsCount >= 1 },
  { id: 'catador', icon: '🧭', name: 'Catador', desc: 'Probaste 5 bebidas distintas.', check: (c) => c.tried >= 5 },
  { id: 'analista', icon: '🔬', name: 'Analista', desc: 'Analizaste el efecto de una noche.', check: (c) => c.analyzeCount >= 1 },
  { id: 'hidratado', icon: '💧', name: 'Hidratado', desc: 'Tomaste una ronda sin nada de alcohol.', check: (c) => c.zero >= 1 },

  // ── difíciles (hay que buscarlos a propósito) ──
  { id: 'mixologo', hard: true, icon: '⚗️', name: 'Mixólogo', desc: '5 bebidas distintas en un solo vaso.', check: (c) => c.liquids.length >= 5 },
  { id: 'rondas', hard: true, icon: '🔁', name: 'Ronda va, ronda viene', desc: '3 rondas en una misma noche.', check: (c) => c.rounds >= 3 },
  { id: 'cierre', hard: true, icon: '🕕', name: 'Hasta el cierre', desc: 'Llegaste a las 06:00, la hora en que cierra el bar.', check: (c) => (c.close || 0) >= 1 },
  { id: 'coleccionista', hard: true, icon: '🗄️', name: 'Coleccionista', desc: 'Serviste en los 7 recipientes.', check: (c) => c.containersCount >= 7 },
  { id: 'barmanpro', hard: true, icon: '🏅', name: 'Barman PRO', desc: 'Probaste 7 pre-armados distintos.', check: (c) => c.presetsCount >= 7 },
  { id: 'maraton', hard: true, icon: '🌙', name: 'Maratón', desc: 'Probaste 12 bebidas distintas.', check: (c) => c.tried >= 12 },
  { id: 'cientifico', hard: true, icon: '📊', name: 'Científico', desc: 'Analizaste 5 noches distintas.', check: (c) => c.analyzeCount >= 5 },
  { id: 'cargado', hard: true, icon: '💥', name: 'Cargadísimo', desc: 'Un vaso con 4+ tragos estándar de alcohol.', check: (c) => c.std >= 4 },
  { id: 'malanoche', hard: true, icon: '🤮', name: 'Mala noche', desc: 'Tanto tomó que vomitó (y no bajó nada la alcoholemia).', check: (c) => c.vomit >= 1 },
  { id: 'siesta', hard: true, icon: '😴', name: 'Siesta etílica', desc: 'Se quedó dormido de tanto tomar.', check: (c) => c.sleep >= 1 },
  { id: 'gameover', hard: true, icon: '☠️', name: 'Game over', desc: 'Cruzó el límite vital. En la vida real no hay botón de revivir.', check: (c) => c.dead >= 1 },
]
