import { Link, useParams } from 'react-router-dom'
import { getChoice, getItem, getLeg, getPlace, getService, getSources, formatDayLong } from '@/model/registry'
import { alternativeById } from '@/data/alternatives'
import { Icon } from '@/components/Icon'
import { RegionArt } from '@/components/RegionArt'
import {
  AlternativeCard, BulletList, Callout, DetailHeader, EmptyState, FavouriteButton, LinkRow, NoteBox, Section, ShareButton, SourceLinks,
} from '@/components/ui'

const KIND_LABEL = {
  transport: 'Přesun',
  'stay-and-food': 'Ubytování a jídlo',
  activity: 'Aktivita',
  food: 'Jídlo',
  evening: 'Večer',
  walk: 'Pěšky',
  admin: 'Zařídit',
  rest: 'Odpočinek',
  choice: 'Výběr',
} as const

export function ItemPage() {
  const { id = '' } = useParams()
  const found = getItem(id)

  if (!found) {
    return (
      <div className="page">
        <EmptyState icon="flag" title="Tenhle krok neznáme">
          <p>ID <code>{id}</code> v publikovaném plánu není. Odkaz může být z jiné verze aplikace.</p>
          <p><Link to="/plan">Otevřít celý plán</Link></p>
        </EmptyState>
      </div>
    )
  }

  const { day, item } = found
  const leg = item.transportLegId ? getLeg(item.transportLegId) : undefined
  const choices = (item.choiceGroupIds ?? []).map(getChoice).filter(Boolean)
  const itemPlaces = (item.placeIds ?? []).map(getPlace).filter(Boolean)
  const itemServices = (item.serviceIds ?? []).map(getService).filter(Boolean)
  const sources = getSources(item.sourceIds)
  const alts = (item.alternativeIds ?? []).map((id) => alternativeById.get(id)).filter(Boolean)

  return (
    <div className="page detail" data-region={day.regionId}>
      <DetailHeader
        region={day.regionId}
        eyebrow={
          <>
            <Link to={`/day/${day.date}`} className="chip chip--accent chip--link">
              <Icon name="chevron-left" size={13} />{formatDayLong(day.date)}
            </Link>
            <span className="chip chip--outline">{KIND_LABEL[item.kind]}</span>
            {item.status === 'optional' ? <span className="chip chip--coral">volitelné</span> : null}
            {item.status === 'backup' ? <span className="chip chip--amber">náhradní varianta</span> : null}
          </>
        }
        title={item.title}
        actions={<><FavouriteButton id={item.id} label={item.title} /><ShareButton label={item.title} /></>}
      >
        {item.subtitle ? <p className="detail-head__lead">{item.subtitle}</p> : null}
        <div className="detail-head__art" aria-hidden="true"><RegionArt region={day.regionId} /></div>
      </DetailHeader>

      {item.condition ? (
        <Callout tone="warn" title="Platí jen za podmínky">{item.condition}</Callout>
      ) : null}

      {item.detail?.length ? (
        <div className="prose">
          {item.detail.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
        </div>
      ) : null}

      {leg ? (
        <Section title="Doprava" hint="Doporučená varianta a alternativy, včetně nástupu a času ode dveří ke dveřím.">
          <LinkRow
            to={`/transport/${leg.id}`}
            icon="van"
            title={`${leg.from} → ${leg.to}`}
            subtitle={`${leg.options.length} varianty · ${leg.options.find((o) => o.recommended)?.label ?? 'porovnání'}`}
            meta={<span className="chip chip--accent">Otevřít dopravní varianty</span>}
            tone="accent"
          />
        </Section>
      ) : null}

      {choices.length ? (
        <Section title="Výběr" hint="Konkrétní možnosti s cenami, polohou a zdroji.">
          <div className="stack-3">
            {choices.map((c) => c ? (
              <LinkRow
                key={c.id}
                to={`/choice/${c.id}`}
                icon={c.mode === 'or' ? 'swap' : 'group'}
                title={c.title}
                subtitle={c.intro}
                meta={<span className="chip chip--outline">{c.serviceIds.length} možností</span>}
                tone="accent"
              />
            ) : null)}
          </div>
        </Section>
      ) : null}

      {itemPlaces.length ? (
        <Section title="Místo">
          <div className="stack-3">
            {itemPlaces.map((p) => p ? (
              <LinkRow key={p.id} to={`/place/${p.id}`} icon="pin" title={p.name} subtitle={p.what} tone="accent" />
            ) : null)}
          </div>
        </Section>
      ) : null}

      {itemServices.length ? (
        <Section title="Podniky">
          <div className="stack-3">
            {itemServices.map((s) => s ? (
              <LinkRow key={s.id} to={`/service/${s.id}`} icon="bowl" title={s.name} subtitle={s.what} />
            ) : null)}
          </div>
        </Section>
      ) : null}

      {item.practical?.length ? (
        <Section title="Prakticky"><BulletList items={item.practical} /></Section>
      ) : null}

      {item.caveats?.length ? (
        <Section title="Co není jisté"><BulletList items={item.caveats} icon="warning" /></Section>
      ) : null}

      {alts.length ? (
        <Section title="Náhradní varianta" hint="Co udělat, když tenhle krok nevyjde.">
          <div className="stack-4">
            {alts.map((a) => a ? <AlternativeCard key={a.id} alt={a} /> : null)}
          </div>
        </Section>
      ) : null}

      {sources.length ? (
        <Section title="Zdroje" hint="Datum u zdroje je den, kdy jsme ho kontrolovali.">
          <SourceLinks sources={sources} />
        </Section>
      ) : null}

      <Section title="Moje poznámka">
        <NoteBox id={`item:${item.id}`} label={item.title} />
      </Section>
    </div>
  )
}
