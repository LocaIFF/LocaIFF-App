import axios from "axios";

const API_BASE = "http://localhost:3001/api";

const http = axios.create({
  baseURL: API_BASE,
  timeout: 5000
});

export async function fetchHotspotsFromApi(layerId) {
  console.info("Simulando fetchHotspotsFromApi para layer:", layerId);
  return Promise.resolve({ data: [] });
}

export async function requestRoute(originId, destinationId) {
  console.info("Simulando requestRoute", { originId, destinationId });
  return Promise.resolve({
    routeId: "rota-mockada",
    pointsPercent: [
      { xPercent: 10, yPercent: 80 },
      { xPercent: 25, yPercent: 60 },
      { xPercent: 40, yPercent: 40 },
      { xPercent: 55, yPercent: 30 },
      { xPercent: 70, yPercent: 20 }
    ]
  });
}

export default http;
