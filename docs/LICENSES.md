# Licence a původ obsahu

## Písma

Obě písma jsou **samohostovaná** v repozitáři (přes balíčky `@fontsource`), takže aplikace nedělá žádný požadavek na cizí server a funguje offline.

| Písmo | Použití | Licence | Autor / zdroj |
|---|---|---|---|
| Bricolage Grotesque Variable | nadpisy, čísla, tlačítka | SIL Open Font License 1.1 | Mathieu Triay — `@fontsource-variable/bricolage-grotesque` |
| Be Vietnam Pro (400/500/600/700) | běžný text | SIL Open Font License 1.1 | Lam Bao — `@fontsource/be-vietnam-pro` |

Plné znění licencí je v `node_modules/@fontsource*/…/LICENSE`.

Be Vietnam Pro je navržené pro vietnamštinu — proto tu je. Obě písma mají subsety `latin`, `latin-ext` (čeština) i `vietnamese`, takže „Mường Hoa" i „Đồng Văn" se vykreslí správně a nepadá to na náhradní písmo.

`src/styles/fonts.css` píše `@font-face` ručně a odkazuje jen na `.woff2`. Hotové CSS z `@fontsource` dodává i staré `.woff` soubory, které by se zbytečně tahaly do offline balíčku.

## Grafika

**V aplikaci nejsou žádné fotografie.** Bylo to vědomé rozhodnutí:

- fotky konkrétních hotelů a vyhlídek by vyžadovaly licenční evidenci a souhlas,
- do offline balíčku by přidaly megabajty,
- a zadání výslovně zakazuje vydávat dekorativní ilustraci za dokumentární snímek konkrétního objektu.

Místo toho:

| Prvek | Co to je | Licence |
|---|---|---|
| `src/components/RegionArt.tsx` | stylizované SVG scenérie oblastí (město, krasové věže, terasy, záliv, koleje) | vlastní tvorba pro tenhle projekt |
| `src/components/Icon.tsx` | sada ikon na mřížce 24 px, tah 1,7, zaoblené konce | vlastní tvorba pro tenhle projekt |
| `public/icons/favicon.svg`, `maskable.svg` | ikona aplikace | vlastní tvorba pro tenhle projekt |
| `public/icons/*.png` | vygenerované z výše uvedených SVG skriptem `scripts/make-icons.mjs` | tamtéž |

Ilustrace jsou záměrně stylizované, aby si je nikdo nespletl s fotografií konkrétního místa.

## Mapy

| Vrstva | Zdroj | Podmínky |
|---|---|---|
| Schematická mapa (výchozí, offline) | vlastní SVG, souřadnice z veřejných zdrojů | vlastní tvorba |
| Podrobná mapa (volitelná, online) | dlaždice OpenStreetMap přes Leaflet | © přispěvatelé OpenStreetMap, [ODbL](https://www.openstreetmap.org/copyright) |

Atribuce je v mapě vždy viditelná.

**Dlaždice se záměrně nestahují dopředu.** [Podmínky provozu standardních dlaždic OSM](https://operations.osmfoundation.org/policies/tiles/) zakazují hromadné stahování a offline funkce. Proto je offline mapa naše vlastní schematická a podrobná mapa je označená jako „potřebuje síť".

Externí navigace se generuje přes [dokumentované Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) a Apple Maps. Když nemáme ověřený pin, otevře se **vyhledání názvu**, ne falešně přesné souřadnice.

## Knihovny

| Knihovna | Licence |
|---|---|
| React, React DOM | MIT |
| React Router | MIT |
| Vite, `@vitejs/plugin-react` | MIT |
| Leaflet | BSD-2-Clause |
| `vite-plugin-pwa`, Workbox | MIT |
| Vitest, Zod, Playwright | MIT / Apache-2.0 |

Leaflet se načítá **dynamickým importem** — do app shellu se nepřipojuje a stahuje se teprve, když si někdo vyžádá podrobnou mapu.

## Cestovní informace

Zdroje jsou vedené strukturovaně v `src/data/sources.ts` — každý má URL, vydavatele, typ, **datum kontroly** a seznam toho, co konkrétně podpírá. V aplikaci jsou vidět přímo u ceny, provozní doby nebo dopravní informace, ne jen v souhrnném seznamu na konci.

Citované texty nejsou kopírované — jsou to vlastní formulace shrnující zjištěné údaje. Ceny, adresy a otevírací doby jsou faktické údaje, u kterých je vždy uvedený zdroj a datum.

**Omezení metody:** viz README, sekce „Důvěryhodnost údajů". Stránky nešlo v době sběru otevřít přímo, jen prohledat. Proto nemá žádná cena stupeň `verified`.
