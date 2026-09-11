# Vietnam Complete Guide

Interaktivní PWA pro naši cestu po severním Vietnamu, **19. 9. – 6. 10. 2026** (18 dnů, 17 nocí, čtyři lidi).
Ráno otevřeš den, na dva tapy najdeš konkrétní dopravu nebo oběd, rozumíš místním názvům — a funguje to i bez signálu.

Po nasazení poběží na `https://marcasimek.github.io/vietnam-complete-guide/`.

---

## Rychlý start

```bash
npm install
npm run dev            # vývoj na http://localhost:5173/vietnam-complete-guide/
```

### Build a náhled produkční verze

```bash
npm run build
npm run preview        # http://localhost:4173/vietnam-complete-guide/
```

Service worker se registruje **jen v produkčním buildu**. Offline režim se tedy testuje přes `preview`, ne přes `dev`.

### Testy

```bash
npm test               # datové a unit testy (vitest) — 64 testů
npm run typecheck      # TypeScript
npm run test:e2e       # end-to-end (Playwright, Chromium mobil + desktop)
```

E2E si samo spustí `npm run build` a `vite preview`. V prostředí s předinstalovaným Chromiem nastav `CHROMIUM_PATH`.

### Vizuální kontrola

```bash
node scripts/shots.mjs                                  # 390 / 768 / 1440 px + diagnostika
node scripts/shot.mjs '#/plan' out.png 390 844          # jeden screenshot
node scripts/make-icons.mjs                             # přegenerovat PNG ikony ze SVG
```

`shots.mjs` hlásí horizontální overflow, useknuté texty, malé dotykové cíle a chyby v konzoli. Bez nálezů = průchozí.

---

## Struktura

```
src/
├─ model/
│  ├─ types.ts        datový model (Day, ItineraryItem, Place, Service, TransportLeg, Price, Source…)
│  └─ registry.ts     vyhledávání, rejstřík entit, kde se co objevuje
├─ data/              VŠECHEN obsah — itinerář, místa, podniky, doprava, ceny, zdroje
│  ├─ days/           18 dnů rozdělených po oblastech
│  ├─ places.ts       místa (města, vyhlídky, jeskyně, pláže…)
│  ├─ services.ts     ubytování, jídelny, bary, wellness, operátoři
│  ├─ transport.ts    dopravní úseky s variantami
│  ├─ choices.ts      výběry služeb („kde spíme", „večer podle nálady")
│  ├─ sources.ts      rejstřík zdrojů s datem kontroly
│  ├─ budget.ts       rozpočtový model
│  └─ route.ts        uzly a spojnice pro mapu
├─ lib/               search (bez diakritiky), money, geo, storage, offline, time
├─ pages/             Plán, Den, Krok, Doprava, Výběr, Místo, Podnik, Mapa, Průvodce, Moje cesta
├─ components/        Icon, RegionArt, ItemRow, SchematicMap, DetailedMap, ui.tsx
├─ styles/            tokens.css, components.css, global.css, fonts.css
└─ pwa/sw.ts          service worker
```

---

## Jak upravit obsah

Obsah je **oddělený od komponent**. Nové jídlo, hotel nebo den se přidá v datech, aniž by se sahalo na UI.

### Přidat podnik

1. Zdroj do `src/data/sources.ts` (URL, vydavatel, `checkedOn`, a hlavně `supports` — co přesně ten zdroj podpírá).
2. Záznam do `src/data/services.ts`. Povinné: `id`, `kind`, `name`, `regionId`, `what`.
   U cen vždy `currency`, `unit` a `confidence`.
3. Odkaz z kroku dne (`serviceIds`) nebo z výběru (`ChoiceGroup.serviceIds`).
4. `npm test` — testy hlídají sirotčí odkazy, chybějící jednotky u cen i souřadnice mimo sever Vietnamu.

### Přidat den nebo krok

Dny jsou v `src/data/days/`. Každý krok potřebuje `id`, `kind`, `title`, `order`, `dayPart`, `status` a **nějaký obsah detailu** — buď text (`detail`, `practical`), nebo odkaz na entitu (`transportLegId`, `choiceGroupIds`, `placeIds`, `serviceIds`). Test „každý krok má použitelný detail" to vynucuje: klikací řádek bez obsahu neprojde.

### Verzování obsahu

`trip.contentVersion` v `src/data/trip.ts`. Po změně dat ho zvyš — offline balíček podle něj pozná, že má starší verzi, a nabídne aktualizaci.

---

## Důvěryhodnost údajů

V aplikaci jsou **tři oddělené stavy**, které se běžně pletou:

| Co to je | Kde se to projeví | Co to NEznamená |
|---|---|---|
| **Důvěryhodnost údaje** (`Confidence`) | štítek u ceny nebo provozní doby | že je volno |
| **Dostupnost** (`Availability`) | u dopravních variant | že je to rezervované |
| **Stav rezervace** (`BookingStatus`) | Moje cesta → Rezervace | nic veřejného; drží se lokálně, default „k řešení" |

Stupně důvěryhodnosti: `traveller-plan` → `verified` → `published` → `estimate` → `unverified`.

**Poctivé omezení:** data vznikla 11. 9. 2026 v prostředí, kde byl web dostupný jen přes vyhledávání — jednotlivé stránky nešlo otevřít. Údaje proto pocházejí z výsledků vyhledávání nad uvedenými URL, ne z otevřené stránky. **Proto nemá žádná cena stupeň `verified`** a test to hlídá. U každé ceny je klikací odkaz, aby to šlo potvrdit. V aplikaci je to vysvětlené v kartě „Jak jsme tohle ověřovali" (Průvodce → Praktické).

---

## Offline

- **Registrace SW** probíhá při startu aplikace, ne až při otevření sekce Offline.
- **„Připravit cestu offline"** (Moje cesta → Offline) uloží app shell a ověří, že je v cache dokument, JavaScript (v něm jsou všechna data itineráře) i styly. Teprve pak hlásí „Připraveno offline".
- Protože je celý itinerář součástí JS bundlu, **offline se otevře i detail, který nikdo předtím nenavštívil**. To ověřuje E2E test.
- **Nefunguje offline** (a aplikace to říká): externí odkazy, podrobná mapa s dlaždicemi, navigace v Google/Apple Maps, cokoli živého.
- Offline mapa je naše vlastní schematická SVG. Dlaždice OpenStreetMap se záměrně nestahují dopředu — [podmínky provozu](https://operations.osmfoundation.org/policies/tiles/) to zakazují.

### Izolace úložiště

GitHub Pages projekty na `marcasimek.github.io` sdílejí origin. Aplikace proto:

- prefixuje všechny klíče `vcg:v1:` a cache `vcg-`,
- **nikdy** nevolá `localStorage.clear()` ani nemaže „vše kromě aktuální cache",
- registruje service worker jen pod `/vietnam-complete-guide/`.

E2E test tohle ověřuje: vytvoří cizí cache a cizí klíče, projde aktualizací i smazáním balíčku a zkontroluje, že cizí data přežila.

### Aktualizace

Nová verze se **nikdy neaktivuje sama** — mohl bys mít rozepsanou poznámku. Aplikace nabídne „Nová verze je připravená" a přechod proběhne až na potvrzení.

---

## Osobní data

Oblíbené, poznámky, výběry variant a stav rezervací jsou **jen na daném zařízení**. Nikam se neposílají a ostatním se samy neobjeví — v UI je to napsané.

Přenos mezi zařízeními je ruční přes **export/import** (Moje cesta → Uložené). Import validuje jméno aplikace i verzi schématu, slučuje místo přepisování a konflikty hlásí.

Do repozitáře ani datasetu **nepatří**: pasy, rezervační kódy, telefonní čísla, skeny smluv, tokeny. Datový test to kontroluje.

---

## Nasazení

Deploy běží přes GitHub Actions (`.github/workflows/deploy.yml`) z větve `main` po úspěšných kontrolách. Publikuje se `dist`, ne zdroje.

**Nutný ruční krok, pokud Pages ještě neběží:**
`Settings → Pages → Build and deployment → Source: GitHub Actions`.
Potom jde deploy spustit ručně přes `workflow_dispatch`, bez nového commitu.

PR kontroluje `.github/workflows/ci.yml`: typecheck, datové testy, build a E2E.

Base path je napevno `/vietnam-complete-guide/`. Pro root hosting: `BASE_PATH=/ npm run build`.

---

## Licence a evidence zdrojů

Viz [`docs/LICENSES.md`](docs/LICENSES.md). Stručně: žádné fotografie — grafika oblastí i ikony jsou vlastní SVG, písma jsou samohostovaná pod OFL, mapové dlaždice jsou OpenStreetMap s atribucí a bez předstahování.

## Další dokumentace

- [`docs/PROGRESS.md`](docs/PROGRESS.md) — stav práce, co zbývá, konkrétní další krok
- [`docs/LICENSES.md`](docs/LICENSES.md) — licence písem, map, knihoven a původ grafiky
- `Vietnam_PWA_master_prompt.md` — původní zadání projektu
