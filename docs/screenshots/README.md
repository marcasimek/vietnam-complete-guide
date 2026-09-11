# Screenshoty

Generuje `node scripts/shots.mjs` proti produkčnímu buildu na `vite preview`.

Pojmenování: `<obrazovka>-<šířka>.jpg` — šířky 390, 768 a 1440 px.
Dlouhé stránky jsou oříznuté na 4 200 px; jde o vizuální kontrolu, ne archiv.

Skript zároveň hlásí horizontální overflow, useknuté texty, malé dotykové cíle a chyby v konzoli.
Poslední průchod: **bez nálezů**. Viz `docs/TEST-REPORT.md`.

Volitelně: `DPR=2 node scripts/shots.mjs` pro retina rozlišení (soubory jsou pak čtyřikrát větší).
