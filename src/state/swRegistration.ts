import { registerSW } from 'virtual:pwa-register'

/**
 * Registrace service workeru probíhá při startu aplikace, ne až když někdo
 * otevře sekci Offline. Jinak by si uživatel otevřel aplikaci, odjel bez
 * signálu a nic by uloženého neměl.
 *
 * Nová verze se NIKDY neaktivuje sama — uživatel může mít rozepsanou poznámku.
 */
export interface SwState {
  needRefresh: boolean
  offlineReady: boolean
  registered: boolean
  error: string | null
}

let state: SwState = { needRefresh: false, offlineReady: false, registered: false, error: null }
const listeners = new Set<(s: SwState) => void>()
let updateFn: ((reload?: boolean) => Promise<void>) | null = null

function emit(next: Partial<SwState>): void {
  state = { ...state, ...next }
  listeners.forEach((l) => l(state))
}

export function initServiceWorker(): void {
  if (import.meta.env.DEV) return
  if (!('serviceWorker' in navigator)) {
    emit({ error: 'Tenhle prohlížeč nepodporuje service worker — offline režim nebude fungovat.' })
    return
  }
  try {
    updateFn = registerSW({
      immediate: true,
      onNeedRefresh() { emit({ needRefresh: true }) },
      onOfflineReady() { emit({ offlineReady: true, registered: true }) },
      onRegistered() { emit({ registered: true }) },
      onRegisterError(err: unknown) {
        // Selhání registrace nesmí shodit aplikaci — jen nebude offline.
        emit({ error: `Service worker se nepodařilo zaregistrovat: ${String(err)}` })
      },
    })
  } catch (err) {
    emit({ error: `Service worker se nepodařilo zaregistrovat: ${String(err)}` })
  }
}

export function getSwState(): SwState { return state }

export function subscribeSw(listener: (s: SwState) => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function applyUpdate(): void {
  void updateFn?.(true)
}
