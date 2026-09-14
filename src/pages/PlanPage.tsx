import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { days } from '@/data'
import { trip } from '@/data/trip'
import { formatDayLong, formatDayShort, getRegion, weekdayShort } from '@/model/registry'
import { tripPosition } from '@/lib/time'
import { Icon } from '@/components/Icon'
import { StepList } from '@/components/StepList'
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
  const focus = params.get('den') && days.some((d) => d.date === params.get('den'))
    ? (params.get('den') as string)
    : pos.focusDate
  const focusDay = days.find((d) => d.date === focus) ?? days[0]
  const blocks = useMemo(() => groupByRegion(days), [])
  const stripRef = useRef<HTMLDivElement>(null)
  const [overviewOpen, setOverviewOpen] = useState(true)

  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-date="${focus}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focus])

  const select = (date: string) => setParams({ den: date }, { replace: true })

  return (
    <div className="page plan">
      <header className="plan__head">
        <div className="plan__title">
          <p className="section-label">Náš plán</p>
          <h1>{trip.title}</h1>
          <p className="small muted">{trip.subtitle}</p>
        </div>
        <TodayBadge pos={pos} />
      </header>

      <div className="daystrip" ref={stripRef}>
        <div className="daystrip__track" role="tablist" aria-label="Výběr dne">
          {days.map((d) => {
            const region = getRegion(d.regionId)
            const active = d.date === focus
            return (
              <button
                key={d.date}
                type="button"
                role="tab"
                aria-selected={active}
                data-date={d.date}
                data-region={d.regionId}
                className={`daychip${active ? ' daychip--active' : ''}${d.date === pos.today ? ' daychip--today' : ''}`}
                onClick={() => select(d.date)}
                title={`${formatDayLong(d.date)} — ${region?.name}: ${d.title}`}
              >
                <span className="daychip__wd">{weekdayShort(d.weekday)}</span>
                <span className="daychip__d">{formatDayShort(d.date)}</span>
                <span className="daychip__dot" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="plan__body">
        <FocusDay day={focusDay} isToday={focusDay.date === pos.today} />

        <section className="overview">
          <div className="overview__head-desktop">
            <h2>Celá cesta</h2>
            <span className="small muted">18 dnů · 17 nocí · 7 oblastí</span>
          </div>
          <button
            type="button"
            className="overview__toggle"
            aria-expanded={overviewOpen}
            onClick={() => setOverviewOpen((v) => !v)}
          >
          <span className="overview__togglehead">
            <span className="section-label">Celá cesta</span>
            <span className="overview__sub">18 dnů · 17 nocí · 7 oblastí</span>
          </span>
          <Icon name="chevron-down" size={18} className={`overview__chev${overviewOpen ? ' overview__chev--open' : ''}`} />
        </button>

        {overviewOpen ? (
          <div className="overview__blocks">
            {blocks.map((block, bi) => {
              const region = getRegion(block.regionId)
              return (
                <div key={`${block.regionId}-${bi}`} className="regionblock" data-region={block.regionId}>
                  <div className="regionblock__head">
                    <span className="regionblock__dot" aria-hidden="true" />
                    <h2>{region?.name}</h2>
                    <span className="regionblock__count">
                      {block.days.length} {block.days.length === 1 ? 'den' : block.days.length < 5 ? 'dny' : 'dnů'}
                    </span>
                  </div>
                  <p className="regionblock__blurb small">{region?.blurb}</p>
                  <ul className="miniday">
                    {block.days.map((d) => (
                      <li key={d.date}>
                        <button
                          type="button"
                          className={`miniday__row${d.date === focus ? ' miniday__row--active' : ''}`}
                          onClick={() => {
                            select(d.date)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          <span className="miniday__date">
                            <span className="miniday__wd">{weekdayShort(d.weekday)}</span>
                            <span className="miniday__num">{formatDayShort(d.date)}</span>
                          </span>
                          <span className="miniday__text">
                            <span className="miniday__title">{d.title}</span>
                            <span className="miniday__theme">{d.theme}</span>
                          </span>
                          <span className="miniday__night">
                            <Icon name={d.night?.kind === 'train' ? 'train' : d.night?.kind === 'bus' ? 'bus' : d.night ? 'bed' : 'plane'} size={15} />
                            <span>{d.night ? d.night.label : 'odlet'}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function TodayBadge({ pos }: { pos: ReturnType<typeof tripPosition> }) {
  if (pos.phase === 'before') {
    return (
      <Link to={`/day/${pos.focusDate}`} className="todaybadge">
        <span className="todaybadge__num">{pos.daysUntil}</span>
        <span className="todaybadge__lbl">{pos.daysUntil === 1 ? 'den do odletu' : pos.daysUntil < 5 ? 'dny do odletu' : 'dnů do odletu'}</span>
      </Link>
    )
  }
  if (pos.phase === 'after') {
    return (
      <div className="todaybadge todaybadge--done">
        <Icon name="check" size={18} />
        <span className="todaybadge__lbl">Cesta proběhla</span>
      </div>
    )
  }
  return (
    <Link to={`/day/${pos.focusDate}`} className="todaybadge todaybadge--live">
      <span className="todaybadge__num">{formatDayShort(pos.focusDate)}</span>
      <span className="todaybadge__lbl">Dnes ve Vietnamu</span>
    </Link>
  )
}

function FocusDay({ day, isToday }: { day: Day; isToday: boolean }) {
  const region = getRegion(day.regionId)
  return (
    <article className={`daycard daycard--focus${isToday ? ' daycard--today' : ''}`} data-region={day.regionId}>
      <div className="daycard__head daycard__head--static">
        <span className="daycard__art" aria-hidden="true"><RegionArt region={day.regionId} className="daycard__artsvg" /></span>
        <span className="daycard__headtext">
          <span className="daycard__date">
            <span className="daycard__daynum">{day.index}. den z 18</span>
            <span className="daycard__dot" aria-hidden="true">·</span>
            {day.weekday} {formatDayLong(day.date)}
            <span className="daycard__dot" aria-hidden="true">·</span>
            {region?.name}
            {isToday ? <span className="chip chip--jade daycard__todaychip">dnes</span> : null}
          </span>
          <span className="daycard__title">{day.title}</span>
          <span className="daycard__theme">{day.theme}</span>
        </span>
      </div>

      <StepList items={day.items} />

      <div className="daycard__actions">
        <Link to={`/day/${day.date}`} className="btn btn--accent btn--sm btn--block">
          Otevřít celý den<Icon name="chevron-right" size={16} />
        </Link>
      </div>

      <div className="daycard__foot">
        <Icon name={day.night?.kind === 'train' ? 'train' : day.night?.kind === 'bus' ? 'bus' : day.night ? 'bed' : 'plane'} size={16} />
        {day.night ? <span>Noc: <strong>{day.night.label}</strong></span> : <span>Bez noci ve Vietnamu — večer letíme domů</span>}
      </div>
    </article>
  )
}
