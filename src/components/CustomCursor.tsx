import { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

const TRAIL_LIFETIME_MS = 260;
const MAX_TRAIL_POINTS = 18;

/**
 * 03. LIGHT-CYCLE TRAIL — Tron: Legacy Ultraviolet Edition
 * - IDLE: Sharp asymmetric cyan diamond tip (16x22px, zero lag) + continuous cyan-to-ultraviolet laser trail on <canvas>.
 * - HOVER: Trail collects smoothly; tip centers into a symmetric ultraviolet diamond + concentric rings (26px & 38px).
 * - ACTIVE / DRAG: Inner ring contracts (scale 0.82) with #E6FCFF cyan-core flash.
 * - Automatically disabled on coarse pointers (`pointer: coarse`); laser trail disabled when `prefers-reduced-motion: reduce`.
 */
export function CustomCursor() {
  const headRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const stateRef = useRef({
    mouseX: -100,
    mouseY: -100,
    isHover: false,
    visible: false,
    trailAlpha: 1,
    points: [] as TrailPoint[],
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    const evaluate = () => {
      setEnabled(pointerQuery.matches && !forcedColorsQuery.matches);
      setReducedMotion(motionQuery.matches);
    };

    evaluate();
    pointerQuery.addEventListener('change', evaluate);
    motionQuery.addEventListener('change', evaluate);
    forcedColorsQuery.addEventListener('change', evaluate);

    return () => {
      pointerQuery.removeEventListener('change', evaluate);
      motionQuery.removeEventListener('change', evaluate);
      forcedColorsQuery.removeEventListener('change', evaluate);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!enabled || !visible) {
      document.documentElement.classList.remove('tron-custom-cursor-active');
      return;
    }
    document.documentElement.classList.add('tron-custom-cursor-active');
    return () => {
      document.documentElement.classList.remove('tron-custom-cursor-active');
    };
  }, [enabled, visible]);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    let activeMagneticEl: HTMLElement | null = null;
    const s = stateRef.current;

    const resetMagneticEl = () => {
      if (activeMagneticEl) {
        activeMagneticEl.style.transform = '';
        activeMagneticEl = null;
      }
    };

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resizeCanvas();

    const drawTrail = () => {
      rafId = 0;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (reducedMotion || !s.visible) {
        s.points = [];
        return;
      }

      const now = performance.now();
      // Prune expired points (~260ms persistence)
      while (s.points.length > 0 && now - s.points[0].time > TRAIL_LIFETIME_MS) {
        s.points.shift();
      }

      // Smoothly collect/fade trail when hovering an interactive target
      const targetAlpha = s.isHover ? 0.12 : 1;
      s.trailAlpha += (targetAlpha - s.trailAlpha) * 0.18;

      if (s.points.length >= 2 && s.trailAlpha > 0.02) {
        const pts = s.points;
        const headPt = pts[pts.length - 1];
        const tailPt = pts[0];

        // Draw smoothly tapered Light-Cycle ribbon segments from tail (0px) to head (3px)
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const progress = i / (pts.length - 1);
          const ageAlpha = Math.max(0, 1 - (now - p1.time) / TRAIL_LIFETIME_MS);
          const alpha = progress * ageAlpha * s.trailAlpha;
          if (alpha <= 0.01) continue;

          const width = Math.max(0.25, progress * 3.0);

          const grad = ctx.createLinearGradient(tailPt.x, tailPt.y, headPt.x, headPt.y);
          grad.addColorStop(0, 'rgba(189, 0, 255, 0)');
          grad.addColorStop(0.45, `rgba(189, 0, 255, ${(0.55 * alpha).toFixed(3)})`);
          grad.addColorStop(1, `rgba(0, 243, 255, ${(0.95 * alpha).toFixed(3)})`);

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }

      if (s.points.length > 0) {
        rafId = window.requestAnimationFrame(drawTrail);
      }
    };

    const scheduleDraw = () => {
      if (!rafId && !reducedMotion) {
        rafId = window.requestAnimationFrame(drawTrail);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      s.mouseX = x;
      s.mouseY = y;

      // Zero-lag direct GPU positioning for the diamond head
      if (headRef.current) {
        headRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      if (!s.visible) {
        s.visible = true;
        setVisible(true);
      }

      if (!reducedMotion) {
        const now = performance.now();
        const last = s.points[s.points.length - 1];
        if (!last || Math.hypot(x - last.x, y - last.y) >= 1.5) {
          s.points.push({ x, y, time: now });
          if (s.points.length > MAX_TRAIL_POINTS) {
            s.points.shift();
          }
          scheduleDraw();
        }
      }

      const target = e.target as HTMLElement | null;
      const interactiveEl =
        target?.closest<HTMLElement>('[data-cursor], a, button, input[type="range"], [role="button"]') ??
        null;
      const hovering = Boolean(interactiveEl);
      if (hovering !== s.isHover) {
        s.isHover = hovering;
        setIsHover(hovering);
      }

      const magneticEl = target?.closest<HTMLElement>('[data-cursor="magnetic"]') ?? null;
      if (magneticEl) {
        if (activeMagneticEl && activeMagneticEl !== magneticEl) {
          resetMagneticEl();
        }
        activeMagneticEl = magneticEl;
        const rect = magneticEl.getBoundingClientRect();
        const relX = x - (rect.left + rect.width / 2);
        const relY = y - (rect.top + rect.height / 2);
        magneticEl.style.transform = `translate3d(${(relX * 0.14).toFixed(2)}px, ${(relY * 0.14).toFixed(2)}px, 0)`;
      } else {
        resetMagneticEl();
      }
    };

    const handlePointerDown = () => setIsActive(true);
    const handlePointerUp = () => setIsActive(false);
    const handlePointerLeave = () => {
      s.visible = false;
      s.isHover = false;
      s.points = [];
      setVisible(false);
      setIsHover(false);
      setIsActive(false);
      resetMagneticEl();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      resetMagneticEl();
    };
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'tron-cursor-layer transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/* Light-Cycle laser ribbon canvas */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />

      {/* Precision diamond head + concentric hover rings */}
      <div
        ref={headRef}
        className={cn(
          'tron-cursor-head',
          isHover && 'is-hover',
          isActive && 'is-active',
        )}
      >
        <div className="tron-cursor-rings" />

        {isHover ? (
          /* HOVER: Centered symmetric Ultraviolet diamond with #F5E6FF core & #ECF8FF edge */
          <svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            fill="none"
            className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_rgba(189,0,255,0.8)] transition-transform duration-150"
          >
            <polygon
              points="9,1 16,11 9,21 2,11"
              fill={isActive ? '#e6fcff' : '#bd00ff'}
              fillOpacity={isActive ? '0.92' : '0.82'}
              stroke="#ecf8ff"
              strokeWidth="1.25"
            />
            <polygon points="9,6 12.5,11 9,16 5.5,11" fill="#f5e6ff" />
          </svg>
        ) : (
          /* IDLE: Sharp asymmetric cyan diamond tip (16x22px) pointing top-left */
          <svg
            width="16"
            height="22"
            viewBox="0 0 16 22"
            fill="none"
            className="drop-shadow-[0_0_8px_rgba(0,243,255,0.75)]"
          >
            <polygon
              points="1,1 14.5,10.5 7.5,13 4.5,20.5"
              fill="rgba(0, 243, 255, 0.24)"
              stroke="#ecf8ff"
              strokeWidth="1.2"
              strokeLinejoin="miter"
            />
            <polygon
              points="3,3.6 11.4,9.8 6.4,11.6 4.4,16.4"
              fill="rgba(0, 243, 255, 0.35)"
              stroke="#00f3ff"
              strokeWidth="0.9"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
