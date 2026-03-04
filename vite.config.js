import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        // IMPORTANT: No 'html' in globPatterns — index.html must ALWAYS come from the network
        // so that cache-busting scripts in the HTML can run and update stale code.
        globPatterns: ['**/*.{js,css,ico,png,svg}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigationPreload: true,
        runtimeCaching: [
          {
            // Navigation requests (HTML pages) — always go to network first
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 7788,
    strictPort: true,
  }
})
