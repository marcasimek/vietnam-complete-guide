import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export interface SwState {
  needRefresh: boolean
  offlineReady: boolean
  update: () => void
}

/**
 * Registrace service workeru s kontrolovaným přechodem na novou verzi.
 * Nová verze se NIKDY neaktivuje sama — uživatel může mít rozepsanou poznámku.
 */
export function useServiceWorker(): SwState {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateFn, setUpdateFn] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (import.meta.env.DEV) return
    const update = registerSW({
      immediate: true,
      onNeedRefresh() { setNeedRefresh(true) },
      onOfflineReady() { setOfflineReady(true) },
      onRegisterError(err: unknown) {
        // Selhání registrace nesmí shodit aplikaci — jen nebude offline.
        console.warn('Service worker se nepodařilo zaregistrovat', err)
      },
    })
    setUpdateFn(() => () => { void update(true) })
  }, [])

  return {
    needRefresh,
    offlineReady,
    update: () => updateFn?.(),
  }
}
