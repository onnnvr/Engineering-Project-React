import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// استدعاء الملفات من الفولدرات الجديدة
import enTranslation from "./locale/en/translation.json";
import arTranslation from "./locale/ar/translation.json";

const resources = {
  en: {
    translation: enTranslation // "translation" هو الاسم الافتراضي (Namespace)
  },
  ar: {
    translation: arTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    // لضمان عدم حدوث مشاكل في التحميل
    ns: ["translation"], 
    defaultNS: "translation",
    detection: {
      order: ['localStorage', 'cookie','htmlTag',  'querystring', 'hash', 'sessionStorage', 'navigator', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;