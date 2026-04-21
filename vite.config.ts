import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // Tauri expects a fixed port, and fails if that port is not available
  server: {
    strictPort: true,
    host: '0.0.0.0',
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  // Tauri uses the dist directory for the build output
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
