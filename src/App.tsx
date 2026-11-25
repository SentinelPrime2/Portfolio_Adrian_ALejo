import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSmoothScroll } from './animations/useSmoothScroll';
import { audioManager } from './audio/AudioManager';
import { rigState } from './canvas/rigState';
import { findProjectById, type PortfolioProject } from './data/portfolio';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { CustomCursor } from './components/CustomCursor';
import { SoundToggle } from './components/SoundToggle';
import { HudOverlay } from './components/HudOverlay';
import { Preloader } from './sections/Preloader';
import { HeroSection } from './sections/HeroSection';
import { ShowcaseSection } from './sections/ShowcaseSection';
import { ProjectBreakdownPage } from './sections/ProjectBreakdownPage';
import { TechPipelineSection } from './sections/TechPipelineSection';
import { ContactSection } from './sections/ContactSection';
import { cn } from './utils/cn';

const RigScene = lazy(() =>
  import('./canvas/RigScene').then((m) => ({ default: m.RigScene })),
);

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SECTION_IDS = ['hero', 'showcase', 'pipeline', 'contact'] as const;

function getProjectFromHash(): PortfolioProject | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.hash.match(/^#\/proyecto\/([^/?#]+)/);
  return findProjectById(match?.[1]);
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const lenisRef = useSmoothScroll({ lerp: 0.095 });
  const appRef = useRef<HTMLDivElement | null>(null);
  const landingRef = useRef<HTMLDivElement | null>(null);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(() =>
    getProjectFromHash(),
  );
  const lastSectionRef = useRef(0);

  // Sync URL hash (#/proyecto/<id>) with browser Back / Forward navigation
  useEffect(() => {
    const syncFromHash = () => {
      setActiveProject(getProjectFromHash());
    };
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  // Pause Lenis, lock body overflow, and keep background landing inert while viewing a Case Study
  useEffect(() => {
    if (!activeProject) return;

    const lenis = lenisRef.current;
    const landing = landingRef.current as (HTMLDivElement & { inert: boolean }) | null;
    lenis?.stop();
    if (landing) landing.inert = true;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      if (landing) landing.inert = false;
      lenisRef.current?.start();
    };
  }, [activeProject, lenisRef]);

  const openProject = useCallback((project: PortfolioProject) => {
    const targetHash = `#/proyecto/${project.id}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    setActiveProject(project);
  }, []);

  const closeProject = useCallback(() => {
    if (window.location.hash.startsWith('#/proyecto/')) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }
    setActiveProject(null);
  }, []);

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
        {t('Saltar al contenido principal', 'Skip to main content')}
      </a>

      <div
        ref={landingRef}
        className={cn(
          'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          activeProject && '-translate-x-10 scale-[0.985] will-change-transform',
        )}
      >
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
        <HudOverlay
          activeSection={activeSection}
          onNavigate={handleNavigate}
          ready={preloaderDone}
        />

        <main id="main-content" tabIndex={-1} className="relative z-10 w-full outline-none">
          <HeroSection ready={preloaderDone} onNavigate={handleNavigate} />
          <ShowcaseSection onSelectProject={openProject} />
          <TechPipelineSection />
          <ContactSection onBackToTop={handleBackToTop} />
        </main>
      </div>

      <ProjectBreakdownPage
        project={activeProject}
        onClose={closeProject}
        onSelectProject={openProject}
      />

      <SoundToggle className="z-[80]" />
    </div>
  );
}
