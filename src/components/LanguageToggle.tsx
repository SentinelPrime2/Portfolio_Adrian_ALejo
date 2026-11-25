import { audioManager } from '../audio/AudioManager';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../utils/cn';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <button
      type="button"
      data-cursor="pointer"
      onPointerEnter={() => audioManager.playSynth('hover', 0.5)}
      onClick={() => {
        audioManager.playSynth('click', 0.75);
        toggleLocale();
      }}
      aria-label={t('Cambiar idioma a inglés', 'Switch language to Spanish')}
      aria-pressed={locale === 'en'}
      className={cn(
        'inline-flex min-h-[38px] items-center border border-[#00f3ff]/30 bg-[#050b14]/90 p-0.5 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors hover:border-[#bd00ff] sm:min-h-[36px]',
        className,
      )}
    >
      <span
        className={cn(
          'px-2 py-1 transition-colors',
          locale === 'es'
            ? 'bg-[#00f3ff]/20 text-[#e6fcff] shadow-[inset_0_0_8px_rgba(0,243,255,0.35)]'
            : 'text-[#8ba4be]',
        )}
      >
        ES
      </span>
      <span aria-hidden="true" className="text-[#00f3ff]/35">
        |
      </span>
      <span
        className={cn(
          'px-2 py-1 transition-colors',
          locale === 'en'
            ? 'bg-[#a020f0]/30 text-[#f5e6ff] shadow-[inset_0_0_8px_rgba(189,0,255,0.45)]'
            : 'text-[#8ba4be]',
        )}
      >
        EN
      </span>
    </button>
  );
}
