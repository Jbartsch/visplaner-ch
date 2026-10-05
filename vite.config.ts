import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://jbartsch.github.io/visplaner-ch/
export default defineConfig({
  plugins: [react()],
  base: '/visplaner-ch/',
})
