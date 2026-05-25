import { useMemo, type ReactNode } from 'react';

interface ImagePanelProps {
  title: string;
  canvas: HTMLCanvasElement | null;
  metrics?: {
    psnr?: number;
    mse?: number;
    compressionRatio?: number;
    bitRate?: number;
  };
  reserveMetrics?: boolean;
  compare?: boolean;
  emptyContent?: ReactNode;
  inverted?: boolean;
  large?: boolean;
}

export function ImagePanel({
  title,
  canvas,
  metrics,
  reserveMetrics = false,
  compare = false,
  emptyContent,
  inverted = false,
  large = false,
}: ImagePanelProps) {
  const imageSrc = useMemo(
    () => (canvas ? canvas.toDataURL('image/png') : null),
    [canvas],
  );

  return (
    <div
      className={`panel ${inverted ? 'panel--inverted' : ''} ${large ? 'panel--large' : ''} ${compare ? 'panel--compare' : ''}`}
    >
      <div className="panel__header">
        <h3>{title}</h3>
      </div>
      <div className="panel__body">
        <div className="panel__frame">
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="panel__image" />
          ) : emptyContent ? (
            <div className="panel__placeholder panel__placeholder--rich">{emptyContent}</div>
          ) : (
            <div className="panel__placeholder">等待上传图像</div>
          )}
        </div>
      </div>
      {(metrics || reserveMetrics) && (
        <div className="panel__metrics">
          {(metrics?.psnr !== undefined || reserveMetrics) && (
            <MetricCell
              label="PSNR"
              value={
                metrics?.psnr !== undefined
                  ? `${metrics.psnr === Infinity ? '∞' : metrics.psnr.toFixed(2)} dB`
                  : '—'
              }
            />
          )}
          {(metrics?.mse !== undefined || reserveMetrics) && (
            <MetricCell
              label="MSE"
              value={metrics?.mse !== undefined ? metrics.mse.toFixed(2) : '—'}
            />
          )}
          {(metrics?.compressionRatio !== undefined || reserveMetrics) && (
            <MetricCell
              label="压缩比"
              value={
                metrics?.compressionRatio !== undefined
                  ? `${metrics.compressionRatio.toFixed(1)} : 1`
                  : '—'
              }
            />
          )}
          {(metrics?.bitRate !== undefined || reserveMetrics) && (
            <MetricCell
              label="码率"
              value={
                metrics?.bitRate !== undefined
                  ? `${metrics.bitRate.toFixed(3)} bit/px`
                  : '—'
              }
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
