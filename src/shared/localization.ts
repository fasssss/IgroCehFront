import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import loginLocale from '../features/authorization/loginLocale.json';
import guildsLocale from '../features/guilds/guildsLocale.json';
import eventsLocale from '../features/events/eventsLocale.json';

function getDefaults() {
  return {
    order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',
    lookupSessionStorage: 'i18nextLng',

    caches: ['cookie', 'localStorage'],
    excludeCacheFor: ['cimode'],
  };
}

const resources = {
  en: {
    translations: {
        ...loginLocale.en,
        ...guildsLocale.en,
        ...eventsLocale.en
    }
  },
  ru: {
    translations: {
        ...loginLocale.ru,
        ...guildsLocale.ru,
        ...eventsLocale.ru
    }
  }
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    ns: ["translations"],
    interpolation: {
      escapeValue: false
    },
    supportedLngs: ['ru', 'en'],
    detection: getDefaults()
  });

export default i18n;