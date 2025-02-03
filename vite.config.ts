import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Алиас для импортов
    },
  },
  server: {
    port: 3000, // Порт разработки
    open: true, // Автоматически открывать браузер
  },
  build: {
    outDir: 'dist', // Папка для сборки
    assetsInlineLimit: 4096, // Лимит для встроенных ассетов
  },
  optimizeDeps: {
    include: ['vue'], // Оптимизация зависимостей
  },
});