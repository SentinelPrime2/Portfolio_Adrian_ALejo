import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUp, ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { ARTIST_INFO } from '../data/portfolio';
import { audioManager } from '../audio/AudioManager';
import {
  addLaserBeam,
  addNeonFlicker,
  addScanWipe,
  addWireDraw,
  createOnceScrollTrigger,
  prefersReducedMotion,
} from '../animations/tronInit';
import { TronWireOverlay } from '../components/TronWireOverlay';
import { TronCircuitCluster } from '../components/TronCircuitCluster';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ContactSectionProps {
  onBackToTop: () => void;
}

export function ContactSection({ onBackToTop }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const horizonRef = useRef<HTMLDivElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      if (horizonRef.current) {
        gsap.fromTo(
          horizonRef.current,
          { yPercent: 18 },
          {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
            },
          },
        );
      }

      const preInitTargets =
        '.contact-status-dot, .contact-status-text, .contact-title-main, .contact-neon-accent, .contact-desc, .contact-cta-primary, .contact-cta-secondary, .contact-social-link, .contact-footer-content';
      gsap.set(preInitTargets, { opacity: 0 });

      const primaryCta = section.querySelector('.contact-cta-primary');
      const secondaryCta = section.querySelector('.contact-cta-secondary');
      const socialLinks = gsap.utils.toArray<HTMLElement>('.contact-social-link');

      const tl = gsap.timeline({ paused: true });

      addNeonFlicker(tl, '.contact-status-dot', 0.02);
      addScanWipe(tl, '.contact-status-text', 0.08, { direction: 'right', duration: 0.42 });
      addScanWipe(tl, '.contact-title-main', 0.14, { direction: 'down', duration: 0.48 });
      addNeonFlicker(tl, '.contact-neon-accent', 0.24);
      addScanWipe(tl, '.contact-desc', 0.42, { direction: 'down', duration: 0.45 });

      tl.fromTo(
        '.contact-cta-primary',
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' },
        0.5,
      );
      addWireDraw(tl, primaryCta, 0.5, { duration: 0.4 });

      tl.fromTo(
        '.contact-cta-secondary',
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' },
        0.6,
      );
      addWireDraw(tl, secondaryCta, 0.6, { duration: 0.4 });

      socialLinks.forEach((link, idx) => {
        const at = 0.72 + idx * 0.09;
        tl.fromTo(
          link,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'power2.out' },
          at,
        );
        addWireDraw(tl, link, at, { duration: 0.34 });
      });

      addLaserBeam(tl, '[data-footer-laser]', 0.78, {
        axis: 'x',
        duration: 0.45,
        settleOpacity: 0,
      });
      tl.fromTo(
        '.contact-footer-content',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', clearProps: 'transform' },
        0.84,
      );

      createOnceScrollTrigger(tl, {
        trigger: section,
        start: 'top 76%',
      });
    },
    { scope: sectionRef },
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ARTIST_INFO.email);
      audioManager.playSynth('success', 0.85);
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      audioManager.playSynth('click', 0.8);
      window.location.href = `mailto:${ARTIST_INFO.email}`;
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className="relative z-10 flex min-h-screen w-full flex-col justify-between overflow-hidden px-5 pb-12 pt-28 sm:px-8 lg:px-12"
    >
      {/* Hex-aligned Tron circuit traces balancing Finn on the open right side */}
      <TronCircuitCluster
        variant="hex-bus-c"
        className="absolute right-[3%] top-[30%] -z-10 hidden h-64 w-72 lg:block"
      />

      {/* Tron Legacy Perspective Horizon Floor */}
      <div
        ref={horizonRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[380px] overflow-hidden opacity-55 will-change-transform"
      >
        <div className="rf-perspective-grid -ml-[20%] mx-auto h-[500px] w-[140%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408]" />
      </div>

      {/* Centered high-impact minimal CTA */}
      <div className="mx-auto my-auto flex w-full max-w-3xl flex-col items-center space-y-7 bg-[#020408]/68 p-5 text-center backdrop-blur-[2px] lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.22em] text-[#00f3ff] uppercase">
          <span className="contact-status-dot h-2 w-2 animate-pulse bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] motion-reduce:animate-none" />
          <span className="contact-status-text">DISPONIBLE PARA PROYECTOS · {ARTIST_INFO.location}</span>
        </div>

        <h2
          id="contact-heading"
          className="font-display text-3xl font-bold leading-[1.1] tracking-[0.04em] text-[#ecf8ff] uppercase sm:text-5xl lg:text-[3.5rem]"
        >
          <span className="contact-title-main inline-block">HABLEMOS DE TU</span>{' '}
          <span className="contact-neon-accent inline-block text-[#00f3ff] tron-glow-cyan">
            PRÓXIMO RIG
          </span>
        </h2>

        <p className="contact-desc max-w-lg text-base text-[#8ba4be] sm:text-lg">
          Character rigging, facial rigs y animación 3D para videojuegos y medios interactivos.
        </p>

        <span role="status" aria-live="polite" className="sr-only">
          {copied ? 'Correo electrónico copiado al portapapeles' : ''}
        </span>

        {/* Direct Email Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            data-cursor="magnetic"
            onPointerEnter={() => audioManager.playSynth('hover', 0.65)}
            onClick={handleCopyEmail}
            aria-label={`Copiar correo ${ARTIST_INFO.email}`}
            className="contact-cta-primary tron-glass-btn-violet relative inline-flex min-h-[44px] items-center gap-2.5 overflow-hidden px-7 py-3.5 font-mono text-xs font-bold tracking-[0.12em] uppercase active:scale-[0.97]"
          >
            <TronWireOverlay variant="violet" withScan />
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>¡EMAIL COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>{ARTIST_INFO.email}</span>
              </>
            )}
          </button>

          <a
            href={`mailto:${ARTIST_INFO.email}`}
            data-cursor="pointer"
            onPointerEnter={() => audioManager.playSynth('hover', 0.6)}
            onClick={() => audioManager.playSynth('click', 0.85)}
            className="contact-cta-secondary tron-glass relative inline-flex min-h-[44px] items-center gap-2 overflow-hidden border border-[#00f3ff]/55 px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-[#e6fcff] uppercase transition-[border-color,color,box-shadow] hover:border-[#bd00ff] hover:text-[#f5e6ff] hover:shadow-[var(--glow-violet-border)]"
          >
            <TronWireOverlay variant="cyan" withScan />
            <Mail className="h-4 w-4 text-[#00f3ff]" aria-hidden="true" />
            <span>Abrir Correo</span>
          </a>
        </div>

        {/* Clean inline profile links */}
        <div className="flex items-center gap-4 pt-4 font-mono text-xs tracking-[0.18em] uppercase">
          <a
            href={ARTIST_INFO.rookiesUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor="pointer"
            onPointerEnter={() => audioManager.playSynth('hover', 0.6)}
            onClick={() => audioManager.playSynth('click', 0.8)}
            className="contact-social-link tron-glass relative inline-flex min-h-[44px] items-center gap-1.5 overflow-hidden border border-[#00f3ff]/30 px-4 py-2 text-[#ecf8ff] transition-[border-color,color,box-shadow] hover:border-[#00f3ff] hover:text-[#e6fcff] hover:shadow-[var(--glow-cyan-border)]"
          >
            <TronWireOverlay variant="cyan" />
            <span>
              The Rookies
              <span className="sr-only"> (se abre en una nueva pestaña)</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#00f3ff]" aria-hidden="true" />
          </a>

          <span aria-hidden="true" className="text-[#8ba4be]">/</span>

          <a
            href={ARTIST_INFO.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor="pointer"
            onPointerEnter={() => audioManager.playSynth('hover', 0.6)}
            onClick={() => audioManager.playSynth('click', 0.8)}
            className="contact-social-link tron-glass relative inline-flex min-h-[44px] items-center gap-1.5 overflow-hidden border border-[#00f3ff]/30 px-4 py-2 text-[#ecf8ff] transition-[border-color,color,box-shadow] hover:border-[#bd00ff] hover:text-[#f5e6ff] hover:shadow-[var(--glow-violet-border)]"
          >
            <TronWireOverlay variant="violet" />
            <span>
              LinkedIn
              <span className="sr-only"> (se abre en una nueva pestaña)</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#bd00ff]" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="relative mx-auto mt-16 flex w-full max-w-7xl items-center justify-between border-t border-[#00f3ff]/15 pb-14 pt-5 font-mono text-[11px] tracking-[0.14em] text-[#8ba4be] sm:pb-4 sm:pr-32">
        <span
          aria-hidden="true"
          data-footer-laser=""
          className="tron-laser-divider left-0 right-0 top-0 h-[1px] origin-center bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent opacity-0 shadow-[0_0_12px_rgba(0,243,255,0.85)]"
        />

        <span className="contact-footer-content">
          © {new Date().getFullYear()} {ARTIST_INFO.shortName} //{' '}
          <span className="text-[#00f3ff]">{ARTIST_INFO.handle}</span>
        </span>

        <button
          type="button"
          data-cursor="magnetic"
          onPointerEnter={() => audioManager.playSynth('hover', 0.6)}
          onClick={() => {
            audioManager.playSynth('transition', 0.75);
            onBackToTop();
          }}
          className="contact-footer-content inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs tracking-[0.18em] text-[#00f3ff] uppercase transition-colors hover:text-[#bd00ff]"
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Arriba</span>
        </button>
      </footer>
    </section>
  );
}
