import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` makes a normal multi-file build for hosting (e.g. Firebase Hosting).
// `npm run build:single` inlines everything into one HTML file, used for the Claude artifact preview.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'single' ? { outDir: 'dist-single' } : {},
  // Security rules tests need the Firestore emulator; they run separately with `npm run test:rules`.
  test: { include: ['src/**/*.test.ts'] },
}))
