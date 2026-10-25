import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev: /api and /ws proxy to the backend on :4000. Production: Nginx routes /api and /ws.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/ws': { target: 'ws://localhost:4000', ws: true },
    },
  },
});
