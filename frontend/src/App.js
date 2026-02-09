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
  const transformRef = useRef(null);
  const closingAnimationTimerRef = useRef(null);

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

  const clearClosingAnimationTimer = useCallback(() => {
    if (closingAnimationTimerRef.current) {
      clearTimeout(closingAnimationTimerRef.current);
      closingAnimationTimerRef.current = null;
    }
  }, []);

  const finalizePanelClose = useCallback(() => {
    clearClosingAnimationTimer();
    cancelAutoCloseTimer();
    setSelectedHotspotId(null);
    setRoutePoints([]);
    setIsInfoClosing(false);
  }, [cancelAutoCloseTimer, clearClosingAnimationTimer]);

  const handleClosePanel = useCallback(() => {
    if (!selectedHotspotId) return;
    cancelAutoCloseTimer();
    clearClosingAnimationTimer();
    setIsInfoClosing(true);
    closingAnimationTimerRef.current = setTimeout(() => {
      finalizePanelClose();
    }, 400);
  }, [cancelAutoCloseTimer, clearClosingAnimationTimer, finalizePanelClose, selectedHotspotId]);

  const startAutoCloseTimer = useCallback(() => {
    cancelAutoCloseTimer();
    autoCloseTimerRef.current = setTimeout(() => {
      handleClosePanel();
    }, 30000);
  }, [cancelAutoCloseTimer, handleClosePanel]);

  const handleLayerChange = (layerId) => {
    setCurrentLayerId(layerId);
    cancelAutoCloseTimer();
    clearClosingAnimationTimer();
    setIsInfoClosing(false);
    setSelectedHotspotId(null);
    setRoutePoints([]);
    setViewerKey((prev) => prev + 1);
  };

  const handleHotspotSelect = useCallback(
    (hotspotId) => {
      if (!hotspotId) return;
      clearClosingAnimationTimer();
      setSelectedHotspotId(hotspotId);
      setRoutePoints([]);
      setIsInfoClosing(false);
      startAutoCloseTimer();
    },
    [clearClosingAnimationTimer, startAutoCloseTimer]
  );

  const handleRequestRoute = async (destinationId) => {
    if (!selectedHotspotId || !destinationId) return;
    cancelAutoCloseTimer();
    clearClosingAnimationTimer();
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
    clearClosingAnimationTimer();
    setRoutePoints([]);
    setIsInfoClosing(false);
  };

  useEffect(() => {
    if (preloadedImagesRef.current) return;
    layers.forEach((layer) => {
      const img = new Image();
      img.src = layer.imagePath;
    });
    preloadedImagesRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      cancelAutoCloseTimer();
      clearClosingAnimationTimer();
    };
  }, [cancelAutoCloseTimer, clearClosingAnimationTimer]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute left-6 top-6 z-[60] flex flex-col gap-4">
        <div className="pointer-events-auto ui-overlay w-45 rounded-3xl bg-slate-950/80 px-5 py-4 backdrop-blur-2xl shadow-soft">
          <div className="leading-tight">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">
              Bem-vindo ao
            </span>
            <h1 className="bg-gradient-to-r from-[#32A041] via-[#32A041] to-white bg-clip-text text-3xl font-extrabold uppercase tracking-wide text-transparent">
              LOCAIFF
            </h1>
          </div>
        </div>
        <div className="pointer-events-auto ui-overlay w-45 rounded-3xl bg-slate-950/75 p-4 backdrop-blur-2xl shadow-soft">
          <LayerSelector
            layers={layers}
            currentLayerId={currentLayerId}
            onChange={handleLayerChange}
            verticalCompact
          />
        </div>
      </div>

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

      {selectedHotspot ? (
        <div className="pointer-events-none absolute inset-y-0 right-6 z-[55] flex items-center justify-end">
          <div
            className={`pointer-events-auto ui-overlay info-panel-shell info-panel-shell-mobile ${
              isInfoClosing ? "info-panel-shell-mobile--closing" : ""
            }`}
          >
            <InfoPanel
              hotspot={selectedHotspot}
              onClose={handleClosePanel}
              onRequestRoute={handleRequestRoute}
              onCancelRoute={handleCancelRoute}
              hasActiveRoute={routePoints.length > 0}
              compact
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;