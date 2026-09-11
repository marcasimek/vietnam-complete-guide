import { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { days } from '@/data'
import { trip } from '@/data/trip'
import { formatDayLong, formatDayShort, getRegion, weekdayShort } from '@/model/registry'
import { tripPosition } from '@/lib/time'
import { Icon } from '@/components/Icon'
import { ItemRow } from '@/components/ItemRow'
import { RegionArt } from '@/components/RegionArt'
import type { Day, RegionId } from '@/model/types'

interface RegionBlock { regionId: RegionId; days: Day[] }

function groupByRegion(list: Day[]): RegionBlock[] {
  const out: RegionBlock[] = []
  for (const day of list) {
    const last = out[out.length - 1]
    if (last && last.regionId === day.regionId) last.days.push(day)
    else out.push({ regionId: day.regionId, days: [day] })
  }
  return out
}

export function PlanPage() {
  const [params, setParams] = useSearchParams()
  const pos = useMemo(() => tripPosition(), [])
  const focus = params.get('den') ?? pos.focusDate
  const blocks = useMemo(() => groupByRegion(days), [])
  const stripRef = useRef<HTMLDivElement>(null)

  // Vybraný den posuň do viditelné části pásu, ale nehýbej stránkou.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-date="${focus}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focus])

  const scrollToDay = (date: string) => {
    setParams({ den: date }, { replace: true })
    const el = document.getElementById(`den-${date}`)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 118
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="page plan">
      <header className="plan__head">
        <div className="plan__title">
          <p className="section-label">Náš plán</p>
          <h1>{trip.title}</h1>
          <p className="small muted">{trip.subtitle}</p>
        </div>
        <TodayBadge />
      </header>

      <div className="daystrip" ref={stripRef}>
        <div className="daystrip__track">
          {days.map((d) => {
            const region = getRegion(d.regionId)
            const active = d.date === focus
            const isToday = d.date === pos.today
            return (
              <button
                key={d.date}
                type="button"
                data-date={d.date}
                data-region={d.regionId}
                className={`daychip${active ? ' daychip--active' : ''}${isToday ? ' daychip--today' : ''}`}
                onClick={() => scrollToDay(d.date)}
                aria-label={`${formatDayLong(d.date)}, ${region?.name ?? ''}`}
              >
                <span className="daychip__wd">{weekdayShort(d.weekday)}</span>
                <span className="daychip__d">{formatDayShort(d.date)}</span>
                <span className="daychip__dot" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="plan__blocks">
        {blocks.map((block, bi) => {
          const region = getRegion(block.regionId)
          return (
            <section key={`${block.regionId}-${bi}`} className="regionblock" data-region={block.regionId}>
              <div className="regionblock__head">
                <span className="regionblock__dot" aria-hidden="true" />
                <h2>{region?.name}</h2>
                <span className="regionblock__count">
                  {block.days.length} {block.days.length === 1 ? 'den' : block.days.length < 5 ? 'dny' : 'dnů'}
                </span>
              </div>
              <p className="regionblock__blurb small">{region?.blurb}</p>
              <div className="regionblock__days">
                {block.days.map((d) => <DayCard key={d.date} day={d} isToday={d.date === pos.today} />)}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function TodayBadge() {
  const pos = useMemo(() => tripPosition(), [])
  if (pos.phase === 'before') {
    return (
      <Link to={`/day/${pos.focusDate}`} className="todaybadge">
        <span className="todaybadge__num">{pos.daysUntil}</span>
        <span className="todaybadge__lbl">{pos.daysUntil === 1 ? 'den do odletu' : pos.daysUntil < 5 ? 'dny do odletu' : 'dnů do odletu'}</span>
      </Link>
    )
  }
  if (pos.phase === 'after') {
    return <div className="todaybadge todaybadge--done"><Icon name="check" size={18} /><span className="todaybadge__lbl">Cesta proběhla</span></div>
  }
  return (
    <Link to={`/day/${pos.focusDate}`} className="todaybadge todaybadge--live">
      <span className="todaybadge__num">{formatDayShort(pos.focusDate)}</span>
      <span className="todaybadge__lbl">Dnes ve Vietnamu</span>
    </Link>
  )
}

function DayCard({ day, isToday }: { day: Day; isToday: boolean }) {
  return (
    <article className={`daycard${isToday ? ' daycard--today' : ''}`} id={`den-${day.date}`} data-region={day.regionId}>
      <Link to={`/day/${day.date}`} className="daycard__head">
        <span className="daycard__art" aria-hidden="true"><RegionArt region={day.regionId} className="daycard__artsvg" /></span>
        <span className="daycard__headtext">
          <span className="daycard__date">
            <span className="daycard__daynum">{day.index}. den</span>
            <span className="daycard__dot" aria-hidden="true">·</span>
            {day.weekday} {formatDayLong(day.date)}
            {isToday ? <span className="chip chip--jade daycard__todaychip">dnes</span> : null}
          </span>
          <span className="daycard__title">{day.title}</span>
          <span className="daycard__theme">{day.theme}</span>
        </span>
        <Icon name="chevron-right" size={18} className="daycard__chev" />
      </Link>
      <ol className="steps">
        {day.items.map((item, i) => <ItemRow key={item.id} item={item} index={i + 1} />)}
      </ol>
      <div className="daycard__foot">
        <Icon name={day.night?.kind === 'train' ? 'train' : day.night ? 'bed' : 'plane'} size={16} />
        {day.night ? <span>Noc: <strong>{day.night.label}</strong></span> : <span>Bez noci ve Vietnamu — večer letíme domů</span>}
      </div>
    </article>
  )
}
