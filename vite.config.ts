/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import {VitePWA} from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
      VitePWA({
        registerType: 'autoUpdate',
        // Use the manifest located in public/manifest.json as the single source of truth
        // (do not define `manifest` here to avoid duplication/conflicts)
        workbox: {
          // Force la mise à jour du cache
          cleanupOutdatedCaches: true,
          // Vérifier les mises à jour toutes les heures
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: {
          // keep service worker disabled in dev to avoid stale caches during development
          enabled: false,
        },
      })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
