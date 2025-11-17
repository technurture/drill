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
import enNavigation from './resources/en/navigation.json';
import enNotifications from './resources/en/notifications.json';

// Import other language subheadings (keeping existing)
import igSubheadings from './resources/ig/subheadings.json';
import yoSubheadings from './resources/yo/subheadings.json';
import haSubheadings from './resources/ha/subheadings.json';
import pidginSubheadings from './resources/pidgin/subheadings.json';

// Import navigation and notifications for all languages
import igNavigation from './resources/ig/navigation.json';
import igNotifications from './resources/ig/notifications.json';
import yoNavigation from './resources/yo/navigation.json';
import yoNotifications from './resources/yo/notifications.json';
import haNavigation from './resources/ha/navigation.json';
import haNotifications from './resources/ha/notifications.json';
import pidginNavigation from './resources/pidgin/navigation.json';
import pidginNotifications from './resources/pidgin/notifications.json';

// Import Hausa translations
import haCommon from './resources/ha/common.json';
import haAuth from './resources/ha/auth.json';
import haModals from './resources/ha/modals.json';
import haPages from './resources/ha/pages.json';
import haAdmin from './resources/ha/admin.json';

// Import Pidgin translations
import pidginCommon from './resources/pidgin/common.json';
import pidginAuth from './resources/pidgin/auth.json';
import pidginModals from './resources/pidgin/modals.json';
import pidginPages from './resources/pidgin/pages.json';
import pidginAdmin from './resources/pidgin/admin.json';

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
        admin: enAdmin,
        navigation: enNavigation,
        notifications: enNotifications
      },
      ig: { 
        subheadings: igSubheadings,
        common: enCommon, // Fallback to English for now
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin,
        navigation: igNavigation,
        notifications: igNotifications
      },
      yo: { 
        subheadings: yoSubheadings,
        common: enCommon,
        auth: enAuth,
        modals: enModals,
        pages: enPages,
        admin: enAdmin,
        navigation: yoNavigation,
        notifications: yoNotifications
      },
      ha: { 
        subheadings: haSubheadings,
        common: haCommon,
        auth: haAuth,
        modals: haModals,
        pages: haPages,
        admin: haAdmin,
        navigation: haNavigation,
        notifications: haNotifications
      },
      pidgin: { 
        subheadings: pidginSubheadings,
        common: pidginCommon,
        auth: pidginAuth,
        modals: pidginModals,
        pages: pidginPages,
        admin: pidginAdmin,
        navigation: pidginNavigation,
        notifications: pidginNotifications
      },
    },
    defaultNS: 'subheadings',
    ns: ['subheadings', 'common', 'auth', 'modals', 'pages', 'admin', 'navigation', 'notifications'],
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
