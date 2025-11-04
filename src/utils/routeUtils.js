export function percentPointsToPixels(pointsPercent = [], width = 0, height = 0) {
  if (!width || !height) {
    return [];
  }

  return pointsPercent.map((point) => ({
    x: (point.xPercent / 100) * width,
    y: (point.yPercent / 100) * height
  }));
}

export function buildRoutePath(pointsPercent = []) {
  if (!pointsPercent.length) {
    return "";
  }

  const [first, ...rest] = pointsPercent;
  const segments = rest.map(
    (point) => `L ${point.xPercent} ${point.yPercent}`
  );

  return [`M ${first.xPercent} ${first.yPercent}`, ...segments].join(" ");
}

// TODO: implementar algoritmo de rotas (Dijkstra/A*)
// export function calculateSmartRoute(graph, originId, destinationId) {
//   throw new Error("Não implementado. Integrar com backend ou escrever algoritmo local.");
// }
