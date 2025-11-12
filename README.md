# UnRAR Browser

[![npm version](https://img.shields.io/npm/v/@unrar-browser/core.svg)](https://www.npmjs.com/package/@unrar-browser/core)
[![build](https://github.com/DavidKk/unrar-browser-wasm/actions/workflows/build.workflow.yml/badge.svg?branch=main)](https://github.com/DavidKk/unrar-browser-wasm/actions/workflows/build.workflow.yml)
[![License](https://img.shields.io/npm/l/@unrar-browser/core.svg)](LICENSE)

> 🎯 A WebAssembly library for extracting RAR files in the browser

Compile UnRAR to WebAssembly, allowing you to extract RAR files directly in the browser without server support.

**🌐 [Live Demo](https://davidkk.github.io/unrar-browser-wasm/)** | English | [简体中文](./README.zh-CN.md)

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

- [Live Demo](https://davidkk.github.io/unrar-browser-wasm/) - Try it online
- [npm Package](https://www.npmjs.com/package/@unrar-browser/core)
- [GitHub Repository](https://github.com/DavidKk/unrar-browser-wasm)
- [Issue Tracker](https://github.com/DavidKk/unrar-browser-wasm/issues)
- [UnRAR Official](https://www.rarlab.com/rar_add.htm)

---

**If you find it useful, please give it a ⭐ Star!**
