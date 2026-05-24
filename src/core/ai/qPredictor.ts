import type { SourceStats } from '../../types';

const WEIGHTS = {
  bias: 42,
  entropy: 8.5,
  variance: -0.012,
  edgeDensity: 180,
  contrast: 25,
  stdDev: -0.08,
};

export function extractFeatures(stats: SourceStats): number[] {
  return [
    stats.entropy,
    stats.variance,
    stats.edgeDensity,
    stats.contrast,
    stats.stdDev,
    stats.mean / 255,
  ];
}

export function predictQuality(stats: SourceStats, targetPsnr?: number): number {
  const [entropy, variance, edgeDensity, contrast, stdDev, meanNorm] =
    extractFeatures(stats);

  let q =
    WEIGHTS.bias +
    WEIGHTS.entropy * entropy +
    WEIGHTS.variance * variance +
    WEIGHTS.edgeDensity * edgeDensity +
    WEIGHTS.contrast * contrast +
    WEIGHTS.stdDev * stdDev +
    meanNorm * 10;

  if (targetPsnr !== undefined) {
    const psnrOffset = (targetPsnr - 32) * 2.5;
    q += psnrOffset;
  }

  return Math.max(1, Math.min(100, Math.round(q)));
}

export function predictQualityForTargetPsnr(
  stats: SourceStats,
  targetPsnr: number,
): number {
  return predictQuality(stats, targetPsnr);
}
