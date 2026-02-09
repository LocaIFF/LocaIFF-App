import React from "react";
import { useSpring, animated, useTransition } from "@react-spring/web";
import RippleButton from "./common/RippleButton";

function InfoPanel({ hotspot, onClose, onRequestRoute, onCancelRoute, hasActiveRoute, isClosing }) {
  // Painel desliza da direita para a esquerda
  const panelSpring = useSpring({
    from: { opacity: 0, transform: "translateX(80px)" },
    to: {
      opacity: isClosing ? 0 : 1,
      transform: isClosing ? "translateX(80px)" : "translateX(0px)"
    },
    config: { tension: 200, friction: 24 }
  });

  // Animação do botão "Cancelar rota" (aparece/desaparece suave)
  const cancelTransitions = useTransition(hasActiveRoute, {
    from: { opacity: 0, transform: "translateY(8px) scale(0.95)", maxHeight: "0px" },
    enter: { opacity: 1, transform: "translateY(0px) scale(1)", maxHeight: "70px" },
    leave: { opacity: 0, transform: "translateY(8px) scale(0.95)", maxHeight: "0px" },
    config: { tension: 240, friction: 22 }
  });

  if (!hotspot) return null;

  return (
    <animated.aside
      style={panelSpring}
      className="glass-surface w-[var(--info-panel-width)] rounded-3xl p-6 text-white shadow-soft custom-scrollbar"
      role="complementary"
      aria-label={`Detalhes de ${hotspot.title}`}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-tight">{hotspot.title}</h2>
        <button
          type="button"
          className="min-h-[44px] min-w-[44px] rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white/80 transition-all duration-200 hover:bg-slate-800/80 active:scale-90"
          onClick={onClose}
          aria-label="Fechar painel"
        >
          ✕
        </button>
      </div>

      <dl className="mt-5 space-y-3 text-sm text-white/80">
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/60">Bloco</dt>
          <dd>{hotspot.block ?? "Não informado"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/60">Andar</dt>
          <dd>{hotspot.floorLabel ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/60">Descrição</dt>
          <dd>{hotspot.description}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <RippleButton
          className="w-full rounded-2xl bg-emerald-400/90 px-4 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 hover:bg-emerald-300 hover:shadow-glow active:scale-[0.97]"
          onClick={() => onRequestRoute?.(hotspot.id)}
          aria-label={`Solicitar rota para ${hotspot.title}`}
        >
          Solicitar rota
        </RippleButton>

        {cancelTransitions((style, show) =>
          show ? (
            <animated.div style={{ ...style, overflow: "hidden" }}>
              <div className="pt-3">
                <RippleButton
                  className="w-full rounded-2xl bg-rose-500/90 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-rose-400 active:scale-[0.97]"
                  onClick={() => onCancelRoute?.()}
                  aria-label="Cancelar rota ativa"
                >
                  Cancelar rota
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