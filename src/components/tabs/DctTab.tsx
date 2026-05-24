import { MatrixHeatmap } from '../ui/MatrixHeatmap';
import { HistogramChart } from '../ui/HistogramChart';
import { BlockPickerOverlay } from '../ui/BlockPickerOverlay';
import type { PipelineResult } from '../../types';
import { BLOCK_SIZE } from '../../core/jpeg/constants';

interface DctTabProps {
  result: PipelineResult;
  originalCanvas: HTMLCanvasElement;
  selectedBlockRow: number;
  selectedBlockCol: number;
  onBlockSelect: (row: number, col: number) => void;
}

export function DctTab({
  result,
  originalCanvas,
  selectedBlockRow,
  selectedBlockCol,
  onBlockSelect,
}: DctTabProps) {
  const blocksX = result.width / BLOCK_SIZE;
  const blocksY = result.height / BLOCK_SIZE;

  return (
    <div className="stack">
      <HistogramChart
        histogram={result.sourceStats.histogram}
        entropy={result.sourceStats.entropy}
      />

      <div className="matrix-grid matrix-grid--triple">
        <div className="section-card">
          <div className="section-card__header">
            <h4>8×8 分块 DCT 变换</h4>
            <p className="section-card__desc">
              在原图上点击块选择 — 块 ({selectedBlockRow}, {selectedBlockCol}) — 变换编码将能量集中到少数系数（§6.6.1）
            </p>
          </div>
          <div className="section-card__body">
            <BlockPickerOverlay
              canvas={originalCanvas}
              blocksX={blocksX}
              blocksY={blocksY}
              selectedBlockRow={selectedBlockRow}
              selectedBlockCol={selectedBlockCol}
              onBlockSelect={onBlockSelect}
            />
          </div>
        </div>

        <MatrixHeatmap
          matrix={result.selectedBlock.pixels}
          title="原始像素矩阵"
          decimals={0}
          large
        />
        <MatrixHeatmap
          matrix={result.selectedBlock.dctCoeffs}
          title="DCT 系数矩阵"
          decimals={1}
          large
        />
      </div>

      <p className="pull-quote">
        左上角 DC 系数最大，右下角高频系数趋近于 0 — 这正是 JPEG 量化能够高效压缩的物理基础。
      </p>
    </div>
  );
}
