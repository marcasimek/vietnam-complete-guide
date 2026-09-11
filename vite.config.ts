import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

/**
 * Base path is fixed to the GitHub Pages project path from the start,
 * so manifest / service worker / deep links are never developed against "/".
 * Override with BASE_PATH=/ for a root-hosted preview.
 */
const base = process.env.BASE_PATH ?? '/vietnam-complete-guide/'

export default defineConfig({
  base,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      strategies: 'injectManifest',
      srcDir: 'src/pwa',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        id: '/vietnam-complete-guide/',
        name: 'Vietnam Complete Guide',
        short_name: 'Vietnam',
        description:
          'Interaktivní průvodce naší cestou po severním Vietnamu: plán dne, doprava, jídlo, mapa a offline režim.',
        lang: 'cs',
        dir: 'ltr',
        start_url: '/vietnam-complete-guide/',
        scope: '/vietnam-complete-guide/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#F7F5EF',
        theme_color: '#0E6B52',
        categories: ['travel', 'navigation', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false, type: 'module' },
    }),
  ],
})
