import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Download, FileText, GraduationCap } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';
import { useLanguage } from '../i18n/LanguageContext';
import {
  addLaserBeam,
  addNeonFlicker,
  addScanWipe,
  addWireDraw,
  createOnceScrollTrigger,
} from '../animations/tronInit';
import { TronWireOverlay } from '../components/TronWireOverlay';
import { TronCircuitCluster } from '../components/TronCircuitCluster';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t } = useLanguage();

  const portraitUrl = `${import.meta.env.BASE_URL}images/adrian-portrait.jpg`;
  const cvUrl = `${import.meta.env.BASE_URL}Adrian_Alejo_CV.pdf`;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.set(
        '.about-eyebrow, .about-title-main, .about-neon-accent, .about-portrait-card, .about-spec-card, .about-bio-panel, .about-edu-card, .about-cv-actions',
        { opacity: 0 },
      );

      const tl = gsap.timeline({ paused: true });

      addLaserBeam(tl, '[data-about-header-laser]', 0, {
        axis: 'x',
        duration: 0.45,
        settleOpacity: 0,
      });
      addScanWipe(tl, '.about-eyebrow', 0.04, { direction: 'right', duration: 0.4 });
      addScanWipe(tl, '.about-title-main', 0.1, { direction: 'down', duration: 0.45 });
      addNeonFlicker(tl, '.about-neon-accent', 0.18);

      const portraitCard = section.querySelector('.about-portrait-card');
      tl.fromTo(
        '.about-portrait-card',
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
        0.2,
      );
      addWireDraw(tl, portraitCard, 0.2, { duration: 0.45 });

      const bioPanel = section.querySelector('.about-bio-panel');
      tl.fromTo(
        '.about-bio-panel',
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: 'power2.out' },
        0.26,
      );
      addWireDraw(tl, bioPanel, 0.26, { duration: 0.45 });

      addScanWipe(tl, '.about-spec-card', 0.34, { direction: 'down', duration: 0.38, stagger: 0.05 });
      addScanWipe(tl, '.about-edu-card', 0.4, { direction: 'down', duration: 0.4, stagger: 0.08 });

      tl.fromTo(
        '.about-cv-actions',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.36, ease: 'expo.out', clearProps: 'transform' },
        0.52,
      );

      createOnceScrollTrigger(tl, {
        trigger: section,
        start: 'top 76%',
      });
    },
    { scope: sectionRef },
  );

  const specs = [
    {
      label: t('BASE', 'LOCATION'),
      value: t('Valencia, España', 'Valencia, Spain'),
    },
    {
      label: t('IDIOMAS', 'LANGUAGES'),
      value: t('ES Nativo · EN C1 · VAL', 'ES Native · EN C1 · VAL'),
    },
    {
      label: 'PIPELINE',
      value: 'Blender → Unity 6',
    },
    {
      label: t('ESPECIALIDAD', 'SPECIALTY'),
      value: 'Character & Facial Rig',
    },
  ];

  const education = [
    {
      period: t('2023 — PRESENTE', '2023 — PRESENT'),
      degree: t(
        'Grado en Diseño y Desarrollo de Videojuegos y Experiencias Interactivas',
        'B.Sc. in Video Game Design & Interactive Experiences',
      ),
      school: 'Florida Universitària · Valencia',
      detail: t(
        'Rigging modular de personajes, skinning, Blend Shapes e integración de animación jugable en Unity.',
        'Modular character rigging, skinning, Blend Shapes, and gameplay animation integration in Unity.',
      ),
      accent: 'cyan' as const,
    },
    {
      period: '2019 — 2023',
      degree: t(
        'Grado en Danzas Acrobáticas y Circenses',
        'B.A. in Acrobatic & Circus Arts',
      ),
      school: 'Universidad Rey Juan Carlos · Madrid',
      detail: t(
        'Base física en biomecánica, equilibrio, arcos e inercia aplicada directamente al body mechanics 3D.',
        'Hands-on foundation in biomechanics, balance, arcs, and momentum applied directly to 3D body mechanics.',
      ),
      accent: 'violet' as const,
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="relative z-10 w-full px-5 py-20 sm:px-8 lg:px-12 lg:py-32"
    >
      <TronCircuitCluster
        variant="hex-bus-a"
        className="absolute right-[3%] top-[8%] -z-10 hidden h-64 w-72 xl:block"
      />

      <div className="mx-auto max-w-7xl space-y-10 lg:space-y-12">
        {/* Section Header */}
        <div className="relative pb-4">
          <span
            aria-hidden="true"
            data-about-header-laser=""
            className="tron-laser-divider bottom-0 left-0 right-0 h-[1px] origin-left bg-gradient-to-r from-[#00f3ff] via-[#bd00ff] to-transparent opacity-0 shadow-[0_0_10px_rgba(0,243,255,0.7)]"
          />
          <span className="about-eyebrow inline-block font-mono text-[11px] tracking-[0.22em] text-[#00f3ff] uppercase">
            {t('03 // SOBRE MÍ · OPERADOR', '03 // ABOUT ME · OPERATOR')}
          </span>
          <h2
            id="about-heading"
            className="mt-1 font-display text-2xl font-bold tracking-[0.04em] text-[#ecf8ff] uppercase sm:text-4xl"
          >
            <span className="about-title-main inline-block">{t('DETRÁS DEL', 'BEHIND THE')}</span>{' '}
            <span className="about-neon-accent inline-block text-[#00f3ff] tron-glow-cyan">
              RIG
            </span>
          </h2>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left Rail: Holographic Portrait Dossier + Operator Specs */}
          <div className="space-y-4 lg:col-span-5">
            <div className="about-portrait-card obsidian-dichroic-panel dichroic-hover-border tron-card-bevel relative mx-auto w-full max-w-[290px] border border-[#00f3ff]/35 bg-[#050b14]/92 p-2.5 shadow-[var(--glow-cyan-border)] sm:max-w-[320px] lg:mx-0 lg:max-w-[350px]">
              <TronWireOverlay variant="dual" withScan />

              {/* 4 HUD Corner Brackets */}
              <span aria-hidden="true" className="pointer-events-none absolute -left-[1px] -top-[1px] h-3 w-3 border-l-2 border-t-2 border-[#00f3ff]" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-3 w-3 border-b-2 border-l-2 border-[#bd00ff]" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-3 w-3 border-b-2 border-r-2 border-[#00f3ff]" />

              <div className="group relative aspect-[3/4] w-full overflow-hidden border border-[#00f3ff]/20 bg-[#020408]">
                <img
                  src={portraitUrl}
                  alt="Adrián Alejo Molina"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top brightness-[0.94] contrast-[1.06] saturate-[0.88] transition-transform duration-500 group-hover:scale-[1.03]"
                />

                {/* Soft dark obsidian radial edge blend + cyan/violet holo sheen */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_46%,rgba(2,4,8,0.86)_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#00f3ff]/12 via-transparent to-[#bd00ff]/16 mix-blend-screen"
                />
                <div aria-hidden="true" className="rf-scanlines pointer-events-none absolute inset-0 opacity-45" />

                <span className="pointer-events-none absolute left-2.5 top-2.5 border border-[#00f3ff]/55 bg-[#020408]/88 px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] text-[#e6fcff] uppercase">
                  ID // SENTINELPRIME
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between px-1 font-mono text-[10px] tracking-[0.14em] text-[#8ba4be] uppercase">
                <span className="truncate text-[#ecf8ff]">ADRIÁN ALEJO MOLINA</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[#00f3ff]">
                  <span className="h-1.5 w-1.5 animate-pulse bg-[#00f3ff] shadow-[0_0_8px_#00f3ff] motion-reduce:animate-none" />
                  ONLINE
                </span>
              </div>
            </div>

            {/* 4-Cell Compact Telemetry Grid */}
            <div className="mx-auto grid w-full max-w-[290px] grid-cols-2 gap-2.5 sm:max-w-[320px] lg:mx-0 lg:max-w-[350px]">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="about-spec-card border border-[#00f3ff]/20 bg-[#050b14]/88 p-3"
                >
                  <div className="font-mono text-[10px] tracking-[0.14em] text-[#00f3ff] uppercase">
                    {spec.label}
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-medium text-[#ecf8ff]">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Rail: Bio + Education Differentiator + CV PDF Buttons */}
          <div className="space-y-6 lg:col-span-7">
            <div className="about-bio-panel obsidian-dichroic-panel relative border border-[#00f3ff]/25 border-t-2 border-t-[#bd00ff] bg-[#050b14]/90 p-5 shadow-[var(--glow-cyan-border)] sm:p-7">
              <TronWireOverlay variant="cyan" withScan />

              <div className="space-y-4 text-sm leading-relaxed text-[#b8cce0] sm:text-base">
                <p>
                  {t(
                    'Soy Adrián Alejo Molina (SentinelPrime), 3D Character Rigger y Animador afincado en Valencia. Me especializo en construir armaduras limpias, deformaciones fiables y controles intuitivos pensados para que animar personajes en tiempo real entre Blender y Unity 6 sea ágil y expresivo.',
                    "I'm Adrián Alejo Molina (SentinelPrime), a 3D Character Rigger & Animator based in Valencia, Spain. I specialize in building clean armatures, reliable deformation, and animator-first control systems designed for expressive real-time performance across Blender and Unity 6.",
                  )}
                </p>
                <p>
                  {t(
                    'Antes de dar el salto al diseño y desarrollo de videojuegos en Florida Universitària, me gradué en Danzas Acrobáticas y Circenses en la Universidad Rey Juan Carlos (Madrid). Esa base física marca mi forma de riggear y animar: comprendo el peso, el centro de gravedad, las líneas de acción y los límites articulares primero desde el movimiento real, y luego los traslado a cada hueso, pivote e IK.',
                    "Before moving into Video Game Design & Development at Florida Universitària, I graduated in Acrobatic & Circus Arts at Universidad Rey Juan Carlos (Madrid). That physical discipline shapes how I rig and animate: I understand weight, center of gravity, motion arcs, and joint mechanics in the real body first — then translate them cleanly into every bone, pivot, and IK solver.",
                  )}
                </p>
              </div>
            </div>

            {/* Education & Foundation Highlight Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {education.map((item) => (
                <article
                  key={item.degree}
                  className="about-edu-card tron-glass border border-[#00f3ff]/20 bg-[#050b14]/88 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
                    <span
                      className={
                        item.accent === 'cyan' ? 'text-[#00f3ff]' : 'text-[#bd00ff]'
                      }
                    >
                      {item.period}
                    </span>
                    <GraduationCap
                      className={
                        item.accent === 'cyan'
                          ? 'h-4 w-4 text-[#00f3ff]'
                          : 'h-4 w-4 text-[#bd00ff]'
                      }
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-2 font-display text-sm font-bold leading-snug text-[#ecf8ff] uppercase sm:text-base">
                    {item.degree}
                  </h3>
                  <div className="mt-1 font-mono text-[11px] text-[#00f3ff]/90">
                    {item.school}
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#8ba4be] sm:text-sm">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>

            {/* CV PDF Actions */}
            <div className="about-cv-actions flex flex-wrap items-center gap-3.5 pt-1">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor="magnetic"
                onPointerEnter={() => audioManager.playSynth('hover', 0.65)}
                onClick={() => audioManager.playSynth('click', 0.85)}
                className="tron-glass-btn-cyan dichroic-hover-border inline-flex min-h-[44px] items-center gap-2.5 px-6 py-3 font-display text-xs font-bold tracking-[0.14em] uppercase hover:scale-[1.02]"
              >
                <FileText className="h-4 w-4 text-[#00f3ff]" aria-hidden="true" />
                <span>
                  {t('Ver CV (PDF)', 'View Resume (PDF)')}
                  <span className="sr-only">
                    {t(' (se abre en una nueva pestaña)', ' (opens in a new tab)')}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#00f3ff]" aria-hidden="true" />
              </a>

              <a
                href={cvUrl}
                download="Adrian_Alejo_CV_3D_Rigger.pdf"
                data-cursor="pointer"
                onPointerEnter={() => audioManager.playSynth('hover', 0.6)}
                onClick={() => audioManager.playSynth('success', 0.8)}
                className="tron-glass-btn-violet inline-flex min-h-[44px] items-center gap-2.5 px-5 py-3 font-mono text-xs font-semibold tracking-[0.14em] uppercase"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{t('Descargar CV', 'Download CV')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
