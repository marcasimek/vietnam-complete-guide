/**
 * Lokální stav zařízení.
 *
 * IZOLACE: všechny klíče začínají `vcg:v1:`. Na `marcasimek.github.io` může
 * běžet víc projektů na stejném originu — nikdy nesmíme sáhnout na cizí klíče.
 * Proto žádné `localStorage.clear()` a žádné mazání „všeho kromě našeho".
 */

export const STORAGE_NS = 'vcg'
export const SCHEMA_VERSION = 1
const PREFIX = `${STORAGE_NS}:v${SCHEMA_VERSION}:`

export type BookingUserStatus = 'todo' | 'requested' | 'booked' | 'paid' | 'not-needed'

export interface LocalUserState {
  schemaVersion: number
  /** ID oblíbených entit. */
  favourites: string[]
  /** ID entity → poznámka (prostý text, nikdy se nevykresluje jako HTML). */
  notes: Record<string, string>
  /** ID výběru (ChoiceGroup) → ID zvolené služby. */
  picks: Record<string, string>
  /** ID rezervační položky → stav. */
  bookings: Record<string, BookingUserStatus>
  updatedAt: string
}

export const EMPTY_STATE: LocalUserState = {
  schemaVersion: SCHEMA_VERSION,
  favourites: [],
  notes: {},
  picks: {},
  bookings: {},
  updatedAt: '',
}

const STATE_KEY = `${PREFIX}state`

export type StorageResult<T> = { ok: true; value: T } | { ok: false; error: string }

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): StorageResult<true> {
  try {
    window.localStorage.setItem(key, value)
    return { ok: true, value: true }
  } catch (err) {
    const name = err instanceof DOMException ? err.name : 'Error'
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      return { ok: false, error: 'Úložiště je plné. Smaž staré poznámky nebo uvolni místo v prohlížeči.' }
    }
    return { ok: false, error: 'Prohlížeč neumožnil uložení (soukromé okno nebo zablokovaná data stránky).' }
  }
}

export function loadState(): LocalUserState {
  const raw = safeGet(STATE_KEY)
  if (!raw) return { ...EMPTY_STATE }
  try {
    const parsed = JSON.parse(raw) as unknown
    return migrate(parsed)
  } catch {
    // Poškozená data nesmí shodit aplikaci — a nesmažeme je naslepo.
    return { ...EMPTY_STATE }
  }
}

export function saveState(state: LocalUserState): StorageResult<true> {
  const next: LocalUserState = { ...state, schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString() }
  return safeSet(STATE_KEY, JSON.stringify(next))
}

/**
 * Migrace vlastního schématu. Zatím existuje jen v1, ale funkce je tu
 * proto, aby budoucí verze nikdy nepřepsala osobní stav naslepo.
 */
export function migrate(input: unknown): LocalUserState {
  if (!input || typeof input !== 'object') return { ...EMPTY_STATE }
  const raw = input as Partial<LocalUserState>
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0
  if (version > SCHEMA_VERSION) {
    // Data z novější verze aplikace: nic nepřepisujeme, jen přečteme, co známe.
    // Lepší je zobrazit méně než smazat cizí budoucí pole.
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    favourites: Array.isArray(raw.favourites) ? raw.favourites.filter((x) => typeof x === 'string') : [],
    notes: isStringRecord(raw.notes) ? raw.notes : {},
    picks: isStringRecord(raw.picks) ? raw.picks : {},
    bookings: isBookingRecord(raw.bookings) ? raw.bookings : {},
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
  }
}

function isStringRecord(v: unknown): v is Record<string, string> {
  return Boolean(v) && typeof v === 'object' && Object.values(v as object).every((x) => typeof x === 'string')
}

const BOOKING_VALUES: BookingUserStatus[] = ['todo', 'requested', 'booked', 'paid', 'not-needed']
function isBookingRecord(v: unknown): v is Record<string, BookingUserStatus> {
  return (
    Boolean(v) &&
    typeof v === 'object' &&
    Object.values(v as object).every((x) => typeof x === 'string' && BOOKING_VALUES.includes(x as BookingUserStatus))
  )
}

// --------------------------------------------------------------------------
// Export / import
// --------------------------------------------------------------------------

export interface ExportEnvelope {
  app: 'vietnam-complete-guide'
  schemaVersion: number
  exportedAt: string
  state: LocalUserState
}

export function buildExport(state: LocalUserState): ExportEnvelope {
  return {
    app: 'vietnam-complete-guide',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
}

export interface ImportReport {
  ok: boolean
  error?: string
  added: { favourites: number; notes: number; picks: number; bookings: number }
  conflicts: string[]
}

/**
 * Import slučuje, nepřepisuje naslepo. Konflikty (stejný klíč, jiná hodnota)
 * hlásíme a necháváme rozhodnout uživatele — `preferImported` říká, co vyhraje.
 */
export function importState(
  current: LocalUserState,
  payload: unknown,
  preferImported: boolean,
): { state: LocalUserState; report: ImportReport } {
  const empty: ImportReport = { ok: false, added: { favourites: 0, notes: 0, picks: 0, bookings: 0 }, conflicts: [] }

  if (!payload || typeof payload !== 'object') {
    return { state: current, report: { ...empty, error: 'Soubor není platný JSON objekt.' } }
  }
  const env = payload as Partial<ExportEnvelope>
  if (env.app !== 'vietnam-complete-guide') {
    return { state: current, report: { ...empty, error: 'Soubor patří jiné aplikaci. Import zamítnut.' } }
  }
  if (typeof env.schemaVersion !== 'number') {
    return { state: current, report: { ...empty, error: 'Chybí verze schématu.' } }
  }
  if (env.schemaVersion > SCHEMA_VERSION) {
    return {
      state: current,
      report: { ...empty, error: `Soubor je z novější verze (schéma ${env.schemaVersion}). Aktualizuj aplikaci a zkus to znovu.` },
    }
  }
  const incoming = migrate(env.state)

  const favourites = [...new Set([...current.favourites, ...incoming.favourites])]
  const conflicts: string[] = []

  const mergeRecord = <T extends string>(a: Record<string, T>, b: Record<string, T>, label: string) => {
    const out: Record<string, T> = { ...a }
    let added = 0
    for (const [k, v] of Object.entries(b)) {
      if (k in out && out[k] !== v) {
        conflicts.push(`${label}: ${k}`)
        if (preferImported) out[k] = v
      } else if (!(k in out)) {
        out[k] = v
        added += 1
      }
    }
    return { out, added }
  }

  const notes = mergeRecord(current.notes, incoming.notes, 'poznámka')
  const picks = mergeRecord(current.picks, incoming.picks, 'výběr')
  const bookings = mergeRecord(current.bookings, incoming.bookings, 'rezervace')

  return {
    state: {
      schemaVersion: SCHEMA_VERSION,
      favourites,
      notes: notes.out,
      picks: picks.out,
      bookings: bookings.out,
      updatedAt: new Date().toISOString(),
    },
    report: {
      ok: true,
      added: {
        favourites: favourites.length - current.favourites.length,
        notes: notes.added,
        picks: picks.added,
        bookings: bookings.added,
      },
      conflicts,
    },
  }
}

/** Smaže JEN naše klíče. Nikdy ne cizí data na stejném originu. */
export function clearOwnData(): StorageResult<true> {
  try {
    const ours: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(PREFIX)) ours.push(key)
    }
    ours.forEach((k) => window.localStorage.removeItem(k))
    return { ok: true, value: true }
  } catch {
    return { ok: false, error: 'Data se nepodařilo smazat.' }
  }
}
