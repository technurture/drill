import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './constants';

// Import English translations
import enSubheadings from './resources/en/subheadings.json';
import enCommon from './resources/en/common.json';
import enAuth from './resources/en/auth.json';
import enModals from './resources/en/modals.json';
import enPages from './resources/en/pages.json';
import enAdmin from './resources/en/admin.json';

// Import other language subheadings (keeping existing)
import igSubheadings from './resources/ig/subheadings.json';
import yoSubheadings from './resources/yo/subheadings.json';
import haSubheadings from './resources/ha/subheadings.json';
import pidginSubheadings from './resources/pidgin/subheadings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        subheadings: enSubheadings,
        common: enCommon,
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin
      },
      ig: { 
        subheadings: igSubheadings,
        common: enCommon, // Fallback to English for now
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin
      },
      yo: { 
        subheadings: yoSubheadings,
        common: enCommon,
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin
      },
      ha: { 
        subheadings: haSubheadings,
        common: enCommon,
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin
      },
      pidgin: { 
        subheadings: pidginSubheadings,
        common: enCommon,
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin
      },
    },
    defaultNS: 'subheadings',
    ns: ['subheadings', 'common', 'auth', 'modals', 'pages', 'admin'],
    fallbackLng: DEFAULT_LANGUAGE,
    lng: DEFAULT_LANGUAGE,
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
