import type { Matrix8x8 } from '../../types';

export function quantizeBlock(
  dctCoeffs: Matrix8x8,
  quantMatrix: Matrix8x8,
): Matrix8x8 {
  return dctCoeffs.map((row, i) =>
    row.map((coeff, j) => Math.round(coeff / quantMatrix[i][j])),
  );
}

export function dequantizeBlock(
  quantizedCoeffs: Matrix8x8,
  quantMatrix: Matrix8x8,
): Matrix8x8 {
  return quantizedCoeffs.map((row, i) =>
    row.map((coeff, j) => coeff * quantMatrix[i][j]),
  );
}
