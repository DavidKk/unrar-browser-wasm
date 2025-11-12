# @unrar-wasm/core

WebAssembly build of the UnRAR library for extracting RAR archives in the browser and Node.js.

## Installation

```bash
pnpm install @unrar-wasm/core
```

## Usage

```javascript
import { getUnrarModule } from '@unrar-wasm/core'

// Initialize the module
const unrar = await getUnrarModule()

// Write RAR file to virtual filesystem
unrar.FS.writeFile('/archive.rar', fileData)

// Extract files
const cmdData = new unrar.CommandData()
const archive = new unrar.Archive(cmdData)
archive.openFile('/archive.rar')

// Read file headers and extract content
while (archive.readHeader() !== unrar.HeaderType.HEAD_ENDARC) {
  const fileName = archive.fileHead.getFileName()
  const fileData = archive.readSubData()
  console.log(`Extracted: ${fileName}`)
  archive.seekToNext()
}
```

## Building

```bash
pnpm build
```

Requires Emscripten to be installed.

## License

This project uses the UnRAR library which is distributed under a specific license. See vendor/unrar/license.txt for details.
