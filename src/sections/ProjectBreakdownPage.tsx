import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Layers,
  Maximize2,
  X,
} from 'lucide-react';
import {
  PORTFOLIO_PROJECTS,
  type PortfolioProject,
  type ProjectContentBlock,
} from '../data/portfolio';
import { audioManager } from '../audio/AudioManager';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { prefersReducedMotion } from '../animations/tronInit';
import { TronWireOverlay } from '../components/TronWireOverlay';
import { cn } from '../utils/cn';

interface ProjectBreakdownPageProps {
  project: PortfolioProject | null;
  onClose: () => void;
  onSelectProject: (project: PortfolioProject) => void;
}

interface LightboxMedia {
  src: string;
  alt: string;
}

export function ProjectBreakdownPage({
  project,
  onClose,
  onSelectProject,
}: ProjectBreakdownPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null);
  const { locale, t } = useLanguage();

  const reduced = prefersReducedMotion();

  // Scroll to top when opening or switching between projects
  useEffect(() => {
    if (!project) {
      setLightbox(null);
      return;
    }

    setLightbox(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    const focusRaf = window.requestAnimationFrame(() => {
      backButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusRaf);
    };
  }, [project?.id]);

  // Keyboard navigation: Escape closes lightbox first, then subpage
  useEffect(() => {
    if (!project) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        audioManager.playSynth('click', 0.65);
        if (lightbox) {
          setLightbox(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, lightbox, onClose]);

  const currentIdx = project
    ? PORTFOLIO_PROJECTS.findIndex((p) => p.id === project.id)
    : -1;
  const prevProject =
    currentIdx >= 0
      ? PORTFOLIO_PROJECTS[
          (currentIdx - 1 + PORTFOLIO_PROJECTS.length) % PORTFOLIO_PROJECTS.length
        ]
      : null;
  const nextProject =
    currentIdx >= 0
      ? PORTFOLIO_PROJECTS[(currentIdx + 1) % PORTFOLIO_PROJECTS.length]
      : null;

  const openLightbox = (src: string, alt: string) => {
    audioManager.playSynth('click', 0.7);
    setLightbox({ src, alt });
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-breakdown-subpage"
          ref={scrollContainerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          data-lenis-prevent
          initial={reduced ? { opacity: 1 } : { x: '100%', opacity: 0.55 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { x: '100%', opacity: 0.55 }}
          transition={{ duration: reduced ? 0.01 : 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="tron-the-grid fixed inset-0 z-[75] overflow-y-auto overflow-x-hidden overscroll-contain bg-[#020408]/97 text-[#ecf8ff] backdrop-blur-xl will-change-transform"
        >
          {/* Subtle ambient glows matching site identity */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,243,255,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(189,0,255,0.08),transparent_55%)]"
          />

          {/* Sticky Top Navigation Bar */}
          <header className="sticky top-0 z-30 border-b border-[#00f3ff]/20 bg-[#020408]/92 px-4 py-2.5 backdrop-blur-md sm:px-8 sm:py-3">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3">
              <button
                ref={backButtonRef}
                type="button"
                data-cursor="magnetic"
                onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                onClick={() => {
                  audioManager.playSynth('click', 0.75);
                  onClose();
                }}
                className="tron-glass-btn-cyan inline-flex min-h-[40px] items-center gap-1.5 px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase sm:min-h-[42px] sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.14em]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#00f3ff]" aria-hidden="true" />
                <span>{t('Volver a proyectos', 'Back to projects')}</span>
              </button>

              <div className="hidden min-w-0 items-center gap-2.5 font-mono text-[11px] tracking-[0.16em] text-[#8ba4be] uppercase sm:flex">
                <span className="text-[#bd00ff]">{project.index}</span>
                <span>/</span>
                <span>0{PORTFOLIO_PROJECTS.length}</span>
                <span className="truncate text-[#e6fcff]">· {project.title}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <LanguageToggle />
                {prevProject && (
                  <button
                    type="button"
                    data-cursor="pointer"
                    aria-label={t(
                      `Proyecto anterior: ${prevProject.title}`,
                      `Previous project: ${prevProject.title}`,
                    )}
                    onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                    onClick={() => {
                      audioManager.playSynth('click', 0.75);
                      onSelectProject(prevProject);
                    }}
                    className="inline-flex h-[40px] w-[40px] items-center justify-center border border-[#00f3ff]/25 bg-[#050b14]/85 text-[#ecf8ff] transition-colors hover:border-[#00f3ff] hover:text-[#e6fcff] sm:h-[42px] sm:w-[42px]"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                {nextProject && (
                  <button
                    type="button"
                    data-cursor="pointer"
                    aria-label={t(
                      `Siguiente proyecto: ${nextProject.title}`,
                      `Next project: ${nextProject.title}`,
                    )}
                    onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                    onClick={() => {
                      audioManager.playSynth('click', 0.75);
                      onSelectProject(nextProject);
                    }}
                    className="inline-flex h-[40px] w-[40px] items-center justify-center border border-[#00f3ff]/25 bg-[#050b14]/85 text-[#ecf8ff] transition-colors hover:border-[#bd00ff] hover:text-[#f5e6ff] sm:h-[42px] sm:w-[42px]"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Case Study Article */}
          <motion.article
            key={project.id}
            initial={reduced ? { opacity: 1 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-8 sm:pt-12"
          >
            {/* Dossier Header */}
            <div className="space-y-6 border-b border-[#00f3ff]/20 pb-8">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase">
                <span className="border border-[#bd00ff]/70 bg-[#a020f0]/20 px-2.5 py-0.5 text-[#f5e6ff]">
                  {project.index} // {project.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#8ba4be]">
                  <Calendar className="h-3.5 w-3.5 text-[#00f3ff]" aria-hidden="true" />
                  {project.publishedDate}
                </span>
              </div>

              <h1
                id="case-study-title"
                className="font-display text-2xl font-bold tracking-[0.03em] text-[#ecf8ff] uppercase sm:text-4xl lg:text-5xl"
              >
                {project.fullTitle}
              </h1>

              <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[#b4c8dd] sm:text-base">
                {project.fullDescription}
              </p>

              {/* Software & Skills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Layers className="mr-1 h-3.5 w-3.5 text-[#00f3ff]" aria-hidden="true" />
                {project.software.map((sw) => (
                  <span
                    key={sw}
                    className="border border-[#00f3ff]/30 bg-[#050b14]/85 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-[#e6fcff] uppercase"
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Cover Artwork */}
            <div className="mt-8">
              <button
                type="button"
                data-cursor="pointer"
                onClick={() => openLightbox(project.thumbnailHiRes, project.fullTitle)}
                className="tron-glass group relative block w-full overflow-hidden border border-[#00f3ff]/35 bg-[#040912] shadow-[var(--glow-cyan-border)]"
              >
                <TronWireOverlay variant="dual" />
                <img
                  src={project.thumbnailHiRes}
                  alt={project.fullTitle}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015] sm:aspect-[16/8.5]"
                />
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-[#00f3ff]/45 bg-[#020408]/85 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-[#e6fcff] uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-3 w-3 text-[#00f3ff]" aria-hidden="true" />
                  {t('Ampliar', 'Zoom')}
                </span>
              </button>
            </div>

            {/* Quick Technical Highlights Strip */}
            {(locale === 'en' ? project.highlightsEn : project.highlights).length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(locale === 'en' ? project.highlightsEn : project.highlights).map((item) => (
                  <div
                    key={item}
                    className="border-l-2 border-[#bd00ff] bg-[#060d18]/90 px-4 py-3 text-xs leading-relaxed text-[#dbeaf8] sm:text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* Exact Ordered Breakdown Blocks */}
            <div className="mt-10 space-y-6 sm:space-y-8">
              {project.blocks.map((block, idx) => (
                <BreakdownBlockRenderer
                  key={`${project.id}-block-${idx}`}
                  block={block}
                  projectTitle={project.title}
                  zoomLabel={t('Ampliar', 'Zoom')}
                  onOpenLightbox={openLightbox}
                />
              ))}
            </div>

            {/* Bottom Navigation: Quick Project Switcher & Return */}
            <footer className="mt-16 border-t border-[#00f3ff]/20 pt-10">
              <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-[#00f3ff] uppercase">
                {t('SEGUIR EXPLORANDO EL PORTFOLIO', 'KEEP EXPLORING PORTFOLIO')}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prevProject && (
                  <button
                    type="button"
                    data-cursor="pointer"
                    onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                    onClick={() => {
                      audioManager.playSynth('click', 0.8);
                      onSelectProject(prevProject);
                    }}
                    className="tron-glass group flex items-center justify-between gap-4 border border-[#00f3ff]/25 bg-[#060d18]/90 p-4 text-left transition-colors hover:border-[#00f3ff]"
                  >
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#8ba4be] uppercase">
                        <ArrowLeft className="h-3 w-3 text-[#00f3ff]" aria-hidden="true" />
                        {t('Anterior', 'Previous')} · {prevProject.index}
                      </span>
                      <div className="mt-1 truncate font-display text-sm font-bold text-[#ecf8ff] uppercase sm:text-base">
                        {prevProject.title}
                      </div>
                    </div>
                  </button>
                )}

                {nextProject && (
                  <button
                    type="button"
                    data-cursor="pointer"
                    onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                    onClick={() => {
                      audioManager.playSynth('click', 0.8);
                      onSelectProject(nextProject);
                    }}
                    className="tron-glass group flex items-center justify-between gap-4 border border-[#00f3ff]/25 bg-[#060d18]/90 p-4 text-right transition-colors hover:border-[#bd00ff] sm:flex-row-reverse"
                  >
                    <div className="min-w-0 sm:flex-1">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#8ba4be] uppercase">
                        {t('Siguiente', 'Next')} · {nextProject.index}
                        <ArrowRight className="h-3 w-3 text-[#bd00ff]" aria-hidden="true" />
                      </span>
                      <div className="mt-1 truncate font-display text-sm font-bold text-[#ecf8ff] uppercase sm:text-base">
                        {nextProject.title}
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  data-cursor="magnetic"
                  onPointerEnter={() => audioManager.playSynth('hover', 0.6)}
                  onClick={() => {
                    audioManager.playSynth('click', 0.75);
                    onClose();
                  }}
                  className="tron-glass-btn-violet inline-flex min-h-[44px] items-center gap-2.5 px-6 py-3 font-display text-xs font-bold tracking-[0.16em] uppercase"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{t('Volver al inicio de proyectos', 'Back to project showcase')}</span>
                </button>
              </div>
            </footer>
          </motion.article>

          {/* Fullscreen High-Res Media Lightbox (Portal above transformed scroll container) */}
          {typeof document !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                {lightbox && (
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('Imagen ampliada', 'Enlarged image')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => {
                      audioManager.playSynth('click', 0.65);
                      setLightbox(null);
                    }}
                    className="fixed inset-0 z-[95] flex items-center justify-center bg-[#020408]/94 p-4 backdrop-blur-md sm:p-8"
                  >
                    <button
                      type="button"
                      autoFocus
                      aria-label={t('Cerrar imagen ampliada', 'Close enlarged image')}
                      onClick={(e) => {
                        e.stopPropagation();
                        audioManager.playSynth('click', 0.65);
                        setLightbox(null);
                      }}
                      className="fixed right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center border border-[#00f3ff]/45 bg-[#050b14]/90 text-[#ecf8ff] transition-colors hover:border-[#bd00ff]"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <img
                      src={lightbox.src}
                      alt={lightbox.alt}
                      onClick={(e) => e.stopPropagation()}
                      className="max-h-[90vh] max-w-full border border-[#00f3ff]/35 object-contain shadow-[var(--glow-cyan-strong)]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BreakdownBlockRenderer({
  block,
  projectTitle,
  zoomLabel,
  onOpenLightbox,
}: {
  block: ProjectContentBlock;
  projectTitle: string;
  zoomLabel: string;
  onOpenLightbox: (src: string, alt: string) => void;
}) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="pt-4">
          <h2 className="border-l-2 border-[#00f3ff] pl-3.5 font-display text-lg font-bold tracking-[0.06em] text-[#ecf8ff] uppercase sm:text-2xl">
            {block.text}
          </h2>
        </div>
      );

    case 'paragraph':
      if (block.bold) {
        return (
          <h3 className="pt-2 font-display text-base font-bold tracking-[0.06em] text-[#00f3ff] uppercase sm:text-lg">
            {block.text}
          </h3>
        );
      }
      return (
        <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[#b4c8dd] sm:text-base">
          {block.text}
        </p>
      );

    case 'image':
      return (
        <button
          type="button"
          data-cursor="pointer"
          onClick={() =>
            onOpenLightbox(block.hiResSrc ?? block.src, block.alt ?? projectTitle)
          }
          className="group relative block w-full overflow-hidden border border-[#00f3ff]/20 bg-[#050b14] transition-colors hover:border-[#00f3ff]/55"
        >
          <img
            src={block.src}
            alt={block.alt ?? projectTitle}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-contain"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-[#00f3ff]/45 bg-[#020408]/85 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-[#e6fcff] uppercase opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3 w-3 text-[#00f3ff]" aria-hidden="true" />
            {zoomLabel}
          </span>
        </button>
      );

    case 'gif':
      return (
        <button
          type="button"
          data-cursor="pointer"
          onClick={() => onOpenLightbox(block.src, block.alt ?? projectTitle)}
          className="group relative block w-full overflow-hidden border border-[#bd00ff]/30 bg-[#050b14] shadow-[0_0_24px_rgba(0,0,0,0.5)] transition-colors hover:border-[#00f3ff]"
        >
          <img
            src={block.src}
            alt={block.alt ?? projectTitle}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-contain"
          />
        </button>
      );

    case 'gallery': {
      const gridCols =
        block.columns === 4
          ? 'grid-cols-2 lg:grid-cols-4'
          : block.columns === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2';
      return (
        <div className={cn('grid gap-3 sm:gap-4', gridCols)}>
          {block.items.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              data-cursor="pointer"
              onClick={() =>
                onOpenLightbox(item.hiResSrc ?? item.src, item.alt ?? projectTitle)
              }
              className="group relative overflow-hidden border border-[#00f3ff]/20 bg-[#050b14] transition-colors hover:border-[#00f3ff]/60"
            >
              <img
                src={item.src}
                alt={item.alt ?? `${projectTitle} (${i + 1})`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      );
    }

    case 'video':
      return (
        <div className="overflow-hidden border border-[#00f3ff]/30 bg-black shadow-[var(--glow-cyan-border)]">
          <video
            src={block.src}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black"
          />
        </div>
      );

    case 'embed':
      return (
        <div className="aspect-video w-full overflow-hidden border border-[#00f3ff]/35 bg-black shadow-[var(--glow-cyan-border)]">
          <iframe
            src={block.src}
            title={block.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
  }
}
