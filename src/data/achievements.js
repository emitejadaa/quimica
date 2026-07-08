// Logros / stickers. `check(ctx)` recibe el contexto del trago actual + acumulados.
// ctx = { liquids:[ids con líquido], ml, cap, grams, std, container,
//         tried, presetsCount, containersCount, analyzeCount }
// hard = true → no se puede desbloquear por accidente (requiere intención/insistencia).
export const ACHIEVEMENTS = [
  { id: 'primer', icon: '🍹', name: 'Primer trago', desc: 'Serviste tu primera bebida.', check: (c) => c.liquids.length >= 1 },
  { id: 'coctelero', icon: '🍸', name: 'Coctelero', desc: '3 bebidas en el mismo vaso.', check: (c) => c.liquids.length >= 3 },
  { id: 'sommelier', icon: '🍷', name: 'Sommelier', desc: 'Serviste algo en la copa.', check: (c) => c.container === 'copa' && c.ml > 0 },
  { id: 'tanque', icon: '🍺', name: 'Sed de campeón', desc: 'Usaste la jarra de 1 litro.', check: (c) => c.container === 'jarra' && c.ml > 0 },
  { id: 'shot', icon: '🥃', name: '¡Shot!', desc: 'Serviste en el vaso de shot.', check: (c) => c.container === 'shot' && c.ml > 0 },
  { id: 'lleno', icon: '🌊', name: 'Hasta el borde', desc: 'Llenaste el recipiente al tope.', check: (c) => c.ml > 0 && c.ml >= c.cap - 1 },
  { id: 'barman', icon: '🧉', name: 'Barman', desc: 'Serviste un pre-armado clásico.', check: (c) => c.presetsCount >= 1 },
  { id: 'catador', icon: '🧭', name: 'Catador', desc: 'Probaste 5 bebidas distintas.', check: (c) => c.tried >= 5 },
  { id: 'analista', icon: '🔬', name: 'Analista', desc: 'Analizaste el efecto de un trago.', check: (c) => c.analyzeCount >= 1 },

  // ── difíciles (hay que buscarlos a propósito) ──
  { id: 'mixologo', hard: true, icon: '⚗️', name: 'Mixólogo', desc: '5 bebidas distintas en un solo vaso.', check: (c) => c.liquids.length >= 5 },
  { id: 'coleccionista', hard: true, icon: '🗄️', name: 'Coleccionista', desc: 'Serviste en los 7 recipientes.', check: (c) => c.containersCount >= 7 },
  { id: 'barmanpro', hard: true, icon: '🏅', name: 'Barman PRO', desc: 'Probaste los 7 pre-armados.', check: (c) => c.presetsCount >= 7 },
  { id: 'maraton', hard: true, icon: '🌙', name: 'Maratón', desc: 'Probaste 12 bebidas distintas.', check: (c) => c.tried >= 12 },
  { id: 'cientifico', hard: true, icon: '📊', name: 'Científico', desc: 'Analizaste 5 tragos distintos.', check: (c) => c.analyzeCount >= 5 },
  { id: 'cargado', hard: true, icon: '💥', name: 'Cargadísimo', desc: 'Un vaso con 4+ tragos estándar de alcohol.', check: (c) => c.std >= 4 },
]
