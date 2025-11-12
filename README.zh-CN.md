# UnRAR Browser

[![npm version](https://img.shields.io/npm/v/@unrar-browser/core.svg)](https://www.npmjs.com/package/@unrar-browser/core)
[![CI](https://github.com/DavidKk/unrar-browser-wasm/workflows/CI/badge.svg)](https://github.com/DavidKk/unrar-browser-wasm/actions)
[![License](https://img.shields.io/npm/l/@unrar-browser/core.svg)](LICENSE)

> 🎯 在浏览器中解压 RAR 文件的 WebAssembly 库

将 UnRAR 编译为 WebAssembly，让你可以在浏览器中直接解压 RAR 文件，无需服务器支持。

[English](./README.md) | 简体中文

## ✨ 特性

- 🌐 **纯浏览器运行** - 无需服务器，数据不离开浏览器
- 🚀 **高性能** - WebAssembly 编译，接近原生速度
- 📦 **完整支持** - 支持 RAR 5.0 格式
- 💪 **TypeScript** - 完整的类型定义
- 🎨 **现代化** - ES Modules，零配置

## 📦 安装

```bash
npm install @unrar-browser/core
```

或使用其他包管理器：

```bash
# pnpm
pnpm add @unrar-browser/core

# yarn
yarn add @unrar-browser/core
```

## 🚀 快速开始

### 基本使用

```typescript
import { getUnrarModule } from '@unrar-browser/core'

async function extractRAR(file: File) {
  // 1. 初始化 UnRAR 模块
  const unrar = await getUnrarModule()

  // 2. 读取文件
  const arrayBuffer = await file.arrayBuffer()

  // 3. 写入虚拟文件系统
  const FS = unrar.FS
  FS.writeFile('/temp.rar', new Uint8Array(arrayBuffer))

  // 4. 打开归档
  const cmdData = new unrar.CommandData()
  const archive = new unrar.Archive(cmdData)

  if (!archive.openFile('/temp.rar')) {
    throw new Error('无法打开 RAR 文件')
  }

  if (!archive.isArchive(true)) {
    throw new Error('不是有效的 RAR 文件')
  }

  // 5. 提取所有文件
  const files = []

  while (archive.readHeader() > 0) {
    const headerType = archive.getHeaderType()

    if (headerType === unrar.HeaderType.HEAD_FILE) {
      const fileName = archive.getFileName()
      const fileSize = archive.getFileSize()
      const isDirectory = archive.isDirectory()

      if (!isDirectory) {
        const content = archive.readFileData()

        // 转换为 Uint8Array
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

  // 6. 清理
  FS.unlink('/temp.rar')

  return files
}

// 使用示例
const fileInput = document.querySelector('input[type="file"]')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const files = await extractRAR(file)

  console.log('提取的文件:', files)

  // 下载第一个文件
  const blob = new Blob([files[0].data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = files[0].name
  a.click()
})
```

### 完整的 HTML 示例

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

        // 提取文件...
        // (使用上面的代码)

        document.getElementById('result').textContent = '解压成功！'
      })
    </script>
  </body>
</html>
```

## 🔧 Vite / Webpack 配置

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
  // ...其他配置
  devServer: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
}
```

## 📖 API 文档

### `getUnrarModule()`

初始化并返回 UnRAR 模块实例。

```typescript
const unrar = await getUnrarModule()
```

### `Archive` 类

```typescript
const archive = new unrar.Archive(cmdData)

// 方法
archive.openFile(fileName: string): boolean           // 打开文件
archive.isArchive(enableBroken: boolean): boolean     // 验证是否为 RAR
archive.readHeader(): number                          // 读取下一个文件头
archive.getHeaderType(): number                       // 获取头类型
archive.getFileName(): string                         // 获取文件名
archive.getFileSize(): number                         // 获取文件大小
archive.isDirectory(): boolean                        // 是否为目录
archive.readFileData(): VectorUint8                   // 读取文件内容
archive.seekToNext(): void                            // 移动到下一个文件
```

### `HeaderType` 枚举

```typescript
unrar.HeaderType.HEAD_FILE // 文件头
unrar.HeaderType.HEAD_ENDARC // 归档结束
```

### `FS` 文件系统

Emscripten 虚拟文件系统，用于文件操作。

```typescript
unrar.FS.writeFile(path: string, data: Uint8Array)    // 写入文件
unrar.FS.readFile(path: string): Uint8Array           // 读取文件
unrar.FS.unlink(path: string)                         // 删除文件
```

## 📝 注意事项

### 必需的 HTTP 头

为了使用 SharedArrayBuffer（WebAssembly 需要），服务器必须返回以下 HTTP 头：

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

如果没有这些头，WASM 将无法正常工作。

### 浏览器兼容性

| 浏览器  | 最低版本 |
| ------- | -------- |
| Chrome  | 91+      |
| Firefox | 95+      |
| Safari  | 15.2+    |
| Edge    | 91+      |

### 性能建议

- 单个 RAR 文件建议 < 100MB
- 解压时会占用相应的内存
- 大文件建议使用 Web Worker 避免阻塞 UI

## 🎯 实际案例

### 批量提取文件

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

### 在 React 中使用

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

    // 提取逻辑...

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

## 🐛 常见问题

### Q: 为什么提示 "SharedArrayBuffer is not defined"？

A: 缺少必需的 HTTP 安全头。确保服务器返回：

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Q: 可以在 Node.js 中使用吗？

A: 可以，但建议使用原生的 `unrar` 命令行工具，性能更好。

### Q: 支持加密的 RAR 文件吗？

A: 支持。使用 `unrar.setPassword(password)` 设置密码。

### Q: 文件很大，会卡住浏览器吗？

A: 建议在 Web Worker 中运行，避免阻塞主线程。

## 📄 许可证

MIT License

基于 UnRAR 源码，遵循 [UnRAR License](https://www.rarlab.com/rar/UnRARLicense.txt)。

## 🔗 链接

- [npm 包](https://www.npmjs.com/package/@unrar-browser/core)
- [GitHub 仓库](https://github.com/DavidKk/unrar-browser-wasm)
- [问题反馈](https://github.com/DavidKk/unrar-browser-wasm/issues)
- [UnRAR 官方](https://www.rarlab.com/rar_add.htm)

---

**如果觉得有用，请给个 ⭐ Star！**
