import { Link, useParams } from 'react-router-dom'
import { daysForLeg, formatDayLong, getLeg, getSources } from '@/model/registry'
import type { TransportOption } from '@/model/types'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import {
  BulletList, Callout, DetailHeader, EmptyState, FavouriteButton, MapActions, NoteBox, PriceList, Section, ShareButton, SourceLinks,
} from '@/components/ui'

const MODE_ICON: Record<TransportOption['mode'], IconName> = {
  van: 'van', bus: 'bus', car: 'car', train: 'train', boat: 'boat', ferry: 'ferry',
  motorbike: 'motorbike', bicycle: 'bicycle', walk: 'walk', plane: 'plane',
  taxi: 'taxi', 'cable-car': 'cable-car',
}

const MODE_LABEL: Record<TransportOption['mode'], string> = {
  van: 'minivan', bus: 'autobus', car: 'auto', train: 'vlak', boat: 'loď', ferry: 'trajekt',
  motorbike: 'motorka', bicycle: 'kolo', walk: 'pěšky', plane: 'letadlo',
  taxi: 'taxi', 'cable-car': 'lanovka',
}

const hourFmt = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 })
function hours(min: number, max: number): string {
  return min === max ? `${hourFmt.format(min)} h` : `${hourFmt.format(min)}–${hourFmt.format(max)} h`
}

const AVAILABILITY_LABEL = {
  'confirmed-for-our-date': 'potvrzeno pro náš termín',
  likely: 'pravděpodobně jede',
  unknown: 'dostupnost neověřena',
  'not-available': 'nejede',
} as const

export function TransportPage() {
  const { id = '' } = useParams()
  const leg = getLeg(id)

  if (!leg) {
    return (
      <div className="page">
        <EmptyState icon="van" title="Tenhle přesun neznáme">
          <p>ID <code>{id}</code> v datech není.</p>
          <p><Link to="/plan">Otevřít celý plán</Link></p>
        </EmptyState>
      </div>
    )
  }

  const usedDays = daysForLeg(leg.id)
  const sources = getSources(leg.sourceIds)
  const recommended = leg.options.find((o) => o.recommended)
  const others = leg.options.filter((o) => !o.recommended)

  return (
    <div className="page detail" data-region="transit">
      <DetailHeader
        region="transit"
        eyebrow={
          <>
            <span className="chip chip--accent">Doprava</span>
            {usedDays.map((d) => (
              <Link key={d} to={`/day/${d}`} className="chip chip--outline chip--link">{formatDayLong(d)}</Link>
            ))}
          </>
        }
        title={`${leg.from} → ${leg.to}`}
        actions={<><FavouriteButton id={leg.id} label={`${leg.from} → ${leg.to}`} /><ShareButton label={`${leg.from} → ${leg.to}`} /></>}
      >
        <p className="detail-head__lead">{leg.summary}</p>
      </DetailHeader>

      <Section title="Rychlé srovnání" hint="Podrobnosti a zdroje jsou u každé varianty níž.">
        <div className="compare">
          {leg.options.map((o) => (
            <a key={o.id} href={`#opt-${o.id}`} className={`compare__row${o.recommended ? ' compare__row--rec' : ''}`}>
              <span className="compare__icon"><Icon name={MODE_ICON[o.mode]} size={18} /></span>
              <span className="compare__text">
                <span className="compare__label">{o.label}</span>
                <span className="compare__facts">
                  {o.doorToDoor ? <span>{hours(o.doorToDoor.minHours, o.doorToDoor.maxHours)}</span> : <span>čas neznáme</span>}
                  <span aria-hidden="true">·</span>
                  <span>{shortPrice(o)}</span>
                </span>
              </span>
              {o.recommended ? <span className="chip chip--jade">tip</span> : null}
            </a>
          ))}
        </div>
      </Section>

      {recommended ? (
        <Section title="Doporučená varianta">
          <OptionCard option={recommended} allSources={sources} highlight />
        </Section>
      ) : null}

      {others.length ? (
        <Section title="Alternativy" hint="Kdy se vyplatí sáhnout po nich a co za to.">
          <div className="stack-4">
            {others.map((o) => <OptionCard key={o.id} option={o} allSources={sources} />)}
          </div>
        </Section>
      ) : null}

      {leg.fallback?.length ? (
        <Section title="Když to nevyjde">
          <Callout tone="warn" title="Plán B pro tenhle přesun">
            <BulletList items={leg.fallback} icon="arrow-right" />
          </Callout>
        </Section>
      ) : null}

      {leg.practical?.length ? (
        <Section title="Prakticky"><BulletList items={leg.practical} /></Section>
      ) : null}

      {sources.length ? (
        <Section title="Zdroje"><SourceLinks sources={sources} /></Section>
      ) : null}

      <Section title="Moje poznámka">
        <NoteBox id={`leg:${leg.id}`} label={`${leg.from} → ${leg.to}`} />
      </Section>
    </div>
  )
}

function shortPrice(option: TransportOption): string {
  const p = option.price?.[0]
  if (!p) return 'cena neznámá'
  const f = new Intl.NumberFormat('cs-CZ', { notation: 'compact', maximumFractionDigits: 1 })
  const unit = p.unit === 'per-person' ? '/os.' : p.unit === 'per-vehicle' ? '/vůz' : ''
  if (typeof p.amount === 'number') return `${f.format(p.amount)} ${p.currency}${unit}`
  if (typeof p.min === 'number' && typeof p.max === 'number') return `${f.format(p.min)}–${f.format(p.max)} ${p.currency}${unit}`
  return 'cena neověřená'
}

function OptionCard({ option, allSources, highlight }: {
  option: TransportOption; allSources: ReturnType<typeof getSources>; highlight?: boolean
}) {
  const sources = getSources(option.sourceIds)
  const merged = [...new Map([...allSources, ...sources].map((s) => [s.id, s])).values()]
  return (
    <article className={`optcard${highlight ? ' optcard--main' : ''}`} id={`opt-${option.id}`}>
      <header className="optcard__head">
        <span className="optcard__icon"><Icon name={MODE_ICON[option.mode]} size={22} /></span>
        <div className="optcard__headtext">
          <h3>{option.label}</h3>
          <p className="optcard__meta">
            <span className="xsmall muted">{MODE_LABEL[option.mode]}</span>
            {highlight ? <span className="chip chip--jade">doporučeno</span> : null}
          </p>
        </div>
      </header>

      <dl className="factgrid">
        {option.doorToDoor ? (
          <div>
            <dt>Ode dveří ke dveřím</dt>
            <dd>
              {hours(option.doorToDoor.minHours, option.doorToDoor.maxHours)}
              {option.ridingTime ? <span className="muted"> (čistá jízda {hours(option.ridingTime.minHours, option.ridingTime.maxHours)})</span> : null}
            </dd>
            {option.doorToDoor.note ? <dd className="xsmall muted">{option.doorToDoor.note}</dd> : null}
          </div>
        ) : null}
        <div>
          <dt>Dostupnost pro 26. 9.</dt>
          <dd><span className={`chip ${option.availability === 'confirmed-for-our-date' ? 'chip--jade' : 'chip--amber'}`}>{AVAILABILITY_LABEL[option.availability]}</span></dd>
        </div>
        {option.operator ? (
          <div><dt>Dopravce</dt><dd>{option.operator}</dd></div>
        ) : null}
        {option.reseller ? (
          <div><dt>Kde se to prodává</dt><dd>{option.reseller}</dd></div>
        ) : null}
        {option.capacityNote ? (
          <div><dt>Kapacita pro čtyři + batohy</dt><dd>{option.capacityNote}</dd></div>
        ) : null}
        {option.bookingLeadTime ? (
          <div><dt>Předstih</dt><dd>{option.bookingLeadTime}</dd></div>
        ) : null}
      </dl>

      {option.price?.length ? (
        <div className="optcard__block">
          <p className="section-label">Cena</p>
          <PriceList prices={option.price} sources={merged} />
        </div>
      ) : null}

      {option.schedule ? (
        <div className="optcard__block">
          <p className="section-label">Jízdní řád</p>
          <p className="small">{option.schedule.summary}</p>
        </div>
      ) : null}

      {(option.pickup || option.dropoff) ? (
        <div className="optcard__block">
          <p className="section-label">Nástup a výstup</p>
          {option.pickup ? (
            <div className="stoprow">
              <span className="stoprow__badge">Nástup</span>
              <div>
                <p className="small">{option.pickup.description}</p>
                {option.pickup.geo ? <MapActions geo={option.pickup.geo} label="nástupní místo" /> : null}
              </div>
            </div>
          ) : null}
          {option.dropoff ? (
            <div className="stoprow">
              <span className="stoprow__badge">Výstup</span>
              <div>
                <p className="small">{option.dropoff.description}</p>
                {option.dropoff.geo ? <MapActions geo={option.dropoff.geo} label="výstupní místo" /> : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {(option.pros?.length || option.cons?.length) ? (
        <div className="proscons">
          {option.pros?.length ? (
            <div className="proscons__col">
              <p className="section-label">Pro</p>
              <BulletList items={option.pros} icon="check" />
            </div>
          ) : null}
          {option.cons?.length ? (
            <div className="proscons__col proscons__col--con">
              <p className="section-label">Proti</p>
              <BulletList items={option.cons} icon="warning" />
            </div>
          ) : null}
        </div>
      ) : null}

      {option.bookingUrl ? (
        <a className="btn btn--ghost btn--sm" href={option.bookingUrl} target="_blank" rel="noreferrer noopener">
          <Icon name="ticket" size={16} />Porovnat a rezervovat<Icon name="arrow-up-right" size={13} />
        </a>
      ) : null}
    </article>
  )
}
