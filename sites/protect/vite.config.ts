import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  build: {
    // Две точки входа: главная и политика обработки персональных данных.
    // Пути указаны относительно корня проекта — Vite резолвит их сам.
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'privacy.html',
      },
    },
  },
})
