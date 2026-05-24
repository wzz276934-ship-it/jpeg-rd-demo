# JPEG 率失真压缩教学系统

以 JPEG 流程为主体的率失真压缩教学演示工具，完整复现压缩每一步，对应信源编码课本公式与定理。

## 功能

- **信源分析**：灰度直方图、信源熵 H(X)
- **8×8 DCT 变换**：分块可视化，可选块查看系数矩阵
- **量化**：标准 JPEG 量化矩阵，Q 滑块实时调节
- **熵编码**：Zigzag 扫描、游程编码、霍夫曼编码、平均码长 vs 熵
- **解码重建**：原图/重建图对比，PSNR、MSE、码率、压缩比
- **R-D 曲线**：实验曲线 + 高斯信源理论下界 R(D) = ½log₂(σ²/D)
- **AI 辅助**：根据图像统计特征与目标 PSNR 推荐 Q 值

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Recharts
- 纯前端 JPEG 算法实现（无需后端）

## 启动（本地开发）

```bash
npm install
npm run dev
```

## 部署成网页（给别人用）

### 方案 A：GitHub Pages（免费，推荐）

1. 在 [GitHub](https://github.com/new) 新建仓库，例如 `jpeg-rd-demo`
2. 在本项目目录执行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/jpeg-rd-demo.git
git push -u origin main
```

3. 打开仓库 **Settings → Pages → Build and deployment**
4. **Source** 选 **GitHub Actions**
5. 等 Actions 跑完（约 1–2 分钟），访问：

`https://你的用户名.github.io/jpeg-rd-demo/`

### 方案 B：Vercel（免费，操作最简单）

1. 把代码推到 GitHub（同上）
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. **Add New Project** → 选这个仓库 → 直接 Deploy
4. 得到形如 `https://jpeg-rd-demo.vercel.app` 的链接，发给对方即可

### 方案 C：Netlify 拖拽部署（不用 GitHub）

```bash
npm run build
```

把生成的 `dist` 文件夹拖到 [app.netlify.com/drop](https://app.netlify.com/drop)

## 项目结构

```
src/
  core/jpeg/     # DCT、量化、Zigzag、霍夫曼、流水线
  core/ai/       # Q 值推荐（轻量特征网络）
  components/    # UI 组件与选项卡
  hooks/         # useJpegPipeline 状态管理
```

## 设计

Minimalist Monochrome 设计系统：纯黑白、Playfair Display 标题、零圆角、线条纹理。
