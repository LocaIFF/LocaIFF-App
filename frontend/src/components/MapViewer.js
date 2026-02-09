import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import clsx from "clsx";
import { buildRoutePath, estimatePathLength } from "../utils/routeUtils";
import SearchBar from "./SearchBar";

function HotspotButton({ spot, isActive, onClick }) {
  return (
    <button
      type="button"
      className={clsx(
        "group hotspot-btn absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm transition duration-300 ease-out",
        isActive
          ? "hotspot-btn--active border-emerald-300 bg-emerald-400/95 text-slate-900 shadow-glow hotspot-ping"
          : "border-white/40 bg-white/20 text-white hover:-translate-y-[calc(50%+2px)] hover:bg-white/35 hover:shadow-xl"
      )}
      style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
      onClick={() => onClick?.(spot.id)}
      aria-label={`${spot.title} — ${spot.block}, ${spot.floorLabel}`}
      aria-pressed={isActive}
      role="button"
    >
      <span className="pointer-events-none">{spot.label ?? "?"}</span>
      <span
        className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 px-2.5 py-1 text-[10px] text-white shadow-soft backdrop-blur group-hover:block"
        role="tooltip"
      >
        {spot.title}
      </span>
    </button>
  );
}

const MemoizedHotspot = React.memo(HotspotButton);

function AnimatedRoutePath({ routePoints }) {
  const pathString = useMemo(() => buildRoutePath(routePoints), [routePoints]);
  const pathLength = useMemo(() => estimatePathLength(routePoints), [routePoints]);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setDrawn(false);
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, [routePoints]);

  if (!pathString) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Sombra / brilho */}
      <path
        d={pathString}
        fill="none"
        stroke="rgba(52, 211, 153, 0.2)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Linha principal com animação de desenho */}
      <path
        d={pathString}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={drawn ? 0 : pathLength}
        className="route-path-draw"
      />
      {/* Dash animada por cima */}
      <path
        d={pathString}
        fill="none"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="route-path"
        style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.5s 1s" }}
      />
    </svg>
  );
}

const MemoizedRoute = React.memo(AnimatedRoutePath);

function MapViewer({ layer, hotspots, allHotspots, selectedHotspotId, onHotspotSelect, routePoints, transformRef, layers, onLayerChange }) {
  const hasRoute = routePoints?.length > 1;
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [layer?.id]);

  const handleHotspotClick = useCallback(
    (id) => {
      onHotspotSelect?.(id);
    },
    [onHotspotSelect]
  );

  if (!layer) return null;

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 map-touch-layer"
      role="application"
      aria-label={`Mapa interativo — ${layer.name}`}
    >
      <TransformWrapper
        ref={transformRef}
        minScale={0.3}
        maxScale={10}
        initialScale={0.6}
        wheel={{ step: 0.08 }}
        pinch={{ step: 5 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        {() => (
          <>
            {/* Barra de pesquisa */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 sm:bottom-4 sm:px-4 md:bottom-6 md:px-6">
              <SearchBar
                hotspots={allHotspots || hotspots}
                onMatch={onHotspotSelect}
                layers={layers}
                onLayerChange={onLayerChange}
              />
            </div>

            <TransformComponent wrapperClass="h-full w-full" contentClass="h-full w-full">
              <div className="relative h-screen w-screen select-none">
                {/* Imagem do mapa */}
                <img
                  src={layer.imagePath}
                  alt={`Planta do ${layer.name}`}
                  className={clsx(
                    "block h-screen w-screen object-cover transition duration-700 ease-out",
                    isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"
                  )}
                  draggable={false}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => console.warn("Imagem não encontrada:", layer.imagePath)}
                />

                {/* Overlay de gradiente */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/45" aria-hidden="true" />

                {/* Rota animada */}
                {hasRoute && <MemoizedRoute routePoints={routePoints} />}

                {/* Hotspots */}
                <div className="absolute inset-0" role="group" aria-label="Pontos de interesse">
                  {hotspots.map((spot) => (
                    <MemoizedHotspot
                      key={spot.id}
                      spot={spot}
                      isActive={selectedHotspotId === spot.id}
                      onClick={handleHotspotClick}
                    />
                  ))}
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default React.memo(MapViewer);