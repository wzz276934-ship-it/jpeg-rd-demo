import { BLOCK_SIZE } from './constants';
import type { Matrix8x8 } from '../../types';

const COS_TABLE: number[][] = Array.from({ length: BLOCK_SIZE }, (_, u) =>
  Array.from({ length: BLOCK_SIZE }, (_, x) =>
    Math.cos(((2 * x + 1) * u * Math.PI) / (2 * BLOCK_SIZE)),
  ),
);

function alpha(u: number): number {
  return u === 0 ? 1 / Math.sqrt(2) : 1;
}

export function dct2(block: Matrix8x8): Matrix8x8 {
  const result: Matrix8x8 = Array.from({ length: BLOCK_SIZE }, () =>
    Array(BLOCK_SIZE).fill(0),
  );

  for (let u = 0; u < BLOCK_SIZE; u++) {
    for (let v = 0; v < BLOCK_SIZE; v++) {
      let sum = 0;
      for (let x = 0; x < BLOCK_SIZE; x++) {
        for (let y = 0; y < BLOCK_SIZE; y++) {
          sum +=
            block[x][y] *
            COS_TABLE[u][x] *
            COS_TABLE[v][y];
        }
      }
      result[u][v] = 0.25 * alpha(u) * alpha(v) * sum;
    }
  }

  return result;
}

export function idct2(coeffs: Matrix8x8): Matrix8x8 {
  const result: Matrix8x8 = Array.from({ length: BLOCK_SIZE }, () =>
    Array(BLOCK_SIZE).fill(0),
  );

  for (let x = 0; x < BLOCK_SIZE; x++) {
    for (let y = 0; y < BLOCK_SIZE; y++) {
      let sum = 0;
      for (let u = 0; u < BLOCK_SIZE; u++) {
        for (let v = 0; v < BLOCK_SIZE; v++) {
          sum +=
            alpha(u) *
            alpha(v) *
            coeffs[u][v] *
            COS_TABLE[u][x] *
            COS_TABLE[v][y];
        }
      }
      result[x][y] = 0.25 * sum;
    }
  }

  return result;
}

export function extractBlock(
  pixels: Float32Array,
  width: number,
  blockRow: number,
  blockCol: number,
): Matrix8x8 {
  const block: Matrix8x8 = Array.from({ length: BLOCK_SIZE }, () =>
    Array(BLOCK_SIZE).fill(128),
  );

  for (let i = 0; i < BLOCK_SIZE; i++) {
    for (let j = 0; j < BLOCK_SIZE; j++) {
      const row = blockRow * BLOCK_SIZE + i;
      const col = blockCol * BLOCK_SIZE + j;
      if (row < width && col < width) {
        block[i][j] = pixels[row * width + col] - 128;
      }
    }
  }

  return block;
}

export function placeBlock(
  pixels: Float32Array,
  width: number,
  blockRow: number,
  blockCol: number,
  block: Matrix8x8,
): void {
  for (let i = 0; i < BLOCK_SIZE; i++) {
    for (let j = 0; j < BLOCK_SIZE; j++) {
      const row = blockRow * BLOCK_SIZE + i;
      const col = blockCol * BLOCK_SIZE + j;
      if (row < width && col < width) {
        pixels[row * width + col] = Math.max(
          0,
          Math.min(255, block[i][j] + 128),
        );
      }
    }
  }
}
