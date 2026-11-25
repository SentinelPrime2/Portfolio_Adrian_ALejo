import { useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';
import { cn } from '../utils/cn';

export interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const { isMuted } = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getSnapshot,
    audioManager.getSnapshot,
  );

  const handleToggle = () => {
    audioManager.toggleMute();
  };

  const handleHover = () => {
    if (!isMuted) {
      audioManager.playSynth('hover', 0.6);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      onPointerEnter={handleHover}
      aria-label={isMuted ? 'Activar audio' : 'Silenciar audio'}
      aria-pressed={!isMuted}
      data-cursor="magnetic"
      className={cn(
        'tron-glass fixed bottom-3 right-3 z-50 inline-flex min-h-[40px] items-center gap-2 border border-[#00f3ff]/30 px-3 py-2 font-mono text-[10px] font-medium tracking-[0.14em] text-[#ecf8ff] uppercase transition-[transform,border-color,background-color,color,box-shadow] duration-200 hover:border-[#bd00ff] hover:text-[#f5e6ff] hover:shadow-[var(--glow-violet-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f3ff] sm:bottom-5 sm:right-5 sm:min-h-[44px] sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-[11px] sm:tracking-[0.16em]',
        className,
      )}
    >
      {isMuted ? (
        <VolumeX className="h-3.5 w-3.5 text-[#8ba4be]" aria-hidden="true" />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-[#00f3ff]" aria-hidden="true" />
      )}
      <span>{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 transition-colors',
          isMuted ? 'bg-[#8ba4be]/75' : 'bg-[#bd00ff] shadow-[0_0_8px_#bd00ff]',
        )}
      />
    </button>
  );
}
