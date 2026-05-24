import { MatrixHeatmap } from '../ui/MatrixHeatmap';
import type { PipelineResult } from '../../types';

interface QuantTabProps {
  result: PipelineResult;
  quality: number;
}

export function QuantTab({ result, quality }: QuantTabProps) {
  const zeroCount = result.selectedBlock.quantizedCoeffs
    .flat()
    .filter((v) => v === 0).length;

  return (
    <div className="stack">
      <div className="inverted-banner">
        <p className="inverted-banner__label">量化质量因子</p>
        <p className="inverted-banner__value">Q = {quality}</p>
        <p className="inverted-banner__desc">
          当前块 {zeroCount}/64 个系数被量化为 0 — 量化引入失真 d(x, x̂)（§6.1）
        </p>
      </div>

      <div className="matrix-grid matrix-grid--triple">
        <MatrixHeatmap
          matrix={result.selectedBlock.dctCoeffs}
          title="DCT 系数（量化前）"
          decimals={1}
          large
        />
        <MatrixHeatmap
          matrix={result.selectedBlock.quantMatrix}
          title="量化矩阵"
          decimals={0}
          large
        />
        <MatrixHeatmap
          matrix={result.selectedBlock.quantizedCoeffs}
          title="量化后系数"
          highlightZeros
          decimals={0}
          large
        />
      </div>

      <div className="formula-grid">
        <div className="formula-card">
          <p className="formula-card__label">量化公式</p>
          <p className="formula-card__expr">Q̂(u,v) = round(F(u,v) / Q(u,v))</p>
        </div>
        <div className="formula-card">
          <p className="formula-card__label">反量化</p>
          <p className="formula-card__expr">F̂(u,v) = Q̂(u,v) × Q(u,v)</p>
        </div>
        <div className="formula-card">
          <p className="formula-card__label">失真测度</p>
          <p className="formula-card__expr">d(x, x̂) = ||x - x̂||²</p>
        </div>
      </div>
    </div>
  );
}
