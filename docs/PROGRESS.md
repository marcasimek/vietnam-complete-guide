# PROGRESS — Vietnam Complete Guide (PWA)

Pracovní stav projektu. Čti ho na začátku každé session spolu s `git log`, `npm test` a kódem.

**Poslední aktualizace:** 14. 9. 2026
**Větev:** `claude/vietnam-pwa-implementation-8xuy9s`

---

## Jak to spustit

```bash
npm install
npm run dev                        # vývoj
npm run build && npm run preview   # http://localhost:4173/vietnam-complete-guide/
npm test                           # 67 datových a unit testů
npx playwright test                # 24 E2E testů (mobil + desktop)
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

Důsledek v datech: **žádná cena nemá stupeň `verified`** a test to vynucuje (`tests/unit/data.test.ts` → „netvrdí ověřeno tam, kde zdroj nebyl otevřen"). U každé ceny je klikací odkaz, aby to šlo potvrdit. V aplikaci je to vysvětlené v kartě „Jak jsme tohle ověřovali" (Průvodce → Praktické).

Kdyby další session měla plný přístup na web: nejcennější je otevřít zdroje u cen a povýšit je na `verified`, doplnit zbývající čtyři ceny a najít ověřené piny.

---

## Další konkrétní krok

Zjistit cenu průvodce na trek 27. 9. — je to jediná placená položka toho dne a poslední chybějící cena, která se dá dohledat bez poptávky. Postup je u služby „Průvodce na trek v údolí Mường Hoa" (Průvodce → Rejstřík).

Potom otevírací doby podniků, které je nemají — jsou to rychlé doplňky z mapy a v praxi rozhodují o tom, jestli se někam vůbec dostaneme.
