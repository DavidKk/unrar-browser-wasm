# @unrar-browser/vite-demo

Vite demo for UnRAR Browser with Tailwind CSS.

English | [简体中文](./README.zh-CN.md)

## Development

```bash
# Install dependencies (from root)
pnpm install

# Build the WASM library first
pnpm --filter @unrar-browser/core build

# Start dev server
pnpm --filter @unrar-browser/vite-demo dev
```

## Features

- 🎨 Modern UI with Tailwind CSS
- 📦 Drag & drop file upload
- 🚀 Client-side extraction
- 💾 Individual file downloads
- 📱 Responsive design
- 🔒 Privacy-focused (no upload)

## Build for GitHub Pages

```bash
pnpm --filter @unrar-browser/vite-demo build
```

The built files will be in `packages/vite-demo/dist/`.
