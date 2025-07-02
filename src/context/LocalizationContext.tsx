import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import i18n from "../locales/i18n";

export type LocalizationContextType = {
  t: typeof i18n.t;
  locale: string;
  setLocale: (locale: string) => void;
  availableLocales: { code: string; label: string }[];
};

const availableLocales = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "ja", label: "日本語" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "tr", label: "Türkçe" },
  { code: "pl", label: "Polski" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  //   { code: "da", label: "Dansk" },
  //   { code: "fi", label: "Suomi" },
  //   { code: "el", label: "Ελληνικά" },
  //   { code: "hu", label: "Magyar" },
  //   { code: "cs", label: "Čeština" },
  //   { code: "ro", label: "Română" },
];

const LocalizationContext = createContext<LocalizationContextType>({
  t: i18n.t,
  locale: i18n.language,
  setLocale: () => {},
  availableLocales,
});

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState(i18n.language);
  const [tick, setTick] = useState(0); // for force update

  useEffect(() => {
    const handleLanguageChanged = () => {
      setLocaleState(i18n.language);
      setTick((tick) => tick + 1); // force update
    };
    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const setLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
  };

  // Provide a stable t function that updates on language change
  const t = React.useCallback(
    ((...args: Parameters<typeof i18n.t>) => i18n.t(...args)) as typeof i18n.t,
    [tick]
  );

  return (
    <LocalizationContext.Provider
      value={{ t, locale, setLocale, availableLocales }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
