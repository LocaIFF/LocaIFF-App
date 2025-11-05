import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import LayerSelector from "./components/LayerSelector";
import MapViewer from "./components/MapViewer";
import InfoPanel from "./components/InfoPanel";
import layers from "./data/layers";
import hotspotsData from "./data/hotspots";
import { requestRoute } from "./api";

function App() {
  const [currentLayerId, setCurrentLayerId] = useState(layers[0]?.id ?? null);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [viewerKey, setViewerKey] = useState(0);
  const [isInfoClosing, setIsInfoClosing] = useState(false);
  const autoCloseTimerRef = useRef(null);
  const preloadedImagesRef = useRef(false);
  const transformRef = useRef(null); // ✅ Corrigido: variável estava faltando

  const currentLayer = useMemo(
    () => layers.find((layer) => layer.id === currentLayerId) ?? null,
    [currentLayerId]
  );

  const hotspots = useMemo(
    () => hotspotsData.filter((spot) => spot.layerId === currentLayerId),
    [currentLayerId]
  );

  const selectedHotspot = useMemo(
    () => hotspotsData.find((spot) => spot.id === selectedHotspotId) ?? null,
    [selectedHotspotId]
  );

  const cancelAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    cancelAutoCloseTimer();
    setSelectedHotspotId(null);
    setRoutePoints([]);
    setIsInfoClosing(false);
  }, [cancelAutoCloseTimer]);

  const startAutoCloseTimer = useCallback(() => {
    cancelAutoCloseTimer();
    autoCloseTimerRef.current = setTimeout(() => {
      setIsInfoClosing(true);
      setTimeout(() => {
        handleClosePanel();
      }, 400);
    }, 30000);
  }, [cancelAutoCloseTimer, handleClosePanel]);

  const handleLayerChange = (layerId) => {
    setCurrentLayerId(layerId);
    cancelAutoCloseTimer();
    setIsInfoClosing(false);
    setSelectedHotspotId(null);
    setRoutePoints([]);
    setViewerKey((prev) => prev + 1);
  };

  const handleHotspotSelect = useCallback((hotspotId) => {
    if (!hotspotId) return; // ✅ Proteção extra
    setSelectedHotspotId(hotspotId);
    setRoutePoints([]);
    setIsInfoClosing(false);
    startAutoCloseTimer();
  }, [startAutoCloseTimer]);

  const handleRequestRoute = async (destinationId) => {
    if (!selectedHotspotId || !destinationId) return;
    cancelAutoCloseTimer();
    setIsInfoClosing(false);
    try {
      const routePayload = await requestRoute(selectedHotspotId, destinationId);
      setRoutePoints(routePayload.pointsPercent ?? []);
    } catch (error) {
      console.error("Falha ao solicitar rota simulada:", error);
    }
  };

  const handleCancelRoute = () => {
    cancelAutoCloseTimer();
    setRoutePoints([]);
    setIsInfoClosing(false);
  };

  useEffect(() => {
    if (preloadedImagesRef.current) return;
    layers.forEach((layer) => {
      const img = new Image();
      img.src = layer.imagePath; /* TODO: garantir que os caminhos em src/data/layers.js estejam corretos */
    });
    preloadedImagesRef.current = true;
  }, []);

  useEffect(() => {
    return () => cancelAutoCloseTimer();
  }, [cancelAutoCloseTimer]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {/* Painel lateral */}
      <div className="pointer-events-none absolute left-6 top-6 z-[60] flex flex-col gap-4">
        <div className="pointer-events-auto ui-overlay w-45 rounded-3xl bg-slate-950/80 px-5 py-4 backdrop-blur-2xl shadow-soft">
          <div className="leading-tight">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">
              Bem-vindo ao
            </span>
            <h1 className="bg-gradient-to-r from-[#32A041] via-[#32A041] to-white bg-clip-text text-3xl font-extrabold uppercase tracking-wide text-transparent">
              lugaiff
            </h1>
          </div>
        </div>
        <div className="pointer-events-auto ui-overlay w-45 rounded-3xl bg-slate-950/75 p-4 backdrop-blur-2xl shadow-soft">
          <LayerSelector
            layers={layers}
            currentLayerId={currentLayerId}
            onChange={handleLayerChange}
          />
        </div>
      </div>

      {/* Mapa */}
      <div className="absolute inset-0">
        <MapViewer
          key={viewerKey}
          layer={currentLayer}
          hotspots={hotspots}
          selectedHotspotId={selectedHotspotId}
          onHotspotSelect={handleHotspotSelect}
          routePoints={routePoints}
          transformRef={transformRef}
        />
      </div>

      {/* Painel de informações */}
      {selectedHotspot && (
        <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2">
          <div
            className={`pointer-events-auto ui-overlay info-panel-shell ${
              isInfoClosing ? "info-panel-shell--closing" : ""
            }`}
          >
            <InfoPanel
              hotspot={selectedHotspot}
              onClose={handleClosePanel}
              onRequestRoute={handleRequestRoute}
              onCancelRoute={handleCancelRoute}
              hasActiveRoute={routePoints.length > 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
