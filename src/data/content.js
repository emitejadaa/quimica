// Contenido educativo. Tiers por alcoholemia + pool de tarjetas rotativas.

export const TIERS = [
  { l: 'Prácticamente sobrio', b: 'Casi nada de etanol en sangre.', face: '🙂', bg: '#e7f6ec', bd: '#2f9e44', tx: '#1e6b30' },
  { l: 'Efecto leve', b: 'Empieza la desinhibición; los reflejos ya bajan.', face: '😊', bg: '#fff7df', bd: '#e0a91e', tx: '#8a6a0a' },
  { l: 'Euforia', b: 'Más confianza y menos atención. Manejar ya es peligroso.', face: '😄', bg: '#fff0d6', bd: '#e0901e', tx: '#9a6207' },
  { l: 'Coordinación afectada', b: 'Cuesta hablar y moverse; el juicio falla.', face: '😵‍💫', bg: '#fdeede', bd: '#e0791e', tx: '#a3530c' },
  { l: 'Borrachera marcada', b: 'Marcha inestable, náuseas y vómitos.', face: '🤢', bg: '#fde4e4', bd: '#e8384f', tx: '#a51a2c' },
  { l: 'Estupor alcohólico', b: 'Confusión severa y somnolencia. Al límite.', face: '🥴', bg: '#f6dada', bd: '#c8102e', tx: '#8c0a20' },
  { l: 'Riesgo vital', b: 'Posible coma y depresión respiratoria. Emergencia.', face: '☠️', bg: '#f3cccc', bd: '#a00b1e', tx: '#7a0818' },
]

// Pool mixto de tarjetas para la sección rotativa (consejo / mito / ojo).
export const FACTS = [
  { kind: 'consejo', t: 'Tomá agua entre trago y trago: te hidratás y bajás el ritmo.' },
  { kind: 'consejo', t: 'Comer antes y durante hace que el alcohol se absorba más lento.' },
  { kind: 'consejo', t: 'Si tomaste, no manejes ni te subas con quien tomó. Pedí un viaje.' },
  { kind: 'consejo', t: 'Si un amigo se descompone, ponelo de costado y pedí ayuda a un adulto.' },
  { kind: 'consejo', t: 'Alterná con algo sin alcohol: nadie nota si tu vaso trae solo gaseosa.' },
  { kind: 'ojo', t: 'Con el estómago vacío el pico de alcoholemia sube más rápido y más alto.' },
  { kind: 'ojo', t: 'Solo el tiempo baja la alcoholemia: ni café, ni ducha fría, ni vomitar.' },
  { kind: 'ojo', t: 'Mezclar tipos de alcohol no emborracha distinto: cuentan los gramos totales.' },
  { kind: 'ojo', t: 'El alcohol con energizante te hace sentir menos borracho, pero seguís igual.' },
  { kind: 'ojo', t: 'El cerebro adolescente todavía se forma: el alcohol lo afecta más que al adulto.' },
  { kind: 'ojo', t: 'El alcohol no abriga: baja tu temperatura corporal aunque sientas calor.' },
  { kind: 'mito', t: 'El café baja la borrachera', v: 'Falso: solo te despabila, la alcoholemia sigue igual.' },
  { kind: 'mito', t: 'Vomitar te despeja', v: 'Falso: lo que ya pasó a la sangre no se va vomitando.' },
  { kind: 'mito', t: 'La cerveza no es alcohol "de verdad"', v: 'Falso: una lata puede tener tanto etanol como un trago fuerte.' },
  { kind: 'mito', t: 'Aguantar mucho es bueno', v: 'Falso: el cuerpo se acostumbró, y eso es señal de riesgo.' },
  { kind: 'mito', t: 'El hielo y la gaseosa "cortan" el alcohol', v: 'Falso: diluyen los grados, pero el etanol total es el mismo.' },
  { kind: 'mito', t: 'Los destilados marean más "por la química"', v: 'Falso: marean más porque tienen mucho más etanol por ml.' },
]

export const KIND_STYLE = {
  consejo: { icon: '💡', title: 'CONSEJO', bg: '#e7f6ec', bd: '#2f9e44', tx: '#207a33' },
  ojo: { icon: '⚠️', title: 'OJO CON ESTO', bg: '#fdeede', bd: '#e08a1e', tx: '#b76b0e' },
  mito: { icon: '🧠', title: 'MITO vs VERDAD', bg: '#eef1fb', bd: '#5566d6', tx: '#3b49b0' },
}

// Micro-notas de toxicocinética (condensadas, para chips).
export const TOXICO = [
  { icon: '🩸', t: 'Aparece en sangre a los ~5 min; pico a los 30–90.' },
  { icon: '💧', t: 'Se reparte por el agua del cuerpo y cruza al cerebro.' },
  { icon: '🫀', t: 'El hígado metaboliza el 90–98%; el resto sale por aliento/orina.' },
]
