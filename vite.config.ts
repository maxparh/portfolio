import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',
  // host: true — сервер слушает IPv4 и IPv6, чтобы localhost открывался
  // и по 127.0.0.1, и по ::1 (частая причина «сервер запустился, но страница
  // не открывается» на Windows).
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Статика, которую раздаёт Node-сервер на VPS (server/index.ts).
    outDir: 'dist',
    emptyOutDir: true,
  },
})
