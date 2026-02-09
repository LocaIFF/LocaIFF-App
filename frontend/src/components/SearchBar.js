import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import useDebounce from "../hooks/useDebounce";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

/**
 * Tenta interpretar o comando de voz como navegação de andar.
 * Exemplos reconhecidos: "andar 3", "terceiro andar", "térreo", "andar 35", "5 andar"
 * Retorna o layerId correspondente ou null.
 */
function parseFloorCommand(text, layers) {
  if (!text || !layers?.length) return null;
  const normalized = text.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove acentos

  // Mapa de palavras ordinais → número
  const ordinalMap = {
    primeiro: 1, primeira: 1,
    segundo: 2, segunda: 2,
    terceiro: 3, terceira: 3,
    quarto: 4, quarta: 4,
    quinto: 5, quinta: 5,
    sexto: 6, sexta: 6,
    setimo: 7, setima: 7,
    oitavo: 8, oitava: 8,
    nono: 9, nona: 9,
    decimo: 10, decima: 10,
  };

  // "térreo" ou "terreo"
  if (/terreo/.test(normalized)) {
    return layers.find((l) => l.id === "ground")?.id ?? null;
  }

  // "andar 3", "andar 35", "3 andar", "3o andar"
  const numMatch = normalized.match(/(?:andar\s*(\d+))|(?:(\d+)\s*[oºª]?\s*andar)/);
  if (numMatch) {
    const num = parseInt(numMatch[1] ?? numMatch[2], 10);
    // Procura layer cujo name contém esse número
    const found = layers.find((l) => {
      const layerNum = l.name.match(/(\d+)/);
      return layerNum && parseInt(layerNum[1], 10) === num;
    });
    return found?.id ?? null;
  }

  // "terceiro andar", "quinto andar"
  for (const [word, num] of Object.entries(ordinalMap)) {
    if (normalized.includes(word)) {
      const found = layers.find((l) => {
        const layerNum = l.name.match(/(\d+)/);
        return layerNum && parseInt(layerNum[1], 10) === num;
      });
      if (found) return found.id;
    }
  }

  // Busca direta pelo nome da layer ("1 andar", "terreo", etc.)
  for (const layer of layers) {
    const layerNorm = layer.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(layerNorm)) {
      return layer.id;
    }
  }

  return null;
}

function SearchBar({ hotspots = [], layers = [], onMatch, onLayerChange, className }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inactivityTimerRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedTerm = useDebounce(searchTerm, 250);

  const computedWidth = useMemo(() => {
    const base = 480;
    const max = 680;
    const extra = Math.min(searchTerm.length * 12, max - base);
    return base + extra;
  }, [searchTerm.length]);

  // Filtrar sugestões com debounce
  useEffect(() => {
    const normalized = debouncedTerm.trim().toLowerCase();
    if (!normalized) {
      setSuggestions([]);
      return;
    }

    const matched = hotspots.filter((spot) => {
      const title = spot.title?.toLowerCase() ?? "";
      const label = spot.label?.toLowerCase() ?? "";
      const block = spot.block?.toLowerCase() ?? "";
      return title.includes(normalized) || label.includes(normalized) || block.includes(normalized);
    });

    setSuggestions(matched.slice(0, 5));
    setSelectedSuggestionIndex(-1);
  }, [debouncedTerm, hotspots]);

  const activateGlow = useCallback(() => {
    setIsFocused(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => setIsFocused(false), 5000);
  }, []);

  const performSearch = useCallback(
    (term) => {
      const normalized = term.trim().toLowerCase();
      if (!normalized) return;

      // 1) Tenta interpretar como comando de andar
      const layerId = parseFloorCommand(term, layers);
      if (layerId) {
        onLayerChange?.(layerId);
        setSearchTerm("");
        setSuggestions([]);
        return;
      }

      // 2) Busca por hotspot (sala)
      const match = hotspots.find((spot) => {
        const title = spot.title?.toLowerCase() ?? "";
        const label = spot.label?.toLowerCase() ?? "";
        return title.includes(normalized) || label.includes(normalized);
      });

      if (match) {
        onMatch?.(match.id);
        setSearchTerm("");
        setSuggestions([]);
      }
    },
    [hotspots, layers, onMatch, onLayerChange]
  );

  const { isListening, toggle: toggleVoice } = useSpeechRecognition({
    onResult: (text) => {
      setSearchTerm(text);
      activateGlow();
    },
    onFinalResult: (text) => {
      performSearch(text);
    }
  });

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      activateGlow();

      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        onMatch?.(suggestions[selectedSuggestionIndex].id);
        setSuggestions([]);
        setSearchTerm("");
        return;
      }

      performSearch(searchTerm);
    },
    [activateGlow, onMatch, performSearch, searchTerm, selectedSuggestionIndex, suggestions]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1));
      } else if (event.key === "Escape") {
        setSuggestions([]);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [suggestions.length]
  );

  const handleSuggestionClick = useCallback(
    (spotId) => {
      onMatch?.(spotId);
      setSuggestions([]);
      setSearchTerm("");
    },
    [onMatch]
  );

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  return (
    <div
      className={clsx(
        "pointer-events-auto search-shell",
        isFocused && "search-shell--active",
        isListening && "search-shell--listening",
        className
      )}
      style={{ width: `min(${computedWidth}px, 90vw)`, maxWidth: "640px" }}
      role="search"
      aria-label="Pesquisar salas e locais ou navegar por andares"
    >
      <form
        className="search-shell__form glass-surface flex items-center gap-3 rounded-full px-5 py-4 text-white shadow-soft"
        onSubmit={handleSubmit}
        onFocus={activateGlow}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
            setTimeout(() => setSuggestions([]), 200);
          }
        }}
      >
        {/* Ícone de busca */}
        <svg className="h-5 w-5 shrink-0 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          name="room-search"
          autoComplete="off"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            activateGlow();
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
          placeholder="Diga &quot;andar 3&quot; ou pesquise uma sala..."
          aria-label="Campo de pesquisa de salas e andares"
          aria-expanded={suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        <button
          type="submit"
          className="ripple-container min-h-[44px] rounded-full bg-slate-900/65 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-800/80"
          aria-label="Buscar"
        >
          Buscar
        </button>

        <button
          type="button"
          className={clsx(
            "audio-trigger flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition",
            isListening && "audio-trigger--active"
          )}
          aria-pressed={isListening}
          aria-label={isListening ? "Parar reconhecimento de voz" : "Pesquisar por voz"}
          title="Pesquisar por voz (pt-BR)"
          onClick={toggleVoice}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
            <path d="M19 10a7 7 0 0 1-14 0" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        </button>
      </form>

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <ul
          className="glass-surface absolute inset-x-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl py-2 custom-scrollbar"
          role="listbox"
          aria-label="Sugestões de pesquisa"
        >
          {suggestions.map((spot, index) => (
            <li
              key={spot.id}
              role="option"
              aria-selected={selectedSuggestionIndex === index}
              className={clsx(
                "flex cursor-pointer items-center gap-3 px-5 py-3 text-sm text-white transition",
                selectedSuggestionIndex === index
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              )}
              onClick={() => handleSuggestionClick(spot.id)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-xs font-bold text-emerald-300">
                {spot.label}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{spot.title}</div>
                <div className="truncate text-xs text-white/50">
                  {spot.block} · {spot.floorLabel}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default React.memo(SearchBar);
