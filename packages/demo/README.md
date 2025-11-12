# @unrar-browser/demo

Beautiful GitHub Pages demo for UnRAR Browser with Tailwind CSS.

## Development

```bash
# Install dependencies (from root)
pnpm install

# Build the WASM library first
pnpm --filter @unrar-browser/core build

# Start dev server
pnpm --filter @unrar-browser/demo dev
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
pnpm --filter @unrar-browser/demo build
```

The built files will be in `packages/demo/dist/`.
