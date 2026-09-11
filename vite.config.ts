import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local dev at / ; GitHub Pages project site needs the repo base path
  base: command === 'serve' ? '/' : '/career-switch-os/',
}))
