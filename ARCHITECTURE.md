# Project Architecture

## Monorepo Structure

This project uses pnpm workspaces to manage a monorepo with multiple packages.

````
unrar-browser-wasm/
├── packages/
│   ├── unrar-wasm/          # Core WASM library
│   │   ├── src/
│   │   │   ├── index.ts     # Main entry point
│   │   │   └── unrar.cpp    # C++ WASM bindings
│   │   ├── build/           # Compiled WASM output
│   │   ├── CMakeLists.txt
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── demo/                # GitHub Pages demo (public-facing)
│   │   ├── index.html
│   │   ├── index.ts         # Beautiful UI with Tailwind
│   │   ├── style.css
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── e2e-demo/            # E2E test demo (for Playwright)
│       ├── index.html       # Simplified test UI
│       ├── index.ts         # Auto-loading test page
│       ├── style.css
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── __e2etests__/            # Playwright E2E tests
├── package.json             # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.json            # Base TypeScript config
├── playwright.config.ts     # Playwright configuration
└── README.md

## Package Overview

### @unrar-browser/core

The core WASM library that provides RAR extraction functionality.

- **Technology**: C++ (UnRAR library) + Emscripten + TypeScript
- **Build Output**: `unrar.js` and `unrar.wasm`
- **Entry Point**: `src/index.ts`
- **Public API**: Exports `getUnrarModule()` function

**Build Command**:
```bash
pnpm --filter @unrar-browser/core build
````

### @unrar-browser/demo

Beautiful demo application for GitHub Pages deployment.

- **Technology**: Vite + TypeScript + Tailwind CSS
- **Port**: 3001
- **Features**:
  - Modern, responsive UI
  - Drag & drop file upload
  - Individual file downloads
  - Client-side extraction
  - Privacy-focused (no uploads)

**Dev Command**:

```bash
pnpm dev
# or
pnpm --filter @unrar-browser/demo dev
```

**Build Command**:

```bash
pnpm build:demo
# or
pnpm --filter @unrar-browser/demo build
```

### @unrar-browser/e2e-demo

Simplified demo for E2E testing with Playwright.

- **Technology**: Vite + TypeScript + Tailwind CSS
- **Port**: 3000
- **Features**:
  - Auto-loads test file (`q.rar`)
  - Detailed console logging
  - English-only interface
  - Simplified UI for test automation

**Dev Command**:

```bash
pnpm dev:e2e
# or
pnpm --filter @unrar-browser/e2e-demo dev
```

## Development Workflow

### Initial Setup

```bash
# Install dependencies
pnpm install

# Build WASM library
pnpm build
```

### Development

```bash
# Start GitHub Pages demo
pnpm dev

# Start E2E test demo
pnpm dev:e2e
```

### Testing

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug
```

### Building

```bash
# Build WASM library
pnpm build

# Build demo for GitHub Pages
pnpm build:demo
```

## TypeScript Configuration

The project uses TypeScript project references for efficient type checking:

- **Root `tsconfig.json`**: Base configuration
- **`packages/unrar-wasm/tsconfig.json`**: WASM library config
- **`packages/vite-demo/tsconfig.json`**: Vite demo app config
- **`packages/e2e-demo/tsconfig.json`**: E2E demo config

Each package extends the root config and defines its own `include` and `references`.

## Vite Configuration

Both demo packages use Vite with similar configurations:

- **Alias**: Maps `@unrar-browser/core` to the source file
- **Public Dir**: Serves WASM files from `../unrar-wasm/build`
- **Headers**: Sets required COOP/COEP headers for SharedArrayBuffer
- **Assets**: Includes `.wasm` files

## Tailwind CSS

Both demo packages use Tailwind CSS for styling:

- **Config**: `tailwind.config.js` in each package
- **Content**: Scans `index.html` and `.ts`/`.tsx` files
- **PostCSS**: Configured via `postcss.config.js`

## Playwright Configuration

- **Test Directory**: `__e2etests__/`
- **Web Server**: Starts `pnpm dev:e2e` on port 3000
- **Browsers**: Chromium (always), Firefox/WebKit (local only)
- **Reporter**: `list` for CI, `list + html` for local
- **Retries**: 2 in CI, 0 locally

## CI/CD

The project includes GitHub Actions workflows:

- **`.github/workflows/ci.yml`**: Linting, building, and E2E testing
- **`.github/workflows/release.yml`**: Publishing to npm and GitHub Releases

## Key Differences: demo vs e2e-demo

| Feature      | @unrar-browser/demo     | @unrar-browser/e2e-demo |
| ------------ | ----------------------- | ----------------------- |
| Purpose      | Public-facing demo      | E2E test automation     |
| Port         | 3001                    | 3000                    |
| UI           | Beautiful, feature-rich | Simplified, functional  |
| File Upload  | Manual (drag & drop)    | Auto-loads `q.rar`      |
| Language     | English                 | English                 |
| Logging      | Minimal                 | Detailed console logs   |
| Open Browser | Yes                     | No                      |

## Dependencies

### Core Library (`@unrar-browser/core`)

- Emscripten (for WASM compilation)
- CMake (for build system)
- UnRAR source code (vendored)

### Demo Packages

- Vite
- TypeScript
- Tailwind CSS
- Autoprefixer
- PostCSS

### Development

- Playwright (E2E testing)
- ESLint (linting)
- Prettier (formatting)
- pnpm (package management)

## Module Resolution

All packages use `@unrar-browser/core` as a workspace dependency:

```json
{
  "dependencies": {
    "@unrar-browser/core": "workspace:*"
  }
}
```

Vite resolves this via alias:

```typescript
{
  resolve: {
    alias: {
      '@unrar-browser/core': resolve(__dirname, '../unrar-wasm/src/index.ts'),
    },
  },
}
```

## WASM Loading

The WASM files are loaded via Vite's `publicDir`:

```typescript
{
  publicDir: resolve(__dirname, '../unrar-wasm/build'),
  assetsInclude: ['**/*.wasm'],
}
```

This makes `unrar.js` and `unrar.wasm` available at the root URL (`/unrar.js`, `/unrar.wasm`).

## Security Headers

Required for SharedArrayBuffer (used by WASM):

```typescript
{
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
}
```
