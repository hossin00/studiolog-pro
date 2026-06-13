import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/studiolog-pro/',
  build: { outDir: 'dist' }
})
