import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: path.resolve(__dirname, '.vite'),
  server: { port: 5173 },
  resolve: {
    alias: {
      '@tonyh-2-eightfold/ef-design-system': path.resolve(__dirname, './vendor-ef-design-system/dist/index.js'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
