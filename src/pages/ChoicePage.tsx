import { Link, useParams } from 'react-router-dom'
import { daysForChoice, formatDayLong, getChoice, getService, getSources, labelForService } from '@/model/registry'
import type { Service } from '@/model/types'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { useUserState } from '@/state/UserStateContext'
import {
  BulletList, Callout, DetailHeader, EmptyState, MapActions, NoteBox, OpeningBlock, PriceList, Section, ShareButton, SourceLinks,
} from '@/components/ui'

const SERVICE_ICON: Record<Service['kind'], IconName> = {
  stay: 'bed', eatery: 'bowl', bar: 'glass', cafe: 'coffee', wellness: 'spa',
  operator: 'group', attraction: 'ticket', shop: 'market', rental: 'bicycle',
}

export function ChoicePage() {
  const { id = '' } = useParams()
  const group = getChoice(id)
  const { getPick, setPick } = useUserState()

  if (!group) {
    return (
      <div className="page">
        <EmptyState icon="swap" title="Tenhle výběr neznáme">
          <p>ID <code>{id}</code> v datech není.</p>
          <p><Link to="/plan">Otevřít celý plán</Link></p>
        </EmptyState>
      </div>
    )
  }

  const items = group.serviceIds.map(getService).filter((s): s is Service => Boolean(s))
  const usedDays = daysForChoice(group.id)
  const picked = getPick(group.id)

  return (
    <div className="page detail" data-region={group.regionId}>
      <DetailHeader
        region={group.regionId}
        eyebrow={
          <>
            <span className="chip chip--accent">{group.mode === 'or' ? 'Podle nálady' : 'Vybíráme jedno'}</span>
            {usedDays.map((d) => (
              <Link key={d} to={`/day/${d}`} className="chip chip--outline chip--link">{formatDayLong(d)}</Link>
            ))}
          </>
        }
        title={group.title}
        actions={<ShareButton label={group.title} />}
      >
        <p className="detail-head__lead">{group.intro}</p>
      </DetailHeader>

      {group.mode === 'or' ? (
        <Callout tone="info">Tohle je „nebo“, ne seznam úkolů. Klidně z toho vyber jen jedno — nebo nic.</Callout>
      ) : null}

      <Section title={group.mode === 'or' ? 'Možnosti' : 'Kandidáti'}>
        <div className="stack-4">
          {items.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              picked={picked === s.id}
              onPick={() => setPick(group.id, picked === s.id ? null : s.id)}
              pickable={group.mode === 'pick-one'}
            />
          ))}
        </div>
      </Section>

      {group.decisionNotes?.length ? (
        <Section title="Podle čeho se rozhodnout"><BulletList items={group.decisionNotes} icon="info" /></Section>
      ) : null}

      {group.openQuestions?.length ? (
        <Section title="Co zatím nevíme">
          <Callout tone="warn"><BulletList items={group.openQuestions} icon="warning" /></Callout>
        </Section>
      ) : null}

      <Section title="Moje poznámka">
        <NoteBox id={`choice:${group.id}`} label={group.title} />
      </Section>
    </div>
  )
}

function ServiceCard({ service, picked, onPick, pickable }: {
  service: Service; picked: boolean; onPick: () => void; pickable: boolean
}) {
  const sources = getSources(service.sourceIds)
  return (
    <article className={`svccard${picked ? ' svccard--picked' : ''}${service.recommended ? ' svccard--rec' : ''}`}>
      <header className="svccard__head">
        <span className="svccard__icon"><Icon name={SERVICE_ICON[service.kind]} size={21} /></span>
        <div className="svccard__headtext">
          <h3>{service.name}</h3>
          <p className="xsmall muted">
            {labelForService(service.kind)}
            {service.localName && service.localName !== service.name ? ` · ${service.localName}` : ''}
            {service.proximity ? ` · ${service.proximity}` : ''}
          </p>
        </div>
        {service.recommended ? <span className="chip chip--jade">náš tip</span> : null}
      </header>

      <p className="small">{service.what}</p>
      {service.why ? <p className="small svccard__why"><strong>Proč: </strong>{service.why}</p> : null}

      {service.orderThis?.length ? (
        <div className="orderthis">
          <p className="section-label">Co si objednat</p>
          <ul>
            {service.orderThis.map((o) => (
              <li key={o.dish}>
                <span className="orderthis__dish">{o.dish}</span>
                {o.price ? <span className="orderthis__price">{formatMini(o.price)}</span> : null}
                {o.note ? <span className="orderthis__note xsmall muted">{o.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <PriceList prices={service.price} sources={sources} />
      <OpeningBlock hours={service.openingHours} sources={sources} />

      {service.practical?.length ? <BulletList items={service.practical} /> : null}
      {service.caveats?.length ? (
        <div className="svccard__caveats">
          <p className="section-label">Co není jisté</p>
          <BulletList items={service.caveats} icon="warning" />
        </div>
      ) : null}

      <MapActions geo={service.geo} label={service.name} searchFallback={service.name} />
      {sources.length ? <SourceLinks sources={sources} compact /> : null}

      <div className="svccard__foot">
        <Link to={`/service/${service.id}`} className="btn btn--quiet btn--sm">
          Otevřít detail<Icon name="chevron-right" size={15} />
        </Link>
        {pickable ? (
          <button type="button" className={`btn btn--sm ${picked ? 'btn--primary' : 'btn--ghost'}`} onClick={onPick} aria-pressed={picked}>
            <Icon name={picked ? 'check' : 'heart'} size={15} />
            {picked ? 'Naše volba' : 'Vybrat'}
          </button>
        ) : null}
      </div>
      {picked ? <p className="xsmall muted svccard__pickednote">Vybráno jen na tomhle zařízení — ostatním se to samo neukáže.</p> : null}
    </article>
  )
}

function formatMini(price: NonNullable<Service['orderThis']>[number]['price']): string {
  if (!price) return ''
  const f = new Intl.NumberFormat('cs-CZ')
  if (typeof price.amount === 'number') return `${f.format(price.amount)} ${price.currency}`
  if (typeof price.min === 'number' && typeof price.max === 'number') return `${f.format(price.min)}–${f.format(price.max)} ${price.currency}`
  return ''
}
