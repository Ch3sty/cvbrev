/**
 * Navigering in i Rekryteringstester: hård laddning och klientnavigering.
 *
 *   npx tsx scripts/perf-navigering-tester.ts --port 5264 --korningar 5 --json ut.json
 *
 * Samma konto och samma emulering som perf-inloggat.ts (kontot med mest
 * data, Pixel 7, 3x CPU-strypning, LTE). För varje mål:
 *
 *   hard   LCP vid en hård laddning (goto), som perf-inloggat.
 *   klient tiden från router.push i en annan dörr (CV-rummet, /dashboard/profil/cv)
 *          tills målets innehåll står: rätt adress, en rubrik i main och
 *          inget laddskelett kvar (aria-busy eller .loading-thread).
 *
 * Kräver ett produktionsbygge som kör på porten. Skriver inget i databasen.
 */
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { laddaEnv } from './_env'

laddaEnv()

const arg = (n: string, f: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const bas = `http://localhost:${arg('port', '5264')}`
const KORNINGAR = Number(arg('korningar', '5'))
const START = '/dashboard/profil/cv'
const MAL: { url: string; klar: string }[] = [
  { url: '/dashboard/tester', klar: 'main h1' },
  { url: '/dashboard/tester/alla', klar: '[data-testkort="logik"]' },
]
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))!

async function konto() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  // Samma val som perf-inloggat.ts: kontot som äger flest rader.
  const [{ data: a }, { data: s }, { data: b }] = await Promise.all([
    sb.from('job_applications').select('user_id').limit(4000),
    sb.from('logic_test_v4_sessions').select('user_id').limit(4000),
    sb.from('letters').select('user_id').limit(4000),
  ])
  const p = new Map<string, number>()
  const r = (rader: { user_id: string | null }[] | null, v: number) => rader?.forEach((x) => x.user_id && p.set(x.user_id, (p.get(x.user_id) ?? 0) + v))
  r(a, 3)
  r(s, 3)
  r(b, 1)
  for (const [id] of [...p.entries()].sort((x, y) => y[1] - x[1]).slice(0, 10)) {
    const { data } = await sb.auth.admin.getUserById(id)
    if (!data?.user?.email) continue
    const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: data.user.email })
    const { data: sess } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties.hashed_token })
    const ss = sess!.session!
    return 'base64-' + Buffer.from(JSON.stringify({ access_token: ss.access_token, refresh_token: ss.refresh_token, expires_at: ss.expires_at, expires_in: ss.expires_in, token_type: 'bearer', user: ss.user })).toString('base64')
  }
  throw new Error('inget konto')
}

async function nySida(browser: Browser, payload: string): Promise<Page> {
  const page = await browser.newPage()
  await page.emulate({
    viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
  })
  const cdp = await page.createCDPSession()
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 3 })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 70, downloadThroughput: (12 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 })
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  for (let i = 0, n = 0; i < payload.length; i += 3200, n++) await page.setCookie({ name: `sb-${ref}-auth-token.${n}`, value: payload.slice(i, i + 3200), url: bas, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: bas, path: '/' })
  await page.evaluateOnNewDocument(() => {
    ;(window as any).__lcp = 0
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) (window as any).__lcp = e.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  return page
}

const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

async function main() {
  const payload = await konto()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ut: Record<string, { hard: number[]; klient: number[] }> = {}
  try {
    for (const m of MAL) {
      ut[m.url] = { hard: [], klient: [] }
      for (let k = 0; k < KORNINGAR; k++) {
        // Hård laddning.
        let page = await nySida(browser, payload)
        await page.goto(bas + m.url, { waitUntil: 'networkidle0', timeout: 90000, referer: `${bas}/dashboard/profil` })
        await new Promise((r) => setTimeout(r, 1500))
        ut[m.url].hard.push(Math.round(await page.evaluate(() => (window as any).__lcp as number)))
        await page.close()

        // Klientnavigering från CV-rummet.
        page = await nySida(browser, payload)
        await page.goto(bas + START, { waitUntil: 'networkidle0', timeout: 90000, referer: `${bas}/dashboard/profil` })
        await new Promise((r) => setTimeout(r, 1500))
        const ms = await page.evaluate(
          async (url, klar) => {
            const t0 = performance.now()
            ;(window as any).next.router.push(url)
            return await new Promise<number>((res, rej) => {
              const slut = Date.now() + 30000
              const koll = () => {
                const pa = location.pathname === url
                const main = document.querySelector('main')
                const busy = main?.querySelector('[aria-busy="true"], .loading-thread')
                if (pa && document.querySelector(klar) && !busy) return res(performance.now() - t0)
                if (Date.now() > slut) return rej(new Error('timeout ' + url))
                requestAnimationFrame(koll)
              }
              koll()
            })
          },
          m.url,
          m.klar
        )
        ut[m.url].klient.push(Math.round(ms))
        await page.close()
        console.log(m.url, 'körning', k + 1, 'hård', ut[m.url].hard.at(-1), 'klient', ut[m.url].klient.at(-1))
      }
    }
  } finally {
    await browser.close()
  }
  const sammandrag = Object.fromEntries(
    Object.entries(ut).map(([u, v]) => [u, { hardLcpMedian: median(v.hard), klientMedian: median(v.klient), ...v }])
  )
  console.log(JSON.stringify(sammandrag, null, 2))
  const json = arg('json', '')
  if (json) fs.writeFileSync(json, JSON.stringify(sammandrag, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
