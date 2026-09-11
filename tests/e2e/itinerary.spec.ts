import { expect, test } from '@playwright/test'

/**
 * Scénáře 1–4 ze zadání §14: mobilní průchod referenčním dnem a osobní stav.
 */

test('1 — přehled → 26. 9. → transfer → varianty → nástup → navigace', async ({ page }) => {
  await page.goto('#/plan')
  await expect(page.getByRole('heading', { name: 'Sever Vietnamu' })).toBeVisible()

  // Výběr dne v pásu
  await page.getByRole('tab', { name: /26\. 9\./ }).click()
  await expect(page.locator('.daycard--focus .daycard__title')).toHaveText('Hà Giang → Sa Pa')

  // Klik na řádek transferu
  await page.getByRole('link', { name: /Ranní přímý transfer do Sa Pa/ }).click()
  await expect(page).toHaveURL(/#\/item\/item-20260926-transfer/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ranní přímý transfer')

  // Dál na dopravní varianty
  await page.getByRole('link', { name: /Otevřít dopravní varianty|Hà Giang → Sa Pa/ }).first().click()
  await expect(page).toHaveURL(/#\/transport\/leg-hagiang-sapa/)

  // Doporučená varianta s cenou, jednotkou a stupněm jistoty
  await expect(page.getByText('doporučeno')).toBeVisible()
  await expect(page.locator('.price__value').filter({ hasText: /270\s?000\s*–\s*500\s?000 VND/ })).toBeVisible()
  await expect(page.getByText('za osobu').first()).toBeVisible()
  await expect(page.getByText('zveřejněný ceník').first()).toBeVisible()

  // Nástup a výstup
  await expect(page.getByText('Nástup', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Výstup', { exact: true }).first()).toBeVisible()

  // Rezervační odkaz vede ven a otevírá se v novém panelu
  const booking = page.getByRole('link', { name: /Porovnat a rezervovat/ })
  await expect(booking).toHaveAttribute('target', '_blank')
  await expect(booking).toHaveAttribute('rel', /noopener/)
})

test('2 — zpět → check-in a oběd → hotely → skutečná jídelna → mapa', async ({ page }) => {
  await page.goto('#/item/item-20260926-checkin-lunch')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Check-in a oběd')

  // Dva propojené výběry
  await expect(page.getByRole('link', { name: /Kde v Sa Pě spíme/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Oběd po příjezdu/ })).toBeVisible()

  await page.getByRole('link', { name: /Kde v Sa Pě spíme/ }).click()
  await expect(page).toHaveURL(/#\/choice\/choice-sapa-stay/)
  // Cena za DVOULŮŽKOVÝ pokoj a noc
  await expect(page.getByText('za pokoj / noc').first()).toBeVisible()
  await expect(page.getByText(/pro 2 osoby/).first()).toBeVisible()

  await page.goBack()
  await page.getByRole('link', { name: /Oběd po příjezdu/ }).click()
  await expect(page).toHaveURL(/#\/choice\/choice-sapa-arrival-lunch/)

  // Konkrétní jídelna s adresou a s tím, co si objednat
  await expect(page.getByRole('heading', { name: /Little Sapa/ })).toBeVisible()
  await expect(page.getByText('Co si objednat').first()).toBeVisible()
  await expect(page.getByText(/5 Đồng Lợi/)).toBeVisible()

  // Mapa vede na vyhledání, ne na falešně přesný bod
  const mapLink = page.getByRole('link', { name: 'Mapa' }).first()
  const href = await mapLink.getAttribute('href')
  expect(href).toContain('google.com/maps/search')
  expect(href).toContain('Little%20Sapa')
})

test('3 — coaster: identita, cena, provoz, zdroje a večerní varianty', async ({ page }) => {
  await page.goto('#/item/item-20260926-coaster')
  const body = page.locator('.page')

  // Identita je vyřešená, ne zamlčená
  await expect(body).toContainText('kolejnici')
  await expect(body).toContainText('bezkolejové')
  await expect(body).toContainText('CoasterKart')

  // Podmínka a zdroje
  await expect(page.getByText('Platí jen za podmínky')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Zdroje' })).toBeVisible()

  // Detail místa má cenu a provozní dobu
  await page.getByRole('link', { name: /Alpine Coaster Sa Pa/ }).click()
  await expect(page).toHaveURL(/#\/place\/place-alpine-coaster-sapa/)
  await expect(page.locator('.price__value').filter({ hasText: /250\s?000 VND/ })).toBeVisible()
  await expect(page.locator('.opening__text')).toHaveText('Denně 9:00–18:00')

  // Večerní varianty jsou „nebo", ne seznam povinností
  await page.goto('#/choice/choice-sapa-evening')
  await expect(page.locator('.detail-head__eyebrow .chip--accent')).toHaveText('Podle nálady')
  await expect(page.locator('.callout--info')).toContainText('ne seznam úkolů')
})

test('4 — oblíbené, rezervace a poznámka přežijí reload', async ({ page }) => {
  await page.goto('#/place/place-alpine-coaster-sapa')
  await page.getByRole('button', { name: /Uložit/ }).click()

  await page.getByRole('button', { name: 'Přidat poznámku' }).click()
  await page.locator('.note__input').fill('Zeptat se na počasí den předem.')

  await page.goto('#/trip?sekce=rezervace')
  await page.locator('.bkitem').first().getByRole('button', { name: 'Rezervováno' }).click()

  await page.reload()
  await expect(page.locator('.bkitem').first().getByRole('button', { name: 'Rezervováno' })).toHaveAttribute('aria-pressed', 'true')

  await page.goto('#/trip?sekce=moje')
  await expect(page.getByText('Alpine Coaster Sa Pa (Mong Village)')).toBeVisible()
  await expect(page.getByText('Zeptat se na počasí den předem.')).toBeVisible()
})

test('deep link a tlačítko zpět obnoví správný kontext', async ({ page }) => {
  // Přímý vstup na detail (jako by přišel sdílený odkaz)
  await page.goto('#/service/svc-little-sapa')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Little Sapa')

  await page.goto('#/day/2026-09-26')
  await page.getByRole('link', { name: /Alpine Coaster \/ downhill autíčka/ }).click()
  await expect(page).toHaveURL(/#\/item\/item-20260926-coaster/)
  await page.goBack()
  await expect(page).toHaveURL(/#\/day\/2026-09-26/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hà Giang → Sa Pa')
})

test('neznámé ID ukáže užitečný fallback, ne prázdnou obrazovku', async ({ page }) => {
  await page.goto('#/place/tohle-neexistuje')
  await expect(page.getByText('Tohle místo neznáme')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Otevřít rejstřík' })).toBeVisible()

  await page.goto('#/day/2030-01-01')
  await expect(page.getByText('Takový den v plánu nemáme')).toBeVisible()

  await page.goto('#/uplne-jina-adresa')
  await expect(page.getByText('Tahle adresa v aplikaci není')).toBeVisible()
})

test('hledání funguje bez diakritiky, česky i místním zápisem', async ({ page }) => {
  await page.goto('#/guide')
  const input = page.getByLabel('Hledat v rejstříku')

  for (const [query, expected] of [
    ['ha giang', 'Hà Giang'],
    ['hanoi', 'Hanoj'],
    ['ta van', 'Tả Van'],
    ['dong van', 'Đồng Văn'],
    ['pho', 'Phở'],
  ] as const) {
    await input.fill(query)
    await expect(page.locator('.idxlist')).toContainText(expected, { timeout: 5000 })
  }

  await input.fill('qqxyzzy')
  await expect(page.getByText('Nic takového v rejstříku není')).toBeVisible()
})
