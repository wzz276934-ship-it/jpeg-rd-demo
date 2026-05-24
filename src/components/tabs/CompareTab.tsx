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
  if (!result) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">上传图像开始</p>
        <p className="empty-state__desc">
          上传或加载示例图后，在此对比原图与 JPEG 解码重建结果，查看 PSNR、MSE、码率与压缩比。
        </p>
      </div>
    );
  }

  return (
    <section className="image-compare image-compare--large">
      <ImagePanel title="原图" canvas={originalCanvas} large />
      <ImagePanel
        title="重建图"
        canvas={reconstructedCanvas}
        inverted
        large
        metrics={{
          psnr: result.metrics.psnr,
          mse: result.metrics.mse,
          compressionRatio: result.encoding.compressionRatio,
          bitRate: result.encoding.bitRate,
        }}
      />
    </section>
  );
}
