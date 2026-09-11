import type { ChoiceGroup } from '@/model/types'

/**
 * Výběry služeb. `pick-one` = vybíráme jednu možnost.
 * `or` = varianty podle nálady — NENÍ to seznam povinností.
 */
export const choiceGroups: ChoiceGroup[] = [
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
