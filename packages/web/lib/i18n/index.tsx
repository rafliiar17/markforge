'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type {
  SupportedLocale,
  TranslationSchema,
  TranslationKey,
  TranslationParams,
  TranslateFunction,
  I18nContextValue,
} from './types';
import { idTranslations } from './locales/id';
import { enTranslations } from './locales/en';

export * from './types';
export { idTranslations } from './locales/id';
export { enTranslations } from './locales/en';

export const LOCALE_STORAGE_KEY = 'markforge_locale';

export const dictionaries: Record<SupportedLocale, TranslationSchema> = {
  id: idTranslations,
  en: enTranslations,
};

/**
 * Safely traverses an object by dot-separated path.
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Replaces {key} tokens in template with params[key].
 */
export function interpolate(template: string, params?: TranslationParams): string {
  if (!params || Object.keys(params).length === 0) return template;
  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined) {
      return String(params[key]);
    }
    return match;
  });
}

/**
 * Resolves a translation key with fallback to alternate locale and raw keyPath.
 */
export function translate(
  locale: SupportedLocale,
  keyPath: TranslationKey | (string & {}),
  params?: TranslationParams
): string {
  const currentDict = dictionaries[locale] || dictionaries.id;
  let val = getNestedValue(currentDict, keyPath);

  // Fallback to alternate locale if not found in current dictionary
  if (typeof val !== 'string') {
    const fallbackLocale: SupportedLocale = locale === 'id' ? 'en' : 'id';
    const fallbackDict = dictionaries[fallbackLocale];
    val = getNestedValue(fallbackDict, keyPath);
  }

  if (typeof val === 'string') {
    return interpolate(val, params);
  }

  return keyPath;
}

/**
 * Helper to safely get the saved locale from localStorage.
 */
export function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'id';
  try {
    const storage = typeof localStorage !== 'undefined' ? localStorage : window.localStorage;
    if (!storage) return 'id';
    const saved = storage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'id' || saved === 'en') {
      return saved;
    }
  } catch {
    // Ignore localStorage read errors (e.g. security sandbox)
  }
  return 'id';
}

/**
 * Helper to safely save the locale to localStorage.
 */
export function setStoredLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return;
  try {
    const storage = typeof localStorage !== 'undefined' ? localStorage : window.localStorage;
    if (!storage) return;
    storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (err) {
    console.warn('Failed to persist markforge_locale to localStorage:', err);
  }
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale && (initialLocale === 'id' || initialLocale === 'en')) {
      return initialLocale;
    }
    return getStoredLocale();
  });

  // Sync with localStorage on mount in case of hydration mismatch
  useEffect(() => {
    if (!initialLocale) {
      const stored = getStoredLocale();
      if (stored !== locale) {
        setLocaleState(stored);
      }
    }
  }, [initialLocale]);

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    setStoredLocale(nextLocale);
  }, []);

  const dictionary = useMemo(
    () => dictionaries[locale] || dictionaries.id,
    [locale]
  );

  const t: TranslateFunction = useCallback(
    (keyPath, params) => {
      return translate(locale, keyPath, params);
    },
    [locale]
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      dictionary,
    }),
    [locale, setLocale, t, dictionary]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback safe context if used outside provider
    return {
      locale: 'id',
      setLocale: () => {},
      t: (keyPath, params) => translate('id', keyPath, params),
      dictionary: dictionaries.id,
    };
  }
  return context;
}
