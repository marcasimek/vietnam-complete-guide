import { Link, useParams } from 'react-router-dom'
import { daysForPlace, formatDayLong, getPlace, getRegion, getSources, labelForPlace } from '@/model/registry'
import { RegionArt } from '@/components/RegionArt'
import {
  BulletList, DetailHeader, EmptyState, FavouriteButton, MapActions, NoteBox, OpeningBlock, PriceList, Section, ShareButton, SourceLinks,
} from '@/components/ui'

export function PlacePage() {
  const { id = '' } = useParams()
  const place = getPlace(id)

  if (!place) {
    return (
      <div className="page">
        <EmptyState icon="pin" title="Tohle místo neznáme">
          <p>ID <code>{id}</code> v rejstříku není.</p>
          <p><Link to="/guide">Otevřít rejstřík</Link></p>
        </EmptyState>
      </div>
    )
  }

  const region = getRegion(place.regionId)
  const usedDays = daysForPlace(place.id)
  const sources = getSources(place.sourceIds)

  return (
    <div className="page detail" data-region={place.regionId}>
      <DetailHeader
        region={place.regionId}
        eyebrow={
          <>
            <span className="chip chip--accent">{labelForPlace(place.kind)}</span>
            <span className="chip chip--outline">{region?.name}</span>
            {usedDays.map((d) => (
              <Link key={d} to={`/day/${d}`} className="chip chip--outline chip--link">{formatDayLong(d)}</Link>
            ))}
          </>
        }
        title={place.name}
        localName={place.localName}
        actions={<><FavouriteButton id={place.id} label={place.name} /><ShareButton label={place.name} /></>}
      >
        <p className="detail-head__lead">{place.what}</p>
        <div className="detail-head__art" aria-hidden="true"><RegionArt region={place.regionId} /></div>
      </DetailHeader>

      {place.whyHere ? (
        <Section title="Proč je to v našem plánu"><p>{place.whyHere}</p></Section>
      ) : null}

      {(place.duration || place.difficulty) ? (
        <div className="quickfacts">
          {place.duration ? <div><span className="section-label">Délka</span><span>{place.duration}</span></div> : null}
          {place.difficulty ? <div><span className="section-label">Náročnost</span><span>{place.difficulty}</span></div> : null}
        </div>
      ) : null}

      {place.price?.length ? (
        <Section title="Cena"><PriceList prices={place.price} sources={sources} /></Section>
      ) : null}

      {place.openingHours ? (
        <Section title="Provoz"><OpeningBlock hours={place.openingHours} sources={sources} /></Section>
      ) : null}

      <Section title="Kde to je">
        <MapActions geo={place.geo} label={place.name} searchFallback={place.name} />
      </Section>

      {place.practical?.length ? <Section title="Prakticky"><BulletList items={place.practical} /></Section> : null}
      {place.caveats?.length ? <Section title="Co není jisté"><BulletList items={place.caveats} icon="warning" /></Section> : null}
      {sources.length ? <Section title="Zdroje"><SourceLinks sources={sources} /></Section> : null}

      <Section title="Moje poznámka"><NoteBox id={`place:${place.id}`} label={place.name} /></Section>
    </div>
  )
}
