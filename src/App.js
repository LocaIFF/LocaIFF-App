import React, { useMemo, useRef, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // novo estado para menu hambúrguer
  const transformRef = useRef(null);

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

  const handleLayerChange = (layerId) => {
    setCurrentLayerId(layerId);
    setSelectedHotspotId(null);
    setRoutePoints([]);
  };

  const handleHotspotSelect = (hotspotId) => {
    setSelectedHotspotId(hotspotId);
    // TODO: disparar aqui qualquer logging/analytics conforme necessidade
  };

  const handleClosePanel = () => {
    setSelectedHotspotId(null);
    setRoutePoints([]);
  };

  const handleRequestRoute = async (destinationId) => {
    if (!selectedHotspotId || !destinationId) {
      return;
    }

    try {
      // TODO: trocar origem fixa por seleção dinâmica (ex.: posição do usuário)
      const routePayload = await requestRoute(selectedHotspotId, destinationId);
      setRoutePoints(routePayload.pointsPercent ?? []);
    } catch (error) {
      // TODO: tratar erros de rede com UI (toast/snackbar)
      console.error("Falha ao solicitar rota simulada:", error);
    }
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <MapViewer
          layer={currentLayer}
          hotspots={hotspots}
          selectedHotspotId={selectedHotspotId}
          onHotspotSelect={handleHotspotSelect}
          routePoints={routePoints}
          transformRef={transformRef}
        />
      </div>
      <button
        type="button"
        className="absolute left-6 top-6 z-30 flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur-2xl shadow-soft"
        onClick={handleToggleMenu}
      >
        <span className="sr-only">Abrir menu</span>
        <span className="block h-[2px] w-6 rounded-full bg-white"></span>
        <span className="block h-[2px] w-6 rounded-full bg-white"></span>
        <span className="block h-[2px] w-6 rounded-full bg-white"></span>
      </button>
      {isMenuOpen && (
        <div className="absolute left-6 top-24 z-30 w-64 rounded-3xl border border-white/20 bg-white/20 p-4 text-white backdrop-blur-2xl shadow-soft">
          <p className="text-sm">
            TODO: preencher com navegação real (links, filtros, configurações, logout etc.).
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-end">
        <div className="pointer-events-auto flex max-w-sm flex-col gap-4 p-6">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-2xl shadow-soft">
            <LayerSelector
              layers={layers}
              currentLayerId={currentLayerId}
              onChange={handleLayerChange}
            />
          </div>
          <InfoPanel
            hotspot={selectedHotspot}
            onClose={handleClosePanel}
            onRequestRoute={handleRequestRoute}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
