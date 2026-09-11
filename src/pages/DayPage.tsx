import { Link, useParams } from 'react-router-dom'
import { days } from '@/data'
import { formatDayLong, getDay, getRegion } from '@/model/registry'
import { Icon } from '@/components/Icon'
import { ItemRow } from '@/components/ItemRow'
import { RegionArt } from '@/components/RegionArt'
import { BulletList, DetailHeader, EmptyState, FavouriteButton, NoteBox, Section, ShareButton } from '@/components/ui'
import { tripPosition } from '@/lib/time'

export function DayPage() {
  const { date = '' } = useParams()
  const day = getDay(date)

  if (!day) {
    return (
      <div className="page">
        <EmptyState icon="flag" title="Takový den v plánu nemáme">
          <p>Cesta trvá od 19. 9. do 6. 10. 2026. Odkaz na <code>{date}</code> do ní nepatří — mohl vzniknout překlepem nebo pochází ze starší verze.</p>
          <p><Link to="/plan">Otevřít celý plán</Link></p>
        </EmptyState>
      </div>
    )
  }

  const region = getRegion(day.regionId)
  const idx = days.findIndex((d) => d.date === day.date)
  const prev = days[idx - 1]
  const next = days[idx + 1]
  const isToday = tripPosition().today === day.date

  return (
    <div className="page detail" data-region={day.regionId}>
      <DetailHeader
        region={day.regionId}
        eyebrow={
          <>
            <span className="chip chip--accent">{region?.name}</span>
            <span className="chip chip--outline">{day.index}. den z 18</span>
            {isToday ? <span className="chip chip--jade">dnes</span> : null}
          </>
        }
        title={day.title}
        actions={<><FavouriteButton id={day.date} label={day.title} /><ShareButton label={day.title} /></>}
      >
        <p className="detail-head__lead">{day.weekday} {formatDayLong(day.date)} · {day.theme}</p>
        <div className="detail-head__art" aria-hidden="true"><RegionArt region={day.regionId} /></div>
      </DetailHeader>

      <Section title="Program dne" hint="Každý řádek vede na konkrétní detail.">
        <ol className="steps steps--roomy">
          {day.items.map((item, i) => <ItemRow key={item.id} item={item} index={i + 1} />)}
        </ol>
      </Section>

      <div className="nightbar">
        <Icon name={day.night?.kind === 'train' ? 'train' : day.night ? 'bed' : 'plane'} size={19} />
        <div>
          <p className="section-label">Noc</p>
          <p>{day.night ? day.night.label : 'Žádná noc ve Vietnamu — večer odlétáme'}</p>
        </div>
      </div>

      {day.dayNotes?.length ? (
        <Section title="Na co si u tohohle dne dát pozor">
          <BulletList items={day.dayNotes} icon="info" />
        </Section>
      ) : null}

      <Section title="Moje poznámka">
        <NoteBox id={`day:${day.date}`} label={day.title} />
      </Section>

      <nav className="daynav" aria-label="Sousední dny">
        {prev ? (
          <Link to={`/day/${prev.date}`} className="daynav__btn" data-region={prev.regionId}>
            <Icon name="chevron-left" size={18} />
            <span><span className="daynav__lbl">Předchozí</span>{formatDayLong(prev.date)} · {prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/day/${next.date}`} className="daynav__btn daynav__btn--next" data-region={next.regionId}>
            <span><span className="daynav__lbl">Další</span>{formatDayLong(next.date)} · {next.title}</span>
            <Icon name="chevron-right" size={18} />
          </Link>
        ) : <span />}
      </nav>
    </div>
  )
}
