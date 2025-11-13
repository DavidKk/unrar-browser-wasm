# Next.js Demo 使用指南

[English](./USAGE.md) | 简体中文

## 快速开始

### 1. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 2. 启动开发服务器

在项目根目录运行：

```bash
pnpm dev:nextjs
```

或者直接在 nextjs-demo 目录运行：

```bash
cd packages/nextjs-demo
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 构建生产版本

在项目根目录运行：

```bash
pnpm build:nextjs
```

构建完成后，可以启动生产服务器：

```bash
pnpm start:nextjs
```

## 功能特性

### 1. 文件上传

- 支持拖放 RAR 文件
- 点击上传区域选择文件
- 仅接受 .rar 格式文件

### 2. 解压功能

- 在浏览器中本地解压 RAR 文件
- 使用 WebAssembly 获得高性能
- 所有处理都在客户端完成，确保隐私安全

### 3. 文件下载

- 解压后可以单独下载每个文件
- 支持显示文件大小和目录结构

## 技术细节

### 目录结构

```
packages/nextjs-demo/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 主页面
│   │   └── globals.css      # 全局样式
│   ├── components/          # React 组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingProgress.tsx
│   │   ├── StatusBanner.tsx
│   │   ├── UploadCard.tsx
│   │   └── ResultsSection.tsx
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useUnrarModule.ts
│   │   └── useUnrarExtractor.ts
│   └── utils/               # 工具函数
│       └── index.ts
├── public/                  # 静态资源
│   ├── unrar.js            # UnRAR WASM 模块
│   └── unrar.wasm          # WASM 二进制文件
├── next.config.ts          # Next.js 配置
├── tailwind.config.ts      # Tailwind CSS 配置
└── tsconfig.json           # TypeScript 配置
```

### WASM 文件

确保 `public` 目录包含以下文件（构建时会自动复制）：

- `unrar.js` - UnRAR JavaScript 包装器
- `unrar.wasm` - UnRAR WebAssembly 模块

这些文件来自 `@unrar-browser/core` 包的构建输出。

### 静态导出

该应用配置为静态导出模式（`output: 'export'`），可以部署到任何静态托管服务，如：

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 常见问题

### 1. WASM 文件加载失败

确保：
- `public` 目录包含 `unrar.js` 和 `unrar.wasm`
- 文件路径正确（应该在应用根目录 `/` 下）
- 服务器正确配置 WASM MIME 类型

### 2. 开发时热重载问题

Next.js 开发服务器会自动处理热重载，但 WASM 模块可能需要刷新页面才能重新加载。

### 3. 构建错误

如果遇到构建错误，尝试：
- 清理缓存：`rm -rf .next`
- 重新安装依赖：`pnpm install`
- 检查 TypeScript 错误：`pnpm type-check`

## 部署

### Vercel

```bash
# 自动部署（推荐）
# 连接 GitHub 仓库到 Vercel

# 或手动部署
pnpm build:nextjs
cd packages/nextjs-demo
vercel --prod
```

### 其他静态托管

```bash
pnpm build:nextjs
# 将 packages/nextjs-demo/out 目录部署到任何静态托管服务
```

## 开发提示

- 使用 `'use client'` 指令标记需要客户端功能的组件
- WASM 模块仅在客户端加载，不在服务器端渲染
- 使用 `useEffect` 处理 WASM 模块的异步加载

