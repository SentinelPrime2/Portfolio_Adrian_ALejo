import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'es' | 'en';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: <T>(es: T, en: T) => T;
}

const STORAGE_KEY = 'sp-portfolio-lang';

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const t = useCallback(
    <T,>(es: T, en: T): T => (locale === 'en' ? en : es),
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
