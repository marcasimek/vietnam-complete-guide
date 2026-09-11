import { useSyncExternalStore } from 'react'
import { applyUpdate, getSwState, subscribeSw, type SwState } from './swRegistration'

export function useServiceWorker(): SwState & { update: () => void } {
  const state = useSyncExternalStore(subscribeSw, getSwState, getSwState)
  return { ...state, update: applyUpdate }
}
