import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './constants';

import enSubheadings from './resources/en/subheadings.json';
import igSubheadings from './resources/ig/subheadings.json';
import yoSubheadings from './resources/yo/subheadings.json';
import haSubheadings from './resources/ha/subheadings.json';
import pidginSubheadings from './resources/pidgin/subheadings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { subheadings: enSubheadings },
      ig: { subheadings: igSubheadings },
      yo: { subheadings: yoSubheadings },
      ha: { subheadings: haSubheadings },
      pidgin: { subheadings: pidginSubheadings },
    },
    defaultNS: 'subheadings',
    ns: ['subheadings'],
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
