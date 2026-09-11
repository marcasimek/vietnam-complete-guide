import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

/**
 * Vývojové prostředí, ve kterém projekt vznikal, má Chromium předinstalované
 * na pevné cestě. Na GitHub runneru tam ale nic není — Playwright si stahuje
 * vlastní. Proto cestu nastavujeme jen tehdy, když opravdu existuje.
 */
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium'
const chromiumPath =
  process.env.CHROMIUM_PATH ?? (existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined)
const launchOptions = chromiumPath ? { executablePath: chromiumPath } : {}

const PORT = 4173
const BASE = `http://localhost:${PORT}/vietnam-complete-guide/`

/**
 * E2E běží proti PRODUKČNÍMU buildu, ne dev serveru — jinak by se netestoval
 * service worker ani skutečný base path.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        launchOptions,
      },
    },
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions,
      },
    },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
