# JPEG 率失真压缩教学系统

《信息论与编码》课程实践项目 · 纯前端 JPEG 压缩与率失真（Rate–Distortion）可视化演示。

**在线演示：** https://wzz276934-ship-it.github.io/jpeg-rd-demo/

---

## 项目简介

本项目实现一套可交互的 JPEG 灰度压缩教学系统，完整覆盖信源熵分析、8×8 DCT、标准量化、Zigzag 扫描、游程编码、霍夫曼编码与解码重建，并实时展示 PSNR、MSE、码率、压缩比及实验 R-D 曲线，叠加高斯无记忆信源的率失真函数 `R(D) = ½ log₂(σ²/D)` 作为参考线（非真实图像下界），帮助将课本公式与可操作的压缩流程一一对应。

---

## 主要功能

| 页签 | 说明 |
|------|------|
| 原图 / 重建图 | 对比原图与 JPEG 重建结果，显示 PSNR、MSE、码率、压缩比 |
| DCT 系数 | 8×8 分块 DCT 系数热力图，点击块查看细节 |
| 量化过程 | 标准 JPEG 量化矩阵、缩放矩阵及量化前后系数 |
| 编码细节 | Zigzag 序列、RLE 符号、霍夫曼表、平均码长 |
| R-D 曲线 | 多 Q 值扫参实验曲线 + 高斯无记忆参考线对照 |

**其他能力**

- 上传本地图像或加载内置示例图
- 侧边栏调节质量因子 Q、目标 PSNR
- AI 辅助：基于图像统计特征线性推荐 Q 值
- 全部计算在浏览器内完成，无需后端

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
git clone https://github.com/wzz276934-ship-it/jpeg-rd-demo.git
cd jpeg-rd-demo
npm install
npm run dev
```

浏览器访问终端提示地址（默认 `http://localhost:5173`），点击「加载示例图 →」或上传灰度图即可体验。

### 其他命令

```bash
npm run build    # 生产构建 → dist/
npm run preview  # 预览构建结果
npm run lint     # ESLint 检查
```

---

## 技术栈

- **框架：** React 19 + TypeScript
- **构建：** Vite 8
- **样式：** Tailwind CSS v4
- **图表：** Recharts
- **公式：** KaTeX
- **部署：** GitHub Pages（GitHub Actions 自动构建）

---

## 项目结构

```
jpeg-rd-demo/
├── src/
│   ├── core/jpeg/          # JPEG 核心算法
│   │   ├── dct.ts          # 8×8 DCT / IDCT
│   │   ├── quantize.ts     # 量化 / 反量化
│   │   ├── zigzag.ts       # Zigzag 与游程编码
│   │   ├── huffman.ts      # 霍夫曼编码
│   │   ├── entropy.ts      # 信源熵、R(D) 理论曲线
│   │   ├── pipeline.ts     # 主编码流水线
│   │   └── constants.ts    # 量化表、Zigzag 顺序
│   ├── core/ai/
│   │   └── qPredictor.ts   # Q 值推荐
│   ├── components/         # UI 组件与五个页签
│   ├── hooks/
│   │   └── useJpegPipeline.ts
│   └── App.tsx
├── paper_rewriting_output/ # 课程项目介绍书（LaTeX / Word）
│   └── final_paper/
│       ├── main.tex
│       └── main.pdf
├── .github/workflows/      # GitHub Pages 部署
└── package.json
```

---

## 压缩流水线

对每一 8×8 像素块：

```
灰度图 → 分块(中心化) → DCT → 量化 → Zigzag → RLE → 霍夫曼
                                              ↓
                                         IDCT 重建 → PSNR / 码率
```

全图 RLE 符号合并后构建霍夫曼表，估计总比特数与压缩比；`computeRdCurve` 对多个 Q 采样绘制实验 R-D 曲线。

---

## 部署

推送到 `main` / `master` 分支后，GitHub Actions 自动执行 `npm run build` 并发布至 GitHub Pages。

本地预览生产构建：

```bash
npm run build
npm run preview
```

---

## 文档

课程项目介绍书位于 `paper_rewriting_output/final_paper/`：

- `main.tex` — LaTeX 源稿（XeLaTeX 编译）
- `main.pdf` — PDF 报告
- `paper.docx` — Word 版（如有）

编译 PDF：

```bash
cd paper_rewriting_output/final_paper
latexmk -xelatex main.tex
```

---

