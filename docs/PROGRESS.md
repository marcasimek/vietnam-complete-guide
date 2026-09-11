# PROGRESS — Vietnam Complete Guide (PWA)

Pracovní stav projektu. Čti ho na začátku každé session spolu s `git log`, `npm test` a kódem.

**Poslední aktualizace:** 11. 9. 2026

---

## Jak to spustit

```bash
npm install
npm run dev                 # vývoj
npm run build && npm run preview   # produkční build na http://localhost:4173/vietnam-complete-guide/
npm test                    # datové a unit testy (vitest)
node scripts/shots.mjs      # screenshoty 390/768/1440 px + diagnostika overflow a malých cílů
node scripts/shot.mjs '#/plan' docs/screenshots/x.png 390 844   # jeden rychlý screenshot
```

Base path je od začátku `/vietnam-complete-guide/`. Pro root hosting `BASE_PATH=/ npm run build`.

---

## Hotovo

### Základ
- Vite 8 + React 19 + TypeScript, HashRouter, base path `/vietnam-complete-guide/`.
- Design systém: `src/styles/tokens.css` + `components.css`, akcent podle oblasti přes `data-region`.
- Vlastní sada ikon (`src/components/Icon.tsx`) a dekorativní SVG grafika oblastí (`RegionArt.tsx`) — žádné fotografie, žádná licenční zátěž, funguje offline.
- Samohostované fonty přes `@fontsource` (Bricolage Grotesque + Be Vietnam Pro, oboje OFL, s vietnamským i latin-ext subsetem).

### Datový model (`src/model/types.ts`)
- Trip, Day, ItineraryItem, Place, Service, TransportLeg, TransportOption, ChoiceGroup, Price, Source, Alternative, GuideCard, BookingTask, PlanBScenario, OpenQuestion.
- Tři oddělené stavy: `Confidence` (důvěryhodnost údaje), `Availability` (dostupnost pro náš termín), `BookingStatus` (co jsme opravdu objednali).
- `GeoPrecision` včetně `area-fallback` = pin neznáme, mapa otevře vyhledání místo falešně přesného bodu.

### Obrazovky
- **Plán** — vybraný den v plné podobě + kompaktní přehled celé cesty po oblastech, pás 18 dnů, „Dnes" podle vietnamského data.
- **Detail dne / kroku / dopravy / výběru / místa / podniku** — každý s vlastní URL, zpět, poznámkou a zdroji.
- **Mapa** — vlastní schematická SVG mapa (offline) + volitelná podrobná mapa Leaflet/OSM. Hlavní trasa a Hà Giang Loop jako dvě samostatná čitelná schémata.
- **Průvodce** — rejstřík s vyhledáváním bez diakritiky (cs + vi), filtry oblast/typ, praktické karty, alternativní oblasti, plán B, otevřené otázky.
- **Moje cesta** — rezervační checklist (18 položek, default „k řešení"), transparentní rozpočet, uložené, poznámky, export/import, offline balíček.

### Obsah
- **Všech 18 pobytových dnů** s kroky, poznámkami dne a noclehy. 17 nocí ověřeno testem.
- **26. 9. je referenční den** — hotový podle zadání: transfer se 3 variantami, check-in + oběd se dvěma výběry, coaster s vyřešenou otázkou identity (kolejová dráha ≠ bezkolejová autíčka), večerní varianty jako „nebo".
- **Hanoj** — 8 míst, 7 podniků s adresami a cenami, 3 dopravní úseky, 3 výběry.
- **Sa Pa** — 5 míst, 10 podniků, 1 dopravní úsek, 3 výběry.
- Praktický průvodce: metoda ověřování, vstup, lety, peníze, SIM (Viettel vs. Airalo v horách), pojištění, zdraví, bezpečnost, pravidla, balení.
- Rozpočet: 26 položek, poctivě označené ty bez ceny, žádné dvojí započtení balíčků.

### Testy
- 64 testů ve `tests/unit/`: struktura cesty, 18 dnů, 17 nocí, referenční integrita, ceny (měna + jednotka + jistota), zdroje, souřadnice, referenční den 26. 9., hledání bez diakritiky, export/import, přepočet měn, mapové odkazy, časová pásma.

---

## Zbývá

1. **Obsah pro zbylé oblasti** — Ninh Bình a Cát Bà nemají vlastní místa, podniky ani dopravní úseky; kroky tam zatím mají jen text detailu.
2. **Hà Giang Loop** — místa (Quản Bạ, Thẩm Mã, Mã Pí Lèng, Nho Quế, Du Già) a operátoři jako služby.
3. **Noční vlak** — vlastní `TransportLeg` s porovnáním dvou dvoulůžkových kupé proti vykoupenému čtyřlůžkovému.
4. **E2E testy (Playwright)** — 10 scénářů ze zadání §14, hlavně offline a aktualizace verze.
5. **GitHub Actions** — build/test na PR, deploy z `main`, ruční spuštění.
6. **README** a evidence licencí.
7. Vizuální průchod ve všech třech šířkách po dokončení obsahu.

---

## Poctivé omezení, které je potřeba znát

Data vznikla v prostředí, kde byl web dostupný **jen přes vyhledávání** — jednotlivé stránky nešlo otevřít (`WebFetch` i přímý `curl` blokuje egress proxy). Údaje proto pocházejí z výsledků vyhledávání nad uvedenými URL, ne z otevřené stránky.

Důsledek v datech: **žádná cena nemá stupeň `verified`** a test to hlídá (`tests/unit/data.test.ts` → „netvrdí ověřeno tam, kde zdroj nebyl otevřen"). U každé ceny je klikací odkaz, aby to šlo potvrdit. V aplikaci je to vysvětlené v kartě „Jak jsme tohle ověřovali" (Průvodce → Praktické).

## Další konkrétní krok

Doplnit místa a podniky pro Ninh Bình (Tràng An, Hang Múa, Bích Động, kozí speciality) a Cát Bà (Lan Hạ, pláže Cát Cò, seafood, lodní operátoři) a napojit je na kroky dnů 29. 9. – 5. 10.
