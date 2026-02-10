import React from "react";
import { useSpring, animated, useTransition } from "@react-spring/web";
import RippleButton from "./common/RippleButton";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeField } from "../data/hotspots";

const ROOM_ICONS = {
  SALA: "🏫",
  LABORATORIO: "🔬",
  AUDITORIO: "🎭",
  ESCRITORIO: "💼",
  COWORKING: "🖥️",
  CORREDOR: "🚪",
  ESCADA: "🪜",
  QUIOSQUE: "📍",
};

function InfoPanel({ hotspot, onClose, onRequestRoute, onCancelRoute, hasActiveRoute, isClosing }) {
  const { t, language } = useLanguage();

  const panelSpring = useSpring({
    from: { opacity: 0, transform: "translateX(80px)" },
    to: {
      opacity: isClosing ? 0 : 1,
      transform: isClosing ? "translateX(80px)" : "translateX(0px)",
    },
    config: { tension: 200, friction: 24 },
  });

  const cancelTransitions = useTransition(hasActiveRoute, {
    from: { opacity: 0, transform: "translateY(8px) scale(0.95)", maxHeight: "0px" },
    enter: { opacity: 1, transform: "translateY(0px) scale(1)", maxHeight: "70px" },
    leave: { opacity: 0, transform: "translateY(8px) scale(0.95)", maxHeight: "0px" },
    config: { tension: 240, friction: 22 },
  });

  if (!hotspot) return null;

  const title = localizeField(hotspot.title, language);
  const block = localizeField(hotspot.block, language);
  const floorLabel = localizeField(hotspot.floorLabel, language);
  const description = localizeField(hotspot.description, language);
  const roomType = hotspot.roomType ? t(`type.${hotspot.roomType}`) : null;
  const roomIcon = ROOM_ICONS[hotspot.roomType] || "📍";

  return (
    <animated.aside
      style={panelSpring}
      className="glass-surface w-[var(--info-panel-width)] rounded-3xl p-6 text-white shadow-soft custom-scrollbar"
      role="complementary"
      aria-label={`${t("detailsOf")} ${title}`}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-tight">{title}</h2>
          <p className="mt-1 text-xs text-white/50">{hotspot.id?.toUpperCase()}</p>
        </div>
        <button
          type="button"
          className="min-h-[44px] min-w-[44px] rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white/80 transition-all duration-200 hover:bg-slate-800/80 active:scale-90"
          onClick={onClose}
          aria-label={t("closePanel")}
        >
          ✕
        </button>
      </div>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <dt className="text-[10px] uppercase tracking-wider text-white/40">{t("block")}</dt>
          <dd className="mt-1 text-sm font-medium">{block || t("notInformed")}</dd>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <dt className="text-[10px] uppercase tracking-wider text-white/40">{t("floor")}</dt>
          <dd className="mt-1 text-sm font-medium">{floorLabel || "—"}</dd>
        </div>

        {roomType && (
          <div className="rounded-xl bg-white/5 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-white/40">{t("type")}</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <span className="text-base">{roomIcon}</span>
              {roomType}
            </dd>
          </div>
        )}

        {hotspot.capacity && (
          <div className="rounded-xl bg-white/5 p-3">
            <dt className="text-[10px] uppercase tracking-wider text-white/40">{t("capacity")}</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <span className="text-base">👥</span>
              {hotspot.capacity}
            </dd>
          </div>
        )}
      </div>

      {description && (
        <div className="mt-3 rounded-xl bg-white/5 p-3">
          <dt className="text-[10px] uppercase tracking-wider text-white/40">{t("description")}</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-white/80">{description}</dd>
        </div>
      )}

      <div className="mt-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            hotspot.accessiblePcd
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-rose-400/15 text-rose-300"
          }`}
        >
          {hotspot.accessiblePcd ? t("accessible") : t("notAccessible")}
        </div>
      </div>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="space-y-2">
        <RippleButton
          className="w-full rounded-2xl bg-emerald-400/90 px-4 py-3.5 text-sm font-semibold text-slate-900 transition-all duration-200 hover:bg-emerald-300 hover:shadow-glow active:scale-[0.97]"
          onClick={() => onRequestRoute?.(hotspot.id)}
          aria-label={`${t("requestRouteFor")} ${title}`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {t("requestRoute")}
          </span>
        </RippleButton>

        {cancelTransitions((style, show) =>
          show ? (
            <animated.div style={{ ...style, overflow: "hidden" }}>
              <div className="pt-1">
                <RippleButton
                  className="w-full rounded-2xl bg-rose-500/90 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-rose-400 active:scale-[0.97]"
                  onClick={() => onCancelRoute?.()}
                  aria-label={t("cancelRouteActive")}
                >
                  {t("cancelRoute")}
                </RippleButton>
              </div>
            </animated.div>
          ) : null
        )}
      </div>
    </animated.aside>
  );
}

export default React.memo(InfoPanel);