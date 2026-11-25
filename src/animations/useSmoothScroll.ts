import { useEffect, useRef } from 'react';
import Lenis, { type LenisOptions } from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface UseSmoothScrollOptions extends LenisOptions {
  enabled?: boolean;
}

/**
 * Initializes Lenis smooth scrolling synchronized with GSAP's ticker and ScrollTrigger.
 * Automatically disables when `prefers-reduced-motion: reduce` is active.
 */
export function useSmoothScroll(options: UseSmoothScrollOptions = {}) {
  const { enabled = true, ...lenisOptions } = options;
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      ...lenisOptions,
    });

    lenisRef.current = lenis;
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on('scroll', onLenisScroll);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
