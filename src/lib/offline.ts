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
 * Ověří, že je v cache opravdu celý app shell, ne jen náhodný soubor.
 *
 * Workbox ukládá `index.html` pod klíčem s revizním parametrem, takže
 * `caches.match('/vietnam-complete-guide/')` ho NENAJDE. Kontrolujeme proto
 * obsah klíčů: potřebujeme dokument, JavaScript (v něm jsou data itineráře)
 * a styly. Když tohle sedí, otevře se offline i detail, který nikdo nenavštívil,
 * protože celý itinerář je součástí JS bundlu — nestahuje se za běhu.
 */
async function verifyShell(): Promise<{ ok: true } | { ok: false; error: string }> {
  const keys = await caches.keys()
  const ours = keys.filter((k) => k.startsWith('vcg-') || k.includes('workbox-precache'))
  let html = false
  let js = false
  let css = false
  for (const key of ours) {
    const cache = await caches.open(key)
    for (const req of await cache.keys()) {
      const path = new URL(req.url).pathname
      if (path.endsWith('.html') || path.endsWith('/')) html = true
      else if (path.endsWith('.js')) js = true
      else if (path.endsWith('.css')) css = true
    }
  }
  if (!html) return { ok: false, error: 'V cache chybí stránka aplikace. Načti stránku znovu a zkus to za chvíli.' }
  if (!js) return { ok: false, error: 'V cache chybí kód aplikace i s daty itineráře. Bez něj by offline nešel otevřít detail, který jsi předtím neotevřel.' }
  if (!css) return { ok: false, error: 'V cache chybí styly. Aplikace by offline vypadala rozbitě — zkus přípravu znovu.' }
  return { ok: true }
}

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
    const check = await verifyShell()
    if (!check.ok) {
      return { ok: false, files, error: check.error }
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

const nf1 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 })
const nf0 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 })

/**
 * Požádá prohlížeč o trvalé úložiště.
 *
 * POZOR NA SLIBY: „persistent storage" znamená jen to, že prohlížeč data
 * nesmaže sám při nedostatku místa. NEchrání proti tomu, když si uživatel
 * smaže data stránky, přeinstaluje prohlížeč nebo mu dojde místo v telefonu.
 * Proto k tomu v UI patří i export dat, ne místo něj.
 */
export async function requestPersistentStorage(): Promise<{ granted: boolean; supported: boolean; error?: string }> {
  if (!navigator.storage?.persist) {
    return { granted: false, supported: false, error: 'Tenhle prohlížeč trvalé úložiště nepodporuje. Aplikace bude fungovat, ale prohlížeč může data uvolnit při nedostatku místa.' }
  }
  try {
    const already = await navigator.storage.persisted()
    if (already) return { granted: true, supported: true }
    const granted = await navigator.storage.persist()
    return { granted, supported: true }
  } catch (err) {
    return { granted: false, supported: true, error: `Žádost selhala: ${String(err)}` }
  }
}

export async function isStoragePersisted(): Promise<boolean | null> {
  if (!navigator.storage?.persisted) return null
  try {
    return await navigator.storage.persisted()
  } catch {
    return null
  }
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return 'neznámo'
  if (bytes < 1024) return `${nf0.format(bytes)} B`
  if (bytes < 1024 * 1024) return `${nf0.format(bytes / 1024)} kB`
  if (bytes < 1024 * 1024 * 1024) return `${nf1.format(bytes / 1024 / 1024)} MB`
  return `${nf1.format(bytes / 1024 / 1024 / 1024)} GB`
}
