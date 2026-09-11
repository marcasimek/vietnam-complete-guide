import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bookingTasks, budgetLines, CATEGORY_LABEL, trip } from '@/data'
import type { BudgetCategory, BudgetLine } from '@/data/budget'
import { formatDayShort, getPlace, getService, getItem, getLeg, getDay } from '@/model/registry'
import { useUserState } from '@/state/UserStateContext'
import { useServiceWorker } from '@/state/useServiceWorker'
import { buildExport, clearOwnData, importState, type BookingUserStatus, type ImportReport } from '@/lib/storage'
import { clearOfflinePackage, formatBytes, isServerReachable, prepareOffline, readStatus, type OfflineStatus, type PrepareProgress } from '@/lib/offline'
import { Icon } from '@/components/Icon'
import { BulletList, Callout, EmptyState, Section } from '@/components/ui'

type View = 'rezervace' | 'rozpocet' | 'moje' | 'offline'

const STATUS_LABEL: Record<BookingUserStatus, string> = {
  todo: 'K řešení',
  requested: 'Poptáno',
  booked: 'Rezervováno',
  paid: 'Zaplaceno',
  'not-needed': 'Netřeba',
}
const STATUS_ORDER: BookingUserStatus[] = ['todo', 'requested', 'booked', 'paid', 'not-needed']

export function TripPage() {
  const [params, setParams] = useSearchParams()
  const view = (params.get('sekce') as View) ?? 'rezervace'
  const setView = (v: View) => setParams({ sekce: v }, { replace: true })

  return (
    <div className="page trip">
      <header className="guide__head">
        <p className="section-label">Moje cesta</p>
        <h1>Rezervace, peníze a offline</h1>
      </header>

      <Callout tone="info" title="Tohle je jen na tomhle zařízení">
        Zaškrtnutí, poznámky a výběry se neposílají nikam a ostatním se samy neobjeví.
        Sdílení odkazu na den nebo místo funguje — sdílení stavu ne. K tomu slouží export a import.
      </Callout>

      <div className="segmented" role="tablist" aria-label="Sekce">
        {([['rezervace', 'Rezervace'], ['rozpocet', 'Rozpočet'], ['moje', 'Uložené'], ['offline', 'Offline']] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            className={`segmented__btn${view === id ? ' segmented__btn--on' : ''}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'rezervace' ? <Bookings /> : null}
      {view === 'rozpocet' ? <Budget /> : null}
      {view === 'moje' ? <Saved /> : null}
      {view === 'offline' ? <Offline /> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Bookings() {
  const { getBooking, setBooking } = useUserState()
  const counts = useMemo(() => {
    const c: Record<BookingUserStatus, number> = { todo: 0, requested: 0, booked: 0, paid: 0, 'not-needed': 0 }
    for (const t of bookingTasks) c[getBooking(t.id)] += 1
    return c
  }, [getBooking])

  return (
    <>
      <div className="tally">
        {STATUS_ORDER.map((s) => (
          <div key={s} className={`tally__cell tally__cell--${s}`}>
            <span className="tally__num">{counts[s]}</span>
            <span className="tally__lbl">{STATUS_LABEL[s]}</span>
          </div>
        ))}
      </div>

      <Section title="Co je potřeba zařídit" hint="Výchozí stav je vždycky „k řešení“. Nic z toho není objednané.">
        <ul className="bklist">
          {bookingTasks.map((t) => {
            const status = getBooking(t.id)
            return (
              <li key={t.id} className={`bkitem bkitem--${status}`}>
                <div className="bkitem__head">
                  <div className="bkitem__headtext">
                    <p className="bkitem__title">{t.title}</p>
                    <p className="xsmall muted">{t.when} · {t.quantity}</p>
                  </div>
                  <span className={`chip bkitem__chip bkitem__chip--${status}`}>{STATUS_LABEL[status]}</span>
                </div>

                {t.providerHint ? <p className="small"><strong>Kdo: </strong>{t.providerHint}</p> : null}
                {t.how ? <p className="small"><strong>Jak: </strong>{t.how}</p> : null}
                {t.leadTime ? <p className="xsmall muted">Předstih: {t.leadTime}</p> : null}
                {t.cancellation ? <p className="xsmall muted">Storno: {t.cancellation}</p> : null}

                {t.dayDates?.length ? (
                  <div className="chip-row">
                    {t.dayDates.map((d) => (
                      <Link key={d} to={`/day/${d}`} className="chip chip--outline chip--link">{formatDayShort(d)}</Link>
                    ))}
                  </div>
                ) : null}

                <div className="bkitem__states" role="group" aria-label={`Stav: ${t.title}`}>
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`statebtn${status === s ? ' statebtn--on' : ''}`}
                      aria-pressed={status === s}
                      onClick={() => setBooking(t.id, s)}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}

// ---------------------------------------------------------------------------

function Budget() {
  const grouped = useMemo(() => {
    const m = new Map<BudgetCategory, BudgetLine[]>()
    for (const l of budgetLines) {
      const arr = m.get(l.category) ?? []
      arr.push(l)
      m.set(l.category, arr)
    }
    return [...m.entries()]
  }, [])

  const known = budgetLines.filter((l) => l.min !== null && !l.includedIn)
  const unknown = budgetLines.filter((l) => l.min === null && !l.includedIn)
  const fx = trip.exchange.find((e) => e.from === 'VND')!
  const usdFx = trip.exchange.find((e) => e.from === 'USD')!

  const toCzk = (v: number, c: string) => (c === 'VND' ? v * fx.rate : c === 'USD' ? v * usdFx.rate : v)
  const perPersonMin = known.reduce((a, l) => a + toCzk((l.basis === 'total' ? (l.min ?? 0) / 4 : l.min ?? 0), l.currency), 0)
  const perPersonMax = known.reduce((a, l) => a + toCzk((l.basis === 'total' ? (l.max ?? 0) / 4 : l.max ?? 0), l.currency), 0)
  const czk = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 })

  return (
    <>
      <Callout tone="warn" title="Tohle není celkový rozpočet cesty">
        Sečíst jde jen to, co má cenu. {unknown.length} z {budgetLines.length} položek zatím cenu nemá —
        největší z nich je balíček loopu. Dokud nebude, je jakýkoli „celkový odhad“ jen číslo.
      </Callout>

      <div className="budgetsum">
        <div>
          <p className="section-label">Součet známých položek</p>
          <p className="budgetsum__value">{czk.format(perPersonMin)} – {czk.format(perPersonMax)} Kč</p>
          <p className="xsmall muted">na osobu · bez mezinárodních letenek · bez {unknown.length} položek bez ceny</p>
        </div>
        <p className="xsmall muted budgetsum__fx">
          Přepočet podle kurzu uloženého {fx.checkedOn}: 1 USD = {usdFx.rate} CZK, 1 USD = 26 001 VND. Kurz se neaktualizuje živě.
        </p>
      </div>

      {grouped.map(([cat, lines]) => (
        <Section key={cat} title={CATEGORY_LABEL[cat]}>
          <ul className="budgetlist">
            {lines.map((l) => (
              <li key={l.id} className={l.includedIn ? 'budgetrow budgetrow--included' : 'budgetrow'}>
                <div className="budgetrow__head">
                  <span className="budgetrow__label">{l.label}</span>
                  <span className="budgetrow__amount">
                    {l.includedIn
                      ? <span className="chip chip--jade">v balíčku</span>
                      : l.min === null
                        ? <span className="chip chip--coral">cena chybí</span>
                        : `${new Intl.NumberFormat('cs-CZ').format(l.min)}${l.max && l.max !== l.min ? `–${new Intl.NumberFormat('cs-CZ').format(l.max)}` : ''} ${l.currency}`}
                  </span>
                </div>
                <p className="xsmall muted">
                  {l.basis === 'per-person' ? 'na osobu' : 'za celou skupinu'}
                  {l.includedIn ? ` · ${l.includedIn} — nezapočítáváme dvakrát` : ''}
                </p>
                {l.note ? <p className="xsmall budgetrow__note">{l.note}</p> : null}
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Co se do součtu nepočítá">
        <BulletList
          icon="info"
          items={[
            'Mezinárodní letenky Praha ⇄ Hanoj. Ty jsou mimo tenhle model.',
            'Jídlo a ubytování na loopu a oběd na plavbě — jsou v balíčcích.',
            'Předplacená noc 18./19. 9. je vedená zvlášť jako náklad navíc, ne jako noc pobytu.',
            'Co kdo skutečně zaplatil. Tenhle model je plán, ne účetnictví.',
          ]}
        />
      </Section>
    </>
  )
}

// ---------------------------------------------------------------------------

function Saved() {
  const { state } = useUserState()
  const favourites = state.favourites
    .map((id) => {
      const place = getPlace(id)
      if (place) return { id, label: place.name, sub: place.what, href: `/place/${id}` }
      const svc = getService(id)
      if (svc) return { id, label: svc.name, sub: svc.what, href: `/service/${id}` }
      const leg = getLeg(id)
      if (leg) return { id, label: `${leg.from} → ${leg.to}`, sub: leg.summary, href: `/transport/${id}` }
      const item = getItem(id)
      if (item) return { id, label: item.item.title, sub: item.item.subtitle ?? '', href: `/item/${id}` }
      const day = getDay(id)
      if (day) return { id, label: day.title, sub: day.theme, href: `/day/${id}` }
      return null
    })
    .filter((x): x is { id: string; label: string; sub: string; href: string } => Boolean(x))

  const notes = Object.entries(state.notes)
    .map(([key, text]) => {
      const [kind, id] = key.split(':')
      const href =
        kind === 'day' ? `/day/${id}`
          : kind === 'item' ? `/item/${id}`
            : kind === 'place' ? `/place/${id}`
              : kind === 'service' ? `/service/${id}`
                : kind === 'leg' ? `/transport/${id}`
                  : kind === 'choice' ? `/choice/${id}` : '/plan'
      return { key, text, href }
    })

  return (
    <>
      <Section title="Uložené">
        {favourites.length === 0 ? (
          <EmptyState icon="heart" title="Zatím nic uloženého">
            <p>Srdíčkem u místa, podniku nebo kroku si ho uložíš sem. Zůstane jen v tomhle prohlížeči.</p>
          </EmptyState>
        ) : (
          <ul className="idxlist">
            {favourites.map((f) => (
              <li key={f.id}>
                <Link to={f.href} className="idxrow">
                  <span className="idxrow__icon"><Icon name="heart" size={18} /></span>
                  <span className="idxrow__text">
                    <span className="idxrow__name">{f.label}</span>
                    <span className="idxrow__sum">{f.sub}</span>
                  </span>
                  <Icon name="chevron-right" size={17} className="idxrow__chev" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Poznámky">
        {notes.length === 0 ? (
          <p className="small muted">Zatím žádné. Poznámku přidáš dole u kteréhokoli detailu.</p>
        ) : (
          <ul className="idxlist">
            {notes.map((n) => (
              <li key={n.key}>
                <Link to={n.href} className="idxrow">
                  <span className="idxrow__icon"><Icon name="note" size={18} /></span>
                  <span className="idxrow__text">
                    <span className="idxrow__sum">{n.text}</span>
                  </span>
                  <Icon name="chevron-right" size={17} className="idxrow__chev" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <DataTransfer />
    </>
  )
}

function DataTransfer() {
  const { state, replaceState } = useUserState()
  const [report, setReport] = useState<ImportReport | null>(null)
  const [preferImported, setPreferImported] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const env = buildExport(state)
    const blob = new Blob([JSON.stringify(env, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vietnam-moje-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onFile = async (file: File) => {
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      const { state: next, report: rep } = importState(state, parsed, preferImported)
      setReport(rep)
      if (rep.ok) replaceState(next)
    } catch {
      setReport({ ok: false, error: 'Soubor se nepodařilo přečíst — není to platný JSON.', added: { favourites: 0, notes: 0, picks: 0, bookings: 0 }, conflicts: [] })
    }
  }

  const counts = `${state.favourites.length} uložených · ${Object.keys(state.notes).length} poznámek · ${Object.keys(state.picks).length} výběrů · ${Object.keys(state.bookings).length} stavů rezervací`

  return (
    <Section title="Export a import" hint="Přenos mezi zařízeními. Není to synchronizace — musíš ho udělat ručně.">
      <p className="small muted">Soubor bude obsahovat: {counts}.</p>
      <div className="chip-row">
        <button type="button" className="btn btn--ghost btn--sm" onClick={exportData}>
          <Icon name="download" size={16} />Stáhnout moje data
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
          <Icon name="refresh" size={16} />Načíst ze souboru
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="vh"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = '' }}
      />
      <label className="checkline">
        <input type="checkbox" checked={preferImported} onChange={(e) => setPreferImported(e.target.checked)} />
        <span>Při konfliktu upřednostnit data ze souboru (jinak zůstane to, co je tady)</span>
      </label>

      {report ? (
        <Callout tone={report.ok ? 'good' : 'warn'} title={report.ok ? 'Import proběhl' : 'Import neproběhl'}>
          {report.error ? <p>{report.error}</p> : null}
          {report.ok ? (
            <p>
              Přidáno: {report.added.favourites} uložených, {report.added.notes} poznámek,{' '}
              {report.added.picks} výběrů, {report.added.bookings} stavů rezervací.
            </p>
          ) : null}
          {report.conflicts.length ? (
            <p>Konflikty ({report.conflicts.length}): {report.conflicts.slice(0, 5).join(', ')}
              {report.conflicts.length > 5 ? ` a další` : ''}. {preferImported ? 'Přepsáno souborem.' : 'Ponecháno stávající.'}</p>
          ) : null}
        </Callout>
      ) : null}

      <details className="danger">
        <summary>Smazat moje data v tomhle prohlížeči</summary>
        <p className="small">Smaže se jen to, co patří téhle aplikaci. Cizí data na stejné doméně se nedotkneme.</p>
        <button
          type="button"
          className="btn btn--sm btn--ghost danger__btn"
          onClick={() => {
            const res = clearOwnData()
            if (res.ok) window.location.reload()
          }}
        >
          Ano, smazat
        </button>
      </details>
    </Section>
  )
}

// ---------------------------------------------------------------------------

function Offline() {
  const sw = useServiceWorker()
  const [status, setStatus] = useState<OfflineStatus | null>(null)
  const [progress, setProgress] = useState<PrepareProgress | null>(null)
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [reachable, setReachable] = useState<boolean | null>(null)

  const refresh = useCallback(async () => {
    setStatus(await readStatus(trip.contentVersion))
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const run = async () => {
    setResult(null)
    setProgress({ done: 0, total: 4, label: 'Startuji…' })
    const res = await prepareOffline(trip.contentVersion, setProgress)
    setResult(res)
    setProgress(null)
    await refresh()
  }

  return (
    <>
      {sw.needRefresh ? (
        <Callout tone="good" title="Nová verze je připravená">
          <p>Rozepsaná poznámka se uloží průběžně, takže o nic nepřijdeš. Přechod proběhne až na tvoje potvrzení.</p>
          <button type="button" className="btn btn--primary btn--sm" onClick={sw.update}>
            <Icon name="refresh" size={16} />Přejít na novou verzi
          </button>
        </Callout>
      ) : null}

      <Section title="Stav offline balíčku">
        {status ? (
          <div className="offstatus">
            <div className={`offstatus__badge${status.ready ? ' offstatus__badge--ok' : ''}`}>
              <Icon name={status.ready ? 'check-circle' : 'download'} size={22} />
              <span>{status.ready ? 'Připraveno offline' : 'Zatím nepřipraveno'}</span>
            </div>
            <dl className="offstatus__grid">
              <div><dt>Uložených souborů</dt><dd>{status.files}</dd></div>
              <div><dt>Zabrané místo</dt><dd>{formatBytes(status.bytes)}{status.quota ? ` z ${formatBytes(status.quota)}` : ''}</dd></div>
              <div><dt>Verze obsahu</dt><dd>{status.version ?? '—'} {status.version && status.version !== trip.contentVersion ? '(starší než aktuální)' : ''}</dd></div>
              <div><dt>Naposledy připraveno</dt><dd>{status.lastPrepared ? new Date(status.lastPrepared).toLocaleString('cs-CZ') : 'nikdy'}</dd></div>
            </dl>
            {status.error ? <Callout tone="warn">{status.error}</Callout> : null}
          </div>
        ) : <p className="small muted">Zjišťuji stav…</p>}
      </Section>

      <Section title="Připravit cestu offline" hint="Uloží aplikaci i celý itinerář včetně detailů, které jsi ještě neotevřel.">
        {progress ? (
          <div className="prog">
            <div className="prog__bar"><span style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>
            <p className="small">{progress.label} ({progress.done}/{progress.total})</p>
          </div>
        ) : (
          <button type="button" className="btn btn--primary btn--block" onClick={() => void run()}>
            <Icon name="download" size={18} />Připravit cestu offline
          </button>
        )}
        {result ? (
          <Callout tone={result.ok ? 'good' : 'warn'} title={result.ok ? 'Uloženo a ověřeno' : 'Nepodařilo se'}>
            {result.ok
              ? <p>Aplikace i data jsou uložené. Zkontrolováno, že se dá otevřít i detail, který jsi předtím nenavštívil.</p>
              : <p>{result.error}</p>}
          </Callout>
        ) : null}
      </Section>

      <Section title="Co offline funguje a co ne">
        <div className="stack-3">
          <div className="offlist offlist--yes">
            <p className="section-label">Funguje bez signálu</p>
            <BulletList icon="check" items={[
              'Celý itinerář, všechny detaily, ceny, zdroje a kontakty jako text.',
              'Rejstřík a vyhledávání.',
              'Naše schematická mapa cesty.',
              'Uložené položky, poznámky a stav rezervací.',
            ]} />
          </div>
          <div className="offlist offlist--no">
            <p className="section-label">Bez signálu nefunguje</p>
            <BulletList icon="warning" items={[
              'Externí odkazy na weby dopravců, hotelů a rezervace.',
              'Podrobná mapa s dlaždicemi — ty se podle podmínek OpenStreetMap nesmějí stahovat dopředu.',
              'Google a Apple Maps navigace.',
              'Cokoli živého: počasí, jízdní řády, Grab, kurzy měn.',
            ]} />
          </div>
        </div>
      </Section>

      <Section title="Kontrola před cestou">
        <p className="small muted">
          {reachable === null ? 'Ověří, jestli je server opravdu dosažitelný. Údaj „online“ z prohlížeče sám o sobě nestačí.'
            : reachable ? 'Server je dosažitelný.' : 'Server není dosažitelný — teď je dobrá chvíle zkusit, jestli aplikace funguje z cache.'}
        </p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => void isServerReachable().then(setReachable)}>
          <Icon name="refresh" size={16} />Ověřit spojení
        </button>
      </Section>

      <Section title="Instalace na telefon">
        <div className="stack-3">
          <div>
            <p className="section-label">iPhone (Safari)</p>
            <BulletList icon="arrow-right" items={[
              'Otevři aplikaci v Safari (ne v Chromu — na iOS to musí být Safari).',
              'Klepni na tlačítko Sdílet dole uprostřed.',
              'Vyber „Přidat na plochu“ a potvrď.',
              'Spusť ji z plochy a teprve pak dej „Připravit cestu offline“.',
            ]} />
          </div>
          <div>
            <p className="section-label">Android (Chrome)</p>
            <BulletList icon="arrow-right" items={[
              'V menu prohlížeče vyber „Přidat na plochu“ nebo „Instalovat aplikaci“.',
              'Chrome někdy nabídne instalaci sám.',
            ]} />
          </div>
          <p className="xsmall muted">
            Programové tlačítko „Instalovat“ na iOS neexistuje — proto tu je návod místo tlačítka, které by nefungovalo.
          </p>
        </div>
      </Section>

      <Section title="Odstranit uložený balíček">
        <p className="small muted">Smaže jen cache téhle aplikace. Poznámky a rezervace zůstanou.</p>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => void clearOfflinePackage().then(() => refresh())}
        >
          Smazat offline balíček
        </button>
      </Section>
    </>
  )
}
