import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/user': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/post': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/comment': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react()],
})
