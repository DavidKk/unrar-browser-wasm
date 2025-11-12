# @unrar-browser/e2e-demo

E2E test demo for @unrar-browser/core library. This demo is used by Playwright for automated testing.

## Development

```bash
# Install dependencies (from root)
pnpm install

# Build the WASM library first
pnpm --filter @unrar-browser/core build

# Start dev server
pnpm --filter @unrar-browser/e2e-demo dev
```

## Features

- Automatic loading and testing of RAR files
- File extraction with content preview
- Hex dump and text preview
- Error handling and debugging

## Testing

The demo automatically loads `q.rar` and displays:

- File list with sizes
- Content previews (hex and text)
- Warnings for empty or invalid content
