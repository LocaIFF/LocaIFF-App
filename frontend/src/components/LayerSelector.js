import React from "react";
import clsx from "clsx";
import RippleButton from "./common/RippleButton";

function LayerSelector({ layers, currentLayerId, onChange }) {
  return (
    <nav className="flex flex-col items-center gap-2 text-white sm:gap-3 md:gap-4" aria-label="Seleção de andares">
      <span className="text-[10px] uppercase tracking-[0.25em] text-white/60 sm:text-xs">Andares</span>
      <div className="flex flex-col gap-1.5 sm:gap-2" role="radiogroup" aria-label="Lista de andares">
        {[...layers]
          .reverse()
          .map((layer) => {
            const isActive = currentLayerId === layer.id;
            return (
              <RippleButton
                key={layer.id}
                className={clsx(
                  "flex items-center justify-center rounded-xl text-xs font-semibold transition sm:rounded-2xl sm:text-sm",
                  "h-9 w-[8.5rem] sm:h-10 sm:w-[9.5rem] md:h-12 md:w-[9.5rem]",
                  isActive
                    ? "bg-emerald-400/90 text-slate-900 shadow-glow ring-2 ring-emerald-300/60"
                    : "bg-slate-900/70 text-white hover:bg-slate-800/80"
                )}
                onClick={() => onChange(layer.id)}
                role="radio"
                aria-checked={isActive}
                aria-label={`Selecionar ${layer.name}`}
              >
                {layer.name}
              </RippleButton>
            );
          })}
      </div>
    </nav>
  );
}

export default React.memo(LayerSelector);