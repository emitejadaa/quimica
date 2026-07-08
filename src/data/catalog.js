// Catálogo de bebidas.
// kcal100 / sugar100 = por cada 100 ml (se escalan según lo servido).
// bottle = spec para dibujar la botella/lata cartoon (ver components/bar/Bottle.jsx).
//   form: 'bottle' | 'can' | 'wine'
//   glass = color del vidrio/lata · cap = color de la tapa · liquid = color del líquido en el vaso
//   label = texto de etiqueta · labelBg / ink = colores de la etiqueta

export const TABS = [
  { id: 'preparado', label: 'Pre-armados', emoji: '🍹' },
  { id: 'cerveza', label: 'Cervezas', emoji: '🍺' },
  { id: 'vino', label: 'Vinos', emoji: '🍷' },
  { id: 'destilado', label: 'Destilados', emoji: '🥃' },
  { id: 'aperitivo', label: 'Aperitivos', emoji: '🍸' },
  { id: 'mezcla', label: 'Sin alcohol', emoji: '🧃' },
  { id: 'extra', label: 'Extras', emoji: '🍋' },
]

export const CATALOG = [
  // ─── CERVEZAS ───
  { id: 'quilmes', name: 'Quilmes', variety: 'lager', cat: 'cerveza', abv: 4.9, dml: 340, kcal100: 43, sugar100: 0,
    bottle: { form: 'bottle', glass: '#6b4a17', cap: '#d8dbe6', liquid: '#e3a90f', label: 'Quilmes', labelBg: '#eef2fb', ink: '#123b82' } },
  { id: 'stella', name: 'Stella', variety: 'lager', cat: 'cerveza', abv: 5.0, dml: 330, kcal100: 42, sugar100: 0,
    bottle: { form: 'bottle', glass: '#4a6b1e', cap: '#e0c04a', liquid: '#e6b020', label: 'Stella', labelBg: '#f3e7c4', ink: '#7a1420' } },
  { id: 'corona', name: 'Corona', variety: 'pilsner', cat: 'cerveza', abv: 4.5, dml: 330, kcal100: 39, sugar100: 0,
    bottle: { form: 'bottle', glass: '#d9e6ce', clear: true, cap: '#e0c04a', liquid: '#f0cf6b', label: 'Corona', labelBg: '#fff', ink: '#0a5ca0' } },
  { id: 'ipa', name: 'IPA', variety: 'artesanal', cat: 'cerveza', abv: 6.5, dml: 330, kcal100: 61, sugar100: 0,
    bottle: { form: 'can', glass: '#e07b2a', cap: '#c86818', liquid: '#c8801a', label: 'IPA', labelBg: '#2b1c0e', ink: '#ffb03a' } },
  { id: 'negra', name: 'Stout', variety: 'negra', cat: 'cerveza', abv: 5.5, dml: 330, kcal100: 55, sugar100: 0,
    bottle: { form: 'bottle', glass: '#2b1a0f', cap: '#b98a2a', liquid: '#2a160a', label: 'Stout', labelBg: '#1a0f07', ink: '#e0b060' } },
  { id: 'sidra', name: 'Sidra', variety: 'dulce', cat: 'cerveza', abv: 5.0, dml: 330, kcal100: 45, sugar100: 4,
    bottle: { form: 'bottle', glass: '#7a6b1e', clear: true, cap: '#c0c4cc', liquid: '#d8b34a', label: 'Sidra', labelBg: '#fdf6d8', ink: '#8a5a10' } },
  { id: 'roja', name: 'Cerveza roja', variety: 'red ale', cat: 'cerveza', abv: 5.2, dml: 330, kcal100: 52, sugar100: 1,
    bottle: { form: 'bottle', glass: '#5a2a14', clear: true, cap: '#c0a02a', liquid: '#a8481a', label: 'Roja', labelBg: '#f0dcc0', ink: '#8a3b10' } },
  { id: 'trigo', name: 'Cerveza de trigo', variety: 'weiss', cat: 'cerveza', abv: 5.0, dml: 330, kcal100: 48, sugar100: 1,
    bottle: { form: 'bottle', glass: '#c9b06a', clear: true, cap: '#d8c85a', liquid: '#e8bf4a', label: 'Trigo', labelBg: '#fbf3d8', ink: '#8a6a10' } },
  { id: 'radler', name: 'Radler', variety: 'con limón', cat: 'cerveza', abv: 2.5, dml: 330, kcal100: 35, sugar100: 4,
    bottle: { form: 'bottle', glass: '#e8d27a', clear: true, cap: '#e0c04a', liquid: '#f2d84e', label: 'Radler', labelBg: '#fdf6d0', ink: '#8a6a10' } },

  // ─── VINOS ───
  { id: 'malbec', name: 'Malbec', variety: 'tinto', cat: 'vino', abv: 14, dml: 150, kcal100: 83, sugar100: 1,
    bottle: { form: 'wine', glass: '#3a1520', cap: '#5a1028', liquid: '#6e1b34', label: 'Malbec', labelBg: '#f0e2c8', ink: '#5a1028' } },
  { id: 'blanco', name: 'Vino blanco', variety: 'seco', cat: 'vino', abv: 12.5, dml: 150, kcal100: 80, sugar100: 1,
    bottle: { form: 'wine', glass: '#c9cf9a', clear: true, cap: '#c8b45a', liquid: '#e7e7a8', label: 'Blanco', labelBg: '#fbfae6', ink: '#8a7a20' } },
  { id: 'espuma', name: 'Espumante', variety: 'champán', cat: 'vino', abv: 12, dml: 120, kcal100: 79, sugar100: 3,
    bottle: { form: 'wine', wide: true, glass: '#3a4a1e', cap: '#e0c04a', liquid: '#f2e6b0', label: 'Espumante', labelBg: '#1a1208', ink: '#e0c04a' } },
  { id: 'vermut', name: 'Vermut', variety: 'rojo', cat: 'vino', abv: 16, dml: 80, kcal100: 138, sugar100: 10,
    bottle: { form: 'bottle', slim: true, glass: '#5a2418', cap: '#3a1810', liquid: '#8a3b1e', label: 'Vermut', labelBg: '#f0dcc0', ink: '#8a3b1e' } },
  { id: 'rosado', name: 'Vino rosado', variety: 'rosé', cat: 'vino', abv: 12.5, dml: 150, kcal100: 82, sugar100: 2,
    bottle: { form: 'wine', glass: '#e8a0a8', clear: true, cap: '#c8b45a', liquid: '#f2a6ac', label: 'Rosado', labelBg: '#fbeaea', ink: '#a83b52' } },
  { id: 'torrontes', name: 'Torrontés', variety: 'aromático', cat: 'vino', abv: 13, dml: 150, kcal100: 80, sugar100: 2,
    bottle: { form: 'wine', glass: '#d0d09a', clear: true, cap: '#c8b45a', liquid: '#ece79a', label: 'Torrontés', labelBg: '#fbfae6', ink: '#7a7a20' } },

  // ─── DESTILADOS ───
  { id: 'fernet', name: 'Fernet', variety: 'Branca', cat: 'destilado', abv: 39, dml: 50, kcal100: 180, sugar100: 16,
    bottle: { form: 'bottle', slim: true, glass: '#241610', cap: '#1a0f08', liquid: '#2c1810', label: 'Fernet', labelBg: '#f0e6d0', ink: '#1a6b3a' } },
  { id: 'vodka', name: 'Vodka', variety: 'triple', cat: 'destilado', abv: 40, dml: 45, kcal100: 216, sugar100: 0,
    bottle: { form: 'bottle', slim: true, glass: '#dbe7f2', clear: true, cap: '#8a1420', liquid: '#eaf2ff', label: 'Vodka', labelBg: '#fff', ink: '#8a1420' } },
  { id: 'gin', name: 'Gin', variety: 'london dry', cat: 'destilado', abv: 40, dml: 45, kcal100: 216, sugar100: 0,
    bottle: { form: 'bottle', slim: true, glass: '#cfe6d8', clear: true, cap: '#0a5c3a', liquid: '#e6f6ef', label: 'Gin', labelBg: '#eef8f2', ink: '#0a5c3a' } },
  { id: 'ron', name: 'Ron', variety: 'dorado', cat: 'destilado', abv: 37.5, dml: 45, kcal100: 200, sugar100: 0,
    bottle: { form: 'bottle', glass: '#7a4a1e', clear: true, cap: '#2b1c0e', liquid: '#b9772e', label: 'Ron', labelBg: '#2b1c0e', ink: '#e0b060' } },
  { id: 'whisky', name: 'Whisky', variety: 'blended', cat: 'destilado', abv: 40, dml: 45, kcal100: 233, sugar100: 0,
    bottle: { form: 'bottle', glass: '#8a5a1e', clear: true, cap: '#1a0f08', liquid: '#9c5a1e', label: 'Whisky', labelBg: '#e6d0a0', ink: '#6b3a10' } },
  { id: 'tequila', name: 'Tequila', variety: 'blanco', cat: 'destilado', abv: 38, dml: 45, kcal100: 200, sugar100: 0,
    bottle: { form: 'bottle', slim: true, glass: '#e6e0b8', clear: true, cap: '#3a7a3a', liquid: '#f1edc8', label: 'Tequila', labelBg: '#fbf6dc', ink: '#8a6a10' } },
  { id: 'jager', name: 'Jäger', variety: 'herbal', cat: 'destilado', abv: 35, dml: 40, kcal100: 250, sugar100: 28,
    bottle: { form: 'bottle', slim: true, glass: '#1a2216', cap: '#e0a020', liquid: '#1f140c', label: 'Jäger', labelBg: '#e0a020', ink: '#1a2216' } },
  { id: 'brandy', name: 'Brandy', variety: 'añejo', cat: 'destilado', abv: 40, dml: 45, kcal100: 231, sugar100: 0,
    bottle: { form: 'bottle', wide: true, glass: '#8a4a1e', clear: true, cap: '#2b1c0e', liquid: '#a8541e', label: 'Brandy', labelBg: '#e6cfa0', ink: '#6b3a10' } },
  { id: 'mezcal', name: 'Mezcal', variety: 'ahumado', cat: 'destilado', abv: 42, dml: 45, kcal100: 230, sugar100: 0,
    bottle: { form: 'bottle', slim: true, glass: '#d8d0a0', clear: true, cap: '#3a2a18', liquid: '#ede6c2', label: 'Mezcal', labelBg: '#f0e6c8', ink: '#6b4a10' } },
  { id: 'cachaca', name: 'Cachaça', variety: 'caña', cat: 'destilado', abv: 40, dml: 45, kcal100: 220, sugar100: 0,
    bottle: { form: 'bottle', slim: true, glass: '#e0e6c8', clear: true, cap: '#2a7a3a', liquid: '#eef2d8', label: 'Cachaça', labelBg: '#f6f9e6', ink: '#2a7a3a' } },

  // ─── APERITIVOS ───
  { id: 'campari', name: 'Campari', variety: 'amargo', cat: 'aperitivo', abv: 25, dml: 60, kcal100: 192, sugar100: 20,
    bottle: { form: 'bottle', slim: true, glass: '#a80c22', clear: true, cap: '#f0f0f0', liquid: '#c8102e', label: 'Campari', labelBg: '#fff', ink: '#a80c22' } },
  { id: 'aperol', name: 'Aperol', variety: 'spritz', cat: 'aperitivo', abv: 11, dml: 80, kcal100: 119, sugar100: 15,
    bottle: { form: 'bottle', glass: '#e0641a', clear: true, cap: '#1a2a5a', liquid: '#ff5b1e', label: 'Aperol', labelBg: '#1a2a5a', ink: '#ff8a3a' } },
  { id: 'gancia', name: 'Gancia', variety: 'americano', cat: 'aperitivo', abv: 16, dml: 80, kcal100: 113, sugar100: 9,
    bottle: { form: 'bottle', glass: '#d0c07a', clear: true, cap: '#a01420', liquid: '#d98a2b', label: 'Gancia', labelBg: '#fbf3d8', ink: '#a01420' } },
  { id: 'baileys', name: 'Baileys', variety: 'crema', cat: 'aperitivo', abv: 17, dml: 50, kcal100: 330, sugar100: 20,
    bottle: { form: 'bottle', wide: true, glass: '#c9a06b', cap: '#e0d0a0', liquid: '#c9a06b', label: 'Baileys', labelBg: '#3a2a18', ink: '#e0c090' } },
  { id: 'durazno', name: 'Licor durazno', variety: 'dulce', cat: 'aperitivo', abv: 18, dml: 45, kcal100: 200, sugar100: 20,
    bottle: { form: 'bottle', slim: true, glass: '#ffb37a', clear: true, cap: '#e07a2a', liquid: '#ffb37a', label: 'Durazno', labelBg: '#fff0e0', ink: '#c85a10' } },
  { id: 'cynar', name: 'Cynar', variety: 'alcaucil', cat: 'aperitivo', abv: 16.5, dml: 60, kcal100: 160, sugar100: 16,
    bottle: { form: 'bottle', slim: true, glass: '#2a2410', cap: '#3a7a3a', liquid: '#4a3212', label: 'Cynar', labelBg: '#f0e6c8', ink: '#2a5a2a' } },
  { id: 'limoncello', name: 'Limoncello', variety: 'limón', cat: 'aperitivo', abv: 28, dml: 45, kcal100: 245, sugar100: 28,
    bottle: { form: 'bottle', slim: true, glass: '#f2e04a', clear: true, cap: '#f0f0f0', liquid: '#f5e63a', label: 'Limoncello', labelBg: '#fffde0', ink: '#8a7a10' } },
  { id: 'amaretto', name: 'Amaretto', variety: 'almendra', cat: 'aperitivo', abv: 24, dml: 45, kcal100: 250, sugar100: 24,
    bottle: { form: 'bottle', wide: true, glass: '#7a3418', clear: true, cap: '#c0202a', liquid: '#9c4420', label: 'Amaretto', labelBg: '#f0dcc0', ink: '#8a2418' } },

  // ─── SIN ALCOHOL (MEZCLADORES) ───
  { id: 'cola', name: 'Coca-Cola', variety: '', cat: 'mezcla', abv: 0, dml: 200, kcal100: 42, sugar100: 11,
    bottle: { form: 'can', glass: '#c8102e', cap: '#a00c20', liquid: '#2b1408', label: 'Cola', labelBg: '#c8102e', ink: '#fff' } },
  { id: 'zero', name: 'Coca Zero', variety: 'sin azúcar', cat: 'mezcla', abv: 0, dml: 200, kcal100: 1, sugar100: 0,
    bottle: { form: 'can', glass: '#1a1a1a', cap: '#333', liquid: '#1a0d06', label: 'Zero', labelBg: '#1a1a1a', ink: '#fff' } },
  { id: 'sprite', name: 'Lima-limón', variety: '', cat: 'mezcla', abv: 0, dml: 200, kcal100: 39, sugar100: 10,
    bottle: { form: 'can', glass: '#3aa53a', cap: '#2a852a', liquid: '#d7f0a8', label: 'Lima', labelBg: '#3aa53a', ink: '#fff' } },
  { id: 'tonica', name: 'Tónica', variety: 'Schweppes', cat: 'mezcla', abv: 0, dml: 200, kcal100: 33, sugar100: 9,
    bottle: { form: 'can', glass: '#e0c84a', cap: '#c0a82a', liquid: '#eef9ff', label: 'Tónica', labelBg: '#e0c84a', ink: '#3a2a10' } },
  { id: 'energi', name: 'Energizante', variety: 'Speed', cat: 'mezcla', abv: 0, dml: 250, kcal100: 44, sugar100: 11,
    bottle: { form: 'can', slim: true, glass: '#c5d92e', cap: '#98a820', liquid: '#c5d92e', label: 'Energy', labelBg: '#1a1a1a', ink: '#c5d92e' } },
  { id: 'jugo', name: 'Jugo naranja', variety: '', cat: 'mezcla', abv: 0, dml: 200, kcal100: 45, sugar100: 9,
    bottle: { form: 'bottle', wide: true, glass: '#ff9d1e', cap: '#2f9e44', liquid: '#ff9d1e', label: 'Jugo', labelBg: '#fff', ink: '#e07a10' } },
  { id: 'soda', name: 'Soda / agua', variety: '', cat: 'mezcla', abv: 0, dml: 200, kcal100: 0, sugar100: 0,
    bottle: { form: 'bottle', glass: '#bfe6ff', clear: true, cap: '#2aa5d6', liquid: '#d6eeff', label: 'Soda', labelBg: '#e6f6ff', ink: '#0a6ca0' } },
  { id: 'granada', name: 'Granadina', variety: 'jarabe', cat: 'mezcla', abv: 0, dml: 30, kcal100: 267, sugar100: 67,
    bottle: { form: 'bottle', slim: true, glass: '#b3122e', clear: true, cap: '#7a0a1e', liquid: '#b3122e', label: 'Granadina', labelBg: '#fff', ink: '#b3122e' } },
  { id: 'pomelo', name: 'Pomelo', variety: 'Paso de los Toros', cat: 'mezcla', abv: 0, dml: 200, kcal100: 38, sugar100: 10,
    bottle: { form: 'can', glass: '#e8a23a', cap: '#c8842a', liquid: '#f2b86a', label: 'Pomelo', labelBg: '#e8a23a', ink: '#7a3a10' } },
  { id: 'ginger', name: 'Ginger ale', variety: 'Canada Dry', cat: 'mezcla', abv: 0, dml: 200, kcal100: 34, sugar100: 9,
    bottle: { form: 'can', glass: '#c9a53a', cap: '#a8852a', liquid: '#e6d488', label: 'Ginger', labelBg: '#c9a53a', ink: '#3a2a10' } },
  { id: 'manzana', name: 'Jugo manzana', variety: '', cat: 'mezcla', abv: 0, dml: 200, kcal100: 46, sugar100: 10,
    bottle: { form: 'bottle', wide: true, glass: '#e0a828', cap: '#3a7a3a', liquid: '#e8b840', label: 'Manzana', labelBg: '#fff', ink: '#8a5a10' } },
  { id: 'agua', name: 'Agua mineral', variety: 'sin gas', cat: 'mezcla', abv: 0, dml: 250, kcal100: 0, sugar100: 0,
    bottle: { form: 'bottle', glass: '#cfeef6', clear: true, cap: '#1e88c8', liquid: '#e2f5fb', label: 'Agua', labelBg: '#eaf8fd', ink: '#1e6ca0' } },
  { id: 'pina', name: 'Jugo de piña', variety: 'tropical', cat: 'mezcla', abv: 0, dml: 200, kcal100: 50, sugar100: 12,
    bottle: { form: 'bottle', wide: true, glass: '#f2ce3a', cap: '#3a7a3a', liquid: '#f6e26b', label: 'Piña', labelBg: '#2a6b2a', ink: '#ffe873' } },
  { id: 'arandano', name: 'Jugo arándano', variety: 'cranberry', cat: 'mezcla', abv: 0, dml: 200, kcal100: 46, sugar100: 11,
    bottle: { form: 'bottle', glass: '#8a1030', clear: true, cap: '#5a0a20', liquid: '#c01a44', label: 'Arándano', labelBg: '#fbeaea', ink: '#8a1030' } },
  { id: 'tomate', name: 'Jugo de tomate', variety: 'p/ bloody mary', cat: 'mezcla', abv: 0, dml: 150, kcal100: 21, sugar100: 3,
    bottle: { form: 'can', glass: '#c8342a', cap: '#a02418', liquid: '#d84a30', label: 'Tomate', labelBg: '#c8342a', ink: '#fff' } },
  { id: 'limonada', name: 'Limonada', variety: 'con menta', cat: 'mezcla', abv: 0, dml: 200, kcal100: 30, sugar100: 7,
    bottle: { form: 'bottle', glass: '#e6f2ba', clear: true, cap: '#e8c020', liquid: '#eef7c8', label: 'Limonada', labelBg: '#fdfbe0', ink: '#7a8a10' } },
  { id: 'tehelado', name: 'Té helado', variety: 'durazno', cat: 'mezcla', abv: 0, dml: 200, kcal100: 30, sugar100: 7,
    bottle: { form: 'can', glass: '#e8a83a', cap: '#c8842a', liquid: '#d88a2e', label: 'Té', labelBg: '#f8ecd0', ink: '#a3530c' } },
  { id: 'coco', name: 'Agua de coco', variety: '', cat: 'mezcla', abv: 0, dml: 200, kcal100: 19, sugar100: 4,
    bottle: { form: 'bottle', wide: true, glass: '#f4f9f4', clear: true, cap: '#6b4a2a', liquid: '#f2f8f0', label: 'Coco', labelBg: '#2a6b4a', ink: '#eaf8f0' } },
  { id: 'naranja', name: 'Naranja gaseosa', variety: 'Fanta', cat: 'mezcla', abv: 0, dml: 200, kcal100: 44, sugar100: 11,
    bottle: { form: 'can', glass: '#f28a1e', cap: '#d0700f', liquid: '#ffa53a', label: 'Naranja', labelBg: '#f28a1e', ink: '#fff' } },
  { id: 'gingerbeer', name: 'Ginger beer', variety: 'picante', cat: 'mezcla', abv: 0, dml: 200, kcal100: 38, sugar100: 9,
    bottle: { form: 'bottle', slim: true, glass: '#d8c07a', clear: true, cap: '#8a5a1e', liquid: '#e6cd82', label: 'G.Beer', labelBg: '#3a2a10', ink: '#e6cd82' } },

  // ─── EXTRAS (no suman líquido, máx 2) ───
  { id: 'hielo', name: 'Hielo', cat: 'extra', abv: 0, kcalEach: 0, sugarEach: 0, emoji: '🧊' },
  { id: 'limon', name: 'Limón', cat: 'extra', abv: 0, kcalEach: 2, sugarEach: 1, emoji: '🍋' },
  { id: 'azucar', name: 'Azúcar', cat: 'extra', abv: 0, kcalEach: 32, sugarEach: 8, emoji: '🍬' },
  { id: 'frutas', name: 'Frutas', cat: 'extra', abv: 0, kcalEach: 18, sugarEach: 4, emoji: '🍓' },
  { id: 'menta', name: 'Menta', cat: 'extra', abv: 0, kcalEach: 0, sugarEach: 0, emoji: '🌿' },
  { id: 'sal', name: 'Sal', cat: 'extra', abv: 0, kcalEach: 0, sugarEach: 0, emoji: '🧂' },
  { id: 'pepino', name: 'Pepino', cat: 'extra', abv: 0, kcalEach: 2, sugarEach: 0, emoji: '🥒' },
  { id: 'cafe', name: 'Café', cat: 'extra', abv: 0, kcalEach: 2, sugarEach: 0, emoji: '☕' },
]

export const byId = Object.fromEntries(CATALOG.map((d) => [d.id, d]))

// Bebidas con gas: burbujean fuerte en el vaso. Las cervezas/sidra son todas con gas;
// además estos mezcladores/espumante. El resto (whisky, vino quieto, jugos, agua sin
// gas…) casi no burbujean.
const FIZZY_IDS = new Set(['espuma', 'cola', 'zero', 'sprite', 'tonica', 'energi', 'soda', 'pomelo', 'ginger', 'naranja', 'gingerbeer'])
export const isFizzy = (id) => { const d = byId[id]; return !!d && (d.cat === 'cerveza' || FIZZY_IDS.has(id)) }
// Cervezas y sidra hacen espuma al servir.
export const isBeer = (id) => byId[id]?.cat === 'cerveza'

// El tope del vaso ahora lo da el recipiente elegido (ver data/containers.js).
export const MAX_EXTRAS = 2
export const STD_GRAMS = 10 // g de etanol por trago estándar
