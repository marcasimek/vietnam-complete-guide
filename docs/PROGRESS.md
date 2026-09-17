# PROGRESS — Vietnam Complete Guide (PWA)

Pracovní stav projektu. Čti ho na začátku každé session spolu s `git log`, `npm test` a kódem.

**Poslední aktualizace:** 16. 9. 2026 — potvrzený noční bus Hà Giang → Sa Pa
**Větev:** `claude/vietnam-pwa-implementation-8xuy9s`

---

## Jak to spustit

```bash
npm install
npm run dev                        # vývoj
npm run build && npm run preview   # http://localhost:4173/vietnam-complete-guide/
npm test                           # 69 datových a unit testů
npx playwright test                # 28 E2E testů (mobil + desktop)
node scripts/shots.mjs             # screenshoty 390/768/1440 px + diagnostika
```

Service worker běží jen v produkčním buildu — offline se testuje přes `preview`, ne `dev`.

---

## Stav: aplikace je funkční a kompletní pro celou cestu

### Hotovo

**Základ**
Vite 8 + React 19 + TypeScript, HashRouter, base path `/vietnam-complete-guide/` od začátku.
Vlastní design systém (`tokens.css`, `components.css`), akcent podle oblasti přes `data-region`.
Vlastní sada ikon a dekorativní SVG grafika oblastí — žádné fotografie, žádná licenční zátěž, funguje offline.
Samohostovaná písma (Bricolage Grotesque + Be Vietnam Pro, OFL, subsety latin / latin-ext / vietnamese, jen `.woff2`).

**Datový model**
Trip, Day, ItineraryItem, Place, Service, TransportLeg + TransportOption, ChoiceGroup, Price, Source, Alternative, GuideCard, BookingTask, PlanBScenario, OpenQuestion.
Tři oddělené stavy: `Confidence` (důvěryhodnost údaje) × `Availability` (dostupnost pro náš termín) × `BookingStatus` (co jsme opravdu objednali, default „k řešení").
`GeoPrecision` včetně `area-fallback` = pin neznáme → mapa otevře vyhledání, ne falešně přesný bod.

**Obrazovky**
Plán (vybraný den v plné podobě + kompaktní přehled cesty, pás 18 dnů, „Dnes" podle vietnamského data) · detail dne, kroku, dopravy, výběru, místa a podniku · Mapa (vlastní schematická SVG offline + volitelný Leaflet/OSM online; hlavní trasa a loop jako dvě čitelná schémata) · Průvodce (rejstřík s hledáním bez diakritiky, filtry, praktické karty, alternativní oblasti, plán B, otevřené otázky) · Moje cesta (rezervace, rozpočet, uložené, poznámky, export/import, offline balíček).

**Obsah — celý itinerář**
18 pobytových dnů, 17 nocí (ověřeno testem). 26. 9. je referenční den podle zadání.
**10 dopravních úseků** s variantami, časem ode dveří ke dveřím, nástupem/výstupem, kapacitou pro čtyři se zavazadly a plánem, když to nevyjde: letiště ⇄ Hanoj, Hanoj → Hà Giang, Hà Giang → Sa Pa, **Sa Pa → Tam Cốc (přímý noční bus)**, Ninh Bình → Cát Bà, Cát Bà → Hanoj. Úseky Sa Pa → Lào Cai, noční vlak a Hanoj → Tam Cốc zůstávají popsané jako náhradní cesta (`alt-night-train-via-hanoi`), ne jako plán.
**Místa a podniky ve všech oblastech** — Hanoj, Hà Giang, loop, Sa Pa, Ninh Bình, Cát Bà.
Praktický průvodce (metoda ověřování, vstup, lety, peníze, SIM, pojištění, zdraví, bezpečnost, pravidla, balení), rozpočet s poctivě označenými položkami bez ceny, 4 náhradní varianty napojené přímo na kroky.

**Nasazení**
`.github/workflows/ci.yml` — PR: typecheck, testy, build, E2E.
`.github/workflows/deploy.yml` — z `main`, s kontrolou base path, manifestu a toho, že se do `dist` nedostalo zadání ani interní poznámky. Ruční spuštění povolené.

**Dokumentace**
`README.md`, `docs/TEST-REPORT.md`, `docs/LICENSES.md`, `docs/screenshots/` (39 obrázků, bez nálezů).

---

## Změna trasy 14. 9. 2026 — noční vlak nahrazen přímým busem

Na přání zadavatele: místo řetězce **transfer do Lào Cai → noční vlak SP4 → ráno přejezd z Hanoje** jedeme **jedním přímým nočním autobusem Sa Pa → Tam Cốc**.

Co se tím v datech změnilo:

- Nový úsek `leg-sapa-ninhbinh` se čtyřmi variantami (kabinový noční bus = doporučeno, běžná lehátka, denní spoj, soukromé auto) a šesti novými zdroji.
- Den 28. 9. přepsán (`src/data/days/sapa-nightbus.ts`, dřív `sapa-train.ts`): odpadly kroky „transfer na nádraží Lào Cai" a „noční vlak", přibyl jeden krok s nočním busem.
- Den 29. 9. přepsán: místo příjezdu vlaku do Hanoje, snídaně u nádraží a návazného přejezdu je **ranní příjezd rovnou do Tam Cốc**. Den tím získal celé dopoledne.
- Oblast `train` přejmenována na `night-transfer` („Noční přejezd"), včetně vlastní grafiky (noční silnice místo kolejí) a barvy `--region-night`. `night.kind` má nově hodnotu `'bus'`.
- Schéma trasy: uzel Lào Cai zrušen, tři úseky sloučeny do jednoho `rs-sapa-tamcoc`. Hlavních mezioblastních přesunů je teď pět místo sedmi.
- Rozpočet: `bd-sapa-laocai`, `bd-night-train` a `bd-hanoi-tamcoc` nahradila jedna položka `bd-sapa-tamcoc-bus` (14–31 USD/os. proti dřívějším zhruba 230–560 USD za čtyři).
- Rezervace: tři úkoly nahradil jeden `bk-sapa-tamcoc-bus`.
- Plán B `planb-no-direct-bus` a alternativa `alt-night-train-via-hanoi` drží původní vlakovou variantu kompletně popsanou pro případ, že přímý spoj nepojede.

**Co je potřeba ověřit:** podle zdrojů vozí až do Tam Cốc jen The Long Travel a Grouptour — ostatní dopravci končí v centru Ninh Bình. Vedeno jako otevřená otázka `oq-direct-bus-details`.

**Navazující úkol:** ubytování v Tam Cốc na 29. 9. musí vědět, že dorazíme kolem páté ráno. Brzký check-in nebo aspoň úschova zavazadel.


## Nabídka Strawberry — první ověřená data cesty (14. 9. 2026)

Zadavatel poslal poptávku přes formulář Strawberry a dopsal si se s nimi na WhatsAppu. **Tohle jsou první údaje celé cesty, které nepocházejí z rešerše, ale přímo od poskytovatele.**

Co je potvrzené:

| Co | Kolik | Zdroj |
|---|---|---|
| Private easy rider 4D/3N | 6 300 000 VND / os. (25 200 000 za čtyři) | rezervační formulář Strawberry |
| Limousine Hanoj → Hà Giang, 9:00 → 16:00 | 350 000 VND / os. (1 400 000 za čtyři) | formulář + WhatsApp |
| Noc po loopu 25./26. 9. na základně | 300 000 VND / pokoj (600 000 za dva) | WhatsApp |
| Dva soukromé pokoje před loopem i na loopu | ano | WhatsApp |

Kvůli tomu vznikl **nový druh zdroje `direct-quote`** (co nám poskytovatel řekl přímo — mail, WhatsApp, telefon; není to web) a přepsal se test na stupeň `verified`:

- dřív: žádná cena nesmí být `verified`, protože sběr dat byl jen vyhledávání
- teď: `verified` smí nést jen cena, která cituje zdroj druhu `direct-quote`, `operator` nebo `traveller`, a musí mít datum kontroly
- přibyla pojistka, že `verified` zůstane pod 20 % všech cen, aby se stupeň nezačal rozlévat na rešerši

Dál se změnilo: rozpočtová položka loopu je z odhadu 212–297 USD konkrétních 6 300 000 VND; `bd-hagiang-2` se rozpadla na `bd-hagiang-night-21` (bez ceny, možná v balíčku) a `bd-hagiang-night-25` (600 000 VND, účtuje se zvlášť); v úseku Hanoj → Hà Giang je nová doporučená varianta `opt-hanoi-hg-strawberry`; den 21. 9. má konkrétní časy 9:00 → 16:00.

**Co zbývalo u Strawberry k 14. 9.:** výše zálohy, storno při počasí, jestli je noc z 21. na 22. 9. v ceně balíčku, a transfer Hà Giang → Sa Pa — na ten předtím neodpověděli.

## Potvrzený noční bus Hà Giang → Sa Pa (16. 9. 2026)

Strawberry na WhatsAppu přímo potvrdilo: **noční bus Hà Giang → Sa Pa odjíždí v 18:00 a je v Sa Pě ve 23:00.** Nahrazuje to dřívější plán (nocleh v Hà Giangu po loopu + ranní přejezd 26. 9.) — místo toho se po loopu jede rovnou do Sa Py ještě týž večer.

Co se tím v datech změnilo:

- Den 25. 9. (`ha-giang.ts`) končí novým krokem `item-20260925-night-bus` (transport, 18:00 → 23:00) místo dřívějšího nočního v Hà Giangu; `night` pole dne je teď `{ label: 'Sa Pa', ... }`.
- Den 26. 9. přišel o krok transferu (`item-20260926-transfer` zrušen) — check-in proběhl už předešlý večer. Zbylé tři kroky se přenumerovaly, den přejmenován na „Sa Pa: coaster a první den v horách".
- `leg-hagiang-sapa`: doporučená varianta `opt-hg-sapa-strawberry-bus` má teď potvrzený rozvrh (`doorToDoor`/`schedule` confidence `verified`), ostatní varianty (limousine, soukromé auto, přes Lào Cai) zůstávají jako popsaná náhrada pro ranní přejezd 26. 9.
- Route/mapa: uzel Hà Giang má 1 noc (dřív 2), Sa Pa 3 noci (dřív 2) — segment `rs-hagiang-sapa` se přesunul na 25. 9. a je typu `bus`.
- Rozpočet/rezervace: `bd-hagiang-night-25` (600 000 VND za noc po loopu) zrušena — ta noc už není potřeba. `bk-hagiang-base` a `bk-transfer-sapa` přepsané na nový rozvrh.
- Nové otevřené otázky: `oq-hanoi-pickup-point` (přesná adresa nástupu v Hanoji 21. 9.) a `oq-strawberry-total-price` (jeden vyčíslený souhrn za všechno). Obě poslané Strawberry, odpověď zatím nedorazila.
- 69 unit testů (přidán blok pro noční bus 25. 9.), 28 E2E testů, build a vizuální kontrola bez nálezů.

## Co zbývá

### Nutný ruční krok
**GitHub Pages není zapnuté.** Potřeba: `Settings → Pages → Build and deployment → Source: GitHub Actions`. Potom jde deploy spustit ručně přes `workflow_dispatch`. Veřejná URL proto **není ověřená** — workflow je připravené, ale nasazení neproběhlo.

### Obsahové doplňky (aplikace bez nich funguje)
1. **Čtyři položky rozpočtu bez ceny** — průvodce na trek 27. 9., lezení u Cát Bà, plavba po Nho Quế a cestovní pojištění. U dvou dalších (Tam Cốc, Cát Bà) známe jen jednu hranici. Všechno je vedené v „Co zatím nevíme" (Průvodce → Varianty) s konkrétním dalším krokem.
2. **Ověřené piny** — většina míst má `area-fallback`, takže mapa otevírá vyhledání názvu místo souřadnic. Kde se podaří najít důvěryhodný pin, přepnout na `approximate` nebo `exact`.
3. **Otevírací doby** — u části podniků chybí (Hotpot Center, Quang Minh, bary v Sa Pě, jídelny v Hanoji). Jsou to údaje, které se dají zjistit v mapě.

### Technické
4. **WebKit** není v prostředí k dispozici (`/opt/pw-browsers` má jen Chromium), takže na Safari to odzkoušené není.
5. **Lighthouse** neproběhl.

---

## Poctivé omezení, které je potřeba znát

Data vznikla v prostředí, kde byl web dostupný **jen přes vyhledávání** — jednotlivé stránky nešlo otevřít (`WebFetch` i přímý `curl` blokuje egress proxy). Údaje pocházejí z výsledků vyhledávání nad uvedenými URL, ne z otevřené stránky.

Důsledek v datech: **`verified` smí nést jen údaj, který nám dal přímo poskytovatel** (WhatsApp, mail, jeho vlastní formulář — zdroj druhu `direct-quote` nebo `operator`) nebo cestující z první ruky, a test to vynucuje (`tests/unit/data.test.ts` → „ověřeno smí stát jen na tom, co nám poskytovatel řekl přímo") i pojistkou, že `verified` zůstane pod 20 % všech cen. Od 14.–16. 9. 2026 takhle přibylo pár konkrétních cen a časů od Strawberry (loop, transfer, noční bus) — u všeho ostatního je klikací odkaz, aby to šlo potvrdit. V aplikaci je to vysvětlené v kartě „Jak jsme tohle ověřovali" (Průvodce → Praktické).

Kdyby další session měla plný přístup na web: nejcennější je otevřít zdroje u cen a povýšit je na `verified`, doplnit zbývající čtyři ceny a najít ověřené piny.

---

## Další konkrétní krok

Zjistit cenu průvodce na trek 27. 9. — je to jediná placená položka toho dne a poslední chybějící cena, která se dá dohledat bez poptávky. Postup je u služby „Průvodce na trek v údolí Mường Hoa" (Průvodce → Rejstřík).

Potom otevírací doby podniků, které je nemají — jsou to rychlé doplňky z mapy a v praxi rozhodují o tom, jestli se někam vůbec dostaneme.
