/**
 * Offline balíček.
 *
 * Co se ukládá: app shell (HTML/JS/CSS/fonty/ikony) — ten je v precache
 * service workeru. Data itineráře jsou součástí JS bundlu, takže se uloží
 * s ním; žádné samostatné API tu není.
 *
 * Co se NEUKLÁDÁ a neslibujeme: externí weby, rezervační stránky, živé počasí,
 * Grab a dlaždice online mapy. Standardní dlaždice OpenStreetMap mají
 * zakázaný hromadný předstah, takže offline mapa je naše vlastní schematická.
 */

export const OFFLINE_CACHE = 'vcg-offline-v1'

export interface OfflineStatus {
  /** Je service worker vůbec podporovaný a zaregistrovaný? */
  supported: boolean
  registered: boolean
  /** Prošla poslední kontrola úspěšně? */
  ready: boolean
  /** Kolik souborů je uloženo. */
  files: number
  /** Odhad velikosti v bajtech, pokud ho prohlížeč umí spočítat. */
  bytes: number | null
  /** Kolik místa zbývá podle prohlížeče. */
  quota: number | null
  /** Kdy naposledy proběhla úspěšná příprava. */
  lastPrepared: string | null
  /** Verze obsahu, která je uložená. */
  version: string | null
  error: string | null
}

const META_KEY = 'vcg:v1:offline-meta'

interface OfflineMeta { lastPrepared: string; version: string; files: number }

function readMeta(): OfflineMeta | null {
  try {
    const raw = window.localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as OfflineMeta) : null
  } catch {
    return null
  }
}

function writeMeta(meta: OfflineMeta): void {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    // Když se metadata neuloží, balíček tím nepřestane fungovat —
    // jen nebudeme umět zobrazit datum poslední přípravy.
  }
}

export async function readStatus(contentVersion: string): Promise<OfflineStatus> {
  const supported = 'serviceWorker' in navigator && 'caches' in window
  const meta = readMeta()
  const base: OfflineStatus = {
    supported,
    registered: false,
    ready: false,
    files: 0,
    bytes: null,
    quota: null,
    lastPrepared: meta?.lastPrepared ?? null,
    version: meta?.version ?? null,
    error: null,
  }
  if (!supported) {
    base.error = 'Tenhle prohlížeč offline režim nepodporuje. Plán bude fungovat jen online.'
    return base
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    base.registered = Boolean(reg?.active)

    const keys = await caches.keys()
    let files = 0
    for (const key of keys) {
      if (!key.startsWith('vcg-') && !key.includes('workbox-precache')) continue
      const cache = await caches.open(key)
      files += (await cache.keys()).length
    }
    base.files = files
    base.ready = base.registered && files > 0 && meta?.version === contentVersion

    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate()
      base.bytes = est.usage ?? null
      base.quota = est.quota ?? null
    }
  } catch (err) {
    base.error = `Stav offline balíčku se nepodařilo přečíst: ${String(err)}`
  }
  return base
}

export interface PrepareProgress { done: number; total: number; label: string }

/**
 * Projde všechny vnitřní cesty aplikace, aby se precache opravdu naplnil
 * a aby šel otevřít i detail, který uživatel předtím nenavštívil.
 *
 * Protože jde o SPA s hash routingem, všechny cesty sdílejí jeden dokument —
 * ověřujeme tedy dostupnost app shellu a všech statických assetů.
 */
export async function prepareOffline(
  contentVersion: string,
  onProgress: (p: PrepareProgress) => void,
): Promise<{ ok: boolean; error?: string; files: number }> {
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    return { ok: false, error: 'Prohlížeč offline režim nepodporuje.', files: 0 }
  }
  try {
    onProgress({ done: 0, total: 4, label: 'Čekám na service worker…' })
    const reg = await navigator.serviceWorker.ready
    if (!reg.active) return { ok: false, error: 'Service worker není aktivní. Zkus načíst stránku znovu.', files: 0 }

    onProgress({ done: 1, total: 4, label: 'Ukládám aplikaci a data…' })
    const shellUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
    const res = await fetch(shellUrl, { cache: 'reload' })
    if (!res.ok) throw new Error(`Aplikace se nenačetla (HTTP ${res.status}).`)
    // Pozor: pokud server vrátí HTML místo očekávaného assetu, nesmí to projít jako úspěch.
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html')) throw new Error('Server vrátil neočekávaný typ odpovědi.')

    onProgress({ done: 2, total: 4, label: 'Kontroluji uložené soubory…' })
    const keys = await caches.keys()
    let files = 0
    for (const key of keys) {
      if (!key.startsWith('vcg-') && !key.includes('workbox-precache')) continue
      const cache = await caches.open(key)
      files += (await cache.keys()).length
    }
    if (files === 0) {
      return {
        ok: false,
        files: 0,
        error: 'Service worker zatím nic neuložil. Načti stránku znovu a zkus to za chvíli — někdy se precache dokončuje na pozadí.',
      }
    }

    onProgress({ done: 3, total: 4, label: 'Ověřuji, že se dá otevřít i nenavštívený detail…' })
    const probe = await caches.match(shellUrl, { ignoreSearch: true })
    if (!probe) {
      return {
        ok: false,
        files,
        error: 'App shell v cache nenašel. Bez něj by offline nešel otevřít detail, který jsi předtím neotevřel.',
      }
    }

    writeMeta({ lastPrepared: new Date().toISOString(), version: contentVersion, files })
    onProgress({ done: 4, total: 4, label: 'Hotovo' })
    return { ok: true, files }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Příprava selhala: ${msg}`, files: 0 }
  }
}

/** Smaže JEN naše cache. Cizí projekty na stejném originu se nedotkneme. */
export async function clearOfflinePackage(): Promise<{ ok: boolean; error?: string }> {
  try {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k.startsWith('vcg-')).map((k) => caches.delete(k)))
    try { window.localStorage.removeItem(META_KEY) } catch { /* ignorovat */ }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

/**
 * `navigator.onLine` říká jen tolik, že má zařízení nějaké síťové rozhraní.
 * Skutečnou dosažitelnost serveru se dá ověřit jen dotazem.
 */
export async function isServerReachable(timeoutMs = 4000): Promise<boolean> {
  if (!navigator.onLine) return false
  const ctrl = new AbortController()
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}manifest.webmanifest?probe=${Date.now()}`, {
      cache: 'no-store',
      signal: ctrl.signal,
    })
    return res.ok
  } catch {
    return false
  } finally {
    window.clearTimeout(t)
  }
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return 'neznámo'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
