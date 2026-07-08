// Recipientes donde se sirve el trago. Cada uno tiene capacidad (ml) y una forma.
// La geometría de cada `shape` (silueta + decoraciones) vive en components/bar/Glass.jsx.
// sizeK = factor de tamaño dibujado dentro de la misma forma. Está calibrado para que
// TODOS los recipientes ocupen bien el espacio reservado (alturas parecidas), pero cada
// uno conserva una silueta propia y reconocible (ancho + forma).

export const CONTAINERS = [
  { id: 'shot', name: 'Shot', emoji: '🥃', cap: 45, shape: 'shot', sizeK: 1.16 },
  { id: 'chico', name: 'Vaso chico', emoji: '🥛', cap: 250, shape: 'tumbler', sizeK: 1.12 },
  { id: 'medio', name: 'Vaso medio', emoji: '🥤', cap: 400, shape: 'highball', sizeK: 0.98 },
  { id: 'grande', name: 'Vaso grande', emoji: '🍺', cap: 500, shape: 'pint', sizeK: 0.98 },
  { id: 'copa', name: 'Copa', emoji: '🍷', cap: 300, shape: 'wine', sizeK: 1.04 },
  { id: 'jarra', name: 'Jarra', emoji: '🍺', cap: 1000, shape: 'mug', sizeK: 1.02 },
  { id: 'botella', name: 'Botella', emoji: '🍾', cap: 750, shape: 'bottleV', sizeK: 0.96 },
]

export const byContainer = Object.fromEntries(CONTAINERS.map((c) => [c.id, c]))

export const capOf = (id) => byContainer[id]?.cap ?? 500

export const DEFAULT_CONTAINER = 'grande'
