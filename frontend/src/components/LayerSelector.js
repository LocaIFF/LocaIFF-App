import React from "react";

function LayerSelector({ layers, currentLayerId, onChange }) {
  const orderedLayers = [...layers];

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <span className="text-xs uppercase tracking-[0.25em] text-white/60">
        Andares
      </span>
      <div className="flex flex-col gap-2">
        {orderedLayers
          .slice()
          .reverse()
          .map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={`flex h-12 w-32 items-center justify-center rounded-2xl text-sm font-semibold transition ${
                currentLayerId === layer.id
                  ? "bg-emerald-400/90 text-slate-900 shadow-soft ring-2 ring-emerald-300/60"
                  : "bg-slate-900/70 text-white hover:bg-slate-800/80"
              }`}
              onClick={() => onChange(layer.id)}
            >
              {layer.name}
            </button>
          ))}
      </div>
    </div>
  );
}

export default LayerSelector;