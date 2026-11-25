import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type TronFlickerMode = 'electric' | 'subtle';

/**
 * Centralized neon ignition profile.
 * Configured safely within WCAG 2.3.1 photosensitivity thresholds (< 3 flashes/sec).
 */
export const TRON_FLICKER_MODE: TronFlickerMode = 'subtle';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Controlled neon-tube ignition transition.
 * Strictly animates opacity + filter(brightness) and cleans up filter on settle,
 * staying below WCAG 2.3.1 (< 3 flashes/sec) thresholds.
 */
export function addNeonFlicker(
  tl: gsap.core.Timeline,
  target: gsap.TweenTarget,
  position: gsap.Position = '>',
  mode: TronFlickerMode = TRON_FLICKER_MODE,
): gsap.core.Timeline {
  if (!target) return tl;

  const keyframes =
    mode === 'electric'
      ? [
          { opacity: 0.9, filter: 'brightness(1.3)', duration: 0.12, ease: 'none' },
          { opacity: 0.48, filter: 'brightness(0.85)', duration: 0.14, ease: 'none' },
          { opacity: 0.96, filter: 'brightness(1.22)', duration: 0.16, ease: 'power1.out' },
          { opacity: 0.72, filter: 'brightness(0.95)', duration: 0.14, ease: 'none' },
          { opacity: 1, filter: 'brightness(1)', duration: 0.22, ease: 'power2.out' },
        ]
      : [
          { opacity: 0.88, filter: 'brightness(1.22)', duration: 0.12, ease: 'none' },
          { opacity: 0.56, filter: 'brightness(0.9)', duration: 0.14, ease: 'none' },
          { opacity: 1, filter: 'brightness(1)', duration: 0.24, ease: 'power2.out' },
        ];

  tl.set(target, { opacity: 0, filter: 'brightness(0.4)' }, position).to(
    target,
    {
      keyframes,
      clearProps: 'filter',
    },
    position,
  );

  return tl;
}

/**
 * Draws the 4 laser perimeter wires and optional vertical scanline sweep inside a container,
 * then fades the temporary laser overlay out cleanly so Obsidian Glass borders take over.
 */
export function addWireDraw(
  tl: gsap.core.Timeline,
  container: Element | null,
  position: gsap.Position = '>',
  opts?: { duration?: number; keepVisible?: boolean },
): gsap.core.Timeline {
  if (!container) return tl;

  const duration = opts?.duration ?? 0.42;
  const keepVisible = opts?.keepVisible ?? false;

  const top = container.querySelector('[data-tron-wire="top"]');
  const right = container.querySelector('[data-tron-wire="right"]');
  const bottom = container.querySelector('[data-tron-wire="bottom"]');
  const left = container.querySelector('[data-tron-wire="left"]');
  const scan = container.querySelector('[data-tron-scan]');

  const edges = [top, right, bottom, left].filter((el): el is Element => Boolean(el));
  if (edges.length === 0 && !scan) return tl;

  const startTime = typeof position === 'number' ? position : tl.duration();

  if (top) {
    tl.fromTo(
      top,
      { scaleX: 0, opacity: 1 },
      { scaleX: 1, opacity: 1, duration: duration * 0.52, ease: 'power3.out' },
      startTime,
    );
  }
  if (left) {
    tl.fromTo(
      left,
      { scaleY: 0, opacity: 1 },
      { scaleY: 1, opacity: 1, duration: duration * 0.52, ease: 'power3.out' },
      startTime,
    );
  }
  if (right) {
    tl.fromTo(
      right,
      { scaleY: 0, opacity: 1 },
      { scaleY: 1, opacity: 1, duration: duration * 0.52, ease: 'power3.out' },
      startTime + duration * 0.24,
    );
  }
  if (bottom) {
    tl.fromTo(
      bottom,
      { scaleX: 0, opacity: 1 },
      { scaleX: 1, opacity: 1, duration: duration * 0.52, ease: 'power3.out' },
      startTime + duration * 0.24,
    );
  }

  if (scan) {
    const sweepEnd = Math.max(container.clientHeight, 24);
    tl.fromTo(
      scan,
      { y: 0, opacity: 0.95 },
      { y: sweepEnd, opacity: 0, duration: duration * 1.15, ease: 'power2.inOut', clearProps: 'transform' },
      startTime + duration * 0.14,
    );
  }

  if (!keepVisible && edges.length > 0) {
    tl.to(
      edges,
      { opacity: 0, duration: 0.35, ease: 'power2.out' },
      startTime + duration * 0.85,
    );
  }

  return tl;
}

/**
 * Materializes text or panel blocks via GPU-composited clip-path wipe.
 */
export function addScanWipe(
  tl: gsap.core.Timeline,
  target: gsap.TweenTarget,
  position: gsap.Position = '>',
  opts?: { direction?: 'down' | 'right'; duration?: number; stagger?: number },
): gsap.core.Timeline {
  if (!target) return tl;

  const direction = opts?.direction ?? 'down';
  const duration = opts?.duration ?? 0.55;
  const fromClip =
    direction === 'right' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)';

  tl.fromTo(
    target,
    { clipPath: fromClip, opacity: 0 },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      duration,
      stagger: opts?.stagger,
      ease: 'expo.out',
      clearProps: 'clipPath',
    },
    position,
  );

  return tl;
}

/**
 * Draws a single 1px laser divider beam along X or Y and fades its flare into the base border.
 */
export function addLaserBeam(
  tl: gsap.core.Timeline,
  target: gsap.TweenTarget,
  position: gsap.Position = '>',
  opts?: { axis?: 'x' | 'y'; duration?: number; settleOpacity?: number },
): gsap.core.Timeline {
  if (!target) return tl;

  const axis = opts?.axis ?? 'x';
  const duration = opts?.duration ?? 0.45;
  const settleOpacity = opts?.settleOpacity ?? 0;

  const fromProps = axis === 'y' ? { scaleY: 0, opacity: 1 } : { scaleX: 0, opacity: 1 };
  const toProps =
    axis === 'y'
      ? { scaleY: 1, opacity: 1, duration, ease: 'power3.out' }
      : { scaleX: 1, opacity: 1, duration, ease: 'power3.out' };

  const startTime = typeof position === 'number' ? position : tl.duration();
  tl.fromTo(target, fromProps, toProps, startTime);

  if (settleOpacity < 1) {
    tl.to(
      target,
      { opacity: settleOpacity, duration: 0.35, ease: 'power2.out' },
      startTime + duration * 0.72,
    );
  }

  return tl;
}

/**
 * Triggers a paused timeline once on scroll without mutating GSAP's _triggers array
 * (avoiding ScrollTrigger's `once: true` splice crash during mid-refresh scroll restoration).
 */
export function createOnceScrollTrigger(
  tl: gsap.core.Timeline,
  vars: {
    trigger: gsap.DOMTarget;
    start: string;
    containerAnimation?: gsap.core.Animation;
    onPlay?: () => void;
  },
): ScrollTrigger {
  let triggered = false;

  const fire = (instant = false) => {
    if (triggered) return;
    triggered = true;
    if (instant) {
      tl.progress(1);
    } else {
      vars.onPlay?.();
      tl.play(0);
    }
  };

  return ScrollTrigger.create({
    trigger: vars.trigger,
    start: vars.start,
    containerAnimation: vars.containerAnimation,
    onEnter: () => fire(false),
    onEnterBack: () => fire(false),
    onRefresh: (self) => {
      if (!triggered && self.progress > 0) {
        fire(true);
      }
    },
  });
}
