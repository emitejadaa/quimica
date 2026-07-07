# Armá tu trago — Spec de implementación

**Fecha:** 2026-07-07
**Origen:** mockup `.dc.html` (design tool, runtime propietario) → app real standalone.

## Objetivo

App educativa cartoon (+18, consumo responsable) donde armás un trago, entrás tus
datos y ves el efecto estimado (Widmark) de forma visual e interactiva.

## Stack

- **React + Vite**, build estático, sin backend. Deployable estático.
- Única dependencia de runtime extra: `html-to-image` (tarjeta PNG).
- Sonido: sintetizador WebAudio (porteado del mockup, sin assets).
- Estética: bar cálido cartoon; fuentes Fredoka / Nunito / Patrick Hand; bordes gruesos.

## Estructura

```
src/
  main.jsx, App.jsx            # shell 3 fases (bar/ficha/análisis) que deslizan
  data/    catalog.js presets.js content.js
  logic/   calc.js  (Widmark, curva, gramos, tragos std, abv, kcal, tiers)  barState.js
  hooks/   useSound.js  usePointerPour.js
  components/
    Hud.jsx  Confetti.jsx
    avatar/  Avatar.jsx  pose.js
    bar/     Glass.jsx Bottle.jsx Shelf.jsx Recipe.jsx Presets.jsx BarScreen.jsx
    form/    FormScreen.jsx
    results/ ResultsScreen.jsx BacCurve.jsx StatGrid.jsx RotatingCard.jsx ShareCard.jsx
```

## Requisitos funcionales (del usuario)

1. **Bebidas cartoon SVG por marca/variedad** (no solo emoji): silueta por tipo, color de
   marca, etiqueta con nombre, animadas. Sin logos reales.
2. **Servir por tiempo de presión**: tap = chorrito chico (~20 ml), hold = continuo.
   Nunca medida fija por defecto.
3. **Unir repetidos**: misma bebida 2 veces = un ítem (suma ml) y una capa de color.
4. **Tope del vaso 500 ml sin rebalse**: al llenarse deja de servir.
5. **Máx 2 extras** (hielo/limón/…): al llegar a 2, resto deshabilitado.
6. **Bug extras**: agregar extra (abv 0) NO cambia el avatar. Avatar depende solo del alcohol.
7. **Avatar SVG detallado**, cartoon/videojuego, nivel de intoxicación **continuo**:
   - Bar: **miedo gradual** según gramos de alcohol / tragos std del vaso.
   - Al Mezclar: animación **tomar-y-marearse** escalada por alcohol, gradual.
   - Resultados: sincronizado con el scrubber de la curva.
8. **Sacar** cartel "+18 sos menor..." y **subtítulo** del título "Armá tu trago".
   Mantener mensaje +18 pero **sutil/restyleado**.
9. **Resultados más gráfico, menos texto**: conservar números clave, sacar párrafos largos.
10. **Frases rotativas** (consejo/mito/advertencia) que no repiten; botón "otra" 🔀.
11. **Form tipo juego**: sliders animados, silueta corporal, estómago que se llena, arco
    sol/luna, reacciones del bartender.
12. **Responsive**; en **horizontal sin scroll vertical** (todo entra), salvo la
    **estantería de ingredientes** (scroll interno si hace falta).

## Features nuevas aprobadas

- **Línea de tiempo interactiva**: scrubber sobre la curva → avatar morfea en vivo + botón ▶.
- **Tragos clásicos de un toque**: Fernet-cola, Gin tonic, Cuba libre, Vodka-jugo,
  Aperol spritz, Birra, Vino. Cargan receta respetando el tope.
- **Tarjeta final descargable** (PNG con html-to-image).

## Decisiones de parámetros

- Vaso: **500 ml**. Tap: ~20 ml. Trago estándar: **10 g** etanol. β=0.15 g/L·h.
- Cálculo Widmark conservado: `C = gramos / (peso × R)`, R por contextura×sexo.
- Avatar: personaje neutro pelo naranja, más detallado (ajustable tras verlo).

## Verificación

Correr `npm run dev`, autoverificar con screenshot, entregar URL. Iteración visual en vivo
con el usuario (reemplaza el review del spec por pedido explícito del usuario).
