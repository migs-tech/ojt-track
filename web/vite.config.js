import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => ({
  // The demo is hosted on GitHub Pages under /ojt-track/
  base: mode === 'demo' ? '/ojt-track/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
