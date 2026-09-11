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
  {
    id: 'choice-ninhbinh-stay',
    title: 'Kde v Tam Cốc spíme',
    intro:
      'Tři noci na jednom místě, dva pokoje. Tenhle blok je záměrně odpočinkový — po loopu a nočním vlaku. Bazén je pracovní priorita, ne luxus.',
    mode: 'pick-one',
    regionId: 'ninh-binh',
    serviceIds: ['svc-tam-coc-horizon', 'svc-trang-an-retreat', 'svc-le-clos-du-fil'],
    decisionNotes: [
      'Bazén si nech potvrdit písemně — není samozřejmost a některé bývají mimo provoz.',
      'Poloha v Tam Cốc znamená jídelny a půjčovnu kol pěšky. Ubytování blíž k Tràng An to obrací.',
      'Zeptej se, jestli jsou v ceně kola pro hosty. Ušetří to den nájmu.',
      'Tři noci na jednom místě je nejdelší blok cesty — tady se vyplatí vybírat pečlivěji než jinde.',
    ],
    openQuestions: [
      'U žádného ze tří kandidátů nemáme dohledanou aktuální cenu za dvoulůžkový pokoj.',
      'Kamarádka slíbila konkrétní tip na hotel s bazénem, ale jméno nemáme. Nevymýšlíme ho.',
    ],
  },
  {
    id: 'choice-ninhbinh-food',
    title: 'Kde jíst v Ninh Bình',
    intro: 'Jedna společná kozí tabule za pobyt a jinak obyčejné jídelny. Kozí maso a cơm cháy jsou skutečné místní speciality, ne turistický výmysl.',
    mode: 'or',
    regionId: 'ninh-binh',
    serviceIds: ['svc-ninhbinh-goat', 'svc-tam-coc-local-eateries'],
    decisionNotes: [
      'Kozí tabule pro čtyři vyjde zhruba na 700 000 – 900 000 VND, tedy kolem 560–720 Kč za celý stůl.',
      'Ốc núi (horští šneci) jsou sezónní — podle zdrojů září až listopad, takže náš termín sedí.',
      'Na denní jídlo jsou jídelny podél Tam Cốc Road. Čím dál od přístaviště, tím levněji.',
    ],
  },
  {
    id: 'choice-catba-stay',
    title: 'Kde na Cát Bà spíme',
    intro: 'Tři noci v městečku, dva pokoje. Poloha v Cát Bà town je podstatná — odsud se chodí pěšky na loď, na jídlo i na pláž.',
    mode: 'pick-one',
    regionId: 'cat-ba',
    serviceIds: ['svc-little-vietnam-hotel', 'svc-moon-boutique'],
    decisionNotes: [
      'U konkrétního objektu ověř aktuální hluk a stavební ruch. Na ostrově se hodně staví a situace se mění rychle.',
      'Ubytování mimo městečko znamená dopravu na každou plavbu i na každou večeři.',
      'Čtvrtá noc tu není — 5. 10. se vracíme na pevninu. Poslední noc musí být v Hanoji.',
    ],
    openQuestions: ['Ceny ani aktuální stav okolí u obou kandidátů nemáme ověřené.'],
  },
  {
    id: 'choice-catba-boat',
    title: 'Kdo nás veze po Lan Hạ',
    intro:
      'Celodenní plavba 3. 10. s rezervou na 4. 10. Nejdůležitější otázka není cena, ale velikost skupiny a co se stane při špatném počasí.',
    mode: 'pick-one',
    regionId: 'cat-ba',
    serviceIds: ['svc-catba-ventures', 'svc-catba-outdoors'],
    decisionNotes: [
      'Ptej se na počet lidí na lodi. Rozdíl mezi 12 a 40 je celý den.',
      'Lezení je samostatný program, ne přídavek k plavbě. Pokud o něj stojíme, poptej ho výslovně u Cat Ba Outdoors.',
      'Rozliš lezení s jištěním na laně od deep-water soloingu — pojišťovny je posuzují jinak.',
      'Zeptej se na podmínky zrušení kvůli počasí. Proto máme 4. 10. jako rezervu.',
      'Nikdo nemusí lézt ani plavat. Ověř, že část skupiny může jen sledovat.',
    ],
    openQuestions: [
      'Konkrétní program ani cenu pro 3. 10. 2026 nemáme u žádného z operátorů potvrzené.',
      'Cena lezení a jeho obsah jsou úplně neověřené.',
    ],
  },
  {
    id: 'choice-catba-food',
    title: 'Kde jíst na Cát Bà',
    intro: 'Nábřeží nebo o ulici dál. Rozdíl v ceně je zásadní, rozdíl v jídle často opačný, než čekáš.',
    mode: 'or',
    regionId: 'cat-ba',
    serviceIds: ['svc-catba-seafood', 'svc-catba-local-eateries'],
    decisionNotes: [
      'U mořských plodů účtovaných podle váhy si vždycky nech potvrdit cenu za kilo PŘED přípravou. Tohle je tady nejčastější problém.',
      'Tři dny samý seafood na nábřeží by byly drahé. Střídej to s obyčejnými jídelnami.',
      'Oběd na plavbě 3. 10. bývá v ceně — ten den neplánuj oběd navíc.',
    ],
  },
  {
    id: 'choice-loop-operator',
    title: 'S kým jedeme loop',
    intro:
      'Čtyři dny, čtyři lidi, dva soukromé pokoje. Nejdůležitější rozhodnutí celé cesty — a zatím nemáme od nikoho cenu. Polož všem třem stejné otázky.',
    mode: 'pick-one',
    regionId: 'ha-giang',
    serviceIds: ['svc-strawberry-loop', 'svc-yesd', 'svc-qt-motorbikes', 'svc-loop-package'],
    decisionNotes: [
      'Kamarádce třídenní loop přišel jako moc sezení a málo vesnic. Čtyři dny musí znamenat víc zastávek, ne víc kilometrů — na to se ptej výslovně.',
      'Ptej se všech tří na totéž, jinak nabídky neporovnáš: hodiny jízdy denně, délka pěších bloků, dva soukromé pokoje, jazyk průvodce, co je v ceně, storno při počasí.',
      'Zeptej se i na transfer z Hanoje 21. 9. a na noci 21. a 25. 9. — často to mají v balíčku a vyjde to levněji.',
      'Úschova velkých batohů: nech si písemně potvrdit, kde a jak.',
      'Pojištění řeš sám, ne přes operátora. Spolujízdu na motorce většina cestovních pojistek vylučuje.',
    ],
    openQuestions: [
      'Od žádného ze tří kandidátů nemáme cenu za 4denní private loop pro čtyři osoby.',
      'U Strawberry je potřeba potvrdit identitu firmy a webu — jména se u loop operátorů kopírují.',
      'Není jasné, jestli 4 dny opravdu znamenají delší pěší bloky, nebo jen delší etapy.',
    ],
  },
]

export const choiceGroupById = new Map(choiceGroups.map((c) => [c.id, c]))
