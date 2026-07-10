// Recipientes donde se sirve el trago. Cada uno tiene capacidad (ml) y una forma.
// La geometría de cada `shape` (silueta + decoraciones) vive en components/bar/Glass.jsx.
// sizeK = factor de tamaño dibujado dentro de la misma forma (chico < medio < grande).

// sizeK acerca los tamaños dibujados para que todos llenen bien el área del vaso
// (sin dejar de ser distintos en forma). No es proporcional a la capacidad real.
export const CONTAINERS = [
  { id: 'shot', name: 'Shot', emoji: '🥃', cap: 45, shape: 'shot', sizeK: 1.0 },
  { id: 'chico', name: 'Vaso chico', emoji: '🥛', cap: 250, shape: 'glass', sizeK: 0.9 },
  { id: 'medio', name: 'Vaso medio', emoji: '🥛', cap: 400, shape: 'glass', sizeK: 0.96 },
  { id: 'grande', name: 'Vaso grande', emoji: '🥛', cap: 500, shape: 'glass', sizeK: 1.0 },
  { id: 'copa', name: 'Copa', emoji: '🍷', cap: 300, shape: 'wine', sizeK: 1.0 },
  { id: 'jarra', name: 'Jarra', emoji: '🍺', cap: 1000, shape: 'mug', sizeK: 1.0 },
  { id: 'botella', name: 'Botella', emoji: '🍾', cap: 750, shape: 'bottleV', sizeK: 1.0 },
]

export const byContainer = Object.fromEntries(CONTAINERS.map((c) => [c.id, c]))

export const capOf = (id) => byContainer[id]?.cap ?? 500

export const DEFAULT_CONTAINER = 'grande'
