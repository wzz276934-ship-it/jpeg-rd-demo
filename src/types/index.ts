export type Matrix8x8 = number[][];

export interface HistogramBin {
  value: number;
  count: number;
  probability: number;
}

export interface SourceStats {
  histogram: HistogramBin[];
  entropy: number;
  mean: number;
  variance: number;
  stdDev: number;
  edgeDensity: number;
  contrast: number;
}

export interface RleSymbol {
  run: number;
  magnitude: number;
}

export interface HuffmanEntry {
  symbol: string;
  code: string;
  probability: number;
  codeLength: number;
}

export interface BlockDetail {
  blockRow: number;
  blockCol: number;
  pixels: Matrix8x8;
  dctCoeffs: Matrix8x8;
  quantMatrix: Matrix8x8;
  quantizedCoeffs: Matrix8x8;
  zigzag: number[];
  rle: RleSymbol[];
}

export interface EncodingStats {
  zigzag: number[];
  rle: RleSymbol[];
  huffmanTable: HuffmanEntry[];
  averageCodeLength: number;
  totalBits: number;
  bitRate: number;
  compressionRatio: number;
}

export interface QualityMetrics {
  mse: number;
  psnr: number;
}

export interface RdPoint {
  quality: number;
  rate: number;
  distortion: number;
  psnr: number;
}

export interface PipelineResult {
  width: number;
  height: number;
  originalGray: Float32Array;
  reconstructedGray: Float32Array;
  sourceStats: SourceStats;
  selectedBlock: BlockDetail;
  encoding: EncodingStats;
  metrics: QualityMetrics;
  rdCurve: RdPoint[];
  theoreticalRd: RdPoint[];
}

export type TabId = 'compare' | 'dct' | 'quantize' | 'encode' | 'rd';
