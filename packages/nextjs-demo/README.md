# UnRAR Browser WASM - Next.js Demo

A demo application showcasing UnRAR Browser WASM with Next.js framework.

English | [简体中文](./README.zh-CN.md)

## Features

- 📦 Extract RAR files in the browser
- 🚀 High performance with WebAssembly
- 🔒 All processing happens locally, protecting your privacy
- 💅 Modern UI design with Tailwind CSS
- ⚡ Built with Next.js 15

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

This app is configured for static export mode and can be deployed to any static hosting service:

```bash
pnpm build
```

The built static files will be in the `out` directory.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Types**: TypeScript
- **WASM**: UnRAR Browser Core
- **Styling**: Tailwind CSS + PostCSS

## Technical Details

### Webpack Configuration

To support WebAssembly and avoid Node.js module conflicts, `next.config.ts` includes:

- **WASM Support**: Enables `asyncWebAssembly` experimental feature
- **Node.js Module Exclusion**: Excludes `fs`, `path`, `module` and other Node.js core modules in client builds

### Client-Side Rendering

All WASM-related code is marked with `'use client'` directive to ensure it runs only in the browser.

## Notes

### WASM Files

Ensure the `public` directory contains the following WASM files:

- `unrar.js` - UnRAR JavaScript wrapper
- `unrar.wasm` - UnRAR WebAssembly module

These files need to be copied from the build output of the `@unrar-browser/core` package. After running the build command in the project root, the files will be automatically copied to the correct location.
