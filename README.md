# JPEG 率失真压缩教学系统

**在线演示：** https://wzz276934-ship-it.github.io/jpeg-rd-demo/

信息编码课程作业 · 纯前端 JPEG 率失真压缩教学演示，完整复现压缩流程，对应课本公式与定理。

## 功能

- **信源分析**：灰度直方图、信源熵 H(X)
- **8×8 DCT 变换**：分块可视化，可选块查看系数矩阵
- **量化**：标准 JPEG 量化矩阵，Q 滑块实时调节
- **熵编码**：Zigzag 扫描、游程编码、霍夫曼编码、平均码长 vs 熵
- **解码重建**：原图/重建图对比，PSNR、MSE、码率、压缩比
- **R-D 曲线**：实验曲线 + 高斯信源理论下界 R(D) = ½log₂(σ²/D)
- **AI 辅助**：根据图像统计特征与目标 PSNR 推荐 Q 值

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的地址（默认 `http://localhost:5173`），点击「加载示例图」或上传灰度图即可体验。

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · 纯前端实现（无需后端）

## 项目结构

```
src/
  core/jpeg/     # DCT、量化、Zigzag、霍夫曼、流水线
  core/ai/       # Q 值推荐
  components/    # UI 组件与选项卡
  hooks/         # 状态管理
```
