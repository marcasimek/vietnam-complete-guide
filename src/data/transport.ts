import type { TransportLeg } from '@/model/types'

/**
 * Dopravní úseky. Každý má doporučenou variantu a 1–2 smysluplné alternativy,
 * odhad ode dveří ke dveřím (ne jen čistou jízdu) a plán, když to nevyjde.
 */
export const transportLegs: TransportLeg[] = [
  {
    id: 'leg-hagiang-sapa',
    from: 'Hà Giang',
    to: 'Sa Pa',
    fromPlaceId: 'place-ha-giang-town',
    toPlaceId: 'place-sapa-town',
    date: '2026-09-26',
    summary:
      'Přímý přejezd mezi dvěma horskými oblastmi, zhruba 250–300 km po silnicích přes Lào Cai. Jedeme ráno, abychom v Sa Pě byli s dostatečnou rezervou na odpolední program.',
    options: [
      {
        id: 'opt-hg-sapa-limousine',
        mode: 'van',
        label: 'Sdílený limousine minivan (přímý)',
        operator:
          'Spoje se prodávají pod jmény jako A21 Tours, Quang Nghi, Quang Tuyen nebo Techbus. Skutečný vlastník vozu se u téhle trasy liší podle konkrétního odjezdu.',
        reseller: '12Go Asia, Bookaway, redBus nebo přímo recepce hotelu / loop operátora v Hà Giang.',
        doorToDoor: {
          minHours: 6.5,
          maxHours: 8,
          note: 'Včetně svozu po Hà Giangu, zastávek a posledního úseku k ubytování v Sa Pě.',
          confidence: 'estimate',
        },
        ridingTime: { minHours: 5.5, maxHours: 7 },
        price: [
          {
            currency: 'VND',
            min: 270_000,
            max: 500_000,
            unit: 'per-person',
            persons: 1,
            note: 'Jednosměrná jízdenka. Pro čtyři tedy zhruba 1 080 000 – 2 000 000 VND.',
            confidence: 'published',
            sourceIds: ['src-bookaway-hg-sapa', 'src-redbus-hg-sapa', 'src-a21-hg-sapa'],
            checkedOn: '2026-09-11',
            excludes: ['jídlo cestou', 'poslední úsek k ubytování mimo centrum'],
          },
        ],
        capacityNote:
          'Limousine vozy mívají 9–11 polohovatelných sedadel, takže čtyři místa nejsou problém. Velké batohy po loopu ale ano: kufr je malý a část zavazadel se dává do uličky. Při rezervaci je potřeba napsat, že jedou čtyři lidé s velkými batohy.',
        pickup: {
          description:
            'Většina prodejců u téhle trasy nabízí vyzvednutí u hotelu v Hà Giangu nebo sběrný bod v centru. Konkrétní místo a čas dostaneš až v potvrzení — proto „potvrdit při rezervaci", ne vymyšlené autobusové nádraží.',
        },
        dropoff: {
          description:
            'V Sa Pě se vystupuje buď u kanceláře dopravce (kanceláře bývají podél ulice Điện Biên Phủ), nebo u autobusového stanoviště u jezera. Od výstupu se obvykle jde 5–10 minut do kopce ke kostelu. Drop-off přímo u hotelu nabízí jen část dopravců.',
        },
        schedule: {
          summary:
            'Prodejci u téhle trasy uvádějí zhruba dva denní odjezdy — ranní kolem 7:30 a odpolední kolem 16:00; nejčasnější spoj bývá kolem 6:30. Pro nás dává smysl ten ranní.',
          confidence: 'published',
          sourceIds: ['src-a21-hg-sapa', 'src-redbus-hg-sapa', 'src-bookaway-hg-sapa'],
        },
        availability: 'unknown',
        bookingLeadTime: 'Rezervovat 2–3 dny předem, ideálně hned na začátku loopu přes ubytování v Hà Giangu.',
        bookingUrl: 'https://12go.asia/',
        pros: [
          'Nejlepší poměr cena/čas — bez přestupu a bez zajížďky přes Hanoj.',
          'Vyzvednutí u hotelu bývá součástí ceny.',
          'Odjezd ráno = odpoledne zbývá čas na coaster.',
        ],
        cons: [
          'Místo na velké batohy po loopu není zaručené.',
          'Sdílený spoj sbírá další cestující, takže reálný čas bývá delší než inzerovaný.',
        ],
        sourceIds: ['src-bookaway-hg-sapa', 'src-redbus-hg-sapa', 'src-a21-hg-sapa', 'src-gyg-hg-sapa-transfer'],
        recommended: true,
      },
      {
        id: 'opt-hg-sapa-private-car',
        mode: 'car',
        label: 'Soukromé auto pro čtyři',
        operator: 'Např. Viet Transfers nebo A21 Tours; stejnou službu nabízí i většina ubytování v Hà Giangu.',
        doorToDoor: {
          minHours: 5.5,
          maxHours: 7,
          note: 'Bez sbírání dalších cestujících. Zastávky si řídíme sami.',
          confidence: 'estimate',
        },
        ridingTime: { minHours: 5.5, maxHours: 6 },
        price: [
          {
            currency: 'VND',
            unit: 'per-vehicle',
            persons: 4,
            note: 'Konkrétní cenu za vůz na trase Hà Giang → Sa Pa se nám nepodařilo dohledat u žádného poskytovatele. Je to otevřená položka — cenu si vyžádej mailem u dvou poskytovatelů a doplň sem. Pro srovnání: na delší trase Hanoj → Sa Pa se veřejně uvádí 135 USD za SUV a 190 USD za sedmimístné MPV.',
            confidence: 'unverified',
            sourceIds: ['src-viettransfers-sapa-hg'],
            checkedOn: '2026-09-11',
          },
        ],
        capacityNote:
          'Pro čtyři lidi s velkými batohy po loopu je potřeba sedmimístné MPV (např. Kia Carnival), ne běžný sedan. Tohle při poptávce explicitně napiš.',
        pickup: { description: 'Vyzvednutí přímo u ubytování v Hà Giangu v čase, který si určíme.' },
        dropoff: { description: 'Přímo u ubytování v Sa Pě — včetně adres v údolí, kam sdílený spoj nejede.' },
        schedule: { summary: 'Odjezd si volíme sami.', confidence: 'traveller-plan' },
        availability: 'unknown',
        bookingLeadTime: 'Poptat 3–7 dní předem, ať je čas porovnat dvě nabídky.',
        pros: [
          'Zaručené místo na čtyři velké batohy.',
          'Přímo od dveří ke dveřím, i když bude ubytování v údolí.',
          'Nejkratší reálný čas — odpoledne zbyde nejvíc.',
        ],
        cons: [
          'Nejdražší varianta a zatím bez ověřené ceny.',
          'Nemá smysl, pokud skončíme v centru Sa Py a pojedeme ranním spojem.',
        ],
        sourceIds: ['src-viettransfers-sapa-hg'],
      },
      {
        id: 'opt-hg-sapa-via-laocai',
        mode: 'bus',
        label: 'Přes Lào Cai s přestupem (záloha)',
        operator: 'Linkový autobus Hà Giang → Lào Cai, pak sdílený minivan nebo taxi Lào Cai → Sa Pa.',
        doorToDoor: {
          minHours: 7,
          maxHours: 9,
          note: 'Závisí na čekání na přestupu — to je hlavní riziko.',
          confidence: 'estimate',
        },
        price: [
          {
            currency: 'VND',
            min: 300_000,
            max: 450_000,
            unit: 'per-person',
            persons: 1,
            note: 'Součet obou úseků. Přesná cena závisí na tom, čím se pojede z Lào Cai nahoru.',
            confidence: 'estimate',
            checkedOn: '2026-09-11',
          },
        ],
        capacityNote: 'Zavazadla se překládají — u čtyř velkých batohů to není příjemné.',
        pickup: { description: 'Autobusové nádraží v Hà Giangu.' },
        dropoff: {
          description:
            'Z Lào Cai se do Sa Py jezdí posledních cca 35 km do kopce; návazné minivany končí typicky na ulici Thạch Sơn před kamenným kostelem.',
        },
        schedule: { summary: 'Během dne jezdí víc spojů než přímých limousine — to je jediná výhoda.', confidence: 'estimate' },
        availability: 'unknown',
        pros: ['Funguje i když přímý spoj odpadne.', 'Víc odjezdů během dne.'],
        cons: [
          'Přestup s velkými batohy.',
          'Nejdelší reálný čas — odpolední program v Sa Pě je pak nejistý.',
        ],
        sourceIds: ['src-bookaway-hg-sapa'],
      },
    ],
    fallback: [
      'Když ranní přímý spoj nepojede, ber odpolední kolem 16:00 a přesuň coaster na ráno 28. 9. — ten den má jen jeden volitelný hlavní program.',
      'Když přijedeme po 17:00, coaster (zavírá v 18:00) vypadává. Není za co bojovat: večerní varianta je hotpot nebo bylinková koupel, obojí funguje pozdě.',
      'Když se rozpadne i záloha přes Lào Cai, poslední možnost je soukromé auto objednané přes ubytování v Hà Giangu — stojí víc, ale zachrání den.',
    ],
    practical: [
      'Vzdálenost se v různých zdrojích uvádí 250–300 km podle zvolené trasy; čistá jízda vychází zhruba 5,5–6 hodin.',
      'Velké batohy po loopu jsou u téhle trasy hlavní proměnná. Řeš je při rezervaci, ne u nástupu.',
      'Nástupní místo a čas potvrzuj písemně. „Ráno vás vyzvedneme" není potvrzení.',
      'V Sa Pě neexistuje jedno autobusové nádraží pro všechny — každý dopravce má svoje místo. Před výstupem si nech ukázat na mapě, kde stojíš.',
    ],
    sourceIds: ['src-bookaway-hg-sapa', 'src-redbus-hg-sapa', 'src-a21-hg-sapa', 'src-gyg-hg-sapa-transfer'],
  },
]

export const transportLegById = new Map(transportLegs.map((l) => [l.id, l]))
