import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/ssr.tsx'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss', '@tailwindcss/typography', '@inertiajs/react'],
})
