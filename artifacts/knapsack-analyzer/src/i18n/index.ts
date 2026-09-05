import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import hi from "./locales/hi";
import ta from "./locales/ta";
import te from "./locales/te";
import bn from "./locales/bn";
import mr from "./locales/mr";
import kn from "./locales/kn";
import es from "./locales/es";
import fr from "./locales/fr";
import ar from "./locales/ar";

export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦" },
];

const savedLang = typeof localStorage !== "undefined"
  ? (localStorage.getItem("kna-lang") ?? "en")
  : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      bn: { translation: bn },
      mr: { translation: mr },
      kn: { translation: kn },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
