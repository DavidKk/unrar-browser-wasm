# Node.js Demo

A demo project showcasing the use of `@unrar-browser/core` in a Node.js environment.

English | [简体中文](./README.zh-CN.md)

## Features

- Extract RAR files in Node.js environment
- Support for extracting all files and directories
- Automatically save extracted files to a specified directory

## Usage

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Example

```bash
# Extract RAR file to default output directory (./output)
pnpm start q.rar

# Extract RAR file to specified directory
pnpm start q.rar ./my-output

# Development mode (auto-reload)
pnpm dev q.rar
```

## Example Output

```
🚀 UnRAR Node.js Demo

==================================================
📦 Loading UnRAR module...
📂 Reading RAR file: q.rar
🔍 Opening archive...
✅ Archive validated successfully, extracting files...

📄 example.txt (1.23 KB)
📁 folder/ (Directory)
📄 folder/nested.txt (456 B)
==================================================

✨ Extraction complete!
📊 Total: 3 file(s)/directory(ies)
📁 Output directory: ./output
```

## Code Explanation

### Basic Usage

```typescript
import { getUnrarModule } from '@unrar-browser/core'
import { readFileSync } from 'fs'

// 1. Initialize module
const unrar = await getUnrarModule()

// 2. Read RAR file
const rarData = readFileSync('archive.rar')
const FS = unrar.FS
FS.writeFile('/temp.rar', new Uint8Array(rarData))

// 3. Open archive
const cmdData = new unrar.CommandData()
const archive = new unrar.Archive(cmdData)
archive.openFile('/temp.rar')

// 4. Extract files
while (archive.readHeader() > 0) {
  if (archive.getHeaderType() === unrar.HeaderType.HEAD_FILE) {
    const fileName = archive.getFileName()
    const fileData = archive.readFileData()
    // Process file data...
  }
  archive.seekToNext()
}

// 5. Cleanup
FS.unlink('/temp.rar')
```

## Notes

1. **Performance**: In Node.js environment, for large files, the native `unrar` command-line tool may perform better
2. **Memory**: Extracting large files will consume corresponding memory
3. **WASM Files**: Ensure `build/unrar.js` and `build/unrar.wasm` files from `@unrar-browser/core` exist

## Differences from Browser Version

- **Loading Method**: Node.js version uses `require()` to load directly, browser version uses `<script>` tag
- **File System**: Node.js version can use Node.js `fs` module to read/write files
- **Performance**: Node.js version typically performs better as it can use more system resources
