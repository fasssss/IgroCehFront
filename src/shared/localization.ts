import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import loginLocale from '../features/authorization/loginLocale.json';

const resources = {
  en: {
    translations: {
        ...loginLocale.en
    }
  },
  ru: {
    translations: {
        ...loginLocale.ru
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    ns: ["translations"],
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;