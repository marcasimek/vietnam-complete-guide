# PROGRESS — Vietnam Complete Guide (PWA)

Pracovní stav projektu. Čti ho na začátku každé session spolu s `git log`, `npm test` a kódem.

**Poslední aktualizace:** 11. 9. 2026
**Větev:** `claude/vietnam-pwa-implementation-8xuy9s`

---

## Jak to spustit

```bash
npm install
npm run dev                        # vývoj
npm run build && npm run preview   # http://localhost:4173/vietnam-complete-guide/
npm test                           # 66 datových a unit testů
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
**9 dopravních úseků** s variantami, časem ode dveří ke dveřím, nástupem/výstupem, kapacitou pro čtyři se zavazadly a plánem, když to nevyjde: letiště ⇄ Hanoj, Hanoj → Hà Giang, Hà Giang → Sa Pa, Sa Pa → Lào Cai, noční vlak, Hanoj → Tam Cốc, Ninh Bình → Cát Bà, Cát Bà → Hanoj.
**Místa a podniky ve všech oblastech** — Hanoj, Hà Giang, loop, Sa Pa, Ninh Bình, Cát Bà.
Praktický průvodce (metoda ověřování, vstup, lety, peníze, SIM, pojištění, zdraví, bezpečnost, pravidla, balení), rozpočet s poctivě označenými položkami bez ceny, 4 náhradní varianty napojené přímo na kroky.

**Nasazení**
`.github/workflows/ci.yml` — PR: typecheck, testy, build, E2E.
`.github/workflows/deploy.yml` — z `main`, s kontrolou base path, manifestu a toho, že se do `dist` nedostalo zadání ani interní poznámky. Ruční spuštění povolené.

**Dokumentace**
`README.md`, `docs/TEST-REPORT.md`, `docs/LICENSES.md`, `docs/screenshots/` (39 obrázků, bez nálezů).

---

## Co zbývá

### Nutný ruční krok
**GitHub Pages není zapnuté.** Potřeba: `Settings → Pages → Build and deployment → Source: GitHub Actions`. Potom jde deploy spustit ručně přes `workflow_dispatch`. Veřejná URL proto **není ověřená** — workflow je připravené, ale nasazení neproběhlo.

### Obsahové doplňky (aplikace bez nich funguje)
1. **Ceny, které chybí** — největší díra je balíček loopu na 4 dny (máme jen hladinu pro 3denní). Dál ubytování v Tam Cốc a na Cát Bà, průvodce na trek, lezení, plavba po Nho Quế. Všechno je vedené v „Co zatím nevíme" (Průvodce → Varianty) s konkrétním dalším krokem.
2. **Konkrétní podniky místo kategorií** — hotpot v Sa Pě, bylinková koupel, kozí restaurace v Ninh Bình a seafood na Cát Bà jsou zatím kategorie s doloženými kandidáty, ne jeden ověřený podnik. Chce to otevřít zdroje a vybrat.
3. **Ověřené piny** — většina míst má `area-fallback`, tedy mapa otevírá vyhledání. Kde se podaří najít důvěryhodný pin, přepnout na `approximate`/`exact`.

### Technické
4. **WebKit** není v prostředí k dispozici (`/opt/pw-browsers` má jen Chromium), takže na Safari to odzkoušené není.
5. **Lighthouse** neproběhl.

---

## Poctivé omezení, které je potřeba znát

Data vznikla v prostředí, kde byl web dostupný **jen přes vyhledávání** — jednotlivé stránky nešlo otevřít (`WebFetch` i přímý `curl` blokuje egress proxy). Údaje pocházejí z výsledků vyhledávání nad uvedenými URL, ne z otevřené stránky.

Důsledek v datech: **žádná cena nemá stupeň `verified`** a test to vynucuje (`tests/unit/data.test.ts` → „netvrdí ověřeno tam, kde zdroj nebyl otevřen"). U každé ceny je klikací odkaz, aby to šlo potvrdit. V aplikaci je to vysvětlené v kartě „Jak jsme tohle ověřovali" (Průvodce → Praktické).

Kdyby další session měla plný přístup na web: nejcennější je otevřít zdroje u cen a povýšit je na `verified`, doplnit chybějící ceny a najít ověřené piny.

---

## Další konkrétní krok

Doplnit chybějící ceny z bodu 1 — začít balíčkem loopu, protože je to největší položka rozpočtu a zároveň nejdůležitější rezervace celé cesty. Postup je popsaný ve výběru „S kým jedeme loop" (Průvodce → Rejstřík, nebo krok 21. 9. → Briefing): položit všem třem operátorům stejné otázky a doplnit odpovědi do `src/data/services.ts` a `src/data/budget.ts`.
