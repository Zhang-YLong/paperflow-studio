import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 4317,
    strictPort: true,
  },
  preview: {
    port: 4317,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
