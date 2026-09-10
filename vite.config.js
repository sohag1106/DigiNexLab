import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    port: 5173,
    // Avoid watching Netlify's staging/output dirs (causes EBUSY locks on Windows).
    watch: { ignored: ['**/.netlify/**', '**/node_modules/**', '**/.git/**'] },
    // Proxy API functions during local dev. When running `wrangler pages dev`
    // in a separate terminal, functions are served on 8788; this lets `npm run
    // dev` (Vite) forward /api to them. To run everything through wrangler
    // instead, just open the wrangler URL and this proxy is unused.
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
