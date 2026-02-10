import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import translations, { SUPPORTED_LANGUAGES } from "./translations";

const LanguageContext = createContext();

const LANG_STORAGE_KEY = "locaiff-lang";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY) || "pt-BR";
    } catch {
      return "pt-BR";
    }
  });

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "pt-BR" ? "pt-BR" : language;
  }, [language]);

  const t = useCallback(
    (key, fallback) => {
      return translations[language]?.[key] ?? translations["pt-BR"]?.[key] ?? fallback ?? key;
    },
    [language]
  );

  const speechLang = language === "pt-BR" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, speechLang, supportedLanguages: SUPPORTED_LANGUAGES }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
