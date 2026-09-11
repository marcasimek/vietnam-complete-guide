import type { Place } from '@/model/types'

/**
 * Rejstřík míst. Jeden záznam = jedno místo, i když se objeví v několika dnech.
 * Aliasy slouží vyhledávání bez diakritiky (viz lib/search.ts).
 */
export const places: Place[] = [
  // ======================= HÀ GIANG =======================================
  {
    id: 'place-ha-giang-town',
    kind: 'city',
    name: 'Hà Giang — město',
    localName: 'Hà Giang',
    aliases: ['Ha Giang', 'Hà Giang', 'Hagiang'],
    regionId: 'ha-giang',
    what: 'Okresní město na řece Lô pod začátkem horského okruhu. Není to cíl sám o sobě — je to základna, odkud se vyjíždí na loop a kam se vrací.',
    whyHere: 'Spíme tu 21. a 25. 9. Tady necháváme velké batohy a odsud 26. 9. odjíždíme do Sa Py.',
    geo: {
      lat: 22.8233,
      lng: 104.9836,
      precision: 'area-centroid',
      searchQuery: 'Hà Giang city, Vietnam',
    },
    practical: [
      'Ubytování a kanceláře loop operátorů jsou soustředěné v centru — pěšky se dá obejít všechno.',
      'Odjezdy dálkových spojů bývají buď od autobusového nádraží, nebo se vyzvedává u ubytování.',
    ],
    tags: ['stay'],
  },
  // ======================= SA PA ==========================================
  {
    id: 'place-sapa-town',
    kind: 'city',
    name: 'Sa Pa — centrum',
    localName: 'Sa Pa',
    aliases: ['Sapa', 'Sa Pa', 'Sapa town', 'Sa Pa centrum'],
    regionId: 'sapa',
    what: 'Horské městečko v 1 500 m n. m. nad údolím Mường Hoa. Kompaktní centrum kolem kamenného kostela a náměstí u Sun Plaza — odsud je všechno pěšky.',
    whyHere: 'Naše základna na dvě noci (26. a 27. 9.). Odtud vyrážíme na trek i na coaster a sem se vracíme na večeři.',
    geo: {
      lat: 22.3364,
      lng: 103.8438,
      precision: 'area-centroid',
      address: 'Sa Pa, Lào Cai',
      searchQuery: 'Nhà thờ đá Sa Pa, Lào Cai',
    },
    practical: [
      'Centrem se rozumí okruh kolem kamenného kostela (Nhà thờ đá) a Sun Plaza — restaurace, hotely i kanceláře dopravců jsou ve vzdálenosti 5–10 minut chůze.',
      'Kanceláře limousine dopravců bývají podél ulice Điện Biên Phủ, ne v jednom společném terminálu.',
      'Od dopravního výstupu se obvykle jde 5–10 minut do kopce ke kostelu.',
      'Počítej s chladnějším podzimním večerem než v nížině — Sa Pa je vysoko a bývá mlha.',
    ],
    caveats: [
      'Sa Pa je turisticky velmi vytížená. Levné místní jídelny jsou obvykle o ulici dál než hlavní třída.',
      'Od správní reformy se místo uvádí i jako „phường Sa Pa, tỉnh Lào Cai" — adresy v různých zdrojích se proto liší zápisem.',
    ],
    sourceIds: ['src-sunparadise-sapa-bars', 'src-ta-sapa-centre-hotel'],
    tags: ['culture'],
  },
  {
    id: 'place-muong-hoa-valley',
    kind: 'nature',
    name: 'Údolí Mường Hoa',
    localName: 'Thung lũng Mường Hoa',
    aliases: ['Muong Hoa', 'Muong Hoa valley', 'Mường Hoa'],
    regionId: 'sapa',
    what: 'Hlavní údolí pod Sa Pou s rýžovými terasami a vesnicemi Lao Chải, Tả Van a Hầu Thào. Silnice po jeho okraji vede od centra dolů na jihovýchod.',
    whyHere: 'Je to kulisa celého našeho pobytu v Sa Pě: coaster leží nad ním, trek 27. 9. jde přímo skrz něj.',
    geo: {
      lat: 22.3125,
      lng: 103.8700,
      precision: 'area-centroid',
      searchQuery: 'Muong Hoa Valley, Sa Pa',
    },
    duration: 'podle programu 2 h až celý den',
    practical: [
      'Od centra Sa Py do Tả Van je po silnici zhruba 9–10 km, sjezd je celou dobu z kopce.',
      'Silnicí jezdí motorky, minivany i turistické shuttly — pěší trasy z ní na části úseků odbočují na polní cesty.',
    ],
    caveats: [
      'Fotky zlatých teras pocházejí ze sklizně. Konec září bývá po hlavní sklizni v nižších polohách — barvu polí nikdo negarantuje.',
    ],
    tags: ['view', 'trek'],
  },
  {
    id: 'place-alpine-coaster-sapa',
    kind: 'landmark',
    name: 'Alpine Coaster Sa Pa (Mong Village)',
    localName: 'Máng trượt Bản Mòng',
    aliases: [
      'Alpine Coaster Sapa', 'Mong Village', 'Ban Mong', 'Bản Mòng',
      'bobová dráha Sapa', 'coaster', 'downhill autíčka', 'mountain coaster',
    ],
    regionId: 'sapa',
    what: 'Horská dráha vedená po kolejnici nad údolím Mường Hoa. Sedíš ve vozíku, brzdíš pákou a jedeš sám — vozík je ke kolejnici připoutaný a nemůže z ní sjet.',
    whyHere: 'Lehký adrenalin na odpoledne po přejezdu z Hà Giang. Krátké, nenáročné a dá se stihnout i po pozdějším příjezdu.',
    geo: {
      lat: 22.3364,
      lng: 103.8438,
      precision: 'area-fallback',
      address: 'Tổ 3, Cầu Mây, Sa Pa, Lào Cai',
      searchQuery: 'Mong Village Alpine Coaster Sapa',
      sourceIds: ['src-ta-mong-village-coaster'],
    },
    duration: 'jízda pár minut, s cestou a frontou počítej 1,5–2,5 h',
    price: [
      {
        currency: 'VND',
        amount: 250_000,
        unit: 'per-person',
        persons: 1,
        note: 'Dospělý. Děti 90–135 cm 100 000 VND. Pro naši čtveřici tedy cca 1 000 000 VND.',
        confidence: 'published',
        sourceIds: ['src-trip-coaster', 'src-klook-coaster'],
        checkedOn: '2026-09-11',
      },
    ],
    openingHours: {
      summary: 'Denně 9:00–18:00',
      confidence: 'published',
      sourceIds: ['src-trip-coaster', 'src-klook-coaster'],
      checkedOn: '2026-09-11',
    },
    practical: [
      'Dráha je od německého výrobce Wiegand: celkem cca 1 095 m — zhruba 825 m sjezd a 250 m vlek nahoru.',
      'Vozíky mají magnetické brzdy a čidla vzdálenosti mezi sebou; rychlost si řídíš sám pákou.',
      'Areál leží asi 5 km od centra Sa Py, autem nebo skútrem 10–15 minut.',
      'Držitelé vstupenky mají podle prodejců zdarma kyvadlovou dopravu od Sapa Convention Center, cca každých 30 minut mezi 8:00 a 18:00 — ověřit na místě u pokladny.',
      'Vstupenky se běžně kupují na místě; online přes Klook/Trip.com jsou taky.',
    ],
    caveats: [
      'Za deště a v husté mlze se dráhy tohohle typu běžně zastavují. Pro 26. 9. to nemáme potvrzené — plán B je posunout jízdu na 28. 9. dopoledne nebo vynechat.',
      'Nemáme ověřený přesný pin. Adresa „Tổ 3, Cầu Mây" je z recenzního portálu — mapa proto otevře vyhledání názvu, ne falešně přesný bod.',
      'Cena 250 000 VND je zveřejněná cena prodejců k 11. 9. 2026, ne potvrzená cena u pokladny na náš den.',
    ],
    sourceIds: [
      'src-ta-mong-village-coaster',
      'src-trip-coaster',
      'src-klook-coaster',
      'src-wiegand-alpine-coaster',
    ],
    tags: ['activity', 'adrenaline', 'view'],
  },
  {
    id: 'place-lao-chai',
    kind: 'village',
    name: 'Lao Chải',
    localName: 'Lao Chải',
    aliases: ['Lao Chai', 'Lao Chải'],
    regionId: 'sapa',
    what: 'Vesnice H’Mongů v údolí Mường Hoa, asi 7 km pod Sa Pou. Obvyklý začátek nebo první zastávka trekových tras.',
    whyHere: 'Výchozí bod pěšího dne 27. 9.',
    geo: { lat: 22.3130, lng: 103.8620, precision: 'area-centroid', searchQuery: 'Lao Chai village, Sa Pa' },
    tags: ['trek', 'culture'],
  },
  {
    id: 'place-ta-van',
    kind: 'village',
    name: 'Tả Van',
    localName: 'Tả Van',
    aliases: ['Ta Van', 'Tả Van', 'Tavan'],
    regionId: 'sapa',
    what: 'Vesnice Giáy v údolí Mường Hoa u řeky, cca 9–10 km od centra Sa Py. Homestaye, bungalovy a klidnější základna než město.',
    whyHere: 'Kandidát na ubytování 26.–28. 9. a cíl pěší trasy 27. 9.',
    geo: { lat: 22.3060, lng: 103.8880, precision: 'area-centroid', searchQuery: 'Ta Van village, Sa Pa' },
    practical: [
      'Do centra Sa Py je to autem zhruba 20–30 minut podle provozu.',
      'Večer je tu klid — to je plus pro spaní a minus pro bar.',
    ],
    tags: ['trek', 'culture', 'rest'],
  },
]

export const placeById = new Map(places.map((p) => [p.id, p]))
