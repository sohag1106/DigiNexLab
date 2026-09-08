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
    // Proxy Netlify Functions during local dev -> netlify dev
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
})
