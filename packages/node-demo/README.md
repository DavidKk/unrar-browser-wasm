# Node.js Demo

这是一个在 Node.js 环境中使用 `@unrar-browser/core` 的示例项目。

## 功能

- 在 Node.js 环境中提取 RAR 文件
- 支持提取所有文件和目录
- 自动保存提取的文件到指定目录

## 使用方法

### 1. 安装依赖

```bash
pnpm install
```

### 2. 运行示例

```bash
# 提取 RAR 文件到默认输出目录 (./output)
pnpm start q.rar

# 提取 RAR 文件到指定目录
pnpm start q.rar ./my-output

# 开发模式（自动重新加载）
pnpm dev q.rar
```

## 示例输出

```
🚀 UnRAR Node.js Demo

==================================================
📦 正在加载 UnRAR 模块...
📂 正在读取 RAR 文件: q.rar
🔍 正在打开归档...
✅ 归档验证成功，开始提取文件...

📄 example.txt (1.23 KB)
📁 folder/
📄 folder/nested.txt (456 B)
==================================================

✨ 提取完成!
📊 总计: 3 个文件/目录
📁 输出目录: ./output
```

## 代码说明

### 基本用法

```typescript
import { getUnrarModule } from '@unrar-browser/core'
import { readFileSync } from 'fs'

// 1. 初始化模块
const unrar = await getUnrarModule()

// 2. 读取 RAR 文件
const rarData = readFileSync('archive.rar')
const FS = unrar.FS
FS.writeFile('/temp.rar', new Uint8Array(rarData))

// 3. 打开归档
const cmdData = new unrar.CommandData()
const archive = new unrar.Archive(cmdData)
archive.openFile('/temp.rar')

// 4. 提取文件
while (archive.readHeader() > 0) {
  if (archive.getHeaderType() === unrar.HeaderType.HEAD_FILE) {
    const fileName = archive.getFileName()
    const fileData = archive.readFileData()
    // 处理文件数据...
  }
  archive.seekToNext()
}

// 5. 清理
FS.unlink('/temp.rar')
```

## 注意事项

1. **性能**: 在 Node.js 环境中，对于大文件，原生 `unrar` 命令行工具可能性能更好
2. **内存**: 提取大文件时会占用相应内存
3. **WASM 文件**: 确保 `@unrar-browser/core` 的 `build/unrar.js` 和 `build/unrar.wasm` 文件存在

## 与浏览器版本的区别

- **加载方式**: Node.js 版本使用 `require()` 直接加载，浏览器版本使用 `<script>` 标签
- **文件系统**: Node.js 版本可以使用 Node.js 的 `fs` 模块读写文件
- **性能**: Node.js 版本通常性能更好，因为可以使用更多系统资源

