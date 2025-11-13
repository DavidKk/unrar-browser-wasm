import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  base: '/unrar-browser-wasm/',
  plugins: [react()],
  resolve: {
    alias: {
      '@unrar-browser/core': resolve(__dirname, '../unrar-wasm/src/index.ts'),
    },
  },

  server: {
    port: 3000,
    open: false,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['../..'],
    },
  },

  publicDir: resolve(__dirname, '../unrar-wasm/build'),
  assetsInclude: ['**/*.wasm'],

  build: {
    outDir: 'dist',
    copyPublicDir: true,
  },

  optimizeDeps: {
    exclude: ['@unrar-browser/core'],
  },
})
