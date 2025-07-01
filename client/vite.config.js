import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' https://apis.google.com https://*.googleapis.com https://*.gstatic.com",
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    },
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
      '/notifications': {
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
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Little\'s Blog',
        short_name: 'Little\'s',
        description: 'A modern blog application with offline capabilities.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
