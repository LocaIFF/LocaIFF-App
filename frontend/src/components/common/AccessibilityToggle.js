import React from "react";
import clsx from "clsx";
import { useLanguage } from "../../i18n/LanguageContext";

function AccessibilityToggle({ highContrast, onToggle }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300",
        highContrast
          ? "border-yellow-400 bg-yellow-400/90 text-slate-900 shadow-glow"
          : "border-white/20 bg-slate-900/70 text-white/70 hover:bg-slate-800/80 hover:text-white"
      )}
      aria-label={highContrast ? t("disableHighContrast") : t("enableHighContrast")}
      aria-pressed={highContrast}
      title={t("highContrastTitle")}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
      </svg>
    </button>
  );
}

export default React.memo(AccessibilityToggle);
