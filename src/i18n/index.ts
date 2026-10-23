/**
 * Copyright (c) 2025 Cade Russell (Ghost Peony)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

/**
 * i18n bootstrap.
 *
 * Keys are the English source strings themselves (see PLAN.md §2.1), so the
 * English catalog stays intentionally empty: any missing key falls back to the
 * key text, which is exactly the English wording used in the UI.
 */

export const LANGUAGE_STORAGE_KEY = 'langconfig.lang';

export const SUPPORTED_LANGUAGES = ['en', 'zh-CN'] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

/** Shown in the settings dropdown; each option is labelled in its own language. */
export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
];

export function isSupportedLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * First visit: follow the browser language (zh* -> zh-CN, everything else -> en).
 * Once the user picks a language explicitly, the stored value always wins.
 */
export function detectBrowserLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const tag of candidates) {
    if (typeof tag === 'string' && tag.toLowerCase().startsWith('zh')) return 'zh-CN';
  }
  return DEFAULT_LANGUAGE;
}

export function getStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage can be unavailable (private mode, file://); fall back to detection.
  }
  return detectBrowserLanguage();
}

export function persistLanguage(language: AppLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures: the in-memory switch still works for this session.
  }
}

/** Keep <html lang="..."> in sync with the active UI language. */
export function applyDocumentLanguage(language: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
}

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
};

const initialLanguage = getStoredLanguage();

void i18next.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'translation',
  fallbackNS: 'translation',
  // Keys are full English sentences, so dots and colons must not be treated
  // as separators (e.g. "Status: Loading..." would otherwise split).
  keySeparator: false,
  nsSeparator: false,
  interpolation: {
    escapeValue: false, // React already escapes rendered strings.
  },
  returnNull: false,
  react: {
    useSuspense: false,
  },
});

applyDocumentLanguage(initialLanguage);

/** Switch language, persist the choice, and update <html lang>. */
export async function changeAppLanguage(language: AppLanguage): Promise<void> {
  persistLanguage(language);
  await i18next.changeLanguage(language);
  applyDocumentLanguage(language);
}

export default i18next;
