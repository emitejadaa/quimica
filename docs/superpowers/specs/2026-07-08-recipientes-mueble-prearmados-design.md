# Recipientes, mueble, pre-armados, logros y jugo — Spec

**Fecha:** 2026-07-08
**Base:** app `Armá tu trago` (React+Vite) ya funcionando en 3 fases.

## Objetivo

Ampliar el bar con recipientes seleccionables, pre-armados vertibles por proporción,
un mueble que se abre con animación, un timeline más lento, logros/stickers y una
capa estética de "juego" (ambiente, carteles, físicas de vertido, sonido inmersivo).

## 1. Recipientes (`src/data/containers.js`)

7 recipientes, cada uno con capacidad y forma. El tope fijo de 500 ml deja de existir;
la capacidad la da el recipiente elegido.

| id | nombre | cap (ml) | shape |
|----|--------|----------|-------|
| shot | Shot | 45 | shot |
| chico | Vaso chico | 250 | glass |
| medio | Vaso medio | 400 | glass |
| grande | Vaso grande | 500 | glass |
| copa | Copa | 300 | wine |
| jarra | Jarra | 1000 | mug |
| botella | Botella | 750 | bottleV |

- `Glass.jsx` recibe `container` y dibuja la silueta vía `clip-path` (polígono en %),
  más decoraciones por forma (pie+tallo para copa, asa para jarra, pico para botella).
  Las capas de líquido se recortan al contorno interior. `fillPct` usa `container.cap`.
- El tamaño dibujado escala suavemente con la capacidad (chico < medio < grande, jarra
  grande) manteniéndose dentro del área disponible.
- **Selector**: fila de chips a la izquierda del vaso (estética cartel de madera).
- Estado `container` en `barState` (default `grande` = 500, preserva comportamiento).
  Acción `setContainer(id)`. Al cambiar a un recipiente con `cap` menor al volumen
  actual, se **reescalan** todos los líquidos proporcionalmente para entrar sin perder
  la receta.
- `GLASS_CAP` se reemplaza por `capOf(containerId)`; `usePointerPour` recibe `cap`.

## 2. Pre-armados por proporción (`src/data/presets.js`)

- Cada preset pasa a `parts: [{ id, p }]` (partes relativas). Ej. Fernet-cola `1:5`.
- Nueva pestaña `preparado` en `TABS` (🍹 Pre-armados). Los presets aparecen en la
  estantería como un ícono de "trago servido" (vaso con el color/tint del trago).
- Al arrastrar y mantener sobre el vaso se sirve como cualquier bebida, repartiendo el
  líquido acumulado según las proporciones → en la receta aparecen los ingredientes por
  separado, cada uno editable con +/− ml ("como si fuera manual").
- Reducer `pourPreset(preset, ml)`: reparte `ml` (limitado por el room del recipiente)
  entre las `parts` y mergea con los ítems existentes.
- Los ids de preset se namespacean para no chocar con ids de bebida; en la estantería
  llevan `data-preset="1"` y `usePointerPour` los trata con `pourPreset`.
- Se elimina la barra "clásicos de un toque" de arriba (`Presets.jsx` deja de usarse en
  `BarScreen`). Los pre-armados ya no auto-agregan extras (son solo proporción).

## 3. Mueble con puertas (`src/components/bar/Cabinet.jsx`)

- Envuelve la estantería (tabs + grid). Arranca **cerrado**: dos puertas de madera
  cartoon con pomos y un cartelito "tocá para abrir 🍸".
- Click en pomo/puerta → `cabinetOpen=true`; puertas giran con `transform: rotateY`
  (izq -110°, der +110°) sobre `perspective`, ~0.9 s, con luz cálida saliendo del fondo.
- Estado `cabinetOpen` en `barState` (default false). Se puede volver a cerrar con un
  tirador. La receta (`Recipe`) queda fuera del mueble, siempre visible.

## 4. Timeline más lento (`src/components/results/BacCurve.jsx`)

- Duración de la animación de play: 4600 ms → ~8000 ms.

## 5. Logros / stickers

- `src/data/achievements.js`: lista `{ id, icon, name, desc }` + lógica de check.
- `src/hooks/useAchievements.js`: set desbloqueado persistido en `localStorage`,
  `evaluate(ctx)` devuelve nuevos desbloqueos; también acumula bebidas distintas probadas.
- Se evalúa al servir / mezclar / analizar. Toast al desbloquear (+ sonido `tada`).
- Botón 🏆 en el `Hud` que abre la galería (`components/Achievements.jsx`): grid de
  stickers, apagados los bloqueados. Contador de progreso.
- Logros: primer trago, sommelier (copa), tanque (jarra), shot, coctelero (3+ ingred.),
  cero (0,0), fondo blanco (recipiente lleno), barman (probar un pre-armado),
  explorador (5 bebidas distintas), fiesta (mezclar y analizar).

## 6. Estética / jugo

- **Ambiente de bar**: cartel de neón parpadeante en el fondo del bar, vetas de madera
  más ricas, luz cálida; todo `pointer-events:none` y de fondo (no rompe el layout
  horizontal sin scroll).
- **Carteles de madera**: las pestañas de categoría dentro del mueble se estilizan como
  carteles colgantes escritos a mano (Patrick Hand).
- **Físicas de vertido**: partículas de salpicadura/gotas al impactar el chorro y
  gradiente de condensación en el vaso mientras hay líquido.
- **Sonido inmersivo** (`useSound`): `pourStart(sizeHint)` ajusta el tono del chorro
  según el tamaño del recipiente; pad ambiente lo-fi opcional con toggle (off por
  defecto), sin assets (WebAudio).

## Verificación

`npm run dev`, autoverificar con navegador headless (screenshots de: bar con mueble
cerrado, mueble abierto, servir un pre-armado, cambiar recipiente, logro desbloqueado,
timeline). Iteración visual. Al final `npm run build` para chequear que compila y push a
`main`.

## No-objetivos (YAGNI)

- Sin medidor de barman, precio ni "sorprendeme" (no elegidos).
- Sin backend ni persistencia más allá de logros en localStorage.
