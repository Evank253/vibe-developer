import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy API to the backend during dev so the client can use relative /api paths.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist'
  }
});
