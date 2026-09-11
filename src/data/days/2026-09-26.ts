import type { Day } from '@/model/types'

/**
 * REFERENČNÍ DEN. Tenhle den je vzor pro celý zbytek itineráře:
 * každý významový řádek je samostatně klikací a vede na skutečný detail
 * s konkrétními možnostmi, cenami, mapou a zdroji.
 */
export const day20260926: Day = {
  date: '2026-09-26',
  index: 8,
  weekday: 'sobota',
  regionId: 'sapa',
  title: 'Hà Giang → Sa Pa',
  theme: 'Přesun + lehký adrenalin',
  night: { label: 'Sa Pa', regionId: 'sapa', kind: 'hotel' },
  dayNotes: [
    'Den stojí a padá s ranním odjezdem. Když vyjedeme kolem 7:30, jsme v Sa Pě odpoledne a coaster se v klidu stihne.',
    'Odpolední spoj (kolem 16:00) znamená příjezd za tmy — pak se coaster přesouvá na ráno 28. 9. a večer zůstává jídlo nebo koupel.',
    'Po čtyřech dnech na loopu nikdo nemusí nic dokazovat. Coaster i večerní program jsou volitelné.',
  ],
  items: [
    {
      id: 'item-20260926-transfer',
      kind: 'transport',
      title: 'Ranní přímý transfer do Sa Pa',
      subtitle: 'Sdílený limousine minivan · 6,5–8 h ode dveří ke dveřím',
      order: 1,
      dayPart: 'morning',
      status: 'main',
      timeHint: 'odjezd ráno, orientačně kolem 7:30',
      transportLegId: 'leg-hagiang-sapa',
      detail: [
        'Jediný skutečný úkol dne: dostat se z Hà Giangu do Sa Py, aniž bychom ztratili celé odpoledne. Trasa vede přes Lào Cai a měří podle zvolené cesty 250–300 km.',
        'Doporučená varianta je přímý sdílený limousine minivan s ranním odjezdem. Přímý spoj tu opravdu existuje — není potřeba zajíždět přes Hanoj ani plánovat přestup, pokud nemusíme.',
      ],
      practical: [
        'Rezervovat nejpozději 2–3 dny předem, ideálně hned na začátku loopu přes ubytování v Hà Giangu.',
        'Do rezervace napsat: čtyři cestující, čtyři velké batohy. Místo na zavazadla je u téhle trasy hlavní proměnná.',
        'Nástupní místo a čas si nech potvrdit písemně.',
      ],
      caveats: [
        'Časy odjezdů jsou z prodejních platforem k 11. 9. 2026, ne potvrzený jízdní řád pro 26. 9. 2026.',
      ],
      sourceIds: ['src-bookaway-hg-sapa', 'src-redbus-hg-sapa', 'src-a21-hg-sapa'],
      tags: ['transport'],
    },
    {
      id: 'item-20260926-checkin-lunch',
      kind: 'stay-and-food',
      title: 'Check-in a oběd',
      subtitle: 'Dva pokoje v Sa Pě · levná místní jídelna hned po příjezdu',
      order: 2,
      dayPart: 'midday',
      status: 'main',
      choiceGroupIds: ['choice-sapa-stay', 'choice-sapa-arrival-lunch'],
      detail: [
        'Kombinovaný krok: nejdřív složit batohy, pak se najíst. Obojí se rozhoduje zároveň, protože kde spíme určuje, kam je rozumné jít na oběd.',
        'Ubytování ještě není vybrané. Proto tu nikde nestojí „X minut od našeho hotelu" — vzdálenosti měříme od centra Sa Py a u každého kandidáta píšeme, co z toho plyne.',
      ],
      practical: [
        'Pokud dorazíme před časem check-inu, batohy jde nechat na recepci a jít se najíst — u všech kandidátů je to běžné, ale potvrď to při rezervaci.',
        'Levné jídelny jsou v centru o ulici dál od hlavní třídy. Cenová hladina běžného jídla je zhruba 50 000 – 130 000 VND za porci.',
      ],
      tags: ['stay', 'food', 'budget'],
    },
    {
      id: 'item-20260926-coaster',
      kind: 'activity',
      title: 'Alpine Coaster / downhill autíčka',
      subtitle: 'Kolejová horská dráha nad údolím · 250 000 VND / os.',
      order: 3,
      dayPart: 'afternoon',
      status: 'optional',
      timeHint: 'odpoledne, poslední jízdy do 18:00',
      placeIds: ['place-alpine-coaster-sapa'],
      condition: 'Jen když dorazíme nejpozději kolem 16:30 a neprší.',
      detail: [
        'Nejdřív k tomu, co to vlastně je, protože „coaster" a „downhill autíčka" nejsou automaticky totéž.',
        'To, co je v Sa Pě, je alpine coaster: vozík jede po pevné kolejnici, je k ní připoutaný a nemůže z ní sjet. Rychlost si řídíš brzdicí pákou, mezi vozíky hlídají odstup čidla. Postavil to německý Wiegand, dráha měří zhruba 1 095 m — asi 825 m sjezdu a 250 m vleku nahoru.',
        '„Downhill autíčka" v běžném významu znamenají bezkolejové vozíky, které jedou volně po dráze nebo silnici (typu alpine slide nebo luge). Takové zařízení jsme v Sa Pě v dostupných zdrojích nenašli. Wiegand sice vyrábí i CoasterKart — kolejový vozík ve tvaru autíčka — ale ten v Sa Pě doložený není.',
        'Závěr: je to jedna atrakce se dvěma jmény, ne dvě různé možnosti. Kdo čeká volně řízené autíčko, dostane kolejovou dráhu.',
      ],
      practical: [
        'Areál je asi 5 km od centra Sa Py, autem nebo skútrem 10–15 minut.',
        'Držitelé vstupenky mají podle prodejců zdarma shuttle od Sapa Convention Center zhruba každých 30 minut mezi 8:00 a 18:00.',
        'Vstupenky se běžně kupují na místě. Rezervace předem není nutná, ale online varianty existují.',
        'Na jízdu i s cestou a frontou počítej 1,5–2,5 hodiny.',
      ],
      caveats: [
        'Za deště nebo v husté mlze se dráhy tohohle typu běžně zastavují. Pro náš den to potvrzené nemáme.',
        'Zavírá v 18:00. Při pozdním příjezdu se to nemá cenu hnát — přesuň na ráno 28. 9.',
      ],
      sourceIds: [
        'src-ta-mong-village-coaster',
        'src-trip-coaster',
        'src-klook-coaster',
        'src-wiegand-alpine-coaster',
        'src-wiegand-coasterkart',
      ],
      tags: ['activity', 'adrenaline'],
    },
    {
      id: 'item-20260926-evening',
      kind: 'evening',
      title: 'Večer: hotpot, bar nebo bylinková koupel',
      subtitle: 'Jedno z toho, ne všechno',
      order: 4,
      dayPart: 'evening',
      status: 'main',
      choiceGroupIds: ['choice-sapa-evening'],
      detail: [
        'Tři různé večery, mezi kterými si vybíráme podle toho, jak dopadl přejezd. Není to seznam, který se má odškrtat.',
        'Po čtyřech dnech na motorce dává největší smysl kombinace „společná večeře + brzy spát", protože další den jdeme pěšky celý den.',
      ],
      practical: [
        'Páry se můžou rozdělit — koupel a bar se dají dát paralelně a sejít se potom.',
        'Bylinková koupel se nedoporučuje po alkoholu ani hned po velkém jídle.',
      ],
      tags: ['evening', 'food', 'wellness'],
    },
  ],
}
