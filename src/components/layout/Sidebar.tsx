import { memo } from 'react';
import { Sparkles } from 'lucide-react';
import { SliderControl } from '../ui/SliderControl';

interface SidebarProps {
  quality: number;
  targetPsnr: number;
  aiRecommendedQ: number | null;
  hasImage: boolean;
  onQualityChange: (q: number) => void;
  onQualityCommit: () => void;
  onTargetPsnrChange: (psnr: number) => void;
  onTargetPsnrCommit: () => void;
  onFileSelect: (file: File) => void;
  onLoadDemo: () => void;
  onApplyAiQ: () => void;
}

export const Sidebar = memo(function Sidebar({
  quality,
  targetPsnr,
  aiRecommendedQ,
  hasImage,
  onQualityChange,
  onQualityCommit,
  onTargetPsnrChange,
  onTargetPsnrCommit,
  onFileSelect,
  onLoadDemo,
  onApplyAiQ,
}: SidebarProps) {  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <p className="sidebar__eyebrow">Rate-Distortion Compression</p>
        <h1 className="sidebar__title">JPEG</h1>
      </div>

      <div className="sidebar__controls">
        <div className="sidebar__section">
          <p className="control-field__label">上传灰度图</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
          <button type="button" className="btn-primary btn-primary--block" onClick={onLoadDemo}>
            加载示例图 →
          </button>
        </div>

        <div className="sidebar__divider" />

        <SliderControl
          label="目标 PSNR (AI 输入)"
          value={targetPsnr}
          min={20}
          max={50}
          step={0.5}
          unit=" dB"
          onChange={onTargetPsnrChange}
          onCommit={onTargetPsnrCommit}
        />

        <div className="sidebar__divider" />

        <div className="sidebar__section">
          <p className="control-field__label">
            <Sparkles
              size={14}
              strokeWidth={1.5}
              style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}
            />
            AI 推荐 Q 值
          </p>
          <div className="sidebar__ai">
            <span className="sidebar__ai-value">{aiRecommendedQ ?? '—'}</span>
            <button
              type="button"
              disabled={!hasImage || aiRecommendedQ === null}
              onClick={onApplyAiQ}
              className="btn-primary btn-primary--block"
            >
              应用 →
            </button>
          </div>
        </div>

        <div className="sidebar__divider" />

        <SliderControl
          label="手动 Q 值"
          value={quality}
          min={1}
          max={100}
          onChange={onQualityChange}
          onCommit={onQualityCommit}
        />
      </div>
    </aside>
  );
});
