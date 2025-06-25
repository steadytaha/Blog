import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      },
      '/user': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      },
      '/post': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      },
      '/comment': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      }
    }
  },
  plugins: [react()],
})
