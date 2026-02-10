import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import useDebounce from "../hooks/useDebounce";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeField } from "../data/hotspots";
import { localizeLayerName } from "../data/layers";

function parseFloorCommand(text, layers, language) {
  if (!text || !layers?.length) return null;
  const normalized = text.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const ordinalMaps = {
    "pt-BR": {
      primeiro: 1, primeira: 1, segundo: 2, segunda: 2, terceiro: 3, terceira: 3,
      quarto: 4, quarta: 4, quinto: 5, quinta: 5, sexto: 6, sexta: 6,
      setimo: 7, setima: 7, oitavo: 8, oitava: 8, nono: 9, nona: 9, decimo: 10,
    },
    en: {
      first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
      sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
    },
    es: {
      primero: 1, primera: 1, segundo: 2, segunda: 2, tercero: 3, tercera: 3,
      cuarto: 4, cuarta: 4, quinto: 5, quinta: 5, sexto: 6, sexta: 6,
      septimo: 7, septima: 7, octavo: 8, octava: 8, noveno: 9, novena: 9, decimo: 10,
    },
  };

  const groundTerms = {
    "pt-BR": ["terreo"],
    en: ["ground", "ground floor"],
    es: ["planta baja", "planta"],
  };

  const gTerms = groundTerms[language] || groundTerms["pt-BR"];
  for (const term of gTerms) {
    if (normalized.includes(term)) {
      return layers.find((l) => l.id === "ground")?.id ?? null;
    }
  }

  const floorWords = { "pt-BR": "andar", en: "floor", es: "piso" };
  const fw = floorWords[language] || "andar";
  const numPattern = new RegExp(`(?:${fw}\\s*(\\d+))|(\\d+)\\s*[oºª]?\\s*${fw}`);
  const numMatch = normalized.match(numPattern);
  if (numMatch) {
    const num = parseInt(numMatch[1] ?? numMatch[2], 10);
    const found = layers.find((l) => {
      const names = typeof l.name === "object" ? Object.values(l.name) : [l.name];
      return names.some((n) => {
        const m = n.match(/(\d+)/);
        return m && parseInt(m[1], 10) === num;
      });
    });
    return found?.id ?? null;
  }

  const ordinalMap = ordinalMaps[language] || ordinalMaps["pt-BR"];
  for (const [word, num] of Object.entries(ordinalMap)) {
    if (normalized.includes(word)) {
      const found = layers.find((l) => {
        const names = typeof l.name === "object" ? Object.values(l.name) : [l.name];
        return names.some((n) => {
          const m = n.match(/(\d+)/);
          return m && parseInt(m[1], 10) === num;
        });
      });
      if (found) return found.id;
    }
  }

  for (const layer of layers) {
    const name = localizeLayerName(layer, language);
    const layerNorm = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(layerNorm)) {
      return layer.id;
    }
  }

  return null;
}

function extractRoomFromPhrase(text, hotspots, language) {
  if (!text || !hotspots?.length) return null;
  const normalized = text.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const roomPatterns = [
    /(?:sala|room|sala-)(\d+)/gi,
    /(\d{3})/g,
  ];

  const candidates = [];

  for (const pattern of roomPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(normalized)) !== null) {
      const num = match[1] || match[0];
      candidates.push(num.replace(/^0+/, ""));
    }
  }

  for (const candidate of candidates) {
    const found = hotspots.find((h) => {
      const id = h.id.toLowerCase();
      return id.includes(candidate) || id.endsWith(`-${candidate}`);
    });
    if (found) return found;
  }

  const words = normalized.split(/\s+/);
  let bestMatch = null;
  let bestScore = 0;

  for (const spot of hotspots) {
    const title = localizeField(spot.title, language)
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const titleWords = title.split(/\s+/);

    let score = 0;
    for (const w of words) {
      if (w.length < 2) continue;
      if (titleWords.some((tw) => tw.includes(w) || w.includes(tw))) {
        score += w.length;
      }
    }
    if (score > bestScore && score >= 3) {
      bestScore = score;
      bestMatch = spot;
    }
  }

  return bestMatch;
}

function SearchBar({ hotspots = [], layers = [], onMatch, onLayerChange, className }) {
  const { t, language, speechLang } = useLanguage();
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

  useEffect(() => {
    const normalized = debouncedTerm.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!normalized || normalized.length < 2) {
      setSuggestions([]);
      return;
    }

    const matched = hotspots.filter((spot) => {
      const title = localizeField(spot.title, language).toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const label = spot.label?.toLowerCase() ?? "";
      const block = localizeField(spot.block, language).toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const desc = localizeField(spot.description, language).toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const id = spot.id.toLowerCase();
      return (
        title.includes(normalized) ||
        label.includes(normalized) ||
        block.includes(normalized) ||
        desc.includes(normalized) ||
        id.includes(normalized)
      );
    });

    setSuggestions(matched.slice(0, 8));
    setSelectedSuggestionIndex(-1);
  }, [debouncedTerm, hotspots, language]);

  const activateGlow = useCallback(() => {
    setIsFocused(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => setIsFocused(false), 5000);
  }, []);

  const performSearch = useCallback(
    (term) => {
      const normalized = term.trim().toLowerCase();
      if (!normalized) return;

      const layerId = parseFloorCommand(term, layers, language);
      if (layerId) {
        onLayerChange?.(layerId);
        setSearchTerm("");
        setSuggestions([]);
        return;
      }

      const roomMatch = extractRoomFromPhrase(term, hotspots, language);
      if (roomMatch) {
        onMatch?.(roomMatch.id);
        setSearchTerm("");
        setSuggestions([]);
        return;
      }

      const match = hotspots.find((spot) => {
        const title = localizeField(spot.title, language).toLowerCase();
        const label = spot.label?.toLowerCase() ?? "";
        return title.includes(normalized) || label.includes(normalized);
      });

      if (match) {
        onMatch?.(match.id);
        setSearchTerm("");
        setSuggestions([]);
      }
    },
    [hotspots, layers, language, onMatch, onLayerChange]
  );

  const { isListening, toggle: toggleVoice } = useSpeechRecognition({
    onResult: (text) => {
      setSearchTerm(text);
      activateGlow();
    },
    onFinalResult: (text) => {
      performSearch(text);
    },
    lang: speechLang,
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
      aria-label={t("searchAriaLabel")}
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
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          aria-expanded={suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        <button
          type="submit"
          className="ripple-container min-h-[44px] rounded-full bg-slate-900/65 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-800/80"
          aria-label={t("searchButton")}
        >
          {t("searchButton")}
        </button>

        <button
          type="button"
          className={clsx(
            "audio-trigger flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition",
            isListening && "audio-trigger--active"
          )}
          aria-pressed={isListening}
          aria-label={isListening ? t("voiceStop") : t("voiceStart")}
          title={t("voiceTitle")}
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

      {suggestions.length > 0 && (
        <ul
          className="glass-surface absolute inset-x-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl py-2 custom-scrollbar"
          role="listbox"
          aria-label={t("suggestionsLabel")}
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
                <div className="truncate font-medium">{localizeField(spot.title, language)}</div>
                <div className="truncate text-xs text-white/50">
                  {localizeField(spot.block, language)} · {localizeField(spot.floorLabel, language)}
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
