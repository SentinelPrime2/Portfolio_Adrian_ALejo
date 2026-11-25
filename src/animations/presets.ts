import type { Transition, Variants } from 'motion/react';

/**
 * Studio-standard easing curves and durations.
 * All presets strictly animate GPU-composited properties:
 * transform, opacity, clip-path, filter.
 */
export const MOTION_EASE = {
  expoOut: [0.16, 1, 0.3, 1] as const,
  quartOut: [0.25, 1, 0.5, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
};

export const GSAP_EASE = {
  expoOut: 'expo.out',
  power4Out: 'power4.out',
  power3InOut: 'power3.inOut',
} as const;

export const DURATION = {
  micro: 0.2,
  fast: 0.4,
  base: 0.75,
  slow: 1.1,
} as const;

export const motionTransitions: Record<string, Transition> = {
  micro: { duration: DURATION.micro, ease: MOTION_EASE.quartOut },
  reveal: { duration: DURATION.base, ease: MOTION_EASE.expoOut },
  springSnappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
  springSoft: { type: 'spring', stiffness: 220, damping: 28, mass: 1 },
};

export const motionVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: motionTransitions.reveal,
    },
  },
  clipReveal: {
    hidden: { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 },
    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      transition: motionTransitions.reveal,
    },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  },
};

export const gsapPresets = {
  fadeUpFrom: {
    opacity: 0,
    y: 28,
    duration: DURATION.base,
    ease: GSAP_EASE.expoOut,
  },
  pulseScale: {
    scale: 1.06,
    duration: 0.18,
    ease: GSAP_EASE.power4Out,
    yoyo: true,
    repeat: 1,
  },
} as const;
