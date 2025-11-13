# @unrar-browser/vite-demo

基于 Vite 和 Tailwind CSS 的 UnRAR Browser 演示应用。

[English](./README.md) | 简体中文

## 开发

```bash
# 安装依赖（在根目录）
pnpm install

# 首先构建 WASM 库
pnpm --filter @unrar-browser/core build

# 启动开发服务器
pnpm --filter @unrar-browser/vite-demo dev
```

## 功能

- 🎨 使用 Tailwind CSS 的现代 UI
- 📦 支持拖放文件上传
- 🚀 客户端解压
- 💾 单独下载文件
- 📱 响应式设计
- 🔒 注重隐私（无上传）

## 构建用于 GitHub Pages

```bash
pnpm --filter @unrar-browser/vite-demo build
```

构建文件将位于 `packages/vite-demo/dist/`。

