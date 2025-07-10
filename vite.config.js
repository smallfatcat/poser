import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/poser/',
  plugins: [react()],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version)
  },
  server: {
    port: 3000,
    open: true
  }
}) 