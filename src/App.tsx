import { Sidebar } from './components/layout/Sidebar';
import { CompareTab } from './components/tabs/CompareTab';
import { DctTab } from './components/tabs/DctTab';
import { EncodingTab } from './components/tabs/EncodingTab';
import { QuantTab } from './components/tabs/QuantTab';
import { RdCurveTab } from './components/tabs/RdCurveTab';
import { TabBar } from './components/ui/TabBar';
import { useJpegPipeline } from './hooks/useJpegPipeline';

function App() {
  const {
    quality,
    setQuality,
    flushQuality,
    targetPsnr,
    setTargetPsnr,
    flushTargetPsnr,
    activeTab,
    setActiveTab,
    selectedBlockRow,
    selectedBlockCol,
    result,
    rdCurve,
    theoreticalRd,
    computingRd,
    aiRecommendedQ,
    originalCanvas,
    reconstructedCanvas,
    hasImage,
    handleFileSelect,
    loadDemoImage,
    applyAiQ,
    selectBlock,
  } = useJpegPipeline();

  return (
    <div className="app-shell texture-noise">
      <a href="#main-content" className="sr-only">
        跳到主内容
      </a>

      <div className="app-layout">
        <Sidebar
          quality={quality}
          targetPsnr={targetPsnr}
          aiRecommendedQ={aiRecommendedQ}
          hasImage={hasImage}
          onQualityChange={setQuality}
          onQualityCommit={flushQuality}
          onTargetPsnrChange={setTargetPsnr}
          onTargetPsnrCommit={flushTargetPsnr}
          onFileSelect={handleFileSelect}
          onLoadDemo={loadDemoImage}
          onApplyAiQ={applyAiQ}
        />

        <main id="main-content" className="app-main">
          <section className="app-main__section">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            <div
              className={`tab-panel texture-grid ${activeTab === 'compare' ? 'tab-panel--compare' : ''}`}
              role="tabpanel"
            >
              {activeTab === 'compare' && (
                <CompareTab
                  result={result}
                  originalCanvas={originalCanvas}
                  reconstructedCanvas={reconstructedCanvas}
                />
              )}
              {activeTab === 'dct' && (
                result ? (
                  <DctTab
                    result={result}
                    originalCanvas={originalCanvas!}
                    selectedBlockRow={selectedBlockRow}
                    selectedBlockCol={selectedBlockCol}
                    onBlockSelect={selectBlock}
                  />
                ) : (
                  <EmptyState />
                )
              )}
              {activeTab === 'quantize' && (
                result ? (
                  <QuantTab result={result} quality={quality} />
                ) : (
                  <EmptyState />
                )
              )}
              {activeTab === 'encode' && (
                result ? (
                  <EncodingTab result={result} />
                ) : (
                  <EmptyState />
                )
              )}
              {activeTab === 'rd' && (
                result ? (
                  <>
                    {computingRd && (
                      <p className="control-field__label" style={{ marginBottom: '1.5rem' }}>
                        正在计算 R-D 曲线…
                      </p>
                    )}
                    <RdCurveTab
                      result={result}
                      quality={quality}
                      rdCurve={rdCurve}
                      theoreticalRd={theoreticalRd}
                      onQualitySelect={setQuality}
                    />
                  </>
                ) : (
                  <EmptyState />
                )
              )}
            </div>
          </section>

          <footer className="footer-note">
            JPEG 率失真压缩教学演示 · 信源编码理论
          </footer>
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <p className="empty-state__title">上传图像开始</p>
      <p className="empty-state__desc">
        系统将逐步演示 JPEG 压缩全流程：信源熵分析 → DCT 变换 → 量化 →
        熵编码 → 解码重建 → 率失真曲线
      </p>
    </div>
  );
}

export default App;
