import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Scénáře 5–10 ze zadání §14: offline balíček, izolace úložiště a aktualizace.
 * Běží jen v mobilním projektu — service worker se testuje jednou, ne dvakrát.
 */
test.describe.configure({ mode: 'serial' })
test.skip(({ browserName }) => browserName !== 'chromium', 'service worker se testuje jen v Chromiu')

async function waitForSw(page: Page): Promise<void> {
  await page.waitForFunction(
    async () => {
      const reg = await navigator.serviceWorker.getRegistration()
      return Boolean(reg?.active)
    },
    undefined,
    { timeout: 25_000 },
  )
}

test('5 + 6 — připravit offline, vypnout síť a otevřít dosud nenavštívený obsah', async ({ page, context }) => {
  await page.goto('#/trip?sekce=offline')
  await waitForSw(page)

  await page.getByRole('button', { name: 'Připravit cestu offline' }).click()
  await expect(page.getByText('Uloženo a ověřeno')).toBeVisible({ timeout: 25_000 })
  await expect(page.locator('.offstatus__badge--ok')).toContainText('Připraveno offline')

  // Stav ukazuje velikost, verzi i datum
  const grid = page.locator('.offstatus__grid')
  await expect(grid).toContainText('Uložených souborů')
  await expect(grid).toContainText('Verze obsahu')
  await expect(grid).not.toContainText('nikdy')

  // --- vypnout síť ---
  await context.setOffline(true)

  // reload z cache
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.offline-bar')).toBeVisible()

  // Den, který jsme v této relaci NIKDY neotevřeli
  await page.goto('#/day/2026-10-03')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Lan Hạ Bay')

  // Detail místa, dopravy a rejstřík offline
  await page.goto('#/place/place-hang-mua')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hang Múa')
  await expect(page.locator('.price__value').first()).toContainText('VND')

  await page.goto('#/transport/leg-laocai-hanoi-train')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Lào Cai → Hanoj')
  await expect(page.locator('.optcard--main .chip--jade')).toHaveText('doporučeno')

  await page.goto('#/guide')
  await page.getByLabel('Hledat v rejstříku').fill('ma pi leng')
  await expect(page.locator('.idxlist')).toContainText('Mã Pí Lèng')

  // Schematická mapa funguje offline
  await page.goto('#/map')
  await expect(page.locator('.smap__svg').first()).toBeVisible()
  await expect(page.locator('.smap__node').first()).toBeVisible()

  await context.setOffline(false)
})

test('9 — chyba mapy nebo obrázku nezamkne aplikaci', async ({ page, context }) => {
  // Zablokuj dlaždice a CDN — podrobná mapa musí selhat elegantně.
  await context.route('**/tile.openstreetmap.org/**', (r) => r.abort())
  await page.goto('#/map')
  await page.getByRole('button', { name: /Podrobná/ }).click()

  // Zbytek stránky zůstane použitelný
  await expect(page.getByRole('heading', { name: 'Přesuny v pořadí' })).toBeVisible()
  await page.getByRole('link', { name: /Hà Giang.*Sa Pa/ }).first().click()
  await expect(page).toHaveURL(/#\/(transport|item)\//)
})

test('7 + 10 — čistý profil nepředstírá cloud sync a cizí data zůstanou', async ({ browser }) => {
  // --- profil A: něco si uloží ---
  const ctxA = await browser.newContext()
  const a = await ctxA.newPage()
  await a.goto('#/place/place-lan-ha-bay')
  await a.getByRole('button', { name: /Uložit/ }).click()
  await a.goto('#/trip?sekce=moje')
  await expect(a.getByText('Lan Hạ Bay')).toBeVisible()

  // --- profil B: cizí aplikace na stejném originu + čistý stav ---
  const ctxB = await browser.newContext()
  const b = await ctxB.newPage()
  await b.goto('#/plan')
  await b.evaluate(async () => {
    // Simulace cizího projektu na stejné doméně (GitHub Pages sdílí origin).
    localStorage.setItem('jina-appka:b0', 'true')
    localStorage.setItem('b1', 'checked')
    const c = await caches.open('jina-appka-v1')
    await c.put('/cizi-soubor', new Response('cizí obsah'))
  })

  await b.goto('#/trip?sekce=moje')
  await expect(b.getByText('Zatím nic uloženého')).toBeVisible()
  await expect(b.getByText('Lan Hạ Bay')).toHaveCount(0)

  // Naše aplikace se aktualizuje a připraví offline...
  await b.goto('#/trip?sekce=offline')
  await waitForSw(b)
  await b.getByRole('button', { name: 'Připravit cestu offline' }).click()
  await expect(b.getByText('Uloženo a ověřeno')).toBeVisible({ timeout: 25_000 })

  // ...a cizí data musí zůstat nedotčená
  const survived = await b.evaluate(async () => ({
    ls0: localStorage.getItem('jina-appka:b0'),
    ls1: localStorage.getItem('b1'),
    cache: (await caches.keys()).includes('jina-appka-v1'),
    cizi: Boolean(await (await caches.open('jina-appka-v1')).match('/cizi-soubor')),
  }))
  expect(survived).toEqual({ ls0: 'true', ls1: 'checked', cache: true, cizi: true })

  // A nepřebíráme cizí klíče jako svoje rezervace
  await b.goto('#/trip?sekce=rezervace')
  const todo = await b.locator('.tally__cell--todo .tally__num').textContent()
  expect(Number(todo)).toBeGreaterThan(0)

  await ctxA.close()
  await ctxB.close()
})

test('smazání našeho balíčku nesmí sáhnout na cizí cache', async ({ page }) => {
  await page.goto('#/trip?sekce=offline')
  await waitForSw(page)
  await page.evaluate(async () => {
    const c = await caches.open('jina-appka-v2')
    await c.put('/x', new Response('x'))
  })
  await page.getByRole('button', { name: 'Smazat offline balíček' }).click()
  await page.waitForTimeout(700)
  const keys = await page.evaluate(() => caches.keys())
  expect(keys).toContain('jina-appka-v2')
  expect(keys.filter((k) => k.startsWith('vcg-'))).toHaveLength(0)
})

test('export a import lokálních dat s validací verze', async ({ page }) => {
  await page.goto('#/service/svc-little-sapa')
  await page.getByRole('button', { name: /Uložit/ }).click()
  await page.goto('#/trip?sekce=moje')

  // Export stáhne soubor s naším jménem a verzí schématu
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Stáhnout moje data' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^vietnam-moje-data-\d{4}-\d{2}-\d{2}\.json$/)

  // Import souboru z jiné aplikace musí být odmítnut
  await page.setInputFiles('input[type="file"]', {
    name: 'cizi.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'jina-appka', schemaVersion: 1, state: {} })),
  })
  await expect(page.getByText('Import neproběhl')).toBeVisible()
  await expect(page.getByText(/jiné aplikaci/)).toBeVisible()

  // Import z novější verze schématu taky
  await page.setInputFiles('input[type="file"]', {
    name: 'novy.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'vietnam-complete-guide', schemaVersion: 99, state: {} })),
  })
  await expect(page.getByText(/novější verze/)).toBeVisible()

  // Platný import projde a sloučí se
  await page.setInputFiles('input[type="file"]', {
    name: 'ok.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      app: 'vietnam-complete-guide',
      schemaVersion: 1,
      state: { schemaVersion: 1, favourites: ['place-ta-van'], notes: {}, picks: {}, bookings: {}, updatedAt: '' },
    })),
  })
  await expect(page.getByText('Import proběhl')).toBeVisible()
  await expect(page.getByText('Tả Van')).toBeVisible()
  // Původní uložená položka zůstala
  await expect(page.getByText('Little Sapa (Cơm Phở Bình Dân)')).toBeVisible()
})
