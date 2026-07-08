// Tragos PRE-ARMADOS: sólo proporciones (partes relativas).
// Se sirven vertiendo como cualquier bebida; el líquido se reparte según `parts`
// y en la receta aparecen los ingredientes por separado (editables como un trago manual).
// ids namespaceados con `mix-` para no chocar con ids de bebida del catálogo.

export const PRESETS = [
  { id: 'mix-fernetcola', name: 'Fernet con coca', color: '#3a2015',
    parts: [{ id: 'fernet', p: 1 }, { id: 'cola', p: 5 }] },
  { id: 'mix-gintonic', name: 'Gin tonic', color: '#dbeee6',
    parts: [{ id: 'gin', p: 1 }, { id: 'tonica', p: 4 }] },
  { id: 'mix-cubalibre', name: 'Cuba libre', color: '#3a1e0e',
    parts: [{ id: 'ron', p: 1 }, { id: 'cola', p: 5 }] },
  { id: 'mix-vodkajugo', name: 'Vodka con jugo', color: '#ff9d1e',
    parts: [{ id: 'vodka', p: 1 }, { id: 'jugo', p: 5 }] },
  { id: 'mix-spritz', name: 'Aperol spritz', color: '#ff6a24',
    parts: [{ id: 'aperol', p: 3 }, { id: 'espuma', p: 4 }, { id: 'soda', p: 2 }] },
  { id: 'mix-negroni', name: 'Negroni', color: '#a8213a',
    parts: [{ id: 'gin', p: 1 }, { id: 'campari', p: 1 }, { id: 'vermut', p: 1 }] },
  { id: 'mix-jagerbomb', name: 'Jägerbomb', color: '#7a8a22',
    parts: [{ id: 'jager', p: 1 }, { id: 'energi', p: 2 }] },
]

export const byPreset = Object.fromEntries(PRESETS.map((p) => [p.id, p]))
