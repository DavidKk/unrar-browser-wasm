# Next.js Demo Usage Guide

English | [简体中文](./USAGE.zh-CN.md)

## Quick Start

### 1. Install Dependencies

Run in project root:

```bash
pnpm install
```

### 2. Start Development Server

Run in project root:

```bash
pnpm dev:nextjs
```

Or run directly in nextjs-demo directory:

```bash
cd packages/nextjs-demo
pnpm dev
```

The app will start at `http://localhost:3000`.

### 3. Build for Production

Run in project root:

```bash
pnpm build:nextjs
```

After building, you can start the production server:

```bash
pnpm start:nextjs
```

## Features

### 1. File Upload

- Drag and drop RAR files
- Click upload area to select files
- Only accepts .rar format files

### 2. Extraction

- Extract RAR files locally in the browser
- High performance with WebAssembly
- All processing happens on the client side, ensuring privacy

### 3. File Download

- Download individual files after extraction
- Display file sizes and directory structure

## Technical Details

### Directory Structure

```
packages/nextjs-demo/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingProgress.tsx
│   │   ├── StatusBanner.tsx
│   │   ├── UploadCard.tsx
│   │   └── ResultsSection.tsx
│   ├── hooks/               # Custom Hooks
│   │   ├── useUnrarModule.ts
│   │   └── useUnrarExtractor.ts
│   └── utils/               # Utility functions
│       └── index.ts
├── public/                  # Static assets
│   ├── unrar.js            # UnRAR WASM module
│   └── unrar.wasm          # WASM binary file
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### WASM Files

Ensure the `public` directory contains the following files (automatically copied during build):

- `unrar.js` - UnRAR JavaScript wrapper
- `unrar.wasm` - UnRAR WebAssembly module

These files come from the build output of the `@unrar-browser/core` package.

### Static Export

This app is configured for static export mode (`output: 'export'`) and can be deployed to any static hosting service, such as:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## Troubleshooting

### 1. WASM File Loading Failed

Ensure:

- `public` directory contains `unrar.js` and `unrar.wasm`
- File paths are correct (should be at app root `/`)
- Server properly configures WASM MIME type

### 2. Hot Reload Issues in Development

Next.js dev server handles hot reload automatically, but WASM modules may require a page refresh to reload.

### 3. Build Errors

If you encounter build errors, try:

- Clean cache: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check TypeScript errors: `pnpm type-check`

## Deployment

### Vercel

```bash
# Automatic deployment (recommended)
# Connect GitHub repository to Vercel

# Or manual deployment
pnpm build:nextjs
cd packages/nextjs-demo
vercel --prod
```

### Other Static Hosting

```bash
pnpm build:nextjs
# Deploy packages/nextjs-demo/out directory to any static hosting service
```

## Development Tips

- Use `'use client'` directive to mark components that need client-side features
- WASM module loads only on client side, not during server-side rendering
- Use `useEffect` to handle asynchronous loading of WASM module
