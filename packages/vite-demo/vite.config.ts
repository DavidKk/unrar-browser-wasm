import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/unrar-browser-wasm/vite-demo/',
  plugins: [react()],
  resolve: {
    alias: {
      '@unrar-browser/core': resolve(import.meta.dirname, '../unrar-wasm/src/index.ts'),
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

  publicDir: 'public',
  assetsInclude: ['**/*.wasm'],

  build: {
    outDir: 'dist',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  optimizeDeps: {
    exclude: ['@unrar-browser/core'],
  },
})
