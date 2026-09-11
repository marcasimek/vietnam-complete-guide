import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { alternatives, guideCards, openQuestions, planB, regions } from '@/data'
import { formatDayShort, getRegion, searchEntities } from '@/model/registry'
import type { EntityKind, IndexEntry } from '@/model/registry'
import type { RegionId, Tag } from '@/model/types'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { BulletList, Callout, EmptyState, Section, SourceLinks } from '@/components/ui'
import { getSources } from '@/model/registry'

type View = 'rejstrik' | 'prakticke' | 'varianty'

const TAG_FILTERS: { id: Tag | 'all'; label: string }[] = [
  { id: 'all', label: 'Vše' },
  { id: 'food', label: 'Jídlo' },
  { id: 'stay', label: 'Ubytování' },
  { id: 'transport', label: 'Doprava' },
  { id: 'view', label: 'Výhled' },
  { id: 'trek', label: 'Trek' },
  { id: 'culture', label: 'Kultura' },
  { id: 'activity', label: 'Aktivita' },
  { id: 'evening', label: 'Večer' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'water', label: 'Voda' },
  { id: 'budget', label: 'Levné' },
]

const KIND_LABEL: Record<EntityKind, string> = {
  place: 'místo', service: 'podnik', transport: 'přesun', choice: 'výběr', day: 'den', item: 'krok',
}

export function GuidePage() {
  const [params, setParams] = useSearchParams()
  const view = (params.get('sekce') as View) ?? 'rejstrik'
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<RegionId | 'all'>('all')
  const [tag, setTag] = useState<Tag | 'all'>('all')

  const results = useMemo(
    () => searchEntities(query, { regionId: region, tag }).filter((e) => e.kind !== 'day' || query.length > 0),
    [query, region, tag],
  )

  const setView = (v: View) => setParams({ sekce: v }, { replace: true })

  return (
    <div className="page guide">
      <header className="guide__head">
        <p className="section-label">Průvodce</p>
        <h1>Co, kde a za kolik</h1>
      </header>

      <div className="segmented" role="tablist" aria-label="Sekce průvodce">
        {([['rejstrik', 'Rejstřík'], ['prakticke', 'Praktické'], ['varianty', 'Varianty']] as const).map(([id, label]) => (
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

      {view === 'rejstrik' ? (
        <>
          <div className="searchbar">
            <Icon name="search" size={19} className="searchbar__icon" />
            <input
              type="search"
              className="searchbar__input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hanoj, Ha Giang, Ta Van, phở, coaster…"
              aria-label="Hledat v rejstříku"
              enterKeyHint="search"
            />
            {query ? (
              <button type="button" className="searchbar__clear" onClick={() => setQuery('')} aria-label="Vymazat hledání">
                <Icon name="close" size={17} />
              </button>
            ) : null}
          </div>
          <p className="xsmall muted guide__hint">Diakritika není potřeba — „ha giang“ i „Hà Giang“ najdou totéž.</p>

          <div className="filters">
            <div className="filters__row" role="group" aria-label="Filtr podle oblasti">
              <button type="button" className={`fchip${region === 'all' ? ' fchip--on' : ''}`} onClick={() => setRegion('all')}>
                Všechny oblasti
              </button>
              {regions.filter((r) => r.id !== 'transit').map((r) => (
                <button
                  key={r.id}
                  type="button"
                  data-region={r.id}
                  className={`fchip fchip--region${region === r.id ? ' fchip--on' : ''}`}
                  onClick={() => setRegion(region === r.id ? 'all' : r.id)}
                >
                  {r.name}
                </button>
              ))}
            </div>
            <div className="filters__row" role="group" aria-label="Filtr podle typu">
              {TAG_FILTERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`fchip${tag === t.id ? ' fchip--on' : ''}`}
                  onClick={() => setTag(tag === t.id ? 'all' : t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <p className="guide__count small muted">
            {results.length === 0 ? 'Nic nenalezeno' : `${results.length} ${results.length === 1 ? 'položka' : results.length < 5 ? 'položky' : 'položek'}`}
          </p>

          {results.length === 0 ? (
            <EmptyState title="Nic takového v rejstříku není">
              <p>Zkus jiné slovo, nebo zruš filtry. Hledat jde česky i místním zápisem.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setQuery(''); setRegion('all'); setTag('all') }}>
                Zrušit filtry
              </button>
            </EmptyState>
          ) : (
            <ul className="idxlist">
              {results.map((e) => <IndexRow key={`${e.kind}-${e.id}`} entry={e} />)}
            </ul>
          )}
        </>
      ) : null}

      {view === 'prakticke' ? (
        <div className="stack-5 guide__cards">
          {guideCards.map((c) => (
            <details key={c.id} className="gcard" open={c.id === 'guide-method'}>
              <summary className="gcard__summary">
                <span className="gcard__icon"><Icon name={CATEGORY_ICON[c.category]} size={20} /></span>
                <span className="gcard__sumtext">
                  <span className="gcard__title">{c.title}</span>
                  <span className="gcard__lead">{c.lead}</span>
                </span>
                <Icon name="chevron-down" size={18} className="gcard__chev" />
              </summary>
              <div className="gcard__body">
                {c.sections.map((s) => (
                  <div key={s.heading ?? s.bullets[0]} className="gcard__section">
                    {s.heading ? <p className="section-label">{s.heading}</p> : null}
                    <BulletList items={s.bullets} icon="arrow-right" />
                  </div>
                ))}
                {c.caveats?.length ? (
                  <Callout tone="warn" title="Co tahle karta neřeší">
                    <BulletList items={c.caveats} icon="warning" />
                  </Callout>
                ) : null}
                {c.sourceIds?.length ? <SourceLinks sources={getSources(c.sourceIds)} compact /> : null}
              </div>
            </details>
          ))}
        </div>
      ) : null}

      {view === 'varianty' ? (
        <>
          <Section title="Alternativní oblasti" hint="Za co by se to vyměnilo a co tím ztratíme. Nic z toho neměníme automaticky.">
            <div className="stack-4">
              {alternatives.map((a) => (
                <article key={a.id} className="altcard">
                  <h3>{a.title}</h3>
                  <p className="small altcard__cond"><strong>Kdy: </strong>{a.condition}</p>
                  <dl className="altcard__grid">
                    <div><dt>Nahradí</dt><dd>{a.replaces}</dd></div>
                    <div><dt>Stojí to</dt><dd>{a.cost}</dd></div>
                  </dl>
                  {a.gains.length ? (
                    <div><p className="section-label">Získáme</p><BulletList items={a.gains} icon="check" /></div>
                  ) : null}
                  {a.losses.length ? (
                    <div><p className="section-label">Ztratíme</p><BulletList items={a.losses} icon="warning" /></div>
                  ) : null}
                  {a.detail?.length ? (
                    <div className="altcard__detail">{a.detail.map((d) => <p key={d.slice(0, 30)} className="small">{d}</p>)}</div>
                  ) : null}
                </article>
              ))}
            </div>
          </Section>

          <Section title="Plán B" hint="Co konkrétně udělat, když se něco pokazí.">
            <div className="stack-4">
              {planB.map((s) => (
                <article key={s.id} className="altcard">
                  <h3>{s.title}</h3>
                  <p className="small altcard__cond"><strong>Kdy: </strong>{s.trigger}</p>
                  <BulletList items={s.steps} icon="arrow-right" />
                  {s.losses?.length ? <p className="xsmall muted">Ztrácíme: {s.losses.join(', ')}.</p> : null}
                </article>
              ))}
            </div>
          </Section>

          <Section title="Co zatím nevíme" hint="Poctivý seznam otevřených položek a co s nimi udělat.">
            <ul className="oqlist">
              {openQuestions.map((q) => (
                <li key={q.id}>
                  <p className="oqlist__title">{q.title}</p>
                  <p className="small">{q.detail}</p>
                  <p className="small oqlist__next"><Icon name="arrow-right" size={14} /><span><strong>Další krok: </strong>{q.nextStep}</span></p>
                  {q.relatedDayDates?.length ? (
                    <p className="chip-row">
                      {q.relatedDayDates.map((d) => (
                        <Link key={d} to={`/day/${d}`} className="chip chip--outline chip--link">{formatDayShort(d)}</Link>
                      ))}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        </>
      ) : null}
    </div>
  )
}

const CATEGORY_ICON: Record<string, IconName> = {
  entry: 'shield', flights: 'plane', insurance: 'shield', money: 'money',
  connectivity: 'wifi-off', health: 'info', safety: 'warning', rules: 'flag',
  packing: 'trip', budget: 'money',
}

function IndexRow({ entry }: { entry: IndexEntry }) {
  const region = getRegion(entry.regionId)
  return (
    <li data-region={entry.regionId}>
      <Link to={entry.href} className="idxrow">
        <span className="idxrow__icon"><Icon name={entry.icon} size={18} /></span>
        <span className="idxrow__text">
          <span className="idxrow__name">
            {entry.name}
            {entry.localName && entry.localName !== entry.name ? <span className="idxrow__local"> · {entry.localName}</span> : null}
          </span>
          <span className="idxrow__sum">{entry.summary}</span>
          <span className="idxrow__meta">
            <span className="chip chip--accent">{region?.name}</span>
            <span className="chip chip--outline">{KIND_LABEL[entry.kind]}</span>
            {entry.dayDates.slice(0, 3).map((d) => <span key={d} className="chip">{formatDayShort(d)}</span>)}
          </span>
        </span>
        <Icon name="chevron-right" size={17} className="idxrow__chev" />
      </Link>
    </li>
  )
}
