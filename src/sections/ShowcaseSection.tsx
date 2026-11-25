import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/portfolio';
import { audioManager } from '../audio/AudioManager';
import { rigState } from '../canvas/rigState';
import { useLanguage } from '../i18n/LanguageContext';
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
import { cn } from '../utils/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CARD_SKIN =
  'obsidian-dichroic-panel dichroic-hover-border tron-card-bevel border-[#00f3ff]/[0.22] hover:border-[#bd00ff] hover:shadow-[var(--glow-violet-border)]';

interface ShowcaseSectionProps {
  onSelectProject: (project: PortfolioProject) => void;
}

export function ShowcaseSection({ onSelectProject }: ShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const revealCardRef = useRef<(idx: number) => void>(() => {});
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const { locale, t } = useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>('.showcase-card');

      const animateCardInit = (card: HTMLElement, tl: gsap.core.Timeline, pos: number) => {
        tl.fromTo(
          card,
          { opacity: 0 },
          { opacity: 1, duration: 0.22, ease: 'power2.out' },
          pos,
        );
        addWireDraw(tl, card, pos, { duration: 0.38 });
        addScanWipe(tl, card.querySelector('.showcase-card-media'), pos + 0.08, {
          direction: 'down',
          duration: 0.48,
        });
        addScanWipe(tl, card.querySelector('.showcase-card-body'), pos + 0.16, {
          direction: 'down',
          duration: 0.4,
        });
        addNeonFlicker(tl, card.querySelector('.showcase-card-index'), pos + 0.22);
      };

      gsap.set(
        '.showcase-eyebrow, .showcase-title-main, .showcase-neon-accent, .showcase-meta, .showcase-card, .showcase-card-index',
        { opacity: 0 },
      );
      if (!reducedMotion) {
        gsap.set('.showcase-progress-track', { scaleX: 0, transformOrigin: 'left center' });
      }

      const headerTl = gsap.timeline({ paused: true });

      addLaserBeam(headerTl, '[data-showcase-header-laser]', 0, {
        axis: 'x',
        duration: 0.45,
        settleOpacity: 0,
      });
      addScanWipe(headerTl, '.showcase-eyebrow', 0.04, { direction: 'right', duration: 0.4 });
      addScanWipe(headerTl, '.showcase-title-main', 0.1, { direction: 'down', duration: 0.45 });
      addNeonFlicker(headerTl, '.showcase-neon-accent', 0.2);
      addNeonFlicker(headerTl, '.showcase-meta', 0.24);
      if (!reducedMotion) {
        headerTl.fromTo(
          '.showcase-progress-track',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power3.out', clearProps: 'transform' },
          0.28,
        );
      }

      createOnceScrollTrigger(headerTl, {
        trigger: section,
        start: 'top 78%',
      });

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        // Start slightly offset right (~24% viewport width) so cards materialize well inside screen
        const getStartX = () => Math.round(window.innerWidth * 0.24);
        const getEndX = () => -Math.max(0, track.scrollWidth - window.innerWidth + 120);
        const getTotalTravel = () => getStartX() - getEndX();

        // Thresholds across Showcase scroll progress (0..1): cards appear 01 -> 06 in place and stay revealed
        const CARD_THRESHOLDS = [0.03, 0.11, 0.21, 0.36, 0.58, 0.8];
        const cardRevealed = cards.map(() => false);
        const cardTimelines = cards.map((card) => {
          const tl = gsap.timeline({ paused: true });
          animateCardInit(card, tl, 0);
          return tl;
        });

        const syncCardsForProgress = (progress: number, instant = false) => {
          cards.forEach((_, idx) => {
            if (cardRevealed[idx]) return;
            const threshold = CARD_THRESHOLDS[idx] ?? 0.8;
            if (progress >= threshold) {
              cardRevealed[idx] = true;
              if (instant) {
                cardTimelines[idx].progress(1);
              } else {
                cardTimelines[idx].play(0);
              }
            }
          });
        };

        revealCardRef.current = (idx: number) => {
          if (cardRevealed[idx] || !cardTimelines[idx]) return;
          cardRevealed[idx] = true;
          cardTimelines[idx].play(0);
        };

        const tween = gsap.fromTo(
          track,
          { x: getStartX },
          {
            x: getEndX,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.max(getTotalTravel(), 1400)}`,
              pin: true,
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                rigState.showcaseProgress = self.progress;
                if (playheadRef.current) {
                  playheadRef.current.style.transform = `scaleX(${Math.max(0.03, self.progress).toFixed(4)})`;
                }
                syncCardsForProgress(self.progress, false);
              },
              onRefresh: (self) => {
                if (self.progress > 0) {
                  syncCardsForProgress(self.progress, self.progress >= 0.98);
                }
              },
            },
          },
        );

        // Subtle inner thumbnail parallax tied to horizontal scroll
        gsap.utils.toArray<HTMLElement>('.showcase-parallax-img').forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -4 },
            {
              xPercent: 4,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });
      });

      mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
        const revealedMobile = cards.map(() => false);
        const mobileCardTls = cards.map((card) => {
          const tl = gsap.timeline({ paused: true });
          animateCardInit(card, tl, 0);
          return tl;
        });

        cards.forEach((card, idx) => {
          createOnceScrollTrigger(mobileCardTls[idx], {
            trigger: card,
            start: 'top 88%',
            onPlay: () => {
              revealedMobile[idx] = true;
            },
          });
        });

        revealCardRef.current = (idx: number) => {
          if (!revealedMobile[idx]) {
            revealedMobile[idx] = true;
            mobileCardTls[idx]?.play(0);
          }
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  const handleOpenProject = (project: PortfolioProject) => {
    audioManager.playSynth('click', 0.9);
    onSelectProject(project);
  };

  return (
    <section
      id="showcase"
      ref={sectionRef}
      aria-labelledby="showcase-heading"
      className="relative z-10 flex min-h-[100svh] w-full flex-col justify-center overflow-hidden py-20 lg:min-h-screen lg:py-0"
    >
      <TronCircuitCluster
        variant="hex-bus-c"
        className="absolute right-[3%] top-[6%] -z-10 hidden h-64 w-72 lg:block"
      />
      <TronCircuitCluster
        variant="hex-bus-a"
        className="absolute bottom-[2%] left-[3%] -z-10 hidden h-56 w-64 lg:block"
      />

      {/* Minimal Header */}
      <div className="relative mx-auto flex w-full max-w-7xl items-end justify-between px-5 pb-8 sm:px-8 lg:px-12">
        <span
          aria-hidden="true"
          data-showcase-header-laser=""
          className="tron-laser-divider bottom-4 left-5 right-5 h-[1px] origin-left bg-gradient-to-r from-[#00f3ff] via-[#bd00ff] to-transparent opacity-0 shadow-[0_0_10px_rgba(0,243,255,0.7)] sm:left-8 sm:right-8 lg:left-12 lg:right-12"
        />

        <div>
          <span className="showcase-eyebrow inline-block font-mono text-[11px] tracking-[0.22em] text-[#00f3ff] uppercase">
            01 // PORTFOLIO
          </span>
          <h2
            id="showcase-heading"
            className="mt-1 font-display text-2xl font-bold tracking-[0.04em] text-[#ecf8ff] uppercase sm:text-4xl"
          >
            <span className="showcase-title-main inline-block">{t('PROYECTOS', 'SELECTED')}</span>{' '}
            <span className="showcase-neon-accent inline-block text-[#00f3ff] tron-glow-cyan">
              {t('SELECCIONADOS', 'PROJECTS')}
            </span>
          </h2>
        </div>

        <span className="showcase-meta hidden font-mono text-xs tracking-[0.18em] text-[#8ba4be] uppercase sm:block">
          PORTFOLIO · 01 — 06
        </span>
      </div>

      {/* Vertical Grid on mobile (< lg) or Reduced Motion; Horizontal Pinned Track on normal desktop (lg+) */}
      <div className="w-full lg:overflow-visible">
        <div
          ref={trackRef}
          className={cn(
            'mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-5 sm:grid-cols-2 sm:px-8',
            reducedMotion
              ? 'lg:grid-cols-3 lg:px-12'
              : 'lg:mx-0 lg:flex lg:w-max lg:max-w-none lg:items-stretch lg:gap-9 lg:px-12 will-change-transform',
          )}
        >
          {PORTFOLIO_PROJECTS.map((project, idx) => (
            <article
              key={project.id}
              className={cn(
                'showcase-card group relative flex w-full shrink-0 flex-col border bg-[#060d18]/92 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1.5',
                !reducedMotion && 'lg:w-[430px]',
                CARD_SKIN,
              )}
            >
              <TronWireOverlay variant="dual" withScan />

              <button
                type="button"
                onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                onFocus={() => revealCardRef.current(idx)}
                onClick={() => handleOpenProject(project)}
                aria-label={t(
                  `Ver proyecto ${project.index}: ${project.title}`,
                  `View project ${project.index}: ${project.title}`,
                )}
                data-cursor="pointer"
                className="flex w-full flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00f3ff]"
              >
                {/* Clean 4:3 Real Thumbnail from The Rookies */}
                <div className="showcase-card-media relative aspect-[4/3] w-full overflow-hidden border-b border-[#00f3ff]/15 bg-[#050b14]">
                  <img
                    src={project.thumbnail}
                    srcSet={`${project.thumbnail} 800w, ${project.thumbnailHiRes} 1400w`}
                    sizes="(max-width: 640px) 310px, 430px"
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="showcase-parallax-img -ml-[4%] h-full w-[108%] max-w-none object-cover transition-transform duration-500 group-hover:scale-[1.04] will-change-transform"
                  />
                  {/* Crisp index tag in accessible Violet Core */}
                  <span className="showcase-card-index pointer-events-none absolute left-3 top-3 border border-[#bd00ff]/75 bg-[#020408]/92 px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] text-[#f5e6ff]">
                    {project.index}
                  </span>
                </div>

                {/* Essential Info Only (At a Glance) */}
                <div className="showcase-card-body flex w-full items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-[#00f3ff] uppercase">
                      {project.category} · {project.year}
                    </div>
                    <h3 className="mt-1 truncate font-display text-lg font-bold text-[#ecf8ff] transition-colors group-hover:text-[#e6fcff]">
                      {project.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-[#8ba4be]">
                      {locale === 'en' ? project.subtitleEn : project.subtitle}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="mt-1 h-4 w-4 shrink-0 text-[#00f3ff] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#bd00ff]"
                    aria-hidden="true"
                  />
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Slim 2px Horizontal Scroll Progress Line (hidden cleanly when showing grid) */}
      {!reducedMotion && (
        <div className="mx-auto mt-8 hidden w-full max-w-7xl px-12 lg:block">
        <div className="showcase-progress-track h-[2px] w-full overflow-hidden bg-[#00f3ff]/15">
          <div
            ref={playheadRef}
            style={{ transform: 'scaleX(0.04)', background: 'var(--iridescent-line)' }}
            className="h-full w-full origin-left shadow-[0_0_10px_rgba(0,243,255,0.45)] will-change-transform"
          />
        </div>
        </div>
      )}
    </section>
  );
}
