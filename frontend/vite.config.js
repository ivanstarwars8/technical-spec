import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Деплой под подпутём на домене (например https://dosh-lo.ru/crm/).
  // Это нужно, чтобы Vite корректно генерировал пути к ассетам в production build.
  base: '/crm/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
