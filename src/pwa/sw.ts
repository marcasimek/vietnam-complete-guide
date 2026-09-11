/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

/**
 * Service worker projektu `vietnam-complete-guide`.
 *
 * IZOLACE: na `marcasimek.github.io` může běžet víc projektů na stejném
 * originu. Proto:
 *  - scope je výhradně `/vietnam-complete-guide/` (řeší se umístěním sw.js),
 *  - mažeme POUZE cache s naším prefixem, nikdy „vše kromě aktuální",
 *  - nesaháme na cizí klíče v localStorage ani na cizí IndexedDB.
 */
const CACHE_PREFIX = 'vcg-'

// Workbox si sem vloží seznam předcachovaných souborů (app shell + data).
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('install', () => {
  // Neaktivujeme se sami — uživatel musí potvrdit přechod na novou verzi,
  // aby nepřišel o rozepsanou poznámku.
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      const ours = keys.filter((k) => k.startsWith(CACHE_PREFIX))
      const current = await caches.keys().then((all) => all.filter((k) => k.includes('workbox-precache')))
      await Promise.all(
        ours.filter((k) => !current.includes(k)).map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | undefined)?.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})
