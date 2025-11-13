# Node.js Demo

A demo project showcasing the use of `@unrar-browser/core` in a Node.js environment.

English | [简体中文](./README.zh-CN.md)

## Features

- Extract RAR files in Node.js environment
- Support for both encrypted and unencrypted RAR files
- Support for extracting all files and directories
- Automatically save extracted files to a specified directory

## Usage

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Example

**Extract unencrypted RAR file:**
```bash
# Extract to default output directory (./output)
pnpm start noencryption.rar

# Extract to specified directory
pnpm start noencryption.rar ./my-output
```

**Extract encrypted RAR file:**
```bash
# Extract encrypted RAR with password
pnpm start encryption.rar ./my-output 123

# Development mode (auto-reload)
pnpm dev encryption.rar ./output 123
```

**Test Files Included:**
- `noencryption.rar` - Unencrypted test file (no password required)
- `encryption.rar` - Encrypted test file (password: `123`)

## Example Output

**Unencrypted RAR:**
```
🚀 UnRAR Node.js Demo

==================================================
📦 Loading UnRAR module...
📂 Reading RAR file: noencryption.rar
🔍 Opening archive...
✅ Archive validated successfully, extracting files...

📄 q/q.txt (6 B)
📁 q (Directory)
==================================================

✨ Extraction complete!
📊 Total: 2 file(s)/directory(ies)
📁 Output directory: ./output
```

**Encrypted RAR:**
```
🚀 UnRAR Node.js Demo

==================================================
📦 Loading UnRAR module...
📂 Reading RAR file: encryption.rar
🔐 Password: ***
🔍 Opening archive...
✅ Archive validated successfully, extracting files...

📄 encryption/encryption.txt (15 B)
📁 encryption (Directory)
==================================================

✨ Extraction complete!
📊 Total: 2 file(s)/directory(ies)
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

// 3. Set password (if needed)
if (password) {
  unrar.setPassword(password)
}

// 4. Open archive
const cmdData = new unrar.CommandData()
const archive = new unrar.Archive(cmdData)
archive.openFile('/temp.rar')

// 5. Extract files
while (archive.readHeader() > 0) {
  if (archive.getHeaderType() === unrar.HeaderType.HEAD_FILE) {
    const fileName = archive.getFileName()
    const fileData = archive.readFileData()
    // Process file data...
  }
  archive.seekToNext()
}

// 6. Cleanup
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
