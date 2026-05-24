import { useMemo } from 'react';

interface ImagePanelProps {
  title: string;
  canvas: HTMLCanvasElement | null;
  metrics?: {
    psnr?: number;
    mse?: number;
    compressionRatio?: number;
    bitRate?: number;
  };
  inverted?: boolean;
  large?: boolean;
}

export function ImagePanel({
  title,
  canvas,
  metrics,
  inverted = false,
  large = false,
}: ImagePanelProps) {
  const imageSrc = useMemo(
    () => (canvas ? canvas.toDataURL('image/png') : null),
    [canvas],
  );

  return (
    <div className={`panel ${inverted ? 'panel--inverted' : ''} ${large ? 'panel--large' : ''}`}>
      <div className="panel__header">
        <h3>{title}</h3>
      </div>
      <div className="panel__body">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="panel__image" />
        ) : (
          <div className="panel__placeholder">等待上传图像</div>
        )}
      </div>
      {metrics && (
        <div className="panel__metrics">
          {metrics.psnr !== undefined && (
            <MetricCell
              label="PSNR"
              value={`${metrics.psnr === Infinity ? '∞' : metrics.psnr.toFixed(2)} dB`}
            />
          )}
          {metrics.mse !== undefined && (
            <MetricCell label="MSE" value={metrics.mse.toFixed(2)} />
          )}
          {metrics.compressionRatio !== undefined && (
            <MetricCell
              label="压缩比"
              value={`${metrics.compressionRatio.toFixed(1)} : 1`}
            />
          )}
          {metrics.bitRate !== undefined && (
            <MetricCell
              label="码率"
              value={`${metrics.bitRate.toFixed(3)} bit/px`}
            />
          )}
        </div>
      )}
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel__metric">
      <p className="panel__metric-label">{label}</p>
      <p className="panel__metric-value">{value}</p>
    </div>
  );
}
