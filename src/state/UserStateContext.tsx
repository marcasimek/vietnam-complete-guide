import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  EMPTY_STATE, loadState, saveState,
  type BookingUserStatus, type LocalUserState,
} from '@/lib/storage'

interface UserStateApi {
  state: LocalUserState
  /** Poslední chyba úložiště — UI ji musí umět zobrazit, ne spolknout. */
  storageError: string | null
  isFavourite: (id: string) => boolean
  toggleFavourite: (id: string) => void
  getNote: (id: string) => string
  setNote: (id: string, text: string) => void
  getPick: (groupId: string) => string | undefined
  setPick: (groupId: string, serviceId: string | null) => void
  getBooking: (id: string) => BookingUserStatus
  setBooking: (id: string, status: BookingUserStatus) => void
  replaceState: (next: LocalUserState) => void
}

const Ctx = createContext<UserStateApi | null>(null)

export function UserStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalUserState>(EMPTY_STATE)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  const commit = useCallback((updater: (prev: LocalUserState) => LocalUserState) => {
    setState((prev) => {
      const next = updater(prev)
      const result = saveState(next)
      setStorageError(result.ok ? null : result.error)
      return next
    })
  }, [])

  const api = useMemo<UserStateApi>(() => ({
    state,
    storageError,
    isFavourite: (id) => state.favourites.includes(id),
    toggleFavourite: (id) =>
      commit((prev) => ({
        ...prev,
        favourites: prev.favourites.includes(id)
          ? prev.favourites.filter((x) => x !== id)
          : [...prev.favourites, id],
      })),
    getNote: (id) => state.notes[id] ?? '',
    setNote: (id, text) =>
      commit((prev) => {
        const notes = { ...prev.notes }
        if (text.trim()) notes[id] = text
        else delete notes[id]
        return { ...prev, notes }
      }),
    getPick: (groupId) => state.picks[groupId],
    setPick: (groupId, serviceId) =>
      commit((prev) => {
        const picks = { ...prev.picks }
        if (serviceId) picks[groupId] = serviceId
        else delete picks[groupId]
        return { ...prev, picks }
      }),
    getBooking: (id) => state.bookings[id] ?? 'todo',
    setBooking: (id, status) =>
      commit((prev) => ({ ...prev, bookings: { ...prev.bookings, [id]: status } })),
    replaceState: (next) => commit(() => next),
  }), [state, storageError, commit])

  // Než se načte localStorage, nevykreslujeme prázdný stav jako pravdu.
  if (!hydrated) return null

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useUserState(): UserStateApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUserState musí být uvnitř UserStateProvider')
  return ctx
}
