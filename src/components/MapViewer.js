import React, { useEffect, useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { buildRoutePath } from "../utils/routeUtils";

function MapViewer({ layer, hotspots, selectedHotspotId, onHotspotSelect, routePoints, transformRef }) {
  const routePath = useMemo(() => buildRoutePath(routePoints), [routePoints]);
  const hasRoute = routePoints?.length > 1;
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [layer?.id]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 map-touch-layer">
      <TransformWrapper
        ref={transformRef}
        minScale={0.1}
        maxScale={5}
        initialScale={0.5}
        wheel={{ step: 0.08 }}
        pinch={{ step: 6 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-2xl shadow-soft">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white/20 text-lg font-bold hover:bg-white/30"
                  onClick={() => zoomIn(0.5)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white/20 text-lg font-bold hover:bg-white/30"
                  onClick={() => zoomOut(0.5)}
                >
                  −
                </button>
                <button
                  type="button"
                  className="h-10 rounded-full bg-white/10 px-5 text-xs font-semibold uppercase tracking-wide hover:bg-white/20"
                  onClick={() => resetTransform(0.4)}
                >
                  Resetar
                </button>
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
                  onError={() => {
                    console.warn("Imagem não encontrada:", layer.imagePath);
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/45"></div>
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {hasRoute ? (
                    <path
                      d={routePath}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="route-dash"
                    />
                  ) : null}
                </svg>
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
                        style={{
                          left: `${spot.xPercent}%`,
                          top: `${spot.yPercent}%`
                        }}
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