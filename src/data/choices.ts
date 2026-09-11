import type { ChoiceGroup } from '@/model/types'

/**
 * Výběry služeb. `pick-one` = vybíráme jednu možnost.
 * `or` = varianty podle nálady — NENÍ to seznam povinností.
 */
export const choiceGroups: ChoiceGroup[] = [
  {
    id: 'choice-hanoi-stay',
    title: 'Kde v Hanoji spíme',
    intro:
      'Tři noci ve dvou pokojích: 19. a 20. 9. na začátku a 5./6. 10. na konci. Klíčové kritérium není cena, ale jestli nám hotel písemně potvrdí pokoj hned po ranním příletu.',
    mode: 'pick-one',
    regionId: 'hanoi',
    serviceIds: ['svc-la-selva', 'svc-tirant'],
    decisionNotes: [
      'Nejdřív polož oběma stejnou otázku: kolik stojí předplacená noc 18./19. 9., nebo nabízíte day-use? Podle odpovědi vyber.',
      '„Early check-in subject to availability" garance NENÍ. Po nočním letu je to rozdíl mezi sprchou v devět a čekáním do dvou odpoledne.',
      'Oba jsou ve Starém Městě — jídlo, trhy i Tạ Hiện jsou pěšky. To je pro nás důležitější než hvězdičky.',
      'Poslední noc 5./6. 10. nemusí být ve stejném hotelu. Tam rozhoduje spíš dostupnost a blízkost k centru kvůli odjezdu na letiště.',
    ],
    openQuestions: [
      'Ani u jednoho nemáme potvrzenou garanci ranního pokoje na 19. 9.',
      'Ceny jsou nabídkové z porovnávačů, ne rezervace pro naše termíny.',
    ],
  },
  {
    id: 'choice-hanoi-oldquarter-food',
    title: 'Kde jíst ve Starém Městě',
    intro:
      'Čtyři konkrétní adresy v docházkové vzdálenosti. Všechno je to hladina 20 000 – 60 000 VND za jídlo, tedy kolem 20–50 Kč.',
    mode: 'or',
    regionId: 'hanoi',
    serviceIds: ['svc-pho-gia-truyen', 'svc-bun-cha-hang-quat', 'svc-banh-cuon-thanh-van', 'svc-bun-cha-hang-manh'],
    decisionNotes: [
      'Phở Gia Truyền je ranní záležitost — po desáté bývá vyprodáno.',
      'Bún chả je obědové jídlo. Večer už ho většinou neseženeš.',
      'Bánh cuốn je nejlehčí — dobré ráno před přesunem.',
      'Všechny jsou jen na hotovost.',
    ],
  },
  {
    id: 'choice-hanoi-evening',
    title: 'Večer v Hanoji',
    intro: 'Street food, vaječná káva nebo bia hơi. První večer 19. 9. po dlouhém letu nemusí být nic z toho.',
    mode: 'or',
    regionId: 'hanoi',
    serviceIds: ['svc-hanoi-streetfood', 'svc-bia-hoi-ta-hien'],
    decisionNotes: [
      'Stánky se rozjíždějí zhruba od 18:00.',
      'Tạ Hiện je hlučné a turistické. O ulici vedle je bia hơi levnější a klidnější.',
      'První večer po příletu je úplně v pořádku dát jen bánh mì a jít spát.',
    ],
  },
  {
    id: 'choice-sapa-stay',
    title: 'Kde v Sa Pě spíme',
    intro:
      'Dvě noci, dva dvoulůžkové pokoje (26. a 27. 9.). Rozhodnutí není o hvězdičkách, ale o tom, jestli chceme večer chodit pěšky, nebo mít ráno terasu nad poli.',
    mode: 'pick-one',
    regionId: 'sapa',
    serviceIds: ['svc-sapa-centre-hotel', 'svc-eco-palms-house', 'svc-sapa-eco-bungalows'],
    decisionNotes: [
      'Centrum vyhrává na večerním programu (hotpot, bar, koupel pěšky) a na ranním odjezdu 28. 9. na vlak.',
      'Údolí vyhrává na klidu, bazénu a na tom, že 27. 9. se vyráží na trek rovnou od domu.',
      'Kompromis, který dává smysl: centrum na obě noci, a bazén/klid dohnat až v Tam Cốc, kde na to máme tři noci.',
      'Dokud není hotel vybraný, nikde v aplikaci nepíšeme vzdálenost „od našeho hotelu" — jen od centra Sa Py.',
    ],
    openQuestions: [
      'U Sapa Eco Bungalows nemáme dohledanou cenu za dvoulůžkový pokoj.',
      'Žádná z cen není potvrzená dostupností pro 26.–28. 9. 2026.',
    ],
  },
  {
    id: 'choice-sapa-arrival-lunch',
    title: 'Oběd po příjezdu',
    intro:
      'Přijedeme hladoví někdy kolem oběda až brzkého odpoledne. Chceme rychle, teple a levně — ne dvouhodinovou restauraci s výhledem.',
    mode: 'pick-one',
    regionId: 'sapa',
    serviceIds: ['svc-little-sapa', 'svc-a-quynh', 'svc-pho-khuyen'],
    decisionNotes: [
      'Little Sapa je výchozí volba: otevřeno přes poledne, hotovky, nízká cena, v centru.',
      'A Quỳnh dává smysl, když někdo chce zkusit thắng cố — ale není to jídlo na den plný přesunu.',
      'Phở Khuyên v době našeho příjezdu nejspíš zavírá (jen do 10:00). Bereme ho na ráno 27. nebo 28. 9.',
      'Všechny tři jsou v centru Sa Py. Když skončíme v údolí, počítej s dopravou nebo jez v místě ubytování.',
    ],
  },
  {
    id: 'choice-sapa-evening',
    title: 'Večer podle nálady',
    intro:
      'Jedno z toho, ne všechno. Po celodenním přejezdu je úplně v pořádku dát jen hotpot a jít spát.',
    mode: 'or',
    regionId: 'sapa',
    serviceIds: [
      'svc-sapa-hotpot-street',
      'svc-red-dao-herbal-bath',
      'svc-hmong-sisters',
      'svc-color-bar-sapa',
      'svc-mountain-bar-pub',
    ],
    decisionNotes: [
      'Hotpot = společná večeře, dlouhé sezení, jeden kotlík pro čtyři.',
      'Bylinková koupel = regenerace před pěším dnem. Ne po alkoholu a ne hned po velkém jídle.',
      'Bar = jedno pivo v centru. Hmong Sisters je klidnější, Mountain Bar hlučnější.',
      'Páry se můžou rozdělit: dva na koupel, dva do baru, sejít se potom. Nic z toho není společný závazek.',
    ],
  },
]

export const choiceGroupById = new Map(choiceGroups.map((c) => [c.id, c]))
