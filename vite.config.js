import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' => deployable en subcarpeta (GitHub Pages) o abriendo el build directo.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: 5173 },
})
