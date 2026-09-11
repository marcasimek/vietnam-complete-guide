# Test report

**Datum:** 11. 9. 2026
**Build:** produkční (`npm run build`), spuštěný přes `vite preview` na `/vietnam-complete-guide/`
**Prohlížeč:** Chromium (Playwright 1.63, předinstalovaný build)

---

## Co proběhlo

| Kontrola | Výsledek |
|---|---|
| TypeScript (`npm run typecheck`) | ✅ bez chyb |
| Datové a unit testy (`npm test`) | ✅ 65 / 65 |
| End-to-end (`npx playwright test`) | ✅ 24 / 24 (mobil + desktop) |
| Produkční build | ✅ precache 34 položek, 1,1 MB |
| Vizuální diagnostika 390 / 768 / 1440 px | ✅ bez nálezů |

---

## Datové a unit testy — 65 testů

`tests/unit/data.test.ts` (31)

- Přesně **18 pobytových dnů**, bez duplicit a bez chybějícího kalendářního dne.
- Souvislé indexy 1–18.
- **17 nocí** v přesném rozložení: Hanoj 3, Hà Giang 2, Yên Minh 1, Đồng Văn 1, Du Già 1, Sa Pa 2, vlak 1, Tam Cốc 3, Cát Bà 3.
- Poslední noc je v Hanoji, ne na ostrově. Poslední den nemá noc ve Vietnamu.
- **Návrat do Prahy 7. 10. v 07:05.**
- Extra zaplacená noc 18./19. 9. je vedená jako náklad navíc a nezkresluje počet nocí.
- Unikátní ID kroků, souvislé pořadí v rámci dne.
- **Každý krok má použitelný detail** — žádný inertní slib klikatelnosti.
- Žádná referenční integrita nechybí: legy, výběry, místa, podniky, zdroje, oblasti, data dnů, uzly mapy.
- Žádná duplicita ID napříč rejstříky (172 identifikátorů).
- Každá viditelná cena má **měnu, jednotku a stupeň jistoty**; `min ≤ max`; cena bez hodnoty musí mít poznámku, co s tím.
- **Žádná cena nemá stupeň `verified`** — test to vynucuje, viz poznámka o metodě níž.
- Ceny se zdrojem mají i datum kontroly.
- Rozpočet nezapočítává balíčky dvakrát.
- Kurz má zdroj i datum.
- Zdroje mají datum kontroly, platné URL a uvádějí, co podpírají.
- Souřadnice leží v severním Vietnamu (chytilo by prohozené lat/lng).
- Bod bez ověřeného pinu má čím se vyhledat.
- Referenční den 26. 9.: čtyři kroky ve správném pořadí, transfer s doporučenou variantou a alternativami, ubytování s cenou za dvoulůžkový pokoj a noc, jídelny s „co si objednat", coaster s aliasy a vyřešenou identitou, večer jako „nebo".
- Alternativy nejsou jen v datech, ale i napojené na kroky.
- Žádné citlivé údaje ani tajemství v datech (pasy, rezervační kódy, telefony, e-maily, tokeny).
- Žádný zakázaný textový balast.

`tests/unit/search.test.ts` (9) — normalizace češtiny i vietnamštiny včetně `đ`, `ơ`, `ư`, které NFD nerozloží. Lookup „ha giang", „hanoi", „ta van", „dong van", „coaster", „downhill auticka", „bobova draha". Nesmysl nevrací nic. Filtry zužují.

`tests/unit/storage.test.ts` (11) — migrace schématu, odolnost proti poškozeným datům, export s verzí, odmítnutí cizí aplikace i novějšího schématu, slučování s hlášením konfliktů, import nepřetáhne cizí klíče.

`tests/unit/money-geo.test.ts` (10) — formát cen a rozsahů, přepočet Kč podle uloženého kurzu s datem, cena za čtveřici jen u ceny na osobu, mapové odkazy (ověřený pin → souřadnice, neověřený → vyhledání), GeoJSON `[lng, lat]` proti knihovnímu `lat/lng`.

`tests/unit/time.test.ts` (5) — „dnes" podle vietnamského data: 25. 9. ve 23:00 v Praze = **26. 9.** ve Vietnamu.

---

## End-to-end — 24 testů (12 scénářů × 2 viewporty)

### Průchod itinerářem (`tests/e2e/itinerary.spec.ts`)

1. **Přehled → 26. 9. → transfer → varianty → nástup → navigace.** Ověřeno: cena s jednotkou a štítkem jistoty, nástupní i výstupní místo, externí rezervační odkaz s `target="_blank"` a `rel="noopener"`.
2. **Check-in a oběd → hotely → skutečná jídelna → mapa.** Ověřeno: cena za dvoulůžkový pokoj a noc, adresa 5 Đồng Lợi, sekce „Co si objednat", a že mapa vede na **vyhledání**, ne na falešně přesný bod.
3. **Coaster.** Ověřeno, že detail obsahuje slova „kolejnici", „bezkolejové" i „CoasterKart" — tedy že je otázka identity vyřešená, ne zamlčená. Dál cena, provozní doba, zdroje a večerní varianty jako „nebo".
4. **Osobní stav.** Oblíbené, poznámka a stav rezervace přežijí reload.
5. **Deep linky a zpět.** Přímý vstup na detail funguje; `goBack()` vrátí správný den.
6. **Fallbacky.** Neznámé ID místa, neexistující den i neznámá adresa ukážou srozumitelný stav s cestou dál, ne prázdnou obrazovku.
7. **Hledání bez diakritiky.** „ha giang", „hanoi", „ta van", „dong van", „pho" najdou; nesmysl nenajde nic.

### Offline a izolace (`tests/e2e/offline.spec.ts`)

8. **Připravit offline → vypnout síť → otevřít dosud nenavštívený obsah.** Balíček se připraví a ověří, stav ukáže počet souborů, velikost, verzi i datum. Po `setOffline(true)` a reloadu se otevře **den 3. 10., detail Hang Múa, noční vlak, rejstřík i schematická mapa — nic z toho nebylo předtím navštívené.**
9. **Selhání mapy.** Zablokované dlaždice OSM nezamknou aplikaci; zbytek stránky zůstane proklikatelný.
10. **Izolace úložiště.** Čistý profil nevidí data prvního profilu (žádný předstíraný cloud sync). Cizí `localStorage` klíče (`jina-appka:b0`, `b1`) i cizí cache **přežijí** aktualizaci i přípravu balíčku. Nepřebíráme cizí klíče jako svoje rezervace.
11. **Smazání balíčku** odstraní jen cache s prefixem `vcg-`, cizí nechá být.
12. **Export/import.** Export má správné jméno souboru a verzi schématu. Soubor z jiné aplikace i z novějšího schématu je **odmítnut** s vysvětlením. Platný import se sloučí a původní data zůstanou.

---

## Vizuální kontrola

`node scripts/shots.mjs` projde 13 obrazovek ve třech šířkách (390 / 768 / 1440 px, DPR 2) a hlásí:

- horizontální overflow,
- useknuté texty (`overflow: hidden` s větším `scrollWidth`),
- dotykové cíle menší než 36 × 26 px,
- chyby v konzoli.

**Výsledek: bez nálezů.** Screenshoty jsou v `docs/screenshots/`.

Co se během iterací opravilo:

- Plán měl na mobilu **24 950 px** výšky (18 dnů × všechny kroky). Přepracováno na vybraný den v plné podobě + kompaktní přehled cesty → **3 300 px**.
- Krok itineráře měl dva samostatné sloupce (číslo + ikona) a bral 80 px šířky. Sloučeno do ikony s číselným odznakem.
- Ikony Plán a Moje cesta se nevykreslovaly správně (`v0` místo `h.01`).
- Grafika Sa Py měla čáry teras mimo tvar kopce.
- Schematická mapa slévala popisky (Hanoj 3× na stejném bodě, celý loop v jednom shluku). Rozdělené na hlavní trasu a samostatné schéma okruhu, s řízenou polohou popisků.
- Inline odkazy na zdroje měly 21 px. Dostaly rozšířenou dotykovou plochu přes `::after` na 44 px, aniž by se rozbila sazba.
- Na 1440 px se zkracovaly texty, i když bylo místo.
- Desetinné tečky místo čárek u hodin, kurzů a velikostí.

---

## Co se netestovalo

- **WebKit / Safari.** V prostředí je nainstalovaný jen Chromium (`/opt/pw-browsers`), WebKit není k dispozici. Aplikace je na iOS Safari cílená (`apple-touch-icon`, `viewport-fit=cover`, `env(safe-area-inset-bottom)`, návod na „Přidat na plochu" místo nefunkčního instalačního tlačítka), ale **na WebKitu odzkoušená není**.
- **Fyzický iPhone.** Simulovaný mobilní viewport není test na skutečném zařízení.
- **Skutečné nasazení.** GitHub Pages pro tenhle repozitář nebylo v době psaní zapnuté, takže veřejná URL ověřená není. Workflow je připravené a kontroluje base path, manifest i to, že se do `dist` nedostalo zadání ani interní poznámky.
- **Lighthouse.** Neproběhl. Je to doplněk, ne náhrada ručních offline scénářů, které proběhly.

---

## Poznámka k metodě ověřování obsahu

Data vznikla v prostředí, kde byl web dostupný **jen přes vyhledávání** — jednotlivé stránky nešlo otevřít (`WebFetch` i přímý `curl` blokuje egress proxy). Údaje pocházejí z výsledků vyhledávání nad uvedenými URL, ne z otevřené stránky.

Důsledek: **žádná cena nemá stupeň `verified`**, a datový test to vynucuje. U každé ceny je klikací odkaz, aby to šlo před cestou potvrdit. V aplikaci je to vysvětlené v kartě „Jak jsme tohle ověřovali".
