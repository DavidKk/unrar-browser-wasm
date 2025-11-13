# UnRAR Browser

[![npm version](https://img.shields.io/npm/v/@unrar-browser/core.svg)](https://www.npmjs.com/package/@unrar-browser/core)
[![build](https://github.com/DavidKk/unrar-browser-wasm/actions/workflows/build.workflow.yml/badge.svg?branch=main)](https://github.com/DavidKk/unrar-browser-wasm/actions/workflows/build.workflow.yml)
[![License](https://img.shields.io/npm/l/@unrar-browser/core.svg)](LICENSE)

> 🎯 A WebAssembly library for extracting RAR files in the browser

Compile UnRAR to WebAssembly, allowing you to extract RAR files directly in the browser without server support.

**🌐 Live Demos:**
- [⚡ Vite Demo](https://davidkk.github.io/unrar-browser-wasm/vite-demo/) - Modern React demo with Vite
- [▲ Next.js Demo](https://davidkk.github.io/unrar-browser-wasm/nextjs-demo/) - Server-side rendered demo
- [🧪 E2E Test Demo](https://davidkk.github.io/unrar-browser-wasm/e2e-demo/) - End-to-end testing demo
English | [简体中文](./README.zh-CN.md)

## ✨ Features

- 🌐 **Pure Browser Execution** - No server needed, data never leaves the browser
- 🚀 **High Performance** - WebAssembly compiled, near-native speed
- 📦 **Full Support** - Supports RAR 5.0 format
- 💪 **TypeScript** - Complete type definitions
- 🎨 **Modern** - ES Modules, zero configuration

## 📦 Installation

```bash
npm install @unrar-browser/core
```

Or use other package managers:

```bash
# pnpm
pnpm add @unrar-browser/core

# yarn
yarn add @unrar-browser/core
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { getUnrarModule } from '@unrar-browser/core'

async function extractRAR(file: File) {
  // 1. Initialize UnRAR module
  const unrar = await getUnrarModule()

  // 2. Read file
  const arrayBuffer = await file.arrayBuffer()

  // 3. Write to virtual file system
  const FS = unrar.FS
  FS.writeFile('/temp.rar', new Uint8Array(arrayBuffer))

  // 4. Open archive
  const cmdData = new unrar.CommandData()
  const archive = new unrar.Archive(cmdData)

  if (!archive.openFile('/temp.rar')) {
    throw new Error('Cannot open RAR file')
  }

  if (!archive.isArchive(true)) {
    throw new Error('Not a valid RAR file')
  }

  // 5. Extract all files
  const files = []

  while (archive.readHeader() > 0) {
    const headerType = archive.getHeaderType()

    if (headerType === unrar.HeaderType.HEAD_FILE) {
      const fileName = archive.getFileName()
      const fileSize = archive.getFileSize()
      const isDirectory = archive.isDirectory()

      if (!isDirectory) {
        const content = archive.readFileData()

        // Convert to Uint8Array
        const size = content.size()
        const data = new Uint8Array(size)
        for (let i = 0; i < size; i++) {
          data[i] = content.get(i)
        }

        files.push({ name: fileName, size: fileSize, data })
      }
    }

    archive.seekToNext()
  }

  // 6. Cleanup
  FS.unlink('/temp.rar')

  return files
}

// Usage example
const fileInput = document.querySelector('input[type="file"]')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const files = await extractRAR(file)

  console.log('Extracted files:', files)

  // Download first file
  const blob = new Blob([files[0].data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = files[0].name
  a.click()
})
```

### Complete HTML Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>UnRAR Demo</title>
  </head>
  <body>
    <input type="file" accept=".rar" id="fileInput" />
    <div id="result"></div>

    <script type="module">
      import { getUnrarModule } from '@unrar-browser/core'

      document.getElementById('fileInput').addEventListener('change', async (e) => {
        const file = e.target.files[0]
        const unrar = await getUnrarModule()

        // Extract files...
        // (use code above)

        document.getElementById('result').textContent = 'Extraction successful!'
      })
    </script>
  </body>
</html>
```

## 🔧 Vite / Webpack Configuration

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  // ...other config
  devServer: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
}
```

### Next.js

Since Next.js runs both server-side and client-side code, and `@unrar-browser/core` needs to run in the **browser environment**, special attention is required:

#### 1. Webpack Configuration (Required)

Configure webpack in `next.config.js` to ignore Node.js modules during client-side builds:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore Node.js modules in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
      }
    }
    return config
  },
  // Required HTTP headers (for SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

#### 2. Use 'use client' Directive (Required)

**Important**: Must be used in client components, add the `'use client'` directive:

```tsx
// app/unrar/page.tsx or components/UnrarExtractor.tsx
'use client'

import { useState, useEffect } from 'react'
import { getUnrarModule } from '@unrar-browser/core'

export default function UnrarPage() {
  const [unrar, setUnrar] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only load on client side
    getUnrarModule()
      .then(setUnrar)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (!unrar) return <div>Failed to load</div>

  // Use unrar...
  return <div>UnRAR module loaded</div>
}
```

#### 3. Use Dynamic Imports (Recommended)

For better code splitting and to avoid server-side execution, use dynamic imports:

```tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import, disable SSR
const UnrarComponent = dynamic(
  () => import('./UnrarComponent'),
  { ssr: false }
)

export default function Page() {
  return <UnrarComponent />
}
```

```tsx
// UnrarComponent.tsx
'use client'

import { getUnrarModule } from '@unrar-browser/core'

export default function UnrarComponent() {
  // Component code...
}
```

#### 4. Complete Next.js Example

```tsx
// app/unrar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getUnrarModule } from '@unrar-browser/core'

export default function UnrarPage() {
  const [unrar, setUnrar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ensure only runs on client side
    if (typeof window === 'undefined') return

    getUnrarModule()
      .then((module) => {
        setUnrar(module)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        console.error('Failed to load UnRAR module:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleFileUpload = async (file: File) => {
    if (!unrar) return

    try {
      const arrayBuffer = await file.arrayBuffer()
      const FS = unrar.FS
      FS.writeFile('/temp.rar', new Uint8Array(arrayBuffer))

      const cmdData = new unrar.CommandData()
      const archive = new unrar.Archive(cmdData)

      if (!archive.openFile('/temp.rar')) {
        throw new Error('Cannot open RAR file')
      }

      // Extract files...
      // (refer to basic usage example)

      FS.unlink('/temp.rar')
    } catch (err) {
      console.error('Extraction failed:', err)
    }
  }

  if (loading) {
    return <div>Loading UnRAR module...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h1>RAR File Extractor</h1>
      <input
        type="file"
        accept=".rar"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
      />
    </div>
  )
}
```

**Key Points**:
1. ✅ **Must use `'use client'` directive** - Ensures code only runs on client side
2. ✅ **Configure webpack fallback** - Ignore Node.js modules (fs, path, crypto, module, etc.)
3. ✅ **Use `useEffect` to load module** - Ensures only runs on client side
4. ✅ **Check `typeof window !== 'undefined'`** - Double safety check
5. ✅ **Configure HTTP headers** - Support SharedArrayBuffer
6. ❌ **Do not use in server components** - Will cause Node.js code path to execute

## 📖 API Documentation

### `getUnrarModule()`

Initialize and return UnRAR module instance.

```typescript
const unrar = await getUnrarModule()
```

### `Archive` Class

```typescript
const archive = new unrar.Archive(cmdData)

// Methods
archive.openFile(fileName: string): boolean           // Open file
archive.isArchive(enableBroken: boolean): boolean     // Validate if RAR
archive.readHeader(): number                          // Read next file header
archive.getHeaderType(): number                       // Get header type
archive.getFileName(): string                         // Get file name
archive.getFileSize(): number                         // Get file size
archive.isDirectory(): boolean                        // Check if directory
archive.readFileData(): VectorUint8                   // Read file content
archive.seekToNext(): void                            // Move to next file
```

### `HeaderType` Enum

```typescript
unrar.HeaderType.HEAD_FILE // File header
unrar.HeaderType.HEAD_ENDARC // End of archive
```

### `FS` File System

Emscripten virtual file system for file operations.

```typescript
unrar.FS.writeFile(path: string, data: Uint8Array)    // Write file
unrar.FS.readFile(path: string): Uint8Array           // Read file
unrar.FS.unlink(path: string)                         // Delete file
```

## 📝 Notes

### Required HTTP Headers

To use SharedArrayBuffer (required by WebAssembly), the server must return the following HTTP headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Without these headers, WASM will not work properly.

### Browser Compatibility

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 91+             |
| Firefox | 95+             |
| Safari  | 15.2+           |
| Edge    | 91+             |

### Performance Recommendations

- Single RAR file recommended < 100MB
- Extraction will consume corresponding memory
- For large files, use Web Worker to avoid blocking UI

## 🎯 Real-World Examples

### Batch File Extraction

```typescript
async function extractAll(rarFile: File) {
  const unrar = await getUnrarModule()
  const arrayBuffer = await rarFile.arrayBuffer()

  unrar.FS.writeFile('/archive.rar', new Uint8Array(arrayBuffer))

  const cmdData = new unrar.CommandData()
  const archive = new unrar.Archive(cmdData)
  archive.openFile('/archive.rar')

  const files = []

  while (archive.readHeader() > 0) {
    if (archive.getHeaderType() === unrar.HeaderType.HEAD_FILE) {
      if (!archive.isDirectory()) {
        const content = archive.readFileData()
        const size = content.size()
        const data = new Uint8Array(size)

        for (let i = 0; i < size; i++) {
          data[i] = content.get(i)
        }

        files.push({
          name: archive.getFileName(),
          size: archive.getFileSize(),
          data: data,
        })
      }
    }
    archive.seekToNext()
  }

  unrar.FS.unlink('/archive.rar')
  return files
}
```

### Using with React

```tsx
import { useState } from 'react'
import { getUnrarModule } from '@unrar-browser/core'

function RARExtractor() {
  const [files, setFiles] = useState([])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const unrar = await getUnrarModule()
    const arrayBuffer = await file.arrayBuffer()

    // Extraction logic...

    setFiles(extractedFiles)
  }

  return (
    <div>
      <input type="file" accept=".rar" onChange={handleFile} />
      <ul>
        {files.map((f) => (
          <li key={f.name}>
            {f.name} ({f.size} bytes)
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 🐛 FAQ

### Q: Why do I get "SharedArrayBuffer is not defined"?

A: Missing required HTTP security headers. Ensure the server returns:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Q: Can I use it in Node.js?

A: Yes, but it's recommended to use the native `unrar` command-line tool for better performance.

### Q: Does it support encrypted RAR files?

A: Yes. Use `unrar.setPassword(password)` to set the password.

### Q: Will large files freeze the browser?

A: It's recommended to run in a Web Worker to avoid blocking the main thread.

## 📄 License

MIT License

Based on UnRAR source code, complies with [UnRAR License](https://www.rarlab.com/rar/UnRARLicense.txt).

## 🔗 Links

- 🌐 **Live Demos** - Try it online
  - [⚡ Vite Demo](https://davidkk.github.io/unrar-browser-wasm/vite-demo/)
  - [▲ Next.js Demo](https://davidkk.github.io/unrar-browser-wasm/nextjs-demo/)
  - [🧪 E2E Test Demo](https://davidkk.github.io/unrar-browser-wasm/e2e-demo/)
- [npm Package](https://www.npmjs.com/package/@unrar-browser/core)
- [GitHub Repository](https://github.com/DavidKk/unrar-browser-wasm)
- [Issue Tracker](https://github.com/DavidKk/unrar-browser-wasm/issues)
- [UnRAR Official](https://www.rarlab.com/rar_add.htm)

---

**If you find it useful, please give it a ⭐ Star!**
