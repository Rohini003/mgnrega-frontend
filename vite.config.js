import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Updated config for Render deployment
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Local development
    host: true,
  },
  preview: {
    port: 8080, // Preview locally if needed
    host: true,
  },
  build: {
    outDir: 'dist', // Default Vite output folder
  },
  // ✅ Important: ensures correct asset paths on Render/NGINX
  base: '/', 
});
