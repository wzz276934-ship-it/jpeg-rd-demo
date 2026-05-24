import { useMemo } from 'react';
import { BLOCK_SIZE } from '../../core/jpeg/constants';

interface BlockPickerOverlayProps {
  canvas: HTMLCanvasElement;
  blocksX: number;
  blocksY: number;
  selectedBlockRow: number;
  selectedBlockCol: number;
  onBlockSelect: (row: number, col: number) => void;
}

export function BlockPickerOverlay({
  canvas,
  blocksX,
  blocksY,
  selectedBlockRow,
  selectedBlockCol,
  onBlockSelect,
}: BlockPickerOverlayProps) {
  const imageSrc = useMemo(
    () => canvas.toDataURL('image/png'),
    [canvas],
  );

  return (
    <div
      className="block-picker-overlay"
      style={{ aspectRatio: `${canvas.width} / ${canvas.height}` }}
    >
      <img
        src={imageSrc}
        alt="原图分块预览"
        className="block-picker-overlay__image"
        width={canvas.width}
        height={canvas.height}
        draggable={false}
      />
      <div
        className="block-picker-overlay__grid"
        style={{
          gridTemplateColumns: `repeat(${blocksX}, 1fr)`,
          gridTemplateRows: `repeat(${blocksY}, 1fr)`,
        }}
      >
        {Array.from({ length: blocksY }, (_, y) =>
          Array.from({ length: blocksX }, (_, x) => {
            const selected = y === selectedBlockRow && x === selectedBlockCol;
            return (
              <button
                key={`${y}-${x}`}
                type="button"
                onClick={() => onBlockSelect(y, x)}
                className={`block-picker-overlay__cell ${selected ? 'block-picker-overlay__cell--active' : ''}`}
                aria-label={`选择块 ${y}, ${x}`}
                aria-pressed={selected}
              />
            );
          }),
        )}
      </div>
      <div className="block-picker-overlay__hint">
        每格 = {BLOCK_SIZE}×{BLOCK_SIZE} 像素 · 当前块 ({selectedBlockRow}, {selectedBlockCol})
      </div>
    </div>
  );
}
