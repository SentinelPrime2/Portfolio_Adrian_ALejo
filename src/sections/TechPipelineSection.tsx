import { type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Bone, Box, Crosshair, Eye, Flame, Move, RotateCcw, Sliders } from 'lucide-react';
import { CORE_TOOLS, PIPELINE_STAGES } from '../data/portfolio';
import {
  rigState,
  setRigShowWidgets,
  subscribeRigShowWidgets,
  type IkLiveMode,
  type RigAnimationPreset,
  type RigLabTab,
  type WeightPaintZone,
} from '../canvas/rigState';
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
import { cn } from '../utils/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PRESETS: {
  id: RigAnimationPreset;
  label: string;
  labelEn: string;
  sub: string;
  subEn: string;
  pose: number;
  energy: number;
}[] = [
  { id: 'idle', label: 'IDLE', labelEn: 'IDLE', sub: 'Brazos cruzados', subEn: 'Crossed arms', pose: 1, energy: 0.5 },
  { id: 'wave', label: 'SALUDO', labelEn: 'WAVE', sub: 'Wave + Sonrisa', subEn: 'Wave + Smile', pose: 1, energy: 0.55 },
  { id: 'run', label: 'CORRER', labelEn: 'RUN', sub: 'Carrera adelante', subEn: 'Forward run', pose: 1, energy: 0.6 },
  { id: 'tpose', label: 'T-POSE', labelEn: 'T-POSE', sub: 'Bind pose base', subEn: 'Base bind pose', pose: 0, energy: 0.1 },
];

const LAB_TABS: { id: RigLabTab; label: string }[] = [
  { id: 'anim', label: 'ANIM' },
  { id: 'ik', label: 'IK LIVE' },
  { id: 'weights', label: 'WEIGHTS' },
  { id: 'mech', label: 'MECH' },
];

const WEIGHT_ZONES: {
  id: WeightPaintZone;
  label: string;
  labelEn: string;
  bonesInfo: string;
  bonesInfoEn: string;
}[] = [
  { id: 'head', label: 'CABEZA', labelEn: 'HEAD', bonesInfo: 'DEF_HEAD · DEF_NECK · DEF_EAR.L/R', bonesInfoEn: 'DEF_HEAD · DEF_NECK · DEF_EAR.L/R' },
  { id: 'torso', label: 'TORSO', labelEn: 'TORSO', bonesInfo: 'DEF_HIPS · DEF_TORSO_01..03', bonesInfoEn: 'DEF_HIPS · DEF_TORSO_01..03' },
  { id: 'armL', label: 'BRAZO IZQ.', labelEn: 'LEFT ARM', bonesInfo: '6 segmentos DEF_UPPER_ARM / FOREARM.L', bonesInfoEn: '6 segments DEF_UPPER_ARM / FOREARM.L' },
  { id: 'hands', label: 'MANOS', labelEn: 'HANDS', bonesInfo: 'DEF_HAND · PALM · FINGER_A..D (L/R)', bonesInfoEn: 'DEF_HAND · PALM · FINGER_A..D (L/R)' },
  { id: 'legs', label: 'PIERNAS', labelEn: 'LEGS', bonesInfo: 'DEF_UPPER/LOWER_LEG · FOOT · TOES', bonesInfoEn: 'DEF_UPPER/LOWER_LEG · FOOT · TOES' },
  { id: 'face', label: 'BOCA / LENGUA', labelEn: 'MOUTH / TONGUE', bonesInfo: '18 DEF_TONGUE + 12 DEF_LIP + EYES', bonesInfoEn: '18 DEF_TONGUE + 12 DEF_LIP + EYES' },
];

export function TechPipelineSection() {
  const { locale, t } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const spineRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rigLabWrapperRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [labTab, setLabTab] = useState<RigLabTab>(rigState.labTab);
  const [preset, setPreset] = useState<RigAnimationPreset>(rigState.preset);
  const [poseBlend, setPoseBlend] = useState(rigState.poseBlend);
  const [energy, setEnergy] = useState(rigState.actingEnergy);
  const [rigAnnouncement, setRigAnnouncement] = useState('');

  // Layer visibility toggles
  const [xray, setXray] = useState(rigState.xrayMode);
  const [showWidgets, setShowWidgets] = useState(rigState.showWidgets);
  const [showBones, setShowBones] = useState(rigState.showBones);

  useEffect(() => {
    setShowWidgets(rigState.showWidgets);
    return subscribeRigShowWidgets((visible) => {
      setShowWidgets(visible);
    });
  }, []);

  // IK Live Lab state
  const [ikMode, setIkMode] = useState<IkLiveMode>(rigState.ikMode);
  const [ikPos, setIkPos] = useState({ x: rigState.ikTargetX, y: rigState.ikTargetY });
  const [isDraggingIk, setIsDraggingIk] = useState(false);

  // Real Weight Paint Heatmap state
  const [weightZone, setWeightZone] = useState<WeightPaintZone>('head');

  // Mechanisms Lab state
  const [handGrip, setHandGrip] = useState(rigState.handGrip);
  const [footRoll, setFootRoll] = useState(rigState.footRoll);
  const [mouthTongue, setMouthTongue] = useState(rigState.mouthTongue);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (rigLabWrapperRef.current) {
        ScrollTrigger.create({
          trigger: rigLabWrapperRef.current,
          start: 'top 78%',
          end: 'bottom 20%',
          onEnter: () => {
            rigState.pipelineLabFocused = true;
          },
          onEnterBack: () => {
            rigState.pipelineLabFocused = true;
          },
          onLeave: () => {
            rigState.pipelineLabFocused = false;
          },
          onLeaveBack: () => {
            rigState.pipelineLabFocused = false;
          },
          onRefresh: (self) => {
            rigState.pipelineLabFocused = self.isActive;
          },
        });
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom 35%',
        scrub: true,
        onUpdate: (self) => {
          rigState.pipelineProgress = self.progress;
          if (spineRef.current) {
            spineRef.current.style.transform = `scaleY(${Math.max(0.04, self.progress).toFixed(4)})`;
          }
        },
      });

      gsap.set(
        '.pipeline-eyebrow, .pipeline-title-main, .pipeline-neon-accent, .pipeline-node, .pipeline-step-index, .pipeline-step-content, .rig-lab-console, .rig-lab-bracket, .rig-lab-title, .pipeline-stack-label, .pipeline-stack-item',
        { opacity: 0 },
      );

      // 1. Section Header Ignition
      const headerTl = gsap.timeline({ paused: true });
      addScanWipe(headerTl, '.pipeline-eyebrow', 0.02, { direction: 'right', duration: 0.4 });
      addScanWipe(headerTl, '.pipeline-title-main', 0.08, { direction: 'down', duration: 0.45 });
      addNeonFlicker(headerTl, '.pipeline-neon-accent', 0.18);
      createOnceScrollTrigger(headerTl, {
        trigger: section,
        start: 'top 80%',
      });

      // 2. Left Rail Circuit Steps 01..04
      gsap.utils.toArray<HTMLElement>('.pipeline-step').forEach((row) => {
        const stepTl = gsap.timeline({ paused: true });
        const node = row.querySelector('.pipeline-node');
        const indexTag = row.querySelector('.pipeline-step-index');
        const body = row.querySelector('.pipeline-step-content');

        addNeonFlicker(stepTl, [node, indexTag], 0);
        addScanWipe(stepTl, body, 0.1, { direction: 'right', duration: 0.48 });

        createOnceScrollTrigger(stepTl, {
          trigger: row,
          start: 'top 86%',
        });
      });

      // 3. Right Rail FINN // RIG LAB Console Wire-Draw & HUD Bracket Flicker
      const consoleEl = section.querySelector('.rig-lab-console');
      if (consoleEl) {
        const consoleTl = gsap.timeline({ paused: true });

        consoleTl.fromTo(
          consoleEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.24, ease: 'power2.out' },
          0,
        );
        addWireDraw(consoleTl, consoleEl, 0.04, { duration: 0.48 });
        addNeonFlicker(consoleTl, '.rig-lab-bracket', 0.14);
        addNeonFlicker(consoleTl, '.rig-lab-title', 0.24);

        createOnceScrollTrigger(consoleTl, {
          trigger: consoleEl,
          start: 'top 82%',
        });
      }

      // 4. Bottom STACK // Dual Laser Bar
      const stackBar = section.querySelector('.pipeline-stack-bar');
      if (stackBar) {
        const stackTl = gsap.timeline({ paused: true });

        addLaserBeam(stackTl, '[data-stack-laser-top]', 0, {
          axis: 'x',
          duration: 0.45,
          settleOpacity: 0,
        });
        addLaserBeam(stackTl, '[data-stack-laser-bottom]', 0.06, {
          axis: 'x',
          duration: 0.45,
          settleOpacity: 0,
        });
        addNeonFlicker(stackTl, '.pipeline-stack-label', 0.1);
        stackTl.fromTo(
          '.pipeline-stack-item',
          { opacity: 0, y: 6 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.045,
            ease: 'expo.out',
            clearProps: 'transform',
          },
          0.18,
        );

        createOnceScrollTrigger(stackTl, {
          trigger: stackBar,
          start: 'top 90%',
        });
      }
    },
    { scope: sectionRef },
  );

  const switchTab = (tab: RigLabTab) => {
    setLabTab(tab);
    rigState.labTab = tab;
    rigState.activeSection = 2;
    if (tab === 'weights') {
      const zone = weightZone === 'none' ? 'head' : weightZone;
      setWeightZone(zone);
      rigState.weightZone = zone;
    } else {
      rigState.weightZone = 'none';
    }
    const label = LAB_TABS.find((tabItem) => tabItem.id === tab)?.label ?? tab;
    setRigAnnouncement(
      t(`Modo ${label} activado en Rig Lab`, `${label} mode activated in Rig Lab`),
    );
    audioManager.playSynth('click', 0.8);
  };

  const handleTabKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, idx: number) => {
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % LAB_TABS.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + LAB_TABS.length) % LAB_TABS.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = LAB_TABS.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const targetTab = LAB_TABS[nextIdx];
      switchTab(targetTab.id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPreset(p.id);
    setPoseBlend(p.pose);
    setEnergy(p.energy);
    rigState.preset = p.id;
    rigState.poseBlend = p.pose;
    rigState.actingEnergy = p.energy;
    const presetName = locale === 'en' ? p.labelEn : p.label;
    setRigAnnouncement(
      t(`Animación ${presetName} activada`, `${presetName} animation activated`),
    );
    audioManager.playSynth('success', 0.7);
  };

  const handlePoseChange = (val: number) => {
    setPoseBlend(val);
    rigState.poseBlend = val;
    if (val > 0.05 && preset === 'tpose') {
      setPreset('idle');
      rigState.preset = 'idle';
    }
    audioManager.playSynth('tick', 0.65);
  };

  const handleEnergyChange = (val: number) => {
    setEnergy(val);
    rigState.actingEnergy = val;
    audioManager.playSynth('tick', 0.65);
  };

  const toggleXray = () => {
    const next = !xray;
    setXray(next);
    rigState.xrayMode = next;
    setRigAnnouncement(
      next
        ? t('Modo X-Ray activado', 'X-Ray mode enabled')
        : t('Modo X-Ray desactivado', 'X-Ray mode disabled'),
    );
    audioManager.playSynth('click', 0.85);
  };

  const toggleWidgets = () => {
    const next = !showWidgets;
    setRigShowWidgets(next);
    setRigAnnouncement(
      next
        ? t('Controladores CTRL visibles', 'CTRL controllers visible')
        : t('Controladores CTRL ocultos', 'CTRL controllers hidden'),
    );
    audioManager.playSynth('click', 0.85);
  };

  const toggleBones = () => {
    const next = !showBones;
    setShowBones(next);
    rigState.showBones = next;
    setRigAnnouncement(
      next
        ? t('Esqueleto DEF visible', 'DEF skeleton visible')
        : t('Esqueleto DEF oculto', 'DEF skeleton hidden'),
    );
    audioManager.playSynth('click', 0.85);
  };

  // Interactive 3D IK drag handlers over the open center stage (desktop) or live preview box (mobile)
  const updateIkFromPointer = (el: HTMLElement | null, clientX: number, clientY: number) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, -(((clientY - rect.top) / rect.height) * 2 - 1)));
    rigState.ikTargetX = nx;
    rigState.ikTargetY = ny;
    setIkPos({ x: nx, y: ny });
  };

  const handleStagePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (labTab !== 'ik') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingIk(true);
    rigState.ikDragging = true;
    audioManager.playSynth('click', 0.7);
    updateIkFromPointer(e.currentTarget, e.clientX, e.clientY);
  };

  const handleStagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingIk || labTab !== 'ik') return;
    updateIkFromPointer(e.currentTarget, e.clientX, e.clientY);
  };

  const handleStagePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingIk) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDraggingIk(false);
    rigState.ikDragging = false;
  };

  const switchIkMode = (mode: IkLiveMode) => {
    setIkMode(mode);
    rigState.ikMode = mode;
    const defX = mode === 'hand' ? -0.25 : 0;
    const defY = mode === 'hand' ? 0.28 : 0.12;
    rigState.ikTargetX = defX;
    rigState.ikTargetY = defY;
    setIkPos({ x: defX, y: defY });
    setRigAnnouncement(
      mode === 'hand'
        ? t('Modo IK cambiado a Mano IK', 'IK mode switched to Hand IK')
        : t('Modo IK cambiado a Eye Aim', 'IK mode switched to Eye Aim'),
    );
    audioManager.playSynth('click', 0.8);
  };

  const selectWeightZone = (zone: WeightPaintZone) => {
    setWeightZone(zone);
    rigState.weightZone = zone;
    const found = WEIGHT_ZONES.find((z) => z.id === zone);
    const label = found ? (locale === 'en' ? found.labelEn : found.label) : zone;
    setRigAnnouncement(
      t(`Mapa de pesos seleccionado: ${label}`, `Weight map selected: ${label}`),
    );
    audioManager.playSynth('click', 0.8);
  };

  const resetRig = () => {
    setLabTab('anim');
    setPreset('idle');
    setPoseBlend(1);
    setEnergy(0.5);
    setXray(false);
    setShowWidgets(false);
    setShowBones(false);
    setIkMode('hand');
    setWeightZone('head');
    setHandGrip(0.25);
    setFootRoll(0);
    setMouthTongue(0);
    setIkPos({ x: -0.25, y: 0.28 });

    rigState.labTab = 'anim';
    rigState.preset = 'idle';
    rigState.poseBlend = 1;
    rigState.actingEnergy = 0.5;
    rigState.xrayMode = false;
    setRigShowWidgets(false);
    rigState.showBones = false;
    rigState.ikMode = 'hand';
    rigState.weightZone = 'none';
    rigState.handGrip = 0.25;
    rigState.footRoll = 0;
    rigState.mouthTongue = 0;
    rigState.ikTargetX = -0.25;
    rigState.ikTargetY = 0.28;
    setRigAnnouncement(
      t('Rig Lab restablecido a posición inicial', 'Rig Lab reset to initial pose'),
    );
    audioManager.playSynth('click', 0.8);
  };

  const activeWeightMeta = WEIGHT_ZONES.find((z) => z.id === weightZone) ?? WEIGHT_ZONES[0];

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      aria-labelledby="pipeline-heading"
      className="relative z-10 w-full px-5 py-20 sm:px-8 lg:px-12 lg:py-36"
    >
      <TronCircuitCluster
        variant="hex-bus-b"
        className="absolute right-[4%] top-[4%] -z-10 hidden h-60 w-72 xl:block"
      />

      <div role="status" aria-live="polite" className="sr-only">
        {rigAnnouncement}
      </div>

      <div className="mx-auto max-w-7xl space-y-8 lg:space-y-14">
        {/* Clean Minimal Header */}
        <div className="max-w-xl">
          <span className="pipeline-eyebrow inline-block font-mono text-[11px] tracking-[0.22em] text-[#00f3ff] uppercase">
            02 // BEHIND THE SCENES · RIG LAB
          </span>
          <h2
            id="pipeline-heading"
            className="mt-1 font-display text-2xl font-bold tracking-[0.04em] text-[#ecf8ff] uppercase sm:text-4xl"
          >
            <span className="pipeline-title-main inline-block">RIGGING ANIMATOR-</span>
            <span className="pipeline-neon-accent inline-block text-[#00f3ff] tron-glow-cyan">
              FIRST
            </span>
          </h2>
        </div>

        {/* 3-Column Stage Layout: Steps (Left 4) · OPEN / DRAGGABLE CENTER STAGE (Center 4) · 4-Tab Rig Lab (Right 4) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          {/* Left Rail: 4 Clean Open Steps with Cyan Circuit Line & Ultraviolet Nodes */}
          <div className="relative space-y-6 pl-7 lg:col-span-4 lg:space-y-9">
            <div
              aria-hidden="true"
              className="absolute bottom-2 left-2 top-2 w-[1px] bg-[#00f3ff]/[0.18]"
            >
              <div
                ref={spineRef}
                style={{ transform: 'scaleY(0.05)' }}
                className="h-full w-full origin-top bg-gradient-to-b from-[#a020f0] via-[#bd00ff] to-[#00f3ff] will-change-transform"
              />
            </div>

            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.index} className="pipeline-step relative">
                <span
                  aria-hidden="true"
                  className="pipeline-node absolute -left-[25px] top-1.5 h-3 w-3 rotate-45 bg-[#bd00ff] shadow-[0_0_12px_#bd00ff]"
                />
                <span className="pipeline-step-index inline-block font-mono text-[11px] tracking-[0.2em] text-[#00f3ff]">
                  {stage.index}
                </span>
                <div className="pipeline-step-content border border-[#00f3ff]/15 bg-[#050b14]/88 p-3.5 backdrop-blur-sm lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                  <h3 className="mt-0.5 font-display text-base font-bold text-[#ecf8ff] uppercase lg:mt-1 sm:text-lg">
                    {locale === 'en' ? stage.titleEn : stage.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#8ba4be] lg:mt-1.5">
                    {locale === 'en' ? stage.descriptionEn : stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dedicated Open Center Stage — becomes interactive drag surface when IK LIVE tab is active! */}
          <div
            ref={stageRef}
            onPointerDown={handleStagePointerDown}
            onPointerMove={handleStagePointerMove}
            onPointerUp={handleStagePointerUp}
            onPointerCancel={handleStagePointerUp}
            data-cursor={labTab === 'ik' ? 'pointer' : undefined}
            className={cn(
              'relative hidden min-h-[540px] select-none flex-col items-center justify-end pb-4 lg:col-span-4 lg:flex',
              labTab === 'ik'
                ? 'pointer-events-auto cursor-crosshair border border-dashed border-[#00f3ff]/35 bg-[#00f3ff]/[0.02]'
                : 'pointer-events-none',
            )}
          >
            {labTab === 'ik' && (
              <div className="pointer-events-none inline-flex items-center gap-2 border border-[#00f3ff]/60 bg-[#020408]/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-[#e6fcff] uppercase backdrop-blur-sm shadow-[var(--glow-cyan-border)]">
                <Move className="h-3 w-3 text-[#00f3ff]" aria-hidden="true" />
                <span>
                  {isDraggingIk
                    ? `TARGET X:${ikPos.x.toFixed(2)} Y:${ikPos.y.toFixed(2)}`
                    : t(
                        `Arrastra aquí para mover ${ikMode === 'hand' ? 'CTRL_HAND_IK' : 'EYE_AIM'}`,
                        `Drag here to move ${ikMode === 'hand' ? 'CTRL_HAND_IK' : 'EYE_AIM'}`,
                      )}
                </span>
              </div>
            )}
          </div>

          {/* Right Rail: Mobile Live 3D Stage + Obsidian Glass 4-Tab Studio Inspector */}
          <div ref={rigLabWrapperRef} className="space-y-3 lg:sticky lg:top-24 lg:col-span-4 lg:space-y-0">
            {/* Mobile-only Live 3D Viewport Frame positioned directly above Rig Lab controls */}
            <div
              onPointerDown={handleStagePointerDown}
              onPointerMove={handleStagePointerMove}
              onPointerUp={handleStagePointerUp}
              onPointerCancel={handleStagePointerUp}
              className={cn(
                'relative flex h-[34svh] min-h-[210px] w-full select-none flex-col justify-between border border-[#00f3ff]/20 bg-transparent p-2.5 lg:hidden',
                labTab === 'ik'
                  ? 'pointer-events-auto touch-none border-dashed border-[#00f3ff]/55 bg-[#00f3ff]/[0.03]'
                  : 'pointer-events-none',
              )}
            >
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-[#00f3ff]/85 uppercase">
                <span>FINN // LIVE STAGE</span>
                <span className="text-[#bd00ff]/90">{labTab.toUpperCase()}</span>
              </div>
              {labTab === 'ik' ? (
                <div className="mx-auto inline-flex items-center gap-1.5 border border-[#00f3ff]/60 bg-[#020408]/85 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-[#e6fcff] uppercase">
                  <Move className="h-3 w-3 text-[#00f3ff]" aria-hidden="true" />
                  <span>
                    {isDraggingIk
                      ? `TARGET X:${ikPos.x.toFixed(2)} Y:${ikPos.y.toFixed(2)}`
                      : t(
                          `Toca y arrastra (${ikMode === 'hand' ? 'HAND_IK' : 'EYE_AIM'})`,
                          `Touch & drag (${ikMode === 'hand' ? 'HAND_IK' : 'EYE_AIM'})`,
                        )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-[#8ba4be]/75 uppercase">
                  <span>{t('VISTA REACTIVA 3D', 'REACTIVE 3D VIEW')}</span>
                  <span>{xray ? 'X-RAY' : showBones ? 'DEF' : 'SOLID'}</span>
                </div>
              )}
            </div>

            <div className="rig-lab-console tron-glass relative border border-[#00f3ff]/30 border-t-2 border-t-[#bd00ff] p-3.5 shadow-[var(--glow-cyan-border)] sm:p-5">
              <TronWireOverlay variant="dual" withScan />

              {/* 4 HUD Corner Brackets */}
              <span aria-hidden="true" className="rig-lab-bracket pointer-events-none absolute -left-[1px] -top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-[#00f3ff]" />
              <span aria-hidden="true" className="rig-lab-bracket pointer-events-none absolute -right-[1px] -top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-[#bd00ff]" />
              <span aria-hidden="true" className="rig-lab-bracket pointer-events-none absolute -bottom-[1px] -left-[1px] h-2.5 w-2.5 border-b-2 border-l-2 border-[#bd00ff]" />
              <span aria-hidden="true" className="rig-lab-bracket pointer-events-none absolute -bottom-[1px] -right-[1px] h-2.5 w-2.5 border-b-2 border-r-2 border-[#00f3ff]" />

              {/* Top Console Bar */}
              <div className="flex items-center justify-between border-b border-[#00f3ff]/20 pb-3">
                <div>
                  <h3 className="rig-lab-title font-display text-xs font-bold tracking-[0.16em] text-[#e6fcff] uppercase">
                    FINN // RIG LAB
                  </h3>
                  <p className="font-mono text-[11px] tracking-[0.1em] text-[#8ba4be] uppercase">
                    38 CTRL · 93 DEF · BLENDER REAL
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetRig}
                  onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                  data-cursor="pointer"
                  aria-label={t('Restablecer rig', 'Reset rig')}
                  className="inline-flex h-11 w-11 items-center justify-center border border-[#bd00ff] bg-[#a020f0]/[0.18] text-[#f5e6ff] shadow-[var(--glow-violet-border)] transition-colors hover:border-[#00f3ff] hover:text-[#e6fcff]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* 4 Studio Mode Tabs */}
              <div
                role="tablist"
                aria-label={t('Modos del Rig Lab', 'Rig Lab modes')}
                className="mt-3.5 grid grid-cols-4 border border-[#00f3ff]/20 bg-[#050b14]/70"
              >
                {LAB_TABS.map((t, idx) => {
                  const active = labTab === t.id;
                  return (
                    <button
                      key={t.id}
                      ref={(el) => {
                        tabRefs.current[idx] = el;
                      }}
                      id={`rig-tab-${t.id}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls={`rig-panel-${t.id}`}
                      tabIndex={active ? 0 : -1}
                      data-cursor="pointer"
                      onPointerEnter={() => audioManager.playSynth('hover', 0.45)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      onClick={() => switchTab(t.id)}
                      className={cn(
                        'min-h-[42px] py-2 font-mono text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors',
                        active
                          ? 'border-t-2 border-t-[#bd00ff] bg-[#a020f0]/20 text-[#f5e6ff]'
                          : 'border-t-2 border-t-transparent text-[#8ba4be] hover:bg-white/5 hover:text-[#ecf8ff]',
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: ANIMATIONS */}
              {labTab === 'anim' && (
                <div
                  role="tabpanel"
                  id="rig-panel-anim"
                  aria-labelledby="rig-tab-anim"
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((p) => {
                      const active = preset === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={active}
                          data-cursor="pointer"
                          onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                          onClick={() => applyPreset(p)}
                          className={cn(
                            'flex min-h-[46px] flex-col items-start border px-3 py-2 text-left transition-colors',
                            active
                              ? 'border-[#00f3ff] bg-[#00f3ff]/[0.18] text-[#e6fcff] shadow-[var(--glow-cyan-border)]'
                              : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:border-[#00f3ff]/50 hover:text-[#ecf8ff]',
                          )}
                        >
                          <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">
                            {locale === 'en' ? p.labelEn : p.label}
                          </span>
                          <span className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-[#8ba4be]">
                            {locale === 'en' ? p.subEn : p.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3.5 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="pose-blend-slider" className="tracking-[0.12em] text-[#ecf8ff]">
                          T-POSE ↔ POSE
                        </label>
                        <span className="tabular-nums text-[#00f3ff]">
                          {Math.round(poseBlend * 100)}%
                        </span>
                      </div>
                      <input
                        id="pose-blend-slider"
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={poseBlend}
                        onChange={(e) => handlePoseChange(Number(e.target.value))}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="energy-slider" className="tracking-[0.12em] text-[#ecf8ff]">
                          {t('VELOCIDAD / ENERGÍA', 'SPEED / ENERGY')}
                        </label>
                        <span className="tabular-nums text-[#e6fcff]">
                          {(0.12 + Math.pow(energy, 1.4) * 3.1).toFixed(1)}× · {Math.round(energy * 100)}%
                        </span>
                      </div>
                      <input
                        id="energy-slider"
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={energy}
                        onChange={(e) => handleEnergyChange(Number(e.target.value))}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE DRAGGABLE IK SOLVER */}
              {labTab === 'ik' && (
                <div
                  role="tabpanel"
                  id="rig-panel-ik"
                  aria-labelledby="rig-tab-ik"
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={ikMode === 'hand'}
                      data-cursor="pointer"
                      onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                      onClick={() => switchIkMode('hand')}
                      className={cn(
                        'flex min-h-[42px] items-center justify-center gap-1.5 border py-2 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors',
                        ikMode === 'hand'
                          ? 'border-[#00f3ff] bg-[#00f3ff]/[0.18] text-[#e6fcff] shadow-[var(--glow-cyan-border)]'
                          : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:text-[#ecf8ff]',
                      )}
                    >
                      <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t('MANO IK', 'HAND IK')}</span>
                    </button>

                    <button
                      type="button"
                      aria-pressed={ikMode === 'eye'}
                      data-cursor="pointer"
                      onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                      onClick={() => switchIkMode('eye')}
                      className={cn(
                        'flex min-h-[42px] items-center justify-center gap-1.5 border py-2 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors',
                        ikMode === 'eye'
                          ? 'border-[#00f3ff] bg-[#00f3ff]/[0.18] text-[#e6fcff] shadow-[var(--glow-cyan-border)]'
                          : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:text-[#ecf8ff]',
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>EYE AIM</span>
                    </button>
                  </div>

                  <p className="font-mono text-[11px] leading-relaxed text-[#8ba4be]">
                    {ikMode === 'hand' ? (
                      <>
                        <span className="hidden lg:inline">
                          {t(
                            'Arrastra sobre el viewport central (o usa los ejes)',
                            'Drag across the center viewport (or use the axes)',
                          )}
                        </span>
                        <span className="lg:hidden">
                          {t(
                            'Arrastra sobre la vista superior (o usa los ejes)',
                            'Drag across the top view (or use the axes)',
                          )}
                        </span>
                        {t(
                          ' para mover CTRL_HAND_IK y resolver la cadena de 6 segmentos en tiempo real.',
                          ' to move CTRL_HAND_IK and solve the 6-segment chain in real time.',
                        )}
                      </>
                    ) : (
                      <>
                        <span className="hidden lg:inline">
                          {t(
                            'Arrastra sobre el viewport central (o usa los ejes)',
                            'Drag across the center viewport (or use the axes)',
                          )}
                        </span>
                        <span className="lg:hidden">
                          {t(
                            'Arrastra sobre la vista superior (o usa los ejes)',
                            'Drag across the top view (or use the axes)',
                          )}
                        </span>
                        {t(
                          ' para dirigir los ojos y la cabeza de Finn con líneas de restricción Aim.',
                          " to aim Finn's eyes and head with live Aim constraint lines.",
                        )}
                      </>
                    )}
                  </p>

                  {/* Accessible fallback sliders synchronized with 3D drag */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="ik-x-slider" className="text-[#ecf8ff]">{t('EJE X', 'AXIS X')}</label>
                        <span className="tabular-nums text-[#00f3ff]">{ikPos.x.toFixed(2)}</span>
                      </div>
                      <input
                        id="ik-x-slider"
                        type="range"
                        min={-1}
                        max={1}
                        step={0.02}
                        value={ikPos.x}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          rigState.ikTargetX = v;
                          setIkPos((prev) => ({ ...prev, x: v }));
                          audioManager.playSynth('tick', 0.5);
                        }}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="ik-y-slider" className="text-[#ecf8ff]">{t('EJE Y', 'AXIS Y')}</label>
                        <span className="tabular-nums text-[#e6fcff]">{ikPos.y.toFixed(2)}</span>
                      </div>
                      <input
                        id="ik-y-slider"
                        type="range"
                        min={-1}
                        max={1}
                        step={0.02}
                        value={ikPos.y}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          rigState.ikTargetY = v;
                          setIkPos((prev) => ({ ...prev, y: v }));
                          audioManager.playSynth('tick', 0.5);
                        }}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REAL BLENDER WEIGHT PAINTING HEATMAP */}
              {labTab === 'weights' && (
                <div
                  role="tabpanel"
                  id="rig-panel-weights"
                  aria-labelledby="rig-tab-weights"
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {WEIGHT_ZONES.map((z) => {
                      const active = weightZone === z.id;
                      return (
                        <button
                          key={z.id}
                          type="button"
                          aria-pressed={active}
                          data-cursor="pointer"
                          onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
                          onClick={() => selectWeightZone(z.id)}
                          className={cn(
                            'min-h-[42px] border px-2.5 py-2 text-left font-mono text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors',
                            active
                              ? 'border-[#00f3ff] bg-[#00f3ff]/[0.18] text-[#e6fcff] shadow-[var(--glow-cyan-border)]'
                              : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:border-[#00f3ff]/50 hover:text-[#ecf8ff]',
                          )}
                        >
                          {locale === 'en' ? z.labelEn : z.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exact Blender Weight Paint Spectrum Legend */}
                  <div className="space-y-1.5 border border-[#00f3ff]/20 bg-[#020408]/85 p-3">
                    <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-[#8ba4be] uppercase">
                      <span className="inline-flex items-center gap-1 text-[#00f3ff]">
                        <Flame className="h-3 w-3" aria-hidden="true" />
                        BLENDER WEIGHT PAINT REAL
                      </span>
                      <span>0.0 → 1.0</span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="h-2 w-full"
                      style={{
                        background:
                          'linear-gradient(90deg, #081466 0%, #00c8ff 25%, #00f05a 50%, rgb(255, 230, 0) 75%, #ff1e1e 100%)',
                      }}
                    />
                    <div className="font-mono text-[10px] text-[#ecf8ff]/90">
                      {locale === 'en' ? activeWeightMeta.bonesInfoEn : activeWeightMeta.bonesInfo}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CUSTOM RIG MECHANISMS FROM FINN_ANTIGRAVITY.blend */}
              {labTab === 'mech' && (
                <div
                  role="tabpanel"
                  id="rig-panel-mech"
                  aria-labelledby="rig-tab-mech"
                  className="mt-4 space-y-4"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] text-[#00f3ff] uppercase">
                    <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {t(
                        'Mecanismos de FINN_ANTIGRAVITY.blend',
                        'FINN_ANTIGRAVITY.blend Mechanisms',
                      )}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* CTRL_FINGERS_ROT */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="hand-grip-slider" className="text-[#ecf8ff]">
                          CTRL_FINGERS_ROT ({t('MANO', 'HAND')})
                        </label>
                        <span className="tabular-nums text-[#00f3ff]">
                          {Math.round(handGrip * 100)}%
                        </span>
                      </div>
                      <input
                        id="hand-grip-slider"
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={handGrip}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setHandGrip(v);
                          rigState.handGrip = v;
                          audioManager.playSynth('tick', 0.6);
                        }}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>

                    {/* CTRL_FOOT_ROLL (Heel Pivot <-> Tip-Toe) */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="foot-roll-slider" className="text-[#ecf8ff]">
                          CTRL_FOOT_ROLL ({t('TALÓN ↔ PUNTA', 'HEEL ↔ TOE')})
                        </label>
                        <span className="tabular-nums text-[#e6fcff]">
                          {footRoll < -0.08 ? 'HEEL' : footRoll > 0.08 ? 'TOE' : 'FLAT'} ({Math.round(footRoll * 100)}%)
                        </span>
                      </div>
                      <input
                        id="foot-roll-slider"
                        type="range"
                        min={-1}
                        max={1}
                        step={0.02}
                        value={footRoll}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setFootRoll(v);
                          rigState.footRoll = v;
                          audioManager.playSynth('tick', 0.6);
                        }}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>

                    {/* CTRL_TONGUE_STRETCH + CTRL_LIPS */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <label htmlFor="tongue-slider" className="text-[#ecf8ff]">
                          CTRL_TONGUE + LIPS ({t('18 HUESOS', '18 BONES')})
                        </label>
                        <span className="tabular-nums text-[#f5e6ff]">
                          {Math.round(mouthTongue * 100)}%
                        </span>
                      </div>
                      <input
                        id="tongue-slider"
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={mouthTongue}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMouthTongue(v);
                          rigState.mouthTongue = v;
                          audioManager.playSynth('tick', 0.6);
                        }}
                        data-cursor="pointer"
                        className="rf-slider w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Persistent Rig Layers Bar (always available across all 4 tabs!) */}
              <div className="mt-5 border-t border-[#00f3ff]/20 pt-4">
                <div className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[#8ba4be] uppercase">
                  {t('CAPAS DEL RIG (BLENDER VIEWPORT)', 'RIG LAYERS (BLENDER VIEWPORT)')}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    data-cursor="magnetic"
                    aria-label={t('Modo X-Ray del rig', 'Rig X-Ray mode')}
                    aria-pressed={xray}
                    onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                    onClick={toggleXray}
                    className={cn(
                      'inline-flex min-h-[42px] items-center justify-center gap-1.5 border py-2 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors',
                      xray
                        ? 'border-[#00a3cc] bg-[#00a3cc]/20 text-[#e6fcff] shadow-[var(--glow-cyan-border)]'
                        : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:border-[#00f3ff]/50 hover:text-[#ecf8ff]',
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>X-Ray</span>
                  </button>

                  <button
                    type="button"
                    data-cursor="magnetic"
                    aria-label={t(
                      'Mostrar controladores del rig (CTRL)',
                      'Toggle rig controllers (CTRL)',
                    )}
                    aria-pressed={showWidgets}
                    onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                    onClick={toggleWidgets}
                    className={cn(
                      'inline-flex min-h-[42px] items-center justify-center gap-1.5 border py-2 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors',
                      showWidgets
                        ? 'border-[#00f3ff] bg-[#00f3ff]/[0.18] text-[#e6fcff] shadow-[var(--glow-cyan-border)]'
                        : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:border-[#00f3ff]/50 hover:text-[#ecf8ff]',
                    )}
                  >
                    <Box className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>CTRL</span>
                  </button>

                  <button
                    type="button"
                    data-cursor="magnetic"
                    aria-label={t(
                      'Mostrar huesos de deformación (DEF)',
                      'Toggle deformation bones (DEF)',
                    )}
                    aria-pressed={showBones}
                    onPointerEnter={() => audioManager.playSynth('hover', 0.55)}
                    onClick={toggleBones}
                    className={cn(
                      'inline-flex min-h-[42px] items-center justify-center gap-1.5 border py-2 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors',
                      showBones
                        ? 'border-[#bd00ff] bg-[#a020f0]/20 text-[#f5e6ff] shadow-[var(--glow-violet-border)]'
                        : 'border-[#00f3ff]/20 bg-[#050b14]/70 text-[#8ba4be] hover:border-[#bd00ff]/50 hover:text-[#ecf8ff]',
                    )}
                  >
                    <Bone className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>DEF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra-clean inline Software Stack strip */}
        <div className="pipeline-stack-bar relative flex flex-wrap items-center gap-x-4 gap-y-2 overflow-hidden border-y border-[#00f3ff]/[0.18] bg-[#040810]/90 px-4 py-3.5 font-mono text-xs tracking-[0.18em] text-[#8ba4be] uppercase">
          <span
            aria-hidden="true"
            data-stack-laser-top=""
            className="tron-laser-divider left-0 right-0 top-0 h-[1px] origin-left bg-gradient-to-r from-[#bd00ff] via-[#00f3ff] to-[#e6fcff] opacity-0 shadow-[0_0_10px_rgba(0,243,255,0.8)]"
          />
          <span
            aria-hidden="true"
            data-stack-laser-bottom=""
            className="tron-laser-divider bottom-0 left-0 right-0 h-[1px] origin-right bg-gradient-to-r from-[#e6fcff] via-[#00f3ff] to-[#bd00ff] opacity-0 shadow-[0_0_10px_rgba(189,0,255,0.8)]"
          />

          <span className="pipeline-stack-label text-[#00f3ff]">STACK //</span>
          {CORE_TOOLS.map((tool, idx) => (
            <span key={tool} className="pipeline-stack-item inline-flex items-center gap-4 text-[#ecf8ff]">
              <span>{tool}</span>
              {idx < CORE_TOOLS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={idx % 2 === 0 ? 'text-[#00f3ff]' : 'text-[#bd00ff]'}
                >
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
