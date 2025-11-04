import React from "react";

function LayerSelector({ layers, currentLayerId, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-[0.2em] text-white/60">
        Andares
      </span>
      <div className="flex flex-wrap gap-2">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              currentLayerId === layer.id
                ? "border-white/90 bg-white text-slate-900 shadow-soft"
                : "border-white/30 bg-white/10 text-white hover:bg-white/20"
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
