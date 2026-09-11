/**
 * Vygeneruje PNG ikony ze zdrojových SVG pomocí předinstalovaného Chromia.
 * Zdroj i výstup jsou v repu — žádná externí služba a žádná binární závislost navíc.
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const targets = [
  { svg: 'public/icons/favicon.svg', out: 'public/icons/icon-192.png', size: 192 },
  { svg: 'public/icons/favicon.svg', out: 'public/icons/icon-512.png', size: 512 },
  { svg: 'public/icons/favicon.svg', out: 'public/icons/apple-touch-icon.png', size: 180 },
  { svg: 'public/icons/maskable.svg', out: 'public/icons/maskable-192.png', size: 192 },
  { svg: 'public/icons/maskable.svg', out: 'public/icons/maskable-512.png', size: 512 },
]

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' })
for (const t of targets) {
  const svg = readFileSync(resolve(root, t.svg), 'utf8')
  const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 })
  await page.setContent(
    `<html><body style="margin:0;width:${t.size}px;height:${t.size}px">${svg.replace('<svg', `<svg width="${t.size}" height="${t.size}"`)}</body></html>`,
  )
  const buf = await page.screenshot({ omitBackground: false })
  writeFileSync(resolve(root, t.out), buf)
  await page.close()
  console.log(`✓ ${t.out} (${t.size}px)`)
}
await browser.close()
