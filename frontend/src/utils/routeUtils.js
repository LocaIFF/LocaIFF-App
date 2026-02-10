export function percentPointsToPixels(pointsPercent = [], width = 0, height = 0) {
  if (!width || !height) return [];
  return pointsPercent.map((point) => ({
    x: (point.xPercent / 100) * width,
    y: (point.yPercent / 100) * height,
  }));
}

export function buildRoutePath(pointsPercent = []) {
  if (!pointsPercent.length) return "";

  const [first, ...rest] = pointsPercent;
  const segments = rest.map((p) => `L ${p.xPercent} ${p.yPercent}`);
  return [`M ${first.xPercent} ${first.yPercent}`, ...segments].join(" ");
}

export function estimatePathLength(pointsPercent = []) {
  let length = 0;
  for (let i = 1; i < pointsPercent.length; i++) {
    const dx = pointsPercent[i].xPercent - pointsPercent[i - 1].xPercent;
    const dy = pointsPercent[i].yPercent - pointsPercent[i - 1].yPercent;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}