import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDownRight } from 'lucide-react';
import { ARTIST_INFO } from '../data/portfolio';
import { audioManager } from '../audio/AudioManager';
import {
  addNeonFlicker,
  addScanWipe,
  addWireDraw,
  prefersReducedMotion,
} from '../animations/tronInit';
import { TronWireOverlay } from '../components/TronWireOverlay';
import { TronCircuitCluster } from '../components/TronCircuitCluster';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface HeroSectionProps {
  ready: boolean;
  onNavigate: (sectionId: string) => void;
}

export function HeroSection({ ready, onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      const preInitTargets =
        '.hero-dot, .hero-eyebrow-text, .hero-name-wipe, .hero-neon-handle, .hero-tagline-wipe, .hero-cta-primary, .hero-cta-secondary, .hero-scroll-label, .hero-scroll-line';

      if (!ready) {
        gsap.set(preInitTargets, { opacity: 0 });
        return;
      }

      gsap.set(preInitTargets, { opacity: 0 });

      const primaryBtn = section.querySelector('.hero-cta-primary');
      const secondaryBtn = section.querySelector('.hero-cta-secondary');

      const tl = gsap.timeline({ delay: 0.04 });

      addNeonFlicker(tl, '.hero-dot', 0.02);
      addScanWipe(tl, '.hero-eyebrow-text', 0.08, { direction: 'right', duration: 0.42 });
      addScanWipe(tl, '.hero-name-wipe', 0.14, { direction: 'down', duration: 0.52 });
      addNeonFlicker(tl, '.hero-neon-handle', 0.24);
      addScanWipe(tl, '.hero-tagline-wipe', 0.42, { direction: 'down', duration: 0.5 });

      tl.fromTo(
        '.hero-cta-primary',
        { opacity: 0 },
        { opacity: 1, duration: 0.24, ease: 'power2.out' },
        0.5,
      );
      addWireDraw(tl, primaryBtn, 0.5, { duration: 0.42 });

      tl.fromTo(
        '.hero-cta-secondary',
        { opacity: 0 },
        { opacity: 1, duration: 0.24, ease: 'power2.out' },
        0.62,
      );
      addWireDraw(tl, secondaryBtn, 0.62, { duration: 0.42 });

      tl.fromTo(
        '.hero-scroll-line',
        { scaleY: 0, opacity: 0, transformOrigin: 'top center' },
        { scaleY: 1, opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform' },
        0.65,
      );
      addNeonFlicker(tl, '.hero-scroll-label', 0.68);

      gsap.to(contentRef.current, {
        yPercent: -14,
        opacity: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [ready] },
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative z-10 flex min-h-screen w-full items-center overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:px-12"
    >
      {/* Quiet background hex-aligned Tron circuit traces breaking out of the honeycomb */}
      <TronCircuitCluster
        variant="hex-bus-a"
        className="absolute left-[34%] top-[10%] -z-10 hidden h-64 w-72 xl:block"
      />
      <TronCircuitCluster
        variant="hex-bus-b"
        className="absolute bottom-[4%] left-[2%] -z-10 hidden h-56 w-64 lg:block"
      />

      <div ref={contentRef} className="mx-auto w-full max-w-7xl will-change-transform">
        <div className="-mx-2 max-w-xl space-y-7 bg-[#020408]/65 p-4 backdrop-blur-[2px] lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          {/* Role Eyebrow */}
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.24em] text-[#00f3ff] uppercase">
            <span className="hero-dot h-2 w-2 bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
            <span className="hero-eyebrow-text">3D RIGGER &amp; ANIMATOR · BLENDER &amp; UNITY</span>
          </div>

          {/* Clean Monumental Headline (tuned for Orbitron display) */}
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-[1.04] tracking-[0.04em] text-[#ecf8ff] uppercase sm:text-5xl lg:text-[3.75rem]"
          >
            <span className="hero-name-wipe block">{ARTIST_INFO.shortName}</span>
            <span className="hero-neon-handle mt-2 block text-[#00f3ff] tron-glow-cyan">
              {ARTIST_INFO.handle}
            </span>
          </h1>

          {/* One clear sentence — no extra box */}
          <p className="hero-tagline-wipe max-w-md text-lg leading-relaxed text-[#8ba4be] sm:text-xl">
            {ARTIST_INFO.tagline}
          </p>

          {/* Two sharp Tron Obsidian Glass CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              data-cursor="magnetic"
              onPointerEnter={() => audioManager.playSynth('hover', 0.7)}
              onClick={() => {
                audioManager.playSynth('click', 0.9);
                onNavigate('showcase');
              }}
              className="hero-cta-primary tron-glass-btn-cyan group relative inline-flex items-center gap-2.5 overflow-hidden px-7 py-3.5 font-display text-sm font-bold tracking-[0.14em] uppercase active:scale-[0.97]"
            >
              <TronWireOverlay variant="cyan" withScan />
              <span>Ver Proyectos</span>
              <ArrowDownRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              data-cursor="pointer"
              onPointerEnter={() => audioManager.playSynth('hover', 0.65)}
              onClick={() => {
                audioManager.playSynth('click', 0.85);
                onNavigate('contact');
              }}
              className="hero-cta-secondary tron-glass relative inline-flex items-center gap-2 overflow-hidden border border-[#bd00ff]/45 px-6 py-3.5 font-mono text-xs font-medium tracking-[0.16em] text-[#ecf8ff] uppercase transition-[border-color,color,box-shadow] duration-200 hover:border-[#bd00ff] hover:text-[#f5e6ff] hover:shadow-[var(--glow-violet-border)] active:scale-[0.97]"
            >
              <TronWireOverlay variant="violet" withScan />
              <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-[#00f3ff]" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-[#bd00ff]" />
              <span>Contacto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Minimal scroll indicator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-[#8ba4be] uppercase md:flex"
      >
        <span className="hero-scroll-label">SCROLL</span>
        <div className="hero-scroll-line h-8 w-[1px] bg-gradient-to-b from-[#00f3ff] via-[#bd00ff] to-transparent" />
      </div>
    </section>
  );
}
