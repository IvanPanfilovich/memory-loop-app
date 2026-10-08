import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.webmanifest',
      includeAssets: ['assets/favicon/favicon.ico', 'assets/favicon/apple-touch-icon.png', 'assets/favicon/android-chrome-192x192.png', 'assets/favicon/android-chrome-512x512.png'],
      manifest: {
        name: 'Memory Loop',
        short_name: 'Memory Loop',
        description: 'Turn every podcast into a mini-course you actually remember',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'en',
        icons: [
          {
            src: '/assets/favicon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/assets/favicon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/assets/favicon/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
        categories: ['education', 'productivity', 'lifestyle'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        // Exclude favicon assets from globPatterns since they're in includeAssets
        globIgnores: ['**/favicon/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.memoryloop\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: true, // Enable in dev for PWA install button testing
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate unique hashes for each build to prevent caching issues
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
})
