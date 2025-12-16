import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ isSsrBuild, command }) => ({
  plugins: [react()],
  root: 'frontend',
  base: command === 'serve' ? '/' : isSsrBuild ? '/' : '/static/build/',
  resolve: {
    dedupe: ['react', 'react-dom', '@inertiajs/react'],
  },
  build: {
    outDir: isSsrBuild ? 'dist/ssr' : 'dist',
    emptyOutDir: true,
    manifest: !isSsrBuild,
    rollupOptions: {
      input: isSsrBuild ? 'ssr.tsx' : 'app.tsx',
    },
  },
  ssr: {
    // Bundle all dependencies into the SSR build so no node_modules needed at runtime
    noExternal: isSsrBuild ? true : ['shiki', '@inertiajs/react'],
  },
  server: {
    origin: 'http://localhost:5173',
    fs: {
      allow: ['..'],
    },
  },
}))
