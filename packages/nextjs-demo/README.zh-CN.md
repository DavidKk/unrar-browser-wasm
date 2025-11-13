# UnRAR Browser WASM - Next.js Demo

这是一个使用 Next.js 框架的 UnRAR Browser WASM 演示应用。

[English](./README.md) | 简体中文

## 功能

- 📦 在浏览器中解压 RAR 文件
- 🚀 使用 WebAssembly 获得高性能
- 🔒 所有处理都在本地进行，保护您的隐私
- 💅 使用 Tailwind CSS 的现代 UI 设计
- ⚡ 基于 Next.js 15 构建

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 部署

该应用配置为静态导出模式，可以部署到任何静态托管服务：

```bash
pnpm build
```

构建后的静态文件将位于 `out` 目录中。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 18 + Tailwind CSS
- **类型**: TypeScript
- **WASM**: UnRAR Browser Core
- **样式**: Tailwind CSS + PostCSS

## 技术细节

### Webpack 配置

为了支持 WebAssembly 和避免 Node.js 模块冲突，`next.config.ts` 包含以下配置：

- **WASM 支持**: 启用 `asyncWebAssembly` 实验性特性
- **Node.js 模块排除**: 在客户端构建时排除 `fs`、`path`、`module` 等 Node.js 核心模块

### 客户端渲染

所有与 WASM 相关的代码都使用 `'use client'` 指令标记，确保只在浏览器中运行。

## 注意事项

### WASM 文件

确保 `public` 目录中包含以下 WASM 文件：
- `unrar.js` - UnRAR JavaScript 包装器
- `unrar.wasm` - UnRAR WebAssembly 模块

这些文件需要从 `@unrar-browser/core` 包的构建输出中复制。在项目根目录运行构建命令后，文件会自动复制到正确位置。

