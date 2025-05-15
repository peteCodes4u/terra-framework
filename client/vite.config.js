import { defineConfig } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

import react from '@vitejs/plugin-react'

const vPort = parseInt(process.env.VITE_PORT);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: vPort,
    open: true,
    proxy: {
      '/api': {
        target: `http://localhost:${vPort + 1}`,
        secure: false,
        changeOrigin: true
      }
    }
  }
})
