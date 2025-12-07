import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  resolve: {
    dedupe: ['react', 'react-dom', '@inertiajs/react'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'frontend/app.tsx',
    },
  },
  server: {
    origin: 'http://localhost:5173',
    fs: {
      allow: ['..'],
    },
  },
})
