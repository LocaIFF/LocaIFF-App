import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { buildRoutePath } from "../utils/routeUtils";

function MapViewer({ layer, hotspots, selectedHotspotId, onHotspotSelect, routePoints, transformRef }) {
  const routePath = useMemo(() => buildRoutePath(routePoints), [routePoints]);
  const hasRoute = routePoints?.length > 1;

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const inactivityTimerRef = useRef(null);
  const recognitionRef = useRef(null); // ✅ adicionado

  // Ajusta largura da barra de pesquisa dinamicamente
  const computedSearchWidth = useMemo(() => {
    const base = 480;
    const max = 680;
    const extra = Math.min(searchTerm.length * 12, max - base);
    return base + extra;
  }, [searchTerm.length]);

  const activateSearchGlow = useCallback(() => {
    setIsSearchFocused(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsSearchFocused(false);
    }, 5000);
  }, []);

  const performSearch = useCallback(
    (term) => {
      const normalized = term.trim().toLowerCase();
      if (!normalized) return;

      const match = hotspots.find((spot) => {
        const title = spot.title?.toLowerCase() ?? "";
        const label = spot.label?.toLowerCase() ?? "";
        return title.includes(normalized) || label.includes(normalized);
      });

      if (match) {
        onHotspotSelect?.(match.id);
      } else {
        console.info("Nenhum hotspot encontrado para:", term);
      }
    },
    [hotspots, onHotspotSelect]
  );

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      activateSearchGlow();
      performSearch(searchTerm);
    },
    [activateSearchGlow, performSearch, searchTerm]
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    activateSearchGlow();
  };

  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    // Se já estiver escutando, para
    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      activateSearchGlow();
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("")
        .trim();

      setSearchTerm(transcript);
      activateSearchGlow();

      const hasFinal = Array.from(event.results).some((result) => result.isFinal);
      if (hasFinal && transcript) {
        performSearch(transcript);
      }
    };

    recognition.onerror = (error) => {
      console.error("Erro no reconhecimento de voz:", error);
      recognition.stop();
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [activateSearchGlow, isListening, performSearch]);

  const handleVoiceButtonPointerDown = useCallback(
    (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      event.preventDefault();
      handleVoiceSearch();
    },
    [handleVoiceSearch]
  );

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [layer?.id]);

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 map-touch-layer ${
        hasRoute ? "route-active" : ""
      }`}
    >
      <TransformWrapper
        ref={transformRef}
        minScale={0.01}
        maxScale={40}
        initialScale={2}
        wheel={{ step: 0.08 }}
        pinch={{ step: 6 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        {() => (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-6">
              <div
                className={`pointer-events-auto search-shell ${isSearchFocused ? "search-shell--active" : ""} ${isListening ? "search-shell--listening" : ""}`}
                style={{ width: `min(${computedSearchWidth}px, 90vw)`, maxWidth: "640px" }}
              >
                <form
                  className="ui-overlay search-shell__form flex items-center gap-3 rounded-full bg-slate-950/80 px-5 py-4 text-white backdrop-blur-2xl shadow-soft animate-glass"
                  onSubmit={handleSearchSubmit}
                  onFocus={() => activateSearchGlow()}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setIsSearchFocused(false);
                      if (inactivityTimerRef.current) {
                        clearTimeout(inactivityTimerRef.current);
                      }
                    }
                  }}
                >
                  <input
                    type="text"
                    name="room-search"
                    autoComplete="off"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
                    placeholder="Pesquise por nome, código ou bloco da sala..."
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900/65 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-800/80"
                  >
                    Buscar
                  </button>
                  <button
                    type="button"
                    className={`audio-trigger ${isListening ? "audio-trigger--active" : ""} flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition`}
                    aria-pressed={isListening}
                    title="Pesquisar por voz (pt-BR)"
                    onPointerDown={handleVoiceButtonPointerDown}
                    onClick={handleVoiceSearch}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
                      <path d="M19 10a7 7 0 0 1-14 0" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
            <TransformComponent wrapperClass="h-full w-full" contentClass="h-full w-full">
              <div className="relative h-screen w-screen select-none">
                <img
                  src={layer.imagePath}
                  alt={layer.name}
                  className={`block h-screen w-screen object-cover transition duration-700 ease-out ${
                    isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  draggable={false}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => console.warn("Imagem não encontrada:", layer.imagePath)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/45"></div>

                {hasRoute && (
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={routePath}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="route-dash"
                    />
                  </svg>
                )}

                <div className="absolute inset-0">
                  {hotspots.map((spot) => {
                    const isActive = selectedHotspotId === spot.id;
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        className={`group hotspot-floating absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur transition duration-300 ease-out ${
                          isActive
                            ? "border-emerald-300 bg-emerald-400/95 text-slate-900 shadow-2xl hotspot-ping"
                            : "border-white/40 bg-white/20 text-white hover:-translate-y-1 hover:bg-white/35 hover:shadow-xl"
                        }`}
                        style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                        onClick={() => onHotspotSelect?.(spot.id)}
                      >
                        <span className="pointer-events-none">{spot.label ?? "Hotspot"}</span>
                        <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-white shadow-soft group-hover:block">
                          {spot.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default MapViewer;