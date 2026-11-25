export type RigAnimationPreset = 'idle' | 'wave' | 'run' | 'tpose';
export type RigLabTab = 'anim' | 'ik' | 'mech';
export type IkLiveMode = 'hand' | 'eye';
export type WeightPaintZone = 'none' | 'head' | 'torso' | 'armL' | 'hands' | 'legs' | 'face';

/**
 * Shared zero-rerender bridge between DOM/GSAP/Lenis/UI controls and R3F useFrame.
 * Mutated in place so Finn's 93-bone rig + 38 real Blender widgets run at locked 60fps.
 */
export const rigState = {
  /** Preloader finished — triggers Finn 3D Tron wireframe-to-solid materialization */
  bootReady: false,

  /** Normalized pointer position (-1 to 1) */
  pointerX: 0,
  pointerY: 0,
  /** Global scroll progress (0 to 1) */
  scrollProgress: 0,
  /** Instantaneous smooth scroll velocity */
  scrollVelocity: 0,
  /** Active section index (0: Hero, 1: Showcase, 2: Tech Pipeline, 3: Contact) */
  activeSection: 0,
  /** Progress inside Tech Pipeline section (0 to 1) */
  pipelineProgress: 0,
  /** Progress inside Showcase section (0 to 1) */
  showcaseProgress: 0,

  /** Animation & Layer Controls */
  poseBlend: 1,
  actingEnergy: 0.5,
  xrayMode: false,
  showBones: false,
  showWidgets: false,
  preset: 'idle' as RigAnimationPreset,

  /** Behind-the-Scenes Studio Lab State */
  labTab: 'anim' as RigLabTab,
  /** True while Rig Lab controls are scrolled into view (frames Finn above controls on mobile) */
  pipelineLabFocused: false,

  /** Live Draggable IK Target (normalized -1..1 inside Pipeline center viewport) */
  ikMode: 'hand' as IkLiveMode,
  ikTargetX: -0.25,
  ikTargetY: 0.28,
  ikDragging: false,

  /** Real Blender Weight Painting Heatmap Zone */
  weightZone: 'none' as WeightPaintZone,

  /** Custom Mechanisms Lab (replicating CTRL_FINGERS_ROT, CTRL_FOOT_ROLL, CTRL_TONGUE_STRETCH) */
  handGrip: 0.25,
  footRoll: 0,
  mouthTongue: 0,
};

const widgetSyncListeners = new Set<(visible: boolean) => void>();

export function setRigShowWidgets(visible: boolean) {
  rigState.showWidgets = visible;
  widgetSyncListeners.forEach((fn) => fn(visible));
}

export function subscribeRigShowWidgets(listener: (visible: boolean) => void): () => void {
  widgetSyncListeners.add(listener);
  return () => {
    widgetSyncListeners.delete(listener);
  };
}
