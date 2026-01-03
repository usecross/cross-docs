import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ isSsrBuild, command }) => ({
  plugins: [tailwindcss(), react()],
  root: 'frontend',
  base: command === 'serve' ? '/' : isSsrBuild ? '/' : '/static/build/',
  resolve: {
    dedupe: ['react', 'react-dom', '@inertiajs/react'],
    // Use source files from @usecross/docs for hot-reloading during development
    conditions: command === 'serve' ? ['development'] : [],
  },
  build: {
    outDir: isSsrBuild ? '../frontend/dist/ssr' : '../static/build',
    emptyOutDir: true,
    manifest: !isSsrBuild,
    rollupOptions: {
      input: resolve(__dirname, 'frontend', isSsrBuild ? 'ssr.tsx' : 'app.tsx'),
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
