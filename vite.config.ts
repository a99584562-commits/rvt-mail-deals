import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps the app portable — works on a local preview and on a
// GitHub Pages project subpath without rewriting asset URLs.
export default defineConfig({
  base: './',
  server: { port: 5196, host: true },
  plugins: [react()],
})
