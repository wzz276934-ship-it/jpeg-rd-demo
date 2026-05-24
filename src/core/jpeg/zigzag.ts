import { ZIGZAG_ORDER } from './constants';
import type { Matrix8x8, RleSymbol } from '../../types';

export function zigzagScan(block: Matrix8x8): number[] {
  return ZIGZAG_ORDER.map(([row, col]) => block[row][col]);
}

export function zigzagToBlock(values: number[]): Matrix8x8 {
  const block: Matrix8x8 = Array.from({ length: 8 }, () => Array(8).fill(0));
  ZIGZAG_ORDER.forEach(([row, col], index) => {
    block[row][col] = values[index] ?? 0;
  });
  return block;
}

export function runLengthEncode(zigzag: number[]): RleSymbol[] {
  const symbols: RleSymbol[] = [];
  let zeroRun = 0;

  for (let i = 1; i < zigzag.length; i++) {
    const value = zigzag[i];
    if (value === 0) {
      zeroRun++;
      if (zeroRun === 16) {
        symbols.push({ run: 15, magnitude: 0 });
        zeroRun = 0;
      }
    } else {
      symbols.push({ run: zeroRun, magnitude: value });
      zeroRun = 0;
    }
  }

  if (zeroRun > 0) {
    symbols.push({ run: zeroRun, magnitude: 0 });
  }

  symbols.unshift({ run: 0, magnitude: zigzag[0] });
  return symbols;
}

export function estimateSymbolBits(magnitude: number): number {
  if (magnitude === 0) return 0;
  const absVal = Math.abs(magnitude);
  return Math.floor(Math.log2(absVal)) + 1;
}
