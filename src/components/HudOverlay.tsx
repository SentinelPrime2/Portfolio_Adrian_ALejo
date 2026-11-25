import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Menu, X } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';
import {
  addLaserBeam,
  addNeonFlicker,
  addScanWipe,
  prefersReducedMotion,
} from '../animations/tronInit';
import { cn } from '../utils/cn';

gsap.registerPlugin(useGSAP);

interface HudOverlayProps {
  activeSection: number;
  onNavigate: (sectionId: string) => void;
  ready?: boolean;
}

const NAV_ITEMS = [
  { id: 'hero', label: 'INICIO' },
  { id: 'showcase', label: 'PROYECTOS' },
  { id: 'pipeline', label: 'PROCESO' },
  { id: 'contact', label: 'CONTACTO' },
] as const;

export function HudOverlay({ activeSection, onNavigate, ready = true }: HudOverlayProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  useGSAP(
    () => {
      if (!headerRef.current || prefersReducedMotion()) return;

      if (!ready) {
        gsap.set('.hud-sp-badge, .hud-brand-text, .hud-nav-item, .hud-role-tag', {
          opacity: 0,
        });
        return;
      }

      const tl = gsap.timeline({ delay: 0.02 });
      addLaserBeam(tl, '[data-hud-laser]', 0, {
        axis: 'x',
        duration: 0.5,
        settleOpacity: 0,
      });
      addNeonFlicker(tl, '.hud-sp-badge', 0.08);
      addScanWipe(tl, '.hud-brand-text', 0.14, { direction: 'right', duration: 0.44 });
      tl.fromTo(
        '.hud-nav-item, .hud-role-tag',
        { opacity: 0, y: -6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.34,
          stagger: 0.045,
          ease: 'expo.out',
          clearProps: 'transform',
        },
        0.2,
      );
    },
    { scope: headerRef, dependencies: [ready] },
  );

  const navigateFromMenu = (id: string) => {
    audioManager.playSynth('click', 0.75);
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header ref={headerRef} className="fixed left-0 right-0 top-0 z-40 px-4 pt-3 sm:px-8 sm:pt-4">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between border-b border-[#00f3ff]/[0.18] bg-[#020408]/[0.88] px-4 py-2.5 backdrop-blur-[12px] sm:py-3">
        <span
          aria-hidden="true"
          data-hud-laser=""
          className="tron-laser-divider bottom-0 left-0 right-0 h-[1px] origin-left bg-gradient-to-r from-[#bd00ff] via-[#00f3ff] to-[#e6fcff] opacity-0 shadow-[0_0_12px_rgba(0,243,255,0.85)]"
        />

        <button
          type="button"
          data-cursor="magnetic"
          aria-label="SentinelPrime — Ir al inicio"
          onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
          onClick={() => navigateFromMenu('hero')}
          className="flex min-h-[44px] items-center gap-2.5 text-left"
        >
          <span
            aria-hidden="true"
            className="hud-sp-badge flex h-6 w-6 items-center justify-center border border-[#bd00ff] bg-[#a020f0]/15 font-mono text-[11px] font-bold text-[#f5e6ff] shadow-[var(--glow-violet-border)]"
          >
            SP
          </span>
          <span className="hud-brand-text font-display text-xs font-bold tracking-[0.22em] text-[#ecf8ff] uppercase sm:text-sm">
            SENTINELPRIME
          </span>
        </button>

        <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSection === idx;
            return (
              <button
                key={item.id}
                type="button"
                data-cursor="pointer"
                aria-current={isActive ? 'location' : undefined}
                onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                onClick={() => navigateFromMenu(item.id)}
                className={cn(
                  'hud-nav-item relative min-h-[36px] py-1 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-200',
                  isActive ? 'text-[#e6fcff]' : 'text-[#8ba4be] hover:text-[#ecf8ff]',
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <span className="hud-role-tag hidden font-mono text-[10px] tracking-[0.2em] text-[#00f3ff] uppercase sm:inline">
          3D RIGGING · ANIM
        </span>

        <button
          type="button"
          onClick={() => {
            audioManager.playSynth('click', 0.7);
            setMobileOpen((v) => !v);
          }}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-[#00f3ff]/35 bg-[#050b14]/85 text-[#e6fcff] transition-colors hover:border-[#bd00ff] md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav-panel"
          aria-label="Navegación móvil"
          className="mx-auto mt-1 flex max-w-7xl flex-col border border-[#00f3ff]/30 bg-[#020408]/95 p-2 backdrop-blur-[16px] md:hidden"
        >
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSection === idx;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'location' : undefined}
                onClick={() => navigateFromMenu(item.id)}
                className={cn(
                  'flex min-h-[44px] items-center justify-between border-l-2 px-4 py-3 text-left font-mono text-xs tracking-[0.18em] uppercase transition-colors',
                  isActive
                    ? 'border-l-[#00f3ff] bg-[#00f3ff]/10 text-[#e6fcff]'
                    : 'border-l-transparent text-[#8ba4be] hover:bg-white/5 hover:text-[#ecf8ff]',
                )}
              >
                <span>{item.label}</span>
                {isActive && <span className="text-[10px] text-[#00f3ff]">ACTIVO</span>}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
