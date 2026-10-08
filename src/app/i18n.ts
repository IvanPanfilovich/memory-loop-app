import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const supportedLanguages = ['en', 'ru'];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    supportedLngs: supportedLanguages,
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    preload: supportedLanguages,
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
    debug: false,
  });

export default i18n;
