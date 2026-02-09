import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import LayerSelector from "./components/LayerSelector";
import MapViewer from "./components/MapViewer";
import InfoPanel from "./components/InfoPanel";
import GlassSurface from "./components/common/GlassSurface";
import AccessibilityToggle from "./components/common/AccessibilityToggle";
import layers from "./data/layers";
import hotspotsData from "./data/hotspots";
import useHighContrast from "./hooks/useHighContrast";
import { requestRoute, layerIdToFloor } from "./api";

function App() {
  const [currentLayerId, setCurrentLayerId] = useState(layers[0]?.id ?? null);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [viewerKey, setViewerKey] = useState(0);
  const [isInfoClosing, setIsInfoClosing] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const autoCloseTimerRef = useRef(null);
  const closingTimerRef = useRef(null);
  const preloadedRef = useRef(false);
  const transformRef = useRef(null);

  const { highContrast, toggleHighContrast } = useHighContrast();

  const currentLayer = useMemo(
    () => layers.find((l) => l.id === currentLayerId) ?? null,
    [currentLayerId]
  );

  const visibleHotspots = useMemo(
    () => hotspotsData.filter((s) => s.layerId === currentLayerId),
    [currentLayerId]
  );

  const selectedHotspot = useMemo(
    () => hotspotsData.find((s) => s.id === selectedHotspotId) ?? null,
    [selectedHotspotId]
  );

  // Filtra pontos da rota para exibir apenas no andar atual
  const currentFloor = useMemo(() => layerIdToFloor(currentLayerId), [currentLayerId]);
  const visibleRoutePoints = useMemo(() => {
    if (!routePoints || routePoints.length === 0) return [];
    // Se os pontos não têm floor (mock antigo), exibir todos
    if (routePoints[0].floor === undefined) return routePoints;
    return routePoints.filter((p) => p.floor === currentFloor);
  }, [routePoints, currentFloor]);

  // ── Timers ──
  const cancelAutoClose = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const cancelClosingAnim = useCallback(() => {
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current);
      closingTimerRef.current = null;
    }
  }, []);

  const finalizePanelClose = useCallback(() => {
    cancelClosingAnim();
    cancelAutoClose();
    setSelectedHotspotId(null);
    setRoutePoints([]);
    setIsInfoClosing(false);
  }, [cancelAutoClose, cancelClosingAnim]);

  const handleClosePanel = useCallback(() => {
    if (!selectedHotspotId) return;
    cancelAutoClose();
    cancelClosingAnim();
    setIsInfoClosing(true);
    closingTimerRef.current = setTimeout(finalizePanelClose, 400);
  }, [cancelAutoClose, cancelClosingAnim, finalizePanelClose, selectedHotspotId]);

  const startAutoClose = useCallback(() => {
    cancelAutoClose();
    autoCloseTimerRef.current = setTimeout(handleClosePanel, 30000);
  }, [cancelAutoClose, handleClosePanel]);

  // ── Handlers ──
  const handleLayerChange = useCallback(
    (layerId) => {
      setCurrentLayerId(layerId);
      cancelAutoClose();
      cancelClosingAnim();
      setIsInfoClosing(false);
      setSelectedHotspotId(null);
      setRoutePoints([]);
      setViewerKey((k) => k + 1);
    },
    [cancelAutoClose, cancelClosingAnim]
  );

  const handleHotspotSelect = useCallback(
    (hotspotId) => {
      if (!hotspotId) return;

      // Se hotspot está em outra camada, troca automaticamente
      const spot = hotspotsData.find((s) => s.id === hotspotId);
      if (spot && spot.layerId !== currentLayerId) {
        setCurrentLayerId(spot.layerId);
        setViewerKey((k) => k + 1);
      }

      cancelClosingAnim();
      setSelectedHotspotId(hotspotId);
      setRoutePoints([]);
      setIsInfoClosing(false);
      startAutoClose();
    },
    [cancelClosingAnim, currentLayerId, startAutoClose]
  );

  const handleRequestRoute = useCallback(
    async (destinationId) => {
      if (!selectedHotspotId || !destinationId) return;
      cancelAutoClose();
      cancelClosingAnim();
      setIsInfoClosing(false);
      setIsLoadingRoute(true);

      try {
        const payload = await requestRoute(selectedHotspotId, destinationId);
        setRoutePoints(payload.pointsPercent ?? []);
      } catch (error) {
        console.error("Falha ao solicitar rota:", error);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [cancelAutoClose, cancelClosingAnim, selectedHotspotId]
  );

  const handleCancelRoute = useCallback(() => {
    cancelAutoClose();
    cancelClosingAnim();
    setRoutePoints([]);
    setIsInfoClosing(false);
  }, [cancelAutoClose, cancelClosingAnim]);

  // ── Preload de imagens ──
  useEffect(() => {
    if (preloadedRef.current) return;
    layers.forEach((l) => {
      const img = new Image();
      img.src = l.imagePath;
    });
    preloadedRef.current = true;
  }, []);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      cancelAutoClose();
      cancelClosingAnim();
    };
  }, [cancelAutoClose, cancelClosingAnim]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {/* ── Sidebar esquerda ── */}
      <div className="pointer-events-none absolute left-3 top-3 z-[60] flex flex-col gap-3 sm:left-4 sm:top-4 sm:gap-3 md:left-6 md:top-6 md:gap-4">
        {/* Logo */}
        <GlassSurface className="pointer-events-auto w-44 px-4 py-3 shadow-soft sm:w-48 sm:px-5 sm:py-3 md:w-48 md:px-5 md:py-4">
          <div className="leading-tight">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">Bem-vindo ao</span>
            <h1 className="bg-gradient-to-r from-[#32A041] via-[#32A041] to-white bg-clip-text text-2xl font-extrabold uppercase tracking-wide text-transparent sm:text-3xl">
              LOCAIFF
            </h1>
          </div>
        </GlassSurface>

        {/* Seletor de camadas */}
        <GlassSurface className="pointer-events-auto w-44 p-3 shadow-soft sm:w-48 sm:p-3 md:w-48 md:p-4">
          <LayerSelector
            layers={layers}
            currentLayerId={currentLayerId}
            onChange={handleLayerChange}
          />
        </GlassSurface>

        {/* Alto contraste */}
        <div className="pointer-events-auto">
          <AccessibilityToggle
            highContrast={highContrast}
            onToggle={toggleHighContrast}
          />
        </div>
      </div>

      {/* ── Mapa ── */}
      <div className="absolute inset-0">
        <MapViewer
          key={viewerKey}
          layer={currentLayer}
          hotspots={visibleHotspots}
          allHotspots={hotspotsData}
          selectedHotspotId={selectedHotspotId}
          onHotspotSelect={handleHotspotSelect}
          routePoints={visibleRoutePoints}
          transformRef={transformRef}
          layers={layers}
          onLayerChange={handleLayerChange}
        />
      </div>

      {/* ── Loading overlay de rota ── */}
      {isLoadingRoute && (
        <div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center">
          <div className="glass-surface animate-fade-in rounded-2xl px-8 py-4 text-sm font-medium text-white shadow-glow">
            Calculando rota…
          </div>
        </div>
      )}

      {/* ── Painel lateral (desktop/tablet) / bottom sheet (mobile) ── */}
      {selectedHotspot && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[55] flex items-end justify-center p-3 sm:inset-x-auto sm:top-0 sm:right-4 sm:bottom-0 sm:flex sm:items-center sm:justify-end sm:p-0 md:right-6">
          <div className="pointer-events-auto w-full max-w-sm sm:w-auto sm:max-w-none" style={{ width: "var(--info-panel-width)" }}>
            <InfoPanel
              hotspot={selectedHotspot}
              onClose={handleClosePanel}
              onRequestRoute={handleRequestRoute}
              onCancelRoute={handleCancelRoute}
              hasActiveRoute={routePoints.length > 0}
              isClosing={isInfoClosing}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;