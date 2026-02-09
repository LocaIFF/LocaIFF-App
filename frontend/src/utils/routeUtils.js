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