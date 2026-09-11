import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Confidence, GeoPoint, OpeningHours, Price, Source } from '@/model/types'
import { CONFIDENCE_HELP, CONFIDENCE_LABEL, formatForFour, formatPriceValue, formatUnit, toCzk } from '@/lib/money'
import { PRECISION_HELP, PRECISION_LABEL, appleMapsUrl, mapsUrl, navigateUrl } from '@/lib/geo'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { useUserState } from '@/state/UserStateContext'

// ---------------------------------------------------------------------------

export function Section({ title, hint, children, action }: {
  title: string; hint?: string; children: ReactNode; action?: ReactNode
}) {
  return (
    <section className="section">
      <div className="section__head">
        <h2>{title}</h2>
        {action}
      </div>
      {hint ? <p className="section__hint small muted">{hint}</p> : null}
      {children}
    </section>
  )
}

export function Callout({ tone = 'info', title, children }: {
  tone?: 'info' | 'warn' | 'good'; title?: string; children: ReactNode
}) {
  const icon: IconName = tone === 'warn' ? 'warning' : tone === 'good' ? 'check-circle' : 'info'
  return (
    <div className={`callout callout--${tone}`}>
      <Icon name={icon} size={18} className="callout__icon" />
      <div>
        {title ? <strong className="callout__title">{title}</strong> : null}
        <div className="callout__body">{children}</div>
      </div>
    </div>
  )
}

export function BulletList({ items, icon = 'check' }: { items: string[]; icon?: IconName }) {
  return (
    <ul className="bullets">
      {items.map((t) => (
        <li key={t}>
          <Icon name={icon} size={15} className="bullets__icon" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function ConfidenceChip({ level }: { level: Confidence }) {
  const tone =
    level === 'verified' ? 'chip--jade'
      : level === 'published' ? 'chip--ocean'
        : level === 'estimate' ? 'chip--amber'
          : level === 'traveller-plan' ? 'chip--plum'
            : 'chip--coral'
  return <span className={`chip ${tone}`} title={CONFIDENCE_HELP[level]}>{CONFIDENCE_LABEL[level]}</span>
}

// ---------------------------------------------------------------------------

export function PriceBlock({ price, sources }: { price: Price; sources: Source[] }) {
  const value = formatPriceValue(price)
  const czk = toCzk(price)
  const four = formatForFour(price)
  const used = sources.filter((s) => price.sourceIds?.includes(s.id))
  return (
    <div className="price">
      <div className="price__row">
        <span className="price__value">{value ?? 'Cenu neznáme'}</span>
        <ConfidenceChip level={price.confidence} />
      </div>
      <div className="price__meta small muted">
        <span>{formatUnit(price)}</span>
        {czk ? <span title={`Kurz uložený ${czk.rateDate}, neaktualizuje se živě`}>{czk.text}</span> : null}
        {four ? <span>{four}</span> : null}
      </div>
      {price.note ? <p className="small price__note">{price.note}</p> : null}
      {price.includes?.length ? (
        <p className="xsmall muted">V ceně: {price.includes.join(', ')}.</p>
      ) : null}
      {price.excludes?.length ? (
        <p className="xsmall muted">Není v ceně: {price.excludes.join(', ')}.</p>
      ) : null}
      {used.length ? <SourceLinks sources={used} compact /> : null}
    </div>
  )
}

export function PriceList({ prices, sources }: { prices?: Price[]; sources: Source[] }) {
  if (!prices?.length) return null
  return (
    <div className="stack-3 price-list">
      {prices.map((p, i) => <PriceBlock key={`${p.unit}-${i}`} price={p} sources={sources} />)}
    </div>
  )
}

export function OpeningBlock({ hours, sources }: { hours?: OpeningHours; sources: Source[] }) {
  if (!hours) return null
  const used = sources.filter((s) => hours.sourceIds?.includes(s.id))
  return (
    <div className="opening">
      <Icon name="clock" size={17} />
      <div>
        <span className="opening__text">{hours.summary}</span>
        <span className="opening__meta">
          <ConfidenceChip level={hours.confidence} />
          {used.length ? <SourceLinks sources={used} compact /> : null}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function SourceLinks({ sources, compact = false }: { sources: Source[]; compact?: boolean }) {
  if (!sources.length) return null
  if (compact) {
    return (
      <span className="src-inline">
        {sources.map((s) =>
          s.url ? (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer noopener" className="src-inline__link">
              <Icon name="source" size={13} />
              {s.publisher ?? s.title}
              <Icon name="arrow-up-right" size={11} />
            </a>
          ) : (
            <span key={s.id} className="src-inline__link src-inline__link--plain">
              <Icon name="source" size={13} />{s.publisher ?? s.title}
            </span>
          ),
        )}
      </span>
    )
  }
  return (
    <ul className="src-list">
      {sources.map((s) => (
        <li key={s.id}>
          <div className="src-list__head">
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer noopener">
                {s.title}
                <Icon name="arrow-up-right" size={13} />
              </a>
            ) : (
              <span>{s.title}</span>
            )}
            <span className="chip chip--outline">{s.checkedOn}</span>
          </div>
          {s.publisher ? <p className="xsmall muted">{s.publisher}</p> : null}
          <p className="xsmall muted">Podpírá: {s.supports.join('; ')}.</p>
          {s.note ? <p className="xsmall src-list__note">{s.note}</p> : null}
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------

export function MapActions({ geo, label, searchFallback }: {
  geo?: GeoPoint; label: string; searchFallback?: string
}) {
  const gmaps = mapsUrl(geo, searchFallback)
  const nav = navigateUrl(geo, searchFallback)
  const apple = appleMapsUrl(geo, searchFallback)
  if (!gmaps && !nav) {
    return <p className="small muted">Pro tohle místo nemáme ani adresu, ani spolehlivý název k vyhledání.</p>
  }
  return (
    <div className="map-actions">
      <div className="map-actions__row">
        {gmaps ? (
          <a className="btn btn--ghost btn--sm" href={gmaps} target="_blank" rel="noreferrer noopener">
            <Icon name="pin" size={17} />Mapa
          </a>
        ) : null}
        {nav ? (
          <a className="btn btn--ghost btn--sm" href={nav} target="_blank" rel="noreferrer noopener">
            <Icon name="arrow-right" size={17} />Navigovat
          </a>
        ) : null}
        {apple ? (
          <a className="btn btn--quiet btn--sm" href={apple} target="_blank" rel="noreferrer noopener">
            Apple Maps
          </a>
        ) : null}
      </div>
      {geo ? (
        <p className="xsmall muted map-actions__note">
          <strong>{PRECISION_LABEL[geo.precision]}</strong> — {PRECISION_HELP[geo.precision]}
          {geo.address ? ` Adresa podle zdroje: ${geo.address}.` : ''}
        </p>
      ) : (
        <p className="xsmall muted map-actions__note">
          Otevře vyhledání „{searchFallback}“ — přesný bod pro {label} nemáme ověřený.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

export function FavouriteButton({ id, label }: { id: string; label: string }) {
  const { isFavourite, toggleFavourite } = useUserState()
  const on = isFavourite(id)
  return (
    <button
      type="button"
      className={`icon-btn${on ? ' icon-btn--on' : ''}`}
      aria-pressed={on}
      aria-label={on ? `Odebrat ${label} z uložených` : `Uložit ${label}`}
      title={on ? 'Uloženo — jen na tomhle zařízení' : 'Uložit (jen na tomhle zařízení)'}
      onClick={() => toggleFavourite(id)}
    >
      <Icon name="heart" size={19} />
    </button>
  )
}

export function ShareButton({ label }: { label: string }) {
  const [done, setDone] = useState(false)
  const onClick = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: label, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setDone(true)
      window.setTimeout(() => setDone(false), 1800)
    } catch {
      // Uživatel sdílení zrušil, nebo schránka není povolená — nic se neděje.
    }
  }
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label={`Sdílet odkaz na ${label}`} title="Sdílet odkaz">
      <Icon name={done ? 'check' : 'share'} size={18} />
    </button>
  )
}

export function NoteBox({ id, label }: { id: string; label: string }) {
  const { getNote, setNote, storageError } = useUserState()
  const value = getNote(id)
  const [open, setOpen] = useState(Boolean(value))
  const fieldId = useId()

  if (!open) {
    return (
      <button type="button" className="btn btn--quiet btn--sm note-open" onClick={() => setOpen(true)}>
        <Icon name="note" size={16} />Přidat poznámku
      </button>
    )
  }
  return (
    <div className="note">
      <label htmlFor={fieldId} className="section-label">Moje poznámka k „{label}“</label>
      <textarea
        id={fieldId}
        className="note__input"
        rows={3}
        value={value}
        placeholder="Jen pro tebe, na tomhle zařízení. Necpi sem čísla dokladů ani rezervační kódy."
        onChange={(e) => setNote(id, e.target.value)}
      />
      <p className="xsmall muted">Uloženo jen v tomhle prohlížeči. Ostatním se to samo neobjeví.</p>
      {storageError ? <p className="xsmall note__error">{storageError}</p> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------

export function DetailHeader({ region, eyebrow, title, localName, actions, children }: {
  region: string; eyebrow: ReactNode; title: string; localName?: string
  actions?: ReactNode; children?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <header className="detail-head" data-region={region}>
      <div className="detail-head__bar">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Zpět">
          <Icon name="chevron-left" size={20} />
        </button>
        <div className="topbar__spacer" />
        {actions}
      </div>
      <div className="detail-head__body">
        <div className="detail-head__eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {localName && localName !== title ? <p className="detail-head__local">{localName}</p> : null}
        {children}
      </div>
    </header>
  )
}

export function LinkRow({ to, icon, title, subtitle, meta, tone }: {
  to: string; icon: IconName; title: string; subtitle?: string; meta?: ReactNode; tone?: 'accent'
}) {
  return (
    <Link to={to} className={`link-row${tone === 'accent' ? ' link-row--accent' : ''}`}>
      <span className="link-row__icon"><Icon name={icon} size={20} /></span>
      <span className="link-row__text">
        <span className="link-row__title">{title}</span>
        {subtitle ? <span className="link-row__sub">{subtitle}</span> : null}
        {meta ? <span className="link-row__meta">{meta}</span> : null}
      </span>
      <Icon name="chevron-right" size={18} className="link-row__chev" />
    </Link>
  )
}

export function EmptyState({ icon = 'search', title, children, action }: {
  icon?: IconName; title: string; children?: ReactNode; action?: ReactNode
}) {
  return (
    <div className="empty">
      <span className="empty__icon"><Icon name={icon} size={26} /></span>
      <h2>{title}</h2>
      {children ? <div className="empty__body small muted">{children}</div> : null}
      {action}
    </div>
  )
}
