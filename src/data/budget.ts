import type { Confidence, Currency } from '@/model/types'

/**
 * Rozpočtový model.
 *
 * Zásady:
 *  - plánovaný rozpočet je oddělený od toho, co kdo skutečně zaplatil,
 *  - nic se nezapočítává dvakrát: co je v balíčku loopu nebo plavby, je
 *    u dané položky označené jako `includedIn`,
 *  - extra zaplacená noc 18./19. 9. je samostatná položka, ne další noc pobytu,
 *  - neznámé částky zůstávají neznámé. Nedoplňujeme nuly.
 */

export type BudgetCategory = 'stay' | 'transport' | 'activity' | 'food' | 'extra' | 'reserve'

export interface BudgetLine {
  id: string
  category: BudgetCategory
  label: string
  note?: string
  /** Rozsah v původní měně. `null` = neznáme a nehádáme. */
  min: number | null
  max: number | null
  currency: Currency
  /** `per-person` nebo `total` pro celou skupinu. */
  basis: 'per-person' | 'total'
  confidence: Confidence
  /** Odkaz na balíček, ve kterém už je položka zahrnutá — nezapočítávat znovu. */
  includedIn?: string
  sourceIds?: string[]
  dayDates?: string[]
}

export const CATEGORY_LABEL: Record<BudgetCategory, string> = {
  stay: 'Ubytování',
  transport: 'Doprava',
  activity: 'Aktivity',
  food: 'Jídlo',
  extra: 'Navíc',
  reserve: 'Rezerva',
}

export const budgetLines: BudgetLine[] = [
  // --- ubytování ---------------------------------------------------------
  {
    id: 'bd-hanoi-3',
    category: 'stay',
    label: 'Hanoj — 3 noci (19., 20. 9. a 5. 10.)',
    note: 'Dva pokoje × 3 noci. Spodní hranice odpovídá La Selva, horní Tirantu v běžné ceně.',
    min: 108, max: 648, currency: 'USD', basis: 'total',
    confidence: 'published',
    sourceIds: ['src-planetofhotels-laselva', 'src-momondo-tirant'],
    dayDates: ['2026-09-19', '2026-09-20', '2026-10-05'],
  },
  {
    id: 'bd-hanoi-extra-night',
    category: 'extra',
    label: 'Předplacená noc 18./19. 9. kvůli rannímu pokoji',
    note: 'NENÍ to další noc pobytu. Je to náklad navíc za to, že pokoj bude v 08:30 ráno volný. Alternativa: day-use, bývá levnější.',
    min: null, max: null, currency: 'USD', basis: 'total',
    confidence: 'unverified',
    dayDates: ['2026-09-19'],
  },
  {
    id: 'bd-hagiang-night-21',
    category: 'stay',
    label: 'Hà Giang — noc 21./22. 9., 2 pokoje',
    note: 'Strawberry potvrdilo dva soukromé pokoje před loopem, ale neřeklo, jestli je ta noc v ceně balíčku, nebo se platí zvlášť. Dokud to nevíme, nedoplňujeme částku.',
    min: null, max: null, currency: 'VND', basis: 'total',
    confidence: 'unverified',
    sourceIds: ['src-strawberry-whatsapp-140926'],
    includedIn: 'Možná v balíčku loopu — nutno potvrdit',
    dayDates: ['2026-09-21'],
  },
  {
    id: 'bd-hagiang-night-25',
    category: 'stay',
    label: 'Hà Giang — noc 25./26. 9., 2 pokoje',
    note: 'Noc po loopu na základně Strawberry, 300 000 VND za pokoj. Pro dva pokoje 600 000 VND. Není v balíčku — účtuje se zvlášť.',
    min: 600_000, max: 600_000, currency: 'VND', basis: 'total',
    confidence: 'verified',
    sourceIds: ['src-strawberry-whatsapp-140926'],
    dayDates: ['2026-09-25'],
  },
  {
    id: 'bd-loop-nights',
    category: 'stay',
    label: 'Homestaye na loopu — 3 noci (22.–24. 9.)',
    note: 'Určuje balíček operátora, neplatí se zvlášť.',
    min: null, max: null, currency: 'VND', basis: 'total',
    confidence: 'traveller-plan',
    includedIn: 'Balíček loopu',
    dayDates: ['2026-09-22', '2026-09-23', '2026-09-24'],
  },
  {
    id: 'bd-sapa-2',
    category: 'stay',
    label: 'Sa Pa — 2 noci, 2 pokoje',
    note: 'Centrum: zhruba 21–31 USD za pokoj a noc. Údolí (Eco Palms): 69–91 USD.',
    min: 84, max: 364, currency: 'USD', basis: 'total',
    confidence: 'published',
    sourceIds: ['src-ta-sapa-centre-hotel', 'src-momondo-eco-palms'],
    dayDates: ['2026-09-26', '2026-09-27'],
  },
  {
    id: 'bd-tamcoc-3',
    category: 'stay',
    label: 'Tam Cốc — 3 noci, 2 pokoje',
    note: 'Spodní hranice odpovídá ceně „od" u Tam Coc Horizon Bungalow (60 USD za pokoj a noc). Horní hranici pro náš termín neznáme.',
    min: 360, max: null, currency: 'USD', basis: 'total',
    confidence: 'published',
    sourceIds: ['src-priceline-tamcoc-horizon'],
    dayDates: ['2026-09-29', '2026-09-30', '2026-10-01'],
  },
  {
    id: 'bd-catba-3',
    category: 'stay',
    label: 'Cát Bà — 3 noci, 2 pokoje',
    note: 'Horní hranice odpovídá ceně „od" u The Moon Boutique (72 USD za pokoj a noc). Cenu levnějšího kandidáta Little Vietnam jsme nedohledali, takže spodní hranice chybí.',
    min: null, max: 432, currency: 'USD', basis: 'total',
    confidence: 'published',
    sourceIds: ['src-ta-moon-catba'],
    dayDates: ['2026-10-02', '2026-10-03', '2026-10-04'],
  },

  // --- doprava -----------------------------------------------------------
  {
    id: 'bd-han-transfer',
    category: 'transport',
    label: 'Letiště HAN → centrum a zpět',
    note: 'Sedmimístné auto v obou směrech. Grab bývá levnější, taxi na taxametr podobné.',
    min: 700_000, max: 900_000, currency: 'VND', basis: 'total',
    confidence: 'published',
    sourceIds: ['src-yvt-noibai-taxi'],
    dayDates: ['2026-09-19', '2026-10-06'],
  },
  {
    id: 'bd-hanoi-hagiang',
    category: 'transport',
    label: 'Hanoj → Hà Giang',
    note: 'Limousine v balíčku Strawberry za 350 000 VND na osobu, tedy 1 400 000 VND za čtyři. Samostatně kupovaná jízdenka na téže trase stojí 450–600 tis. VND, takže přes operátora je to levnější.',
    min: 350_000, max: 350_000, currency: 'VND', basis: 'per-person',
    confidence: 'verified',
    sourceIds: ['src-strawberry-booking-form'],
    dayDates: ['2026-09-21'],
  },
  {
    id: 'bd-loop-package',
    category: 'activity',
    label: 'Balíček Hà Giang Loop, 4 dny (Strawberry)',
    note: 'Konkrétní nabídka Strawberry: Private Motorbike Tour Easy Rider 4D/3N. Pro čtyři 25 200 000 VND. Sedí uprostřed dřívějšího odhadu 212–297 USD na osobu. Zatím nezaplaceno. Neověřeno, jestli je v ceně noc z 21. na 22. 9.',
    min: 6_300_000, max: 6_300_000, currency: 'VND', basis: 'per-person',
    confidence: 'verified',
    sourceIds: ['src-strawberry-booking-form'],
    dayDates: ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'],
  },
  {
    id: 'bd-hagiang-sapa',
    category: 'transport',
    label: 'Hà Giang → Sa Pa',
    note: 'Strawberry nabízí Hotel Sleeping Bus / Limousine za 300 000 VND na osobu — levnější než sdílený limousine od jiných prodejců (270–500 tis.). Odjezd 7:30 podle webu; nepotvrzeno, jestli je i večerní spoj.',
    min: 300_000, max: 300_000, currency: 'VND', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-strawberry-hagiang-sapa-schedule'],
    dayDates: ['2026-09-26'],
  },
  {
    id: 'bd-sapa-tamcoc-bus',
    category: 'transport',
    label: 'Přímý noční bus Sa Pa → Tam Cốc',
    note: 'Spodní hranice = běžné lehátko (kolem 370 tis. VND). Horní = jednolůžková kabina (cca 31 USD); dvoulůžková vyjde na cca 21 USD na osobu. Nahrazuje dřívější trojici transfer do Lào Cai + noční vlak + přejezd z Hanoje, která pro čtyři vycházela zhruba na 230–560 USD.',
    min: 14, max: 31, currency: 'USD', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-geckoroutes-sapa-ninhbinh', 'src-sapanomad-cabin-ninhbinh'],
    dayDates: ['2026-09-28'],
  },
  {
    id: 'bd-ninhbinh-catba',
    category: 'transport',
    label: 'Ninh Bình → Cát Bà (bus + trajekt)',
    note: 'Kombinovaná jízdenka včetně trajektu a svozu k hotelu.',
    min: 12, max: 16, currency: 'USD', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-goodmorning-ninhbinh-catba', 'src-catbaexpress-ninhbinh'],
    dayDates: ['2026-10-02'],
  },
  {
    id: 'bd-catba-hanoi',
    category: 'transport',
    label: 'Cát Bà → Hanoj',
    note: 'Odvozeno z cen na stejné trase opačným směrem.',
    min: 13, max: 18, currency: 'USD', basis: 'per-person',
    confidence: 'estimate',
    sourceIds: ['src-goodmorning-ninhbinh-catba'],
    dayDates: ['2026-10-05'],
  },

  // --- aktivity ----------------------------------------------------------
  {
    id: 'bd-coaster',
    category: 'activity',
    label: 'Alpine Coaster Sa Pa',
    min: 250_000, max: 250_000, currency: 'VND', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-trip-coaster', 'src-klook-coaster'],
    dayDates: ['2026-09-26'],
  },
  {
    id: 'bd-herbal-bath',
    category: 'activity',
    label: 'Bylinková koupel Dao Đỏ',
    note: 'Podle podniku. Ve vesnici Tả Phìn levněji, kombinace s masáží dráž.',
    min: 80_000, max: 520_000, currency: 'VND', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-vinpearl-herbal-bath'],
    dayDates: ['2026-09-26', '2026-09-27'],
  },
  {
    id: 'bd-sapa-trek',
    category: 'activity',
    label: 'Průvodce na trek v údolí Mường Hoa',
    note: 'Cenu za celodenní trek pro čtyři jsme nedohledali. Vyžádej si nabídku a doplň — je to jediná placená položka dne 27. 9.',
    min: null, max: null, currency: 'VND', basis: 'per-person',
    confidence: 'unverified',
    dayDates: ['2026-09-27'],
  },
  {
    id: 'bd-trang-an',
    category: 'activity',
    label: 'Tràng An — lodní výlet',
    note: 'Vstupné včetně loďky a veslařky. Některé zdroje uvádějí 300 000 VND — ověř na pokladně. Dřívější orientace z plánování NENÍ potvrzená cena.',
    min: 250_000, max: 300_000, currency: 'VND', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-huracars-ninhbinh-fees', 'src-trangan-boat-guide'],
    dayDates: ['2026-09-30'],
  },
  {
    id: 'bd-lanha-boat',
    category: 'activity',
    label: 'Celodenní loď Lan Hạ Bay',
    note: 'Menší skupina s kajakem. Oběd bývá v ceně plavby — nezapočítávej ho znovu do jídla.',
    min: 32, max: 50, currency: 'USD', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-gyg-lanha-smallgroup', 'src-catba-ventures'],
    dayDates: ['2026-10-03'],
  },

  // --- jídlo -------------------------------------------------------------
  {
    id: 'bd-food-daily',
    category: 'food',
    label: 'Jídlo a pití — dny mimo balíčky',
    note: 'Odhad pro levné místní jídelny: snídaně 30–60 tis., oběd 50–130 tis., večeře 80–250 tis. VND na osobu a den. Dny na loopu a den plavby sem NEPATŘÍ — tam je jídlo v balíčku.',
    min: 200_000, max: 450_000, currency: 'VND', basis: 'per-person',
    confidence: 'estimate',
    dayDates: [],
  },
  {
    id: 'bd-hotpot',
    category: 'food',
    label: 'Hotpot v Sa Pě (jednou za pobyt)',
    note: 'Jeden kotlík pro čtyři. Je to dražší než běžná jídelna.',
    min: 300_000, max: 850_000, currency: 'VND', basis: 'total',
    confidence: 'published',
    sourceIds: ['src-mytour-sapa-hotpot'],
    dayDates: ['2026-09-26'],
  },

  // --- navíc a rezerva ---------------------------------------------------
  {
    id: 'bd-sim',
    category: 'extra',
    label: 'SIM / eSIM',
    min: 60_000, max: 200_000, currency: 'VND', basis: 'per-person',
    confidence: 'published',
    sourceIds: ['src-viettel-coverage'],
  },
  {
    id: 'bd-stamp',
    category: 'extra',
    label: 'Razítko podle fotky',
    note: 'Orientace ze screenshotu: cca 250 000 VND za jeden obličej nebo zvíře. Ověřit na místě.',
    min: 250_000, max: 250_000, currency: 'VND', basis: 'total',
    confidence: 'unverified',
    dayDates: ['2026-09-20'],
  },
  {
    id: 'bd-insurance',
    category: 'extra',
    label: 'Cestovní pojištění',
    note: 'Se spolujízdou na motorce a případně lezením — to bývá dražší tarif. Cena závisí na pojišťovně a rozsahu krytí, takže ji tu nevymýšlíme.',
    min: null, max: null, currency: 'CZK', basis: 'per-person',
    confidence: 'unverified',
  },
  {
    id: 'bd-reserve',
    category: 'reserve',
    label: 'Rezerva',
    note: 'Na počasí, změnu spoje, taxi navíc a neplánované věci. Doporučujeme aspoň 15 % z plánované částky.',
    min: null, max: null, currency: 'CZK', basis: 'per-person',
    confidence: 'traveller-plan',
  },
]
