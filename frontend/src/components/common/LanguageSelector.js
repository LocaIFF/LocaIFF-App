import React, { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { useLanguage } from "../../i18n/LanguageContext";
import { useTransition, animated } from "@react-spring/web";

function LanguageSelector() {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const current = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, []);

  const menuTransitions = useTransition(isOpen, {
    from: { opacity: 0, transform: "translateY(8px) scale(0.92)" },
    enter: { opacity: 1, transform: "translateY(0px) scale(1)" },
    leave: { opacity: 0, transform: "translateY(8px) scale(0.92)" },
    config: { tension: 280, friction: 22 },
  });

  return (
    <div ref={containerRef} className="relative">
      {menuTransitions((style, show) =>
        show ? (
          <animated.div
            style={style}
            className="glass-surface absolute bottom-full right-0 mb-2 min-w-[140px] rounded-2xl py-2 shadow-soft"
          >
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150",
                  language === lang.code
                    ? "bg-emerald-400/20 text-emerald-300 font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </animated.div>
        ) : null
      )}

      <button
        type="button"
        onClick={toggle}
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300",
          isOpen
            ? "border-emerald-300 bg-emerald-400/90 text-slate-900 shadow-glow"
            : "border-white/20 bg-slate-900/70 text-white/70 hover:bg-slate-800/80 hover:text-white"
        )}
        aria-label={t("languageLabel")}
        aria-expanded={isOpen}
        title={t("language")}
      >
        <span className="text-sm font-bold">{current.label}</span>
      </button>
    </div>
  );
}

export default React.memo(LanguageSelector);
