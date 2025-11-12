export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  ig: { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  yo: { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  ha: { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  pidgin: { code: 'pidgin', name: 'Pidgin English', nativeName: 'Pidgin' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGE_STORAGE_KEY = 'shebalance-language';

export const LANGUAGE_OPTIONS = Object.values(SUPPORTED_LANGUAGES).map(lang => ({
  value: lang.code,
  label: lang.nativeName,
}));
