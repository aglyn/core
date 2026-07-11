/**
 * @license
 * Copyright 2026 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Captures the docs-site console screenshots (1440×900 viewport PNGs
// under apps/docs/static/img/…) against the seeded local emulator stack
// — same prerequisites as tools/e2e/console.e2e.mjs (see
// docs/E2E_LOCAL.md):
//
//   1. npx -y firebase-tools@13 emulators:start --config firebase.e2e.json …
//   2. npm run seed:e2e
//   3. dev server with the emulator flags
//   4. E2E_BASE_URL=http://localhost:4210 node tools/e2e/capture-docs-screenshots.mjs
//
// Each shot waits for seeded content, strips the emulator warning
// banner and the Next dev indicator, and lets images/fonts settle.

import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const IMG_ROOT = join(repoRoot, 'apps/docs/static/img')

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4200'
const HOST_ID = process.env.E2E_HOST ?? 'demo'
const EMAIL = process.env.E2E_EMAIL ?? 'e2e@aglyn.test'
const PASSWORD = process.env.E2E_PASSWORD ?? 'E2e-Password-1'
const TIMEOUT_MS = Number(process.env.E2E_TIMEOUT_MS ?? 60_000)

/** path → output file (under static/img) + the text to wait for. */
const shots = [
  {
    out: 'getting-started/console-dashboard.png',
    path: `/${HOST_ID}`,
    waitFor: 'Demo Bakery',
  },
  {
    out: 'datasets/data-page.png',
    path: `/${HOST_ID}/data`,
    waitFor: 'Avery Quinn',
  },
  {
    out: 'media/media-page.png',
    path: `/${HOST_ID}/media`,
    waitFor: 'hero.jpg',
    // Let the thumbnail images finish loading.
    settleMs: 4000,
  },
  {
    out: 'content/content-page.png',
    path: `/${HOST_ID}/content`,
    waitFor: 'Blog',
  },
  {
    out: 'bookings/bookings-page.png',
    path: `/${HOST_ID}/bookings`,
    waitFor: 'Grace Hopper',
  },
  {
    out: 'contacts/contacts-page.png',
    path: `/${HOST_ID}/contacts`,
    waitFor: 'wholesale@example.com',
  },
  {
    out: 'marketing-overlays/marketing-page.png',
    path: `/${HOST_ID}/marketing`,
    waitFor: 'Welcome bar',
  },
  {
    out: 'workflows-and-actions/workflows-page.png',
    path: `/${HOST_ID}/workflows`,
    waitFor: 'DozenQuote',
  },
  {
    out: 'workflows-and-actions/logic-page.png',
    path: `/${HOST_ID}/logic`,
    waitFor: 'Reference health',
  },
  {
    out: 'billing-and-plans/billing-page.png',
    path: '/org/billing',
    waitFor: 'Manage payment methods',
  },
]

const browser = await chromium.launch({
  headless: true,
  ...(process.env.E2E_CHROME_PATH
    ? { executablePath: process.env.E2E_CHROME_PATH }
    : process.platform === 'darwin'
      ? {
          executablePath:
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        }
      : { channel: 'chrome' }),
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})

// Sign in through the real UI once (see console.e2e.mjs for why).
{
  const page = await context.newPage()
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'domcontentloaded' })
  await page.fill('input[type="email"], input[name="email"]', EMAIL)
  await page.fill('input[type="password"], input[name="password"]', PASSWORD)
  await page.click('button[type="submit"], button:has-text("Next")')
  await page.waitForURL((url) => !url.pathname.startsWith('/signin'), {
    timeout: TIMEOUT_MS,
  })
  await page.close()
}

// Pre-warm the routes so dev-server compiles don't distort waits.
for (const shot of shots) {
  await fetch(`${BASE_URL}${shot.path}`).catch(() => undefined)
}

let failures = 0
for (const shot of shots) {
  const page = await context.newPage()
  try {
    await page.goto(`${BASE_URL}${shot.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT_MS,
    })
    await page.waitForSelector(`text=${shot.waitFor}`, { timeout: TIMEOUT_MS })
    // Not for docs: the auth-emulator warning banner and Next's dev
    // indicator/error badge.
    await page.evaluate(() => {
      for (const selector of [
        '.firebase-emulator-warning',
        'nextjs-portal',
        '#__next-build-watcher',
        '[data-nextjs-toast]',
      ]) {
        document.querySelectorAll(selector).forEach((el) => el.remove())
      }
    })
    await page.waitForTimeout(shot.settleMs ?? 1500)
    const outPath = join(IMG_ROOT, shot.out)
    mkdirSync(dirname(outPath), { recursive: true })
    await page.screenshot({ path: outPath })
    console.log(`SHOT  ${shot.out}`)
  } catch (error) {
    failures += 1
    console.error(`FAIL  ${shot.out}: ${String(error?.message ?? error).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

await browser.close()
console.log(failures ? `\n${failures} shots failed` : `\nAll ${shots.length} shots captured`)
process.exit(failures ? 1 : 0)
