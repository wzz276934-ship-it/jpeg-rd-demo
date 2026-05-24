function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function zoomDomainAround(
  domain: [number, number],
  center: number,
  cursorRatio: number,
  factor: number,
  minSpan: number,
  bounds: [number, number],
): [number, number] {
  const [boundMin, boundMax] = bounds;
  const span = Math.max(minSpan, domain[1] - domain[0]);
  const newSpan = clamp(span * factor, minSpan, boundMax - boundMin);

  let newMin = center - cursorRatio * newSpan;
  let newMax = center + (1 - cursorRatio) * newSpan;

  if (newMin < boundMin) {
    newMin = boundMin;
    newMax = boundMin + newSpan;
  }
  if (newMax > boundMax) {
    newMax = boundMax;
    newMin = boundMax - newSpan;
  }

  newMin = clamp(newMin, boundMin, boundMax - minSpan);
  newMax = clamp(newMax, boundMin + minSpan, boundMax);

  if (newMax - newMin < minSpan) {
    const mid = clamp(center, boundMin + minSpan / 2, boundMax - minSpan / 2);
    newMin = mid - minSpan / 2;
    newMax = mid + minSpan / 2;
  }

  return [newMin, newMax];
}

export function panDomain(
  domain: [number, number],
  delta: number,
  bounds: [number, number],
): [number, number] {
  const [boundMin, boundMax] = bounds;
  const span = domain[1] - domain[0];
  let newMin = domain[0] + delta;
  let newMax = domain[1] + delta;

  if (newMin < boundMin) {
    newMin = boundMin;
    newMax = boundMin + span;
  }
  if (newMax > boundMax) {
    newMax = boundMax;
    newMin = boundMax - span;
  }

  return [newMin, newMax];
}

export interface ChartPlotOffset {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type WheelZoomZone = 'plot' | 'x-axis' | 'y-axis' | 'none';

export function getWheelZoomZone(
  chartX: number,
  chartY: number,
  plot: ChartPlotOffset,
): WheelZoomZone {
  const plotRight = plot.left + plot.width;
  const plotBottom = plot.top + plot.height;

  if (
    chartX >= plot.left &&
    chartX <= plotRight &&
    chartY >= plot.top &&
    chartY <= plotBottom
  ) {
    return 'plot';
  }

  if (chartX < plot.left && chartY >= plot.top && chartY <= plotBottom) {
    return 'y-axis';
  }

  if (chartY > plotBottom && chartX >= plot.left && chartX <= plotRight) {
    return 'x-axis';
  }

  return 'none';
}

export const RD_CHART_MARGIN = {
  top: 12,
  right: 20,
  left: 56,
  bottom: 28,
};

export const RD_X_BOUNDS: [number, number] = [0, 800];
export const RD_MIN_X_SPAN = 20;
export const RD_MIN_Y_SPAN = 0.08;

export function computeYBounds(
  experimental: { rate: number; distortion: number }[],
  theoretical: { rate: number; distortion: number }[],
): [number, number] {
  const expMax = Math.max(...experimental.map((p) => p.rate), 0.1);
  const theoryMax = Math.max(
    ...theoretical
      .filter((p) => p.distortion <= RD_X_BOUNDS[1])
      .map((p) => p.rate),
    0,
  );
  const maxRate = Math.max(expMax, theoryMax) * 1.15;
  return [0, Math.max(maxRate, 0.5)];
}
