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
  title: 'Sa Pa: coaster a první den v horách',
  theme: 'Celý den v horách, žádný přesun',
  night: { label: 'Sa Pa', regionId: 'sapa', kind: 'hotel' },
  dayNotes: [
    'Přesun je hotový — dorazili jsme nočním busem už včera večer (18:00–23:00, potvrzeno Strawberry). Celý den 26. 9. je tak volný, žádná cesta ho neškrtí.',
    'Po čtyřech dnech na loopu nikdo nemusí nic dokazovat. Coaster i večerní program jsou volitelné.',
  ],
  items: [
    {
      id: 'item-20260926-checkin-lunch',
      kind: 'stay-and-food',
      title: 'Klidné dopoledne a oběd',
      subtitle: 'Ubytování už je vyřešené od večera · levná místní jídelna',
      order: 1,
      dayPart: 'morning',
      status: 'main',
      choiceGroupIds: ['choice-sapa-stay', 'choice-sapa-arrival-lunch'],
      detail: [
        'Check-in proběhl už včera kolem 23:00 po příjezdu nočního busu. Dnes ráno tak nic nespěchá — jen se najíst a rozkoukat.',
        'Ubytování ještě není vybrané. Proto tu nikde nestojí „X minut od našeho hotelu" — vzdálenosti měříme od centra Sa Py a u každého kandidáta píšeme, co z toho plyne.',
      ],
      practical: [
        'Levné jídelny jsou v centru o ulici dál od hlavní třídy. Cenová hladina běžného jídla je zhruba 50 000 – 130 000 VND za porci.',
      ],
      tags: ['stay', 'food', 'budget'],
    },
    {
      id: 'item-20260926-coaster',
      kind: 'activity',
      title: 'Alpine Coaster / downhill autíčka',
      subtitle: 'Kolejová horská dráha nad údolím · 250 000 VND / os.',
      order: 2,
      dayPart: 'afternoon',
      status: 'optional',
      timeHint: 'odpoledne, poslední jízdy do 18:00',
      placeIds: ['place-alpine-coaster-sapa'],
      condition: 'Jen když nebude pršet — jinak přesun na ráno 28. 9.',
      alternativeIds: ['alt-coaster-2809'],
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
        'Zavírá v 18:00. Když by pršelo celé odpoledne, přesuň na ráno 28. 9.',
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
      order: 3,
      dayPart: 'evening',
      status: 'main',
      choiceGroupIds: ['choice-sapa-evening'],
      detail: [
        'Tři různé večery, mezi kterými si vybíráme podle toho, jak dopadl den. Není to seznam, který se má odškrtat.',
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
