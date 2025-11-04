import React from "react";

function InfoPanel({ hotspot, onClose, onRequestRoute }) {
  if (!hotspot) {
    return (
      <aside className="w-80 rounded-3xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur-2xl shadow-soft">
        <p className="text-sm text-white/80">
          Selecione um lugar para ver as informações detalhadas.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-80 rounded-3xl border border-white/20 bg-white/15 p-6 text-white backdrop-blur-2xl shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-tight">{hotspot.title}</h2>
        <button
          type="button"
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/25"
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
          Verificar Rota
        </button>
        <p className="text-xs text-white/50">
          TODO: substituir lógica de origem/destino pelo fluxo real (ex.: usuário seleciona ponto inicial).
        </p>
      </div>
    </aside>
  );
}

export default InfoPanel;
