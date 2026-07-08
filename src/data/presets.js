// Tragos clásicos de un toque. items = líquidos (ml). extras = ids de decoración (máx 2).
export const PRESETS = [
  { id: 'fernet', name: 'Fernet con coca', emoji: '🥤', tint: '#2c1810',
    items: [{ id: 'fernet', ml: 50 }, { id: 'cola', ml: 250 }], extras: ['hielo'] },
  { id: 'gintonic', name: 'Gin tonic', emoji: '🍸', tint: '#e6f6ef',
    items: [{ id: 'gin', ml: 45 }, { id: 'tonica', ml: 250 }], extras: ['hielo', 'limon'] },
  { id: 'cubalibre', name: 'Cuba libre', emoji: '🥃', tint: '#2b1408',
    items: [{ id: 'ron', ml: 45 }, { id: 'cola', ml: 250 }], extras: ['limon', 'hielo'] },
  { id: 'destornillador', name: 'Vodka con jugo', emoji: '🍊', tint: '#ff9d1e',
    items: [{ id: 'vodka', ml: 45 }, { id: 'jugo', ml: 230 }], extras: ['hielo'] },
  { id: 'spritz', name: 'Aperol spritz', emoji: '🍹', tint: '#ff5b1e',
    items: [{ id: 'aperol', ml: 80 }, { id: 'espuma', ml: 120 }, { id: 'soda', ml: 60 }], extras: ['hielo', 'limon'] },
  { id: 'birra', name: 'Una birra', emoji: '🍺', tint: '#e3a90f',
    items: [{ id: 'quilmes', ml: 340 }], extras: [] },
  { id: 'copavino', name: 'Copa de vino', emoji: '🍷', tint: '#6e1b34',
    items: [{ id: 'malbec', ml: 150 }], extras: [] },
]
