import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSmoothScroll } from './animations/useSmoothScroll';
import { audioManager } from './audio/AudioManager';
import { rigState } from './canvas/rigState';
import { CustomCursor } from './components/CustomCursor';
import { SoundToggle } from './components/SoundToggle';
import { HudOverlay } from './components/HudOverlay';
import { Preloader } from './sections/Preloader';
import { HeroSection } from './sections/HeroSection';
import { ShowcaseSection } from './sections/ShowcaseSection';
import { TechPipelineSection } from './sections/TechPipelineSection';
import { ContactSection } from './sections/ContactSection';

const RigScene = lazy(() =>
  import('./canvas/RigScene').then((m) => ({ default: m.RigScene })),
);

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SECTION_IDS = ['hero', 'showcase', 'pipeline', 'contact'] as const;

export default function App() {
  const lenisRef = useSmoothScroll({ lerp: 0.095 });
  const appRef = useRef<HTMLDivElement | null>(null);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const lastSectionRef = useRef(0);

  // Normalized pointer tracking for the 3D rig & HUD (zero React re-renders)
  useEffect(() => {
    window.scrollTo(0, 0);
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      rigState.pointerX = nx;
      rigState.pointerY = ny;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  // Global scroll progress, velocity, and section audio transitions via GSAP ScrollTrigger
  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          rigState.scrollProgress = self.progress;
          rigState.scrollVelocity = self.getVelocity() / 120;
        },
      });

      SECTION_IDS.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: 'top 52%',
          end: 'bottom 52%',
          onEnter: () => {
            rigState.activeSection = index;
            setActiveSection(index);
            if (lastSectionRef.current !== index) {
              lastSectionRef.current = index;
              audioManager.playSynth('transition', 0.65);
            }
          },
          onEnterBack: () => {
            rigState.activeSection = index;
            setActiveSection(index);
            if (lastSectionRef.current !== index) {
              lastSectionRef.current = index;
              audioManager.playSynth('transition', 0.55);
            }
          },
        });
      });

      // Ensure pinned Showcase measurements refresh cleanly once Preloader finishes
      if (preloaderDone) {
        ScrollTrigger.refresh();
      }
    },
    { scope: appRef, dependencies: [preloaderDone] },
  );

  const handleNavigate = useCallback(
    (sectionId: string) => {
      const target = document.getElementById(sectionId);
      if (!target) return;

      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: 0, duration: 1.25 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [lenisRef],
  );

  const handleBackToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.35 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lenisRef]);

  return (
    <div id="app-shell" ref={appRef} className="tron-the-grid relative min-h-screen w-full text-[#ecf8ff]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:border focus:border-[#00f3ff] focus:bg-[#020408] focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:tracking-[0.14em] focus:text-[#e6fcff] focus:uppercase focus:shadow-[var(--glow-cyan-strong)]"
      >
        Saltar al contenido principal
      </a>

      <Preloader
        onComplete={() => {
          rigState.bootReady = true;
          setPreloaderDone(true);
        }}
      />
      <Suspense fallback={null}>
        <RigScene />
      </Suspense>
      <CustomCursor />
      <HudOverlay activeSection={activeSection} onNavigate={handleNavigate} ready={preloaderDone} />

      <main id="main-content" tabIndex={-1} className="relative z-10 w-full outline-none">
        <HeroSection ready={preloaderDone} onNavigate={handleNavigate} />
        <ShowcaseSection />
        <TechPipelineSection />
        <ContactSection onBackToTop={handleBackToTop} />
      </main>

      <SoundToggle />
    </div>
  );
}
