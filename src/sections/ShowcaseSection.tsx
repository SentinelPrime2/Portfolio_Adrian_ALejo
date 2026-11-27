import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import {
  PORTFOLIO_PROJECTS,
  PROJECT_CATEGORIES,
  type PortfolioProject,
  type ProjectCategoryGroup,
} from '../data/portfolio';
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

const CATEGORY_FRAME_STYLES: Record<
  ProjectCategoryGroup['accent'],
  {
    border: string;
    glow: string;
    bar: string;
    codeColor: string;
    badgeBorder: string;
    cornerColor: string;
    laserGradient: string;
  }
> = {
  cyan: {
    border: 'border-[#00f3ff]/35 shadow-[0_0_32px_rgba(0,243,255,0.06)]',
    glow: 'from-[#00f3ff]/[0.08] via-transparent to-transparent',
    bar: 'bg-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.75)]',
    codeColor: 'text-[#00f3ff]',
    badgeBorder: 'border-[#00f3ff]/40 bg-[#00f3ff]/[0.08] text-[#bfefff]',
    cornerColor: 'border-[#00f3ff]/75',
    laserGradient: 'from-[#00f3ff] via-[#79f6ff]/70 to-transparent',
  },
  violet: {
    border: 'border-[#bd00ff]/35 shadow-[0_0_32px_rgba(189,0,255,0.07)]',
    glow: 'from-[#bd00ff]/[0.09] via-transparent to-transparent',
    bar: 'bg-[#bd00ff] shadow-[0_0_12px_rgba(189,0,255,0.8)]',
    codeColor: 'text-[#d980ff]',
    badgeBorder: 'border-[#bd00ff]/45 bg-[#bd00ff]/[0.1] text-[#f2d6ff]',
    cornerColor: 'border-[#bd00ff]/75',
    laserGradient: 'from-[#bd00ff] via-[#00f3ff]/65 to-transparent',
  },
  iridescent: {
    border: 'border-[#79f6ff]/30 shadow-[0_0_32px_rgba(121,246,255,0.07)]',
    glow: 'from-[#79f6ff]/[0.07] via-[#bd00ff]/[0.04] to-transparent',
    bar: 'bg-[linear-gradient(180deg,#00f3ff,#d6a8ff,#79f6ff)] shadow-[0_0_12px_rgba(121,246,255,0.7)]',
    codeColor: 'text-[#9bf8ff]',
    badgeBorder: 'border-[#79f6ff]/40 bg-[#79f6ff]/[0.08] text-[#e6fcff]',
    cornerColor: 'border-[#79f6ff]/70',
    laserGradient: 'from-[#00f3ff] via-[#d6a8ff] to-transparent',
  },
};

interface ShowcaseSectionProps {
  onSelectProject: (project: PortfolioProject) => void;
}

export function ShowcaseSection({ onSelectProject }: ShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const revealBoxRef = useRef<(groupIdx: number) => void>(() => {});
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
      if (!section) return;

      const boxes = gsap.utils.toArray<HTMLElement>('.showcase-category-box');

      gsap.set(
        '.showcase-eyebrow, .showcase-title-main, .showcase-neon-accent, .showcase-meta, .showcase-category-box, .showcase-card, .showcase-card-index',
        { opacity: 0 },
      );

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

      createOnceScrollTrigger(headerTl, {
        trigger: section,
        start: 'top 80%',
      });

      // Keep 3D Finn gently rotating across vertical scroll through the portfolio blocks
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          rigState.showcaseProgress = self.progress;
        },
      });

      const revealedBoxes = boxes.map(() => false);
      const boxTimelines = boxes.map((box) => {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(
          box,
          { opacity: 0 },
          { opacity: 1, duration: 0.28, ease: 'power2.out' },
          0,
        );
        addWireDraw(tl, box, 0.02, { duration: 0.42 });
        addLaserBeam(tl, box.querySelector('[data-cat-laser]'), 0.08, {
          axis: 'x',
          duration: 0.42,
          settleOpacity: 0.8,
        });

        const innerCards = gsap.utils.toArray<HTMLElement>('.showcase-card', box);
        innerCards.forEach((card, cardIdx) => {
          const pos = 0.14 + cardIdx * 0.09;
          tl.fromTo(
            card,
            { opacity: 0 },
            { opacity: 1, duration: 0.24, ease: 'power2.out' },
            pos,
          );
          addWireDraw(tl, card, pos, { duration: 0.36 });
          addScanWipe(tl, card.querySelector('.showcase-card-media'), pos + 0.06, {
            direction: 'down',
            duration: 0.42,
          });
          addScanWipe(tl, card.querySelector('.showcase-card-body'), pos + 0.12, {
            direction: 'down',
            duration: 0.36,
          });
          addNeonFlicker(tl, card.querySelector('.showcase-card-index'), pos + 0.18);
        });

        return tl;
      });

      boxes.forEach((box, idx) => {
        createOnceScrollTrigger(boxTimelines[idx], {
          trigger: box,
          start: 'top 88%',
          onPlay: () => {
            revealedBoxes[idx] = true;
          },
        });
      });

      revealBoxRef.current = (groupIdx: number) => {
        if (revealedBoxes[groupIdx]) return;
        revealedBoxes[groupIdx] = true;
        boxTimelines[groupIdx]?.play(0);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  const handleOpenProject = (project: PortfolioProject) => {
    audioManager.playSynth('click', 0.9);
    onSelectProject(project);
  };

  const totalCountLabel = String(PORTFOLIO_PROJECTS.length).padStart(2, '0');

  return (
    <section
      id="showcase"
      ref={sectionRef}
      aria-labelledby="showcase-heading"
      className="relative z-10 w-full overflow-hidden py-24 lg:py-28"
    >
      <TronCircuitCluster
        variant="hex-bus-c"
        className="absolute right-[3%] top-[4%] -z-10 hidden h-64 w-72 lg:block"
      />
      <TronCircuitCluster
        variant="hex-bus-a"
        className="absolute bottom-[4%] left-[3%] -z-10 hidden h-56 w-64 lg:block"
      />

      {/* Section Header */}
      <div className="relative mx-auto flex w-full max-w-7xl items-end justify-between px-5 pb-10 sm:px-8 lg:px-12">
        <span
          aria-hidden="true"
          data-showcase-header-laser=""
          className="tron-laser-divider bottom-5 left-5 right-5 h-[1px] origin-left bg-gradient-to-r from-[#00f3ff] via-[#bd00ff] to-transparent opacity-0 shadow-[0_0_10px_rgba(0,243,255,0.7)] sm:left-8 sm:right-8 lg:left-12 lg:right-12"
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
          PORTFOLIO · 01 — {totalCountLabel}
        </span>
      </div>

      {/* Vertical Category Blocks (Desktop & Mobile) */}
      <div className="mx-auto w-full max-w-7xl space-y-8 px-5 sm:px-8 lg:space-y-10 lg:px-12">
        {PROJECT_CATEGORIES.map((group, groupIdx) => {
          const groupProjects = PORTFOLIO_PROJECTS.filter((p) => p.group === group.id);
          const skin = CATEGORY_FRAME_STYLES[group.accent];
          const countLabel = String(groupProjects.length).padStart(2, '0');
          const isThreeCol = groupProjects.length >= 3;

          return (
            <div
              key={group.id}
              data-category-group={group.id}
              className={cn(
                'showcase-category-box obsidian-dichroic-panel tron-card-bevel relative overflow-hidden border bg-[#040912]/88 p-5 sm:p-7 lg:p-8',
                skin.border,
              )}
            >
              {/* Subtle radial ambient corner wash & HUD bracket accents */}
              <div
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
                  skin.glow,
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2',
                  skin.cornerColor,
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2',
                  skin.cornerColor,
                )}
              />

              {/* Category Frame Header */}
              <div className="relative mb-6 flex flex-col gap-3 pb-4 md:flex-row md:items-end md:justify-between">
                <span
                  aria-hidden="true"
                  data-cat-laser=""
                  className={cn(
                    'tron-laser-divider bottom-0 left-0 right-0 h-[1px] origin-left bg-gradient-to-r opacity-0',
                    skin.laserGradient,
                  )}
                />

                <div className="flex items-start gap-3.5">
                  <span aria-hidden="true" className={cn('mt-1 h-9 w-[3px] shrink-0', skin.bar)} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={cn(
                          'font-mono text-[10px] tracking-[0.22em] uppercase',
                          skin.codeColor,
                        )}
                      >
                        {group.code}
                      </span>
                      <span
                        className={cn(
                          'border px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] uppercase',
                          skin.badgeBorder,
                        )}
                      >
                        {countLabel} {t('PROYECTOS', 'PROJECTS')}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-xl font-bold tracking-[0.06em] text-[#ecf8ff] uppercase sm:text-2xl">
                      {locale === 'en' ? group.titleEn : group.title}
                    </h3>
                  </div>
                </div>

                <p className="max-w-md text-xs leading-relaxed text-[#9bb3ca] md:text-right sm:text-[13px]">
                  {locale === 'en' ? group.descriptionEn : group.description}
                </p>
              </div>

              {/* Inner Grid of Projects inside Category Frame */}
              <div
                className={cn(
                  'relative grid grid-cols-1 gap-5 md:grid-cols-2',
                  isThreeCol ? 'lg:grid-cols-3 lg:gap-6' : 'lg:gap-7',
                )}
              >
                {groupProjects.map((project) => (
                  <article
                    key={project.id}
                    className={cn(
                      'showcase-card group relative flex w-full flex-col border bg-[#060d18]/94 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1.5',
                      CARD_SKIN,
                    )}
                  >
                    <TronWireOverlay variant="dual" withScan />

                    <button
                      type="button"
                      onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                      onFocus={() => revealBoxRef.current(groupIdx)}
                      onClick={() => handleOpenProject(project)}
                      aria-label={t(
                        `Ver proyecto ${project.index}: ${project.title}`,
                        `View project ${project.index}: ${project.title}`,
                      )}
                      data-cursor="pointer"
                      className="flex w-full flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00f3ff]"
                    >
                      {/* Clean 16:10 Real Thumbnail from The Rookies */}
                      <div className="showcase-card-media relative aspect-[16/10] w-full overflow-hidden border-b border-[#00f3ff]/15 bg-[#050b14]">
                        <img
                          src={project.thumbnail}
                          srcSet={`${project.thumbnail} 800w, ${project.thumbnailHiRes} 1400w`}
                          sizes="(max-width: 768px) 360px, (max-width: 1024px) 420px, 540px"
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] will-change-transform"
                        />
                        <span className="showcase-card-index pointer-events-none absolute left-3 top-3 border border-[#bd00ff]/75 bg-[#020408]/92 px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] text-[#f5e6ff]">
                          {project.index}
                        </span>
                      </div>

                      {/* Essential Info */}
                      <div
                        className={cn(
                          'showcase-card-body flex w-full flex-1 items-start justify-between gap-3',
                          isThreeCol ? 'p-4 sm:p-5' : 'gap-4 p-5',
                        )}
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] tracking-[0.18em] text-[#00f3ff] uppercase">
                            {project.category} · {project.year}
                          </div>
                          <h4
                            className={cn(
                              'mt-1 font-display font-bold leading-snug text-[#ecf8ff] transition-colors group-hover:text-[#e6fcff]',
                              isThreeCol ? 'text-[15px]' : 'text-lg',
                            )}
                          >
                            {project.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-[#8ba4be]">
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
          );
        })}
      </div>
    </section>
  );
}
