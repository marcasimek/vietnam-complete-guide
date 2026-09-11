import { Link, useParams } from 'react-router-dom'
import { daysForService, formatDayLong, getRegion, getService, getSources, labelForService } from '@/model/registry'
import { Icon } from '@/components/Icon'
import {
  BulletList, DetailHeader, EmptyState, FavouriteButton, MapActions, NoteBox, OpeningBlock, PriceList, Section, ShareButton, SourceLinks,
} from '@/components/ui'

export function ServicePage() {
  const { id = '' } = useParams()
  const service = getService(id)

  if (!service) {
    return (
      <div className="page">
        <EmptyState icon="bowl" title="Tenhle podnik neznáme">
          <p>ID <code>{id}</code> v rejstříku není.</p>
          <p><Link to="/guide">Otevřít rejstřík</Link></p>
        </EmptyState>
      </div>
    )
  }

  const region = getRegion(service.regionId)
  const usedDays = daysForService(service.id)
  const sources = getSources(service.sourceIds)

  return (
    <div className="page detail" data-region={service.regionId}>
      <DetailHeader
        region={service.regionId}
        eyebrow={
          <>
            <span className="chip chip--accent">{labelForService(service.kind)}</span>
            <span className="chip chip--outline">{region?.name}</span>
            {usedDays.map((d) => (
              <Link key={d} to={`/day/${d}`} className="chip chip--outline chip--link">{formatDayLong(d)}</Link>
            ))}
          </>
        }
        title={service.name}
        localName={service.localName}
        actions={<><FavouriteButton id={service.id} label={service.name} /><ShareButton label={service.name} /></>}
      >
        <p className="detail-head__lead">{service.what}</p>
      </DetailHeader>

      {service.why ? <Section title="Proč zrovna tohle"><p>{service.why}</p></Section> : null}

      {service.orderThis?.length ? (
        <Section title="Co si objednat">
          <ul className="dishes">
            {service.orderThis.map((o) => (
              <li key={o.dish}>
                <div className="dishes__row">
                  <span className="dishes__name">{o.dish}</span>
                  {o.price ? <span className="dishes__price">{priceMini(o.price.min, o.price.max, o.price.amount, o.price.currency)}</span> : null}
                </div>
                {o.localName && !o.dish.includes(o.localName) ? <p className="xsmall muted">{o.localName}</p> : null}
                {o.note ? <p className="xsmall">{o.note}</p> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {service.price?.length ? <Section title="Cena"><PriceList prices={service.price} sources={sources} /></Section> : null}
      {service.openingHours ? <Section title="Otevírací doba"><OpeningBlock hours={service.openingHours} sources={sources} /></Section> : null}

      <Section title="Kde to je">
        <MapActions geo={service.geo} label={service.name} searchFallback={service.name} />
        {service.website ? (
          <a className="btn btn--ghost btn--sm" href={service.website} target="_blank" rel="noreferrer noopener">
            <Icon name="source" size={16} />Web podniku<Icon name="arrow-up-right" size={13} />
          </a>
        ) : null}
      </Section>

      {service.practical?.length ? <Section title="Prakticky"><BulletList items={service.practical} /></Section> : null}
      {service.caveats?.length ? <Section title="Co není jisté"><BulletList items={service.caveats} icon="warning" /></Section> : null}
      {sources.length ? <Section title="Zdroje"><SourceLinks sources={sources} /></Section> : null}

      <Section title="Moje poznámka"><NoteBox id={`service:${service.id}`} label={service.name} /></Section>
    </div>
  )
}

function priceMini(min?: number, max?: number, amount?: number, currency = 'VND'): string {
  const f = new Intl.NumberFormat('cs-CZ')
  if (typeof amount === 'number') return `${f.format(amount)} ${currency}`
  if (typeof min === 'number' && typeof max === 'number') return `${f.format(min)}–${f.format(max)} ${currency}`
  return ''
}
