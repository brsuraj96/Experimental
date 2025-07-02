import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// the translations
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";
import zh from "./zh.json";
import hi from "./hi.json";
import ar from "./ar.json";
import ru from "./ru.json";
import ja from "./ja.json";
import pt from "./pt.json";
import it from "./it.json";
import ko from "./ko.json";
import tr from "./tr.json";
import pl from "./pl.json";
import nl from "./nl.json";
import sv from "./sv.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  hi: { translation: hi },
  zh: { translation: zh },
  ar: { translation: ar },
  ja: { translation: ja },
  ru: { translation: ru },
  pt: { translation: pt },
  it: { translation: it },
  ko: { translation: ko },
  tr: { translation: tr },
  pl: { translation: pl },
  nl: { translation: nl },
  sv: { translation: sv },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode || "en",
  fallbackLng: "en",
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
