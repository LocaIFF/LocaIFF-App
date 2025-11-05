import React from "react";

function InfoPanel({ hotspot, onClose, onRequestRoute, onCancelRoute, hasActiveRoute }) {
  if (!hotspot) {
    return null;
  }

  return (
    <aside className="w-80 rounded-3xl border border-white/10 bg-slate-950/75 p-6 text-white backdrop-blur-2xl shadow-soft animate-glass">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-tight">{hotspot.title}</h2>
        <button
          type="button"
          className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-slate-800/80"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
      <dl className="mt-5 space-y-3 text-sm text-white/80">
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/60">Bloco</dt>
          <dd>{hotspot.block ?? "Não informado"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/60">Andar</dt>
          <dd>{hotspot.floorLabel ?? "Referência do layer"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/60">Descrição</dt>
          <dd>{hotspot.description}</dd>
        </div>
      </dl>
      <div className="mt-6 space-y-3">
        <button
          type="button"
          className="w-full rounded-2xl bg-emerald-400/90 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
          onClick={() => onRequestRoute?.(hotspot.id)}
        >
          Solicitar rota
        </button>
        {hasActiveRoute ? (
          <button
            type="button"
            className="w-full rounded-2xl bg-rose-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
            onClick={() => onCancelRoute?.()}
          >
            Cancelar rota
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default InfoPanel;
