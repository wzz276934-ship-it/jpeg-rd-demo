import { BLOCK_SIZE, scaleQuantMatrix } from './constants';
import { dct2, extractBlock, idct2, placeBlock } from './dct';
import { computeSourceStats, theoreticalRateDistortion } from './entropy';
import {
  buildHuffmanTable,
  computeAverageCodeLength,
  computeSymbolEntropy,
  estimateTotalBits,
} from './huffman';
import { dequantizeBlock, quantizeBlock } from './quantize';
import { runLengthEncode, zigzagScan } from './zigzag';
import type {
  BlockDetail,
  EncodingStats,
  PipelineResult,
  QualityMetrics,
  RdPoint,
  RleSymbol,
} from '../../types';

function padToBlockSize(size: number): number {
  return Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
}

export function imageDataToGray(imageData: ImageData): {
  pixels: Float32Array;
  width: number;
  height: number;
} {
  const { width, height, data } = imageData;
  const paddedW = padToBlockSize(width);
  const paddedH = padToBlockSize(height);
  const pixels = new Float32Array(paddedW * paddedH).fill(128);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      pixels[y * paddedW + x] = gray;
    }
  }

  return { pixels, width: paddedW, height: paddedH };
}

function computeMetrics(
  original: Float32Array,
  reconstructed: Float32Array,
): QualityMetrics {
  let mse = 0;
  for (let i = 0; i < original.length; i++) {
    const diff = original[i] - reconstructed[i];
    mse += diff * diff;
  }
  mse /= original.length;
  const psnr = mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
  return { mse, psnr };
}

function processBlock(
  pixels: Float32Array,
  width: number,
  height: number,
  blockRow: number,
  blockCol: number,
  quantMatrix: number[][],
): {
  detail: BlockDetail;
  rle: RleSymbol[];
} {
  const blockPixels = extractBlock(pixels, width, height, blockRow, blockCol);
  const dctCoeffs = dct2(blockPixels);
  const quantizedCoeffs = quantizeBlock(dctCoeffs, quantMatrix);
  const zigzag = zigzagScan(quantizedCoeffs);
  const rle = runLengthEncode(zigzag);

  return {
    detail: {
      blockRow,
      blockCol,
      pixels: blockPixels.map((row) => row.map((v) => v + 128)),
      dctCoeffs,
      quantMatrix,
      quantizedCoeffs,
      zigzag,
      rle,
    },
    rle,
  };
}

function reconstructImage(
  pixels: Float32Array,
  width: number,
  height: number,
  quantMatrix: number[][],
): Float32Array {
  const output = new Float32Array(pixels.length);
  const blocksX = width / BLOCK_SIZE;
  const blocksY = height / BLOCK_SIZE;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const blockPixels = extractBlock(pixels, width, height, by, bx);
      const dctCoeffs = dct2(blockPixels);
      const quantized = quantizeBlock(dctCoeffs, quantMatrix);
      const dequantized = dequantizeBlock(quantized, quantMatrix);
      const spatial = idct2(dequantized);
      placeBlock(output, width, height, by, bx, spatial);
    }
  }

  return output;
}

export function runPipeline(
  pixels: Float32Array,
  width: number,
  height: number,
  quality: number,
  selectedBlockRow = 0,
  selectedBlockCol = 0,
): PipelineResult {
  const sourceStats = computeSourceStats(pixels, width, height);
  const quantMatrix = scaleQuantMatrix(quality);
  const blocksX = width / BLOCK_SIZE;
  const blocksY = height / BLOCK_SIZE;

  const allRle: RleSymbol[] = [];
  let selectedBlock = processBlock(pixels, width, height, 0, 0, quantMatrix).detail;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const { detail, rle } = processBlock(
        pixels,
        width,
        height,
        by,
        bx,
        quantMatrix,
      );
      allRle.push(...rle);
      if (by === selectedBlockRow && bx === selectedBlockCol) {
        selectedBlock = detail;
      }
    }
  }

  const huffmanTableFull = buildHuffmanTable(allRle);
  const symbolEntropy = computeSymbolEntropy(allRle);
  const averageCodeLength = computeAverageCodeLength(allRle, huffmanTableFull);
  const totalBits = estimateTotalBits(allRle, huffmanTableFull);
  const bitRate = totalBits / pixels.length;
  const rawBits = pixels.length * 8;
  const compressionRatio = rawBits / Math.max(totalBits, 1);

  const encoding: EncodingStats = {
    zigzag: selectedBlock.zigzag,
    rle: selectedBlock.rle,
    huffmanTable: huffmanTableFull.slice(0, 16),
    symbolEntropy,
    averageCodeLength,
    totalBits,
    bitRate,
    compressionRatio,
  };

  const reconstructedGray = reconstructImage(pixels, width, height, quantMatrix);
  const metrics = computeMetrics(pixels, reconstructedGray);

  return {
    width,
    height,
    originalGray: pixels,
    reconstructedGray,
    sourceStats,
    selectedBlock,
    encoding,
    metrics,
    rdCurve: [],
    theoreticalRd: [],
  };
}

export function computeRdCurve(
  pixels: Float32Array,
  width: number,
  height: number,
  steps = 20,
): { rdCurve: RdPoint[]; theoreticalRd: RdPoint[] } {
  const qualities = Array.from({ length: steps }, (_, i) =>
    Math.round(1 + (99 * i) / (steps - 1)),
  );

  const rdCurve: RdPoint[] = qualities.map((quality) => {
    const quantMatrix = scaleQuantMatrix(quality);
    const reconstructed = reconstructImage(pixels, width, height, quantMatrix);
    const { mse, psnr } = computeMetrics(pixels, reconstructed);

    const blocksX = width / BLOCK_SIZE;
    const blocksY = height / BLOCK_SIZE;
    const allRle: RleSymbol[] = [];
    for (let by = 0; by < blocksY; by++) {
      for (let bx = 0; bx < blocksX; bx++) {
        const { rle } = processBlock(pixels, width, height, by, bx, quantMatrix);
        allRle.push(...rle);
      }
    }
    const table = buildHuffmanTable(allRle);
    const totalBits = estimateTotalBits(allRle, table);
    const rate = totalBits / pixels.length;

    return { quality, rate, distortion: mse, psnr };
  });

  const stats = computeSourceStats(pixels, width, height);
  const maxDistortion = Math.max(...rdCurve.map((p) => p.distortion));
  const theoretical = theoreticalRateDistortion(
    stats.variance,
    maxDistortion * 1.2,
  );

  const theoreticalRd: RdPoint[] = theoretical.map((p) => ({
    quality: 0,
    rate: p.rate,
    distortion: p.distortion,
    psnr: p.distortion > 0 ? 10 * Math.log10((255 * 255) / p.distortion) : 100,
  }));

  return { rdCurve, theoreticalRd };
}

export function grayToCanvas(
  pixels: Float32Array,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < pixels.length; i++) {
    const val = Math.max(0, Math.min(255, Math.round(pixels[i])));
    imageData.data[i * 4] = val;
    imageData.data[i * 4 + 1] = val;
    imageData.data[i * 4 + 2] = val;
    imageData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function createDemoImageData(size = 256): ImageData {
  const data = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const edge = Math.abs(Math.sin(x * 0.08) * Math.cos(y * 0.08)) * 80;
      const gray = Math.max(
        0,
        Math.min(255, Math.round(128 - dist * 0.35 + edge)),
      );
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255;
    }
  }

  return new ImageData(data, size, size);
}

export function loadImageFromFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxSize = 512;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(imageData);
    };
    img.onerror = reject;
    img.src = url;
  });
}
