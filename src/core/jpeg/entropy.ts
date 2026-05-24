import type { HistogramBin, SourceStats } from '../../types';

export function computeSourceStats(
  pixels: Float32Array,
  width: number,
  height: number,
): SourceStats {
  const histogram = new Array(256).fill(0);
  let sum = 0;

  for (let i = 0; i < pixels.length; i++) {
    const value = Math.max(0, Math.min(255, Math.round(pixels[i])));
    histogram[value]++;
    sum += pixels[i];
  }

  const total = pixels.length;
  const mean = sum / total;

  let varianceSum = 0;
  let edgeCount = 0;

  for (let i = 0; i < pixels.length; i++) {
    varianceSum += (pixels[i] - mean) ** 2;
    const x = i % width;
    const y = Math.floor(i / width);
    if (x < width - 1) {
      const grad = Math.abs(pixels[i + 1] - pixels[i]);
      if (grad > 15) edgeCount++;
    }
    if (y < height - 1) {
      const grad = Math.abs(pixels[i + width] - pixels[i]);
      if (grad > 15) edgeCount++;
    }
  }

  const variance = varianceSum / total;
  const stdDev = Math.sqrt(variance);

  let entropy = 0;
  const bins: HistogramBin[] = histogram.map((count, value) => {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
    return { value, count, probability };
  });

  const edgeDensity = edgeCount / total;
  const contrast = stdDev / 128;

  return {
    histogram: bins.filter((b) => b.count > 0),
    entropy,
    mean,
    variance,
    stdDev,
    edgeDensity,
    contrast,
  };
}

export function theoreticalRateDistortion(
  variance: number,
  maxDistortion: number,
  steps = 50,
): { rate: number; distortion: number }[] {
  const points: { rate: number; distortion: number }[] = [];
  const minD = Math.max(variance * 0.001, 0.5);

  for (let i = 0; i <= steps; i++) {
    const distortion = minD + ((maxDistortion - minD) * i) / steps;
    const rate = variance > distortion ? 0.5 * Math.log2(variance / distortion) : 0;
    points.push({ rate: Math.max(0, rate), distortion });
  }

  return points;
}
