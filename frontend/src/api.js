import axios from "axios";
import layers from "./data/layers";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

const http = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

export const KIOSK_POSITION = {
  layerId: "ground",
  xPercent: 50,
  yPercent: 85,
};

export function layerIdToFloor(layerId) {
  const idx = layers.findIndex((l) => l.id === layerId);
  return idx >= 0 ? idx : 0;
}

export function floorToLayerId(floor) {
  return layers[floor]?.id ?? layers[0].id;
}

export async function requestRoute(_originId, destinationCode) {
  try {
    const { data } = await http.post("/routes", {
      destinationCode,
      onlyAccessible: false,
    });
    return data;
  } catch (err) {
    return {
      routeId: "mock",
      pointsPercent: [
        { xPercent: KIOSK_POSITION.xPercent, yPercent: KIOSK_POSITION.yPercent, floor: 0 },
        { xPercent: 50, yPercent: 75, floor: 0 },
        { xPercent: 50, yPercent: 65, floor: 0 },
        { xPercent: 50, yPercent: 55, floor: 0 },
        { xPercent: 50, yPercent: 45, floor: 0 },
      ],
      distanciaTotal: 40,
    };
  }
}

export async function fetchNodes(andar) {
  const params = andar != null ? { andar } : {};
  const { data } = await http.get("/nodes", { params });
  return data;
}

export default http;
