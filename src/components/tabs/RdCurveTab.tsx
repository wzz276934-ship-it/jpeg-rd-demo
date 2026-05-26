import { useMemo } from 'react';
import { RdCurveChart } from '../ui/RdCurveChart';
import type { PipelineResult, RdPoint } from '../../types';

interface RdCurveTabProps {
  result: PipelineResult;
  quality: number;
  rdCurve: RdPoint[];
  theoreticalRd: RdPoint[];
  onQualitySelect: (quality: number) => void;
}

export function RdCurveTab({
  result,
  quality,
  rdCurve,
  theoreticalRd,
  onQualitySelect,
}: RdCurveTabProps) {
  const chartData = useMemo(
    () => ({
      experimental: rdCurve.map((p) => ({
        rate: p.rate,
        distortion: p.distortion,
        quality: p.quality,
      })),
      theoretical: theoreticalRd.map((p) => ({
        rate: p.rate,
        distortion: p.distortion,
      })),
    }),
    [rdCurve, theoreticalRd],
  );

  const currentPoint = rdCurve.find((p) => p.quality === quality);

  return (
    <div className="stack">
      <div className="inverted-banner">
        <p className="inverted-banner__label">率失真函数 · 高斯无记忆信源（参考线）</p>
        <p className="inverted-banner__value" style={{ fontSize: '2rem' }}>
          R(D) = ½ log₂(σ²/D)
        </p>
        <p className="inverted-banner__desc">
          虚线为无记忆高斯信源参考线；真实图像因空间相关，JPEG 实验曲线常落在其下方 — 点击曲线上的点或表格行切换 Q 值
        </p>
      </div>

      <div className="section-card">
        <div className="chart-box chart-box--tall chart-box--rd">
          <RdCurveChart
            experimental={chartData.experimental}
            theoretical={chartData.theoretical}
            currentPoint={currentPoint}
            onPointSelect={onQualitySelect}
          />
        </div>
      </div>

      <div className="matrix-grid">
        <div className="section-card">
          <div className="section-card__header">
            <h4>当前工作点 Q = {quality}</h4>
          </div>
          <div className="panel__metrics">
            <div className="panel__metric">
              <p className="panel__metric-label">码率 R</p>
              <p className="panel__metric-value">
                {result.encoding.bitRate.toFixed(4)} bit/px
              </p>
            </div>
            <div className="panel__metric">
              <p className="panel__metric-label">失真 D</p>
              <p className="panel__metric-value">{result.metrics.mse.toFixed(2)}</p>
            </div>
            <div className="panel__metric">
              <p className="panel__metric-label">PSNR</p>
              <p className="panel__metric-value">
                {result.metrics.psnr === Infinity
                  ? '∞'
                  : `${result.metrics.psnr.toFixed(2)} dB`}
              </p>
            </div>
            <div className="panel__metric">
              <p className="panel__metric-label">压缩比</p>
              <p className="panel__metric-value">
                {result.encoding.compressionRatio.toFixed(1)} : 1
              </p>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card__header">
            <h4>R-D 曲线数据</h4>
          </div>
          <div
            className="section-card__body"
            style={{ maxHeight: '12rem', overflowY: 'auto', padding: 0 }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Q</th>
                  <th>R</th>
                  <th>D</th>
                  <th>PSNR</th>
                </tr>
              </thead>
              <tbody>
                {rdCurve.map((point) => (
                  <tr
                    key={point.quality}
                    style={{
                      cursor: 'pointer',
                      background:
                        point.quality === quality ? 'var(--color-muted)' : undefined,
                    }}
                    onClick={() => onQualitySelect(point.quality)}
                  >
                    <td>{point.quality}</td>
                    <td>{point.rate.toFixed(4)}</td>
                    <td>{point.distortion.toFixed(2)}</td>
                    <td>{point.psnr.toFixed(1)} dB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
