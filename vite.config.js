import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 12000,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    hmr: {
      clientPort: 443
    },
    allowedHosts: [
      'work-1-ywbhbikoyjcaxyrh.prod-runtime.all-hands.dev',
      'work-2-ywbhbikoyjcaxyrh.prod-runtime.all-hands.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});