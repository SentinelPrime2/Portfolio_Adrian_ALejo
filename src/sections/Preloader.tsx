import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { audioManager } from '../audio/AudioManager';
import { GSAP_EASE } from '../animations/presets';
import { prefersReducedMotion } from '../animations/tronInit';

gsap.registerPlugin(useGSAP);

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const [done, setDone] = useState(false);

  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const { contextSafe } = useGSAP(
    () => {
      if (done || !overlayRef.current) return;

      const reduced = prefersReducedMotion();
      const counterObj = { val: 0 };
      const stages = [
        'BOOTING RIG-OS v2.6...',
        'BINDING ARMATURE BONES...',
        'CALIBRATING IK / FK SOLVERS...',
        'VIEWPORT ONLINE // 60 FPS',
      ];

      const tl = gsap.timeline({
        onComplete: () => {
          audioManager.playSynth('boot', 0.85);
          setDone(true);
          completeRef.current();
        },
      });

      if (reduced) {
        tl.to(counterObj, {
          val: 100,
          duration: 0.48,
          ease: 'power2.out',
          onUpdate: () => {
            const pct = Math.round(counterObj.val);
            if (counterRef.current) {
              counterRef.current.textContent = `${String(pct).padStart(3, '0')}%`;
            }
            if (statusRef.current) {
              const idx = Math.min(stages.length - 1, Math.floor((pct / 100) * stages.length));
              statusRef.current.textContent = stages[idx];
            }
          },
        })
          .to(
            progressBarRef.current,
            { scaleX: 1, duration: 0.48, ease: 'power2.out' },
            '<',
          )
          .to(overlayRef.current, {
            opacity: 0,
            duration: 0.28,
            ease: 'power2.out',
          });
        return;
      }

      tl.from('.preloader-reveal', {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.06,
        ease: GSAP_EASE.expoOut,
      })
        .to(
          counterObj,
          {
            val: 100,
            duration: 1.05,
            ease: 'power2.inOut',
            onUpdate: () => {
              const pct = Math.round(counterObj.val);
              if (counterRef.current) {
                counterRef.current.textContent = `${String(pct).padStart(3, '0')}%`;
              }
              if (statusRef.current) {
                const idx = Math.min(stages.length - 1, Math.floor((pct / 100) * stages.length));
                statusRef.current.textContent = stages[idx];
              }
            },
          },
          '-=0.15',
        )
        .to(
          progressBarRef.current,
          {
            scaleX: 1,
            duration: 1.05,
            ease: 'power2.inOut',
          },
          '<',
        )
        .to('.preloader-inner', {
          opacity: 0,
          y: -14,
          duration: 0.28,
          ease: 'power2.in',
        })
        .to(
          overlayRef.current,
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 0.65,
            ease: GSAP_EASE.power3InOut,
          },
          '-=0.08',
        );
    },
    { scope: overlayRef, dependencies: [done] },
  );

  const handleSkip = contextSafe(() => {
    audioManager.playSynth('click', 0.7);
    if (!overlayRef.current) {
      setDone(true);
      completeRef.current();
      return;
    }
    gsap.killTweensOf(overlayRef.current);
    gsap.to(overlayRef.current, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.35,
      ease: GSAP_EASE.expoOut,
      onComplete: () => {
        setDone(true);
        completeRef.current();
      },
    });
  });

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#020408] px-6 text-[#ecf8ff]"
      role="status"
      aria-live="polite"
    >
      {/* Background subtle grid */}
      <div className="rf-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="rf-scanlines pointer-events-none absolute inset-0 opacity-45" />

      <div className="preloader-inner relative z-10 w-full max-w-md space-y-6">
        <span className="sr-only">Cargando portfolio de Sentinel Prime</span>
        <div className="preloader-reveal flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-[#00f3ff] uppercase">
          <span>RIG-OS // SENTINEL PRIME</span>
          <span className="text-[#8ba4be]">BLENDER · UNITY</span>
        </div>

        <div className="preloader-reveal space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold tracking-wider text-[#ecf8ff] uppercase sm:text-3xl">
              ARMATURE <span className="text-[#00f3ff] tron-glow-cyan">INIT</span>
            </span>
            <span
              ref={counterRef}
              aria-hidden="true"
              className="font-mono text-2xl font-semibold text-[#00f3ff] tabular-nums tron-glow-cyan"
            >
              000%
            </span>
          </div>

          <div className="relative h-2 w-full overflow-hidden border border-[#00f3ff]/25 bg-[#050b14]">
            <div
              ref={progressBarRef}
              style={{ transform: 'scaleX(0)', background: 'var(--iridescent-line)' }}
              className="h-full w-full origin-left shadow-[0_0_14px_rgba(189,0,255,0.45)] will-change-transform"
            />
          </div>
        </div>

        <div className="preloader-reveal flex items-center justify-between font-mono text-[11px] tracking-[0.14em] text-[#f5e6ff]">
          <span ref={statusRef} aria-hidden="true">BOOTING RIG-OS v2.6...</span>
          <button
            type="button"
            onClick={handleSkip}
            data-cursor="pointer"
            className="inline-flex min-h-[44px] items-center px-2 text-[#00f3ff] transition-colors hover:text-[#bd00ff]"
          >
            SKIP →
          </button>
        </div>
      </div>
    </div>
  );
}
