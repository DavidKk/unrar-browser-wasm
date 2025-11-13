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

The demo automatically loads and extracts **two test files** side-by-side:

1. **noencryption.rar** - Unencrypted RAR file (no password required)
2. **encryption.rar** - Encrypted RAR file (password: `123`)

Both extractions run automatically on page load and display:

- File list with sizes
- Content previews (hex and text)
- Warnings for empty or invalid content
- Side-by-side comparison of encrypted vs. unencrypted extraction

This dual-extraction setup is designed for automated E2E testing with Playwright.
