# PROJECT RULES — Creative Web Engine

Base técnica persistente para el desarrollo creativo frontend (estándar Awwwards / FWA). Lee este archivo antes de añadir funcionalidades o diseñar secciones.

---

## 1. Stack Instalado (No reinstalar salvo necesidad real)

### Core & Estilos
- `vite` `8.3.8`
- `react` / `react-dom` `19.3.1`
- `typescript` `7.0.2`
- `tailwindcss` / `@tailwindcss/vite` `4.3.5`

### Animaciones y Scroll
- `gsap` `3.15.1`
- `@gsap/react` `2.1.2`
- `motion` `14.14.0`
- `lenis` `1.3.27`

### 3D, WebGL, Shaders y Postprocesado
- `three` `0.187.0` (`@types/three` `0.187.0`)
- `@react-three/fiber` `9.8.2`
- `@react-three/drei` `10.7.9`
- `@react-three/postprocessing` `3.2.2`
- `postprocessing` `6.39.6`

### Motor de Audio y Síntesis
- `howler` `2.2.4` (`@types/howler` `2.2.13`)
- `tone` `15.1.22`

### Física 2D y Generación Procedural
- `matter-js` `0.20.0` (`@types/matter-js` `0.20.2`)
- `simplex-noise` `4.0.3`

### Utilidades UI e Iconos
- `lucide-react` `1.77.0`
- `clsx` `2.1.1`
- `tailwind-merge` `3.7.1`

---

## 2. Arquitectura de Carpetas

- `/public/sounds/` — Archivos de audio reales (`.mp3`, `.wav`, `.ogg`) cargados vía `AudioManager`.
- `/public/models/` — Modelos 3D (`.glb`, `.gltf`).
- `/public/textures/` — Texturas, mapas HDRI e imágenes para WebGL/UI.
- `/src/audio/AudioManager.ts` — Motor central híbrido (Singleton): Howler + sintetizador procedural Web Audio API (`hover`, `click`, `transition`, `success`).
- `/src/animations/useSmoothScroll.ts` — Hook de Lenis sincronizado con `gsap.ticker` y `ScrollTrigger`.
- `/src/animations/presets.ts` — Curvas, duraciones y presets reutilizables para Motion y GSAP.
- `/src/canvas/` — Escenas Three.js / R3F, shaders GLSL y sistemas Canvas/Matter.js.
- `/src/components/SoundToggle.tsx` — Control flotante accesible de Mute/Unmute conectado a `AudioManager`.
- `/src/components/CustomCursor.tsx` — Cursor magnético acelerado por GPU (`data-cursor="pointer"` | `data-cursor="magnetic"`).
- `/src/sections/` — Secciones de la web.
- `/src/utils/cn.ts` — Helper combinando `clsx` + `tailwind-merge`.

---

## 3. Reglas Obligatorias de Calidad y Rendimiento

1. **GSAP siempre con `useGSAP()`:** Toda animación, timeline o `ScrollTrigger` en React debe registrarse con `useGSAP()` (de `@gsap/react`) y `contextSafe` para handlers de eventos, garantizando limpieza automática al desmontar.
2. **Motion desde `motion/react`:** Importar siempre desde `motion/react` (nunca `framer-motion`).
3. **Solo propiedades GPU:** Animar exclusivamente propiedades compuestas por GPU (`transform`, `opacity`, `clip-path`, `filter`). Evitar animar `top`, `left`, `width`, `height`, `margin` o `padding`.
4. **Audio centralizado:** Todo sonido (archivos en `/public/sounds/` o microsonidos procedurales) debe pasar por `audioManager` (`src/audio/AudioManager.ts`) para respetar el volumen maestro, el estado `isMuted` y el desbloqueo de `AudioContext`.
5. **Limpieza estricta (Zero Leaks):** Limpiar siempre event listeners, `requestAnimationFrame`, instancias de WebGL/Matter.js, `Lenis`, y timelines de GSAP al desmontar componentes.
6. **Accesibilidad y dispositivos:** Respetar siempre `prefers-reduced-motion` y limitar efectos de cursor personalizado a dispositivos con `pointer: fine`.
7. **Dependencias estables:** No reinstalar ni cambiar versiones de dependencias existentes salvo necesidad técnica real y justificada.
