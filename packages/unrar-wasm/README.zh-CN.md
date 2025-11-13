# @unrar-browser/core

用于在浏览器和 Node.js 中解压 RAR 归档的 UnRAR 库 WebAssembly 构建版本。

[English](./README.md) | 简体中文

## 安装

```bash
pnpm install @unrar-browser/core
```

## 使用

```javascript
import { getUnrarModule } from '@unrar-browser/core'

// 初始化模块
const unrar = await getUnrarModule()

// 将 RAR 文件写入虚拟文件系统
unrar.FS.writeFile('/archive.rar', fileData)

// 解压文件
const cmdData = new unrar.CommandData()
const archive = new unrar.Archive(cmdData)
archive.openFile('/archive.rar')

// 读取文件头并解压内容
while (archive.readHeader() > 0) {
  const headerType = archive.getHeaderType()
  if (headerType === unrar.HeaderType.HEAD_FILE) {
    const fileName = archive.getFileName()
    const fileData = archive.readFileData()
    console.log(`已解压: ${fileName}`)
  }
  archive.seekToNext()
}
```

## 构建

```bash
pnpm build
```

需要安装 Emscripten。

## 许可证

本项目使用 UnRAR 库，该库在特定许可证下分发。详情请参阅 vendor/unrar/license.txt。
