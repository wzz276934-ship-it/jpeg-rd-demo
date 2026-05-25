import { ImagePanel } from '../layout/ImagePanel';
import type { PipelineResult } from '../../types';

interface CompareTabProps {
  result: PipelineResult | null;
  originalCanvas: HTMLCanvasElement | null;
  reconstructedCanvas: HTMLCanvasElement | null;
}

export function CompareTab({
  result,
  originalCanvas,
  reconstructedCanvas,
}: CompareTabProps) {
  const metrics = result
    ? {
        psnr: result.metrics.psnr,
        mse: result.metrics.mse,
        compressionRatio: result.encoding.compressionRatio,
        bitRate: result.encoding.bitRate,
      }
    : undefined;

  return (
    <div className="compare-tab">
      {!result && (
        <div className="compare-tab__hint">
          <p className="compare-tab__hint-title">上传图像开始</p>
          <p className="compare-tab__hint-desc">
            上传或加载示例图后，在此对比原图与 JPEG 解码重建结果，查看 PSNR、MSE、码率与压缩比。
          </p>
        </div>
      )}

      <section className="image-compare image-compare--large">
        <ImagePanel
          title="原图"
          canvas={originalCanvas}
          large
          compare
          reserveMetrics
          metrics={metrics}
        />
        <ImagePanel
          title="重建图"
          canvas={reconstructedCanvas}
          inverted
          large
          compare
          reserveMetrics
          metrics={metrics}
        />
      </section>
    </div>
  );
}
