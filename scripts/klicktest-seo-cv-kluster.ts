/**
 * Klicktestet för SEO-svepet i CV-klustret 2026-11-17
 * (docs/plan-seo-cv-kluster-2026-11-17.md, avsnitt 4.6): riktig Chrome,
 * Pixel 7 och dator, som ny besökare (egen webbläsarkontext utan cookies
 * utom samtycket). Skärmdump per steg i --ut (utanför git).
 *
 *   npx tsx scripts/klicktest-seo-cv-kluster.ts --bas http://localhost:8300 --ut <mapp>
 *
 * Steg: /verktyg/skapa-cv (inga sju steg, stillbilden till provsidan,
 * Ladda upp ditt CV till /cv-mallar#ladda-upp), de tre stilsidorna
 * (uppladdningsraden före vecket, galleriet bara med egenskapen, en
 * uppladdning som visar arbetsytan med sidans mallar, ett mallkort till
 * /cv-mallar/prova), en pilotsida (mallblocket, miniatyr till provsidan), en
 * publik yrkesmallsida (titel, länken tillbaka) och alla tio 308:or.
 * Varje sida: inga JS-fel, inga 5xx, ingen sidled.
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer, { type Browser, type Page } from 'puppeteer'

const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const BAS = arg('bas', 'http://localhost:8300')!
const UT = path.resolve(arg('ut', 'qa-seo-cv')!)
fs.mkdirSync(UT, { recursive: true })

const VYER = {
  pixel7: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  dator: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
} as const
type Vy = keyof typeof VYER

const STIL = [
  { path: '/cv-mallar/word', antal: 26, egenskap: 'word' },
  { path: '/cv-mallar/foto', antal: 15, egenskap: 'foto' },
  { path: '/cv-mallar/enkla', antal: 17, egenskap: 'en-spalt' },
] as const

const OMDIRIGERINGAR: [string, string][] = [
  ['/artiklar/cv-mall-gratis-guide', '/cv-mallar'],
  ['/artiklar/cv-mall-word-gratis', '/cv-mallar/word'],
  ['/artiklar/cv-mall-pdf-gratis', '/cv-mallar'],
  ['/cv-mall-gratis-guide', '/cv-mallar'],
  ['/cv-mall-word-gratis', '/cv-mallar/word'],
  ['/cv-mallar/saljare', '/cv-exempel/saljare'],
  ['/cv-mallar/butikssaljare', '/cv-exempel/butikssaljare'],
  ['/cv-mallar/barnskotare', '/cv-exempel/barnskotare'],
  ['/cv-mallar/ingenjor', '/cv-exempel/ingenjor'],
  ['/cv-mallar/larare', '/cv-exempel/larare'],
]

const resultat: string[] = []
let fel = 0
function kontroll(ok: boolean, text: string) {
  if (!ok) fel++
  resultat.push(`${ok ? 'ok ' : 'FEL'} ${text}`)
  console.log(`${ok ? 'ok ' : 'FEL'} ${text}`)
}
const vila = (ms: number) => new Promise((r) => setTimeout(r, ms))

let ipNr = 20
const nyIp = () => `10.78.${Math.floor(Date.now() / 1000) % 250}.${ipNr++ % 250}`

async function nySida(browser: Browser, vy: Vy) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const fel_: string[] = []
  page.on('pageerror', (e) => fel_.push('js: ' + String(e).slice(0, 200)))
  page.on('response', (r) => {
    if (r.status() >= 500 && r.url().startsWith(BAS)) fel_.push(`${r.status()} ${r.url().replace(BAS, '')}`)
  })
  await page.setViewport(VYER[vy])
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': nyIp() })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  return { page, ctx, fel: fel_ }
}

async function bild(page: Page, namn: string, full = false) {
  await page.screenshot({ path: path.join(UT, `${namn}.png`) as `${string}.png`, fullPage: full })
}

async function ingenSidled(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
}

/** En CV-PDF att ladda upp: exempel-CV:t utskrivet av Chrome. */
async function testPdf(browser: Browser): Promise<string> {
  const fil = path.join(UT, 'Erik-Lindberg-CV.pdf')
  if (fs.existsSync(fil)) return fil
  const p = await browser.newPage()
  await p.goto(`${BAS}/api/public/exempel/cv?mall=linne`, { waitUntil: 'networkidle0', timeout: 120000 })
  await p.evaluate(() => document.querySelectorAll('script').forEach((s) => s.remove()))
  await p.pdf({ path: fil, format: 'A4', printBackground: true })
  await p.close()
  return fil
}

async function skapaCv(browser: Browser, vy: Vy) {
  const steg = `skapa-cv-${vy}`
  const { page, ctx, fel: f } = await nySida(browser, vy)
  await page.goto(`${BAS}/verktyg/skapa-cv`, { waitUntil: 'networkidle2', timeout: 180000 })
  await bild(page, `${steg}-01-hjalte`)
  const text = await page.evaluate(() => document.body.innerText)
  kontroll(!/sju steg|7 steg|steg 3 av 7/i.test(text), `${steg}: inga sju steg i texten`)
  kontroll(text.includes('Skapa CV, direkt på arket'.toUpperCase()) || /Skapa CV, direkt på arket/i.test(text), `${steg}: eyebrow Skapa CV, direkt på arket`)
  const sek = await page.$('a[href="/cv-mallar#ladda-upp"]')
  kontroll(Boolean(sek), `${steg}: sekundärknappen Ladda upp ditt CV finns`)
  const still = await page.$('#demo a[href="/cv-mallar/prova?mall=linne"]')
  kontroll(Boolean(still), `${steg}: stillbilden av arket länkar till /cv-mallar/prova?mall=linne`)
  if (still) {
    await still.scrollIntoView()
    await vila(600)
    await bild(page, `${steg}-02-stillbild`)
  }
  kontroll((await ingenSidled(page)) <= 0, `${steg}: ingen sidled`)
  await bild(page, `${steg}-03-hela`, true)
  if (sek) {
    await page.evaluate(() => window.scrollTo(0, 0))
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 180000 }), page.click('a[href="/cv-mallar#ladda-upp"]')])
    await vila(1500)
    kontroll(page.url().endsWith('/cv-mallar#ladda-upp'), `${steg}: Ladda upp ditt CV landar på ${page.url().replace(BAS, '')}`)
    await bild(page, `${steg}-04-ladda-upp`)
  }
  kontroll(f.length === 0, `${steg}: inga JS-fel eller 5xx (${f.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function stilsida(browser: Browser, vy: Vy, s: (typeof STIL)[number], ladda: boolean) {
  const namn = s.path.split('/').pop()
  const steg = `stil-${namn}-${vy}`
  const { page, ctx, fel: f } = await nySida(browser, vy)
  await page.goto(`${BAS}${s.path}`, { waitUntil: 'networkidle2', timeout: 180000 })
  await vila(1200)
  await bild(page, `${steg}-01-hjalte`)
  const uppY = await page.evaluate(() => Math.round(document.querySelector('#ladda-upp')?.getBoundingClientRect().top ?? 99999))
  kontroll(uppY < (vy === 'pixel7' ? 900 : 700), `${steg}: uppladdningsraden finns tidigt på sidan (y ${uppY})`)
  const galleri = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('#mallarna a[href^="/cv-mallar/prova?mall="]')].map((a) => new URL(a.getAttribute('href')!, 'http://x').searchParams.get('mall')))],
  )
  kontroll(galleri.length === s.antal, `${steg}: galleriet har ${galleri.length} mallar (väntat ${s.antal})`)
  await page.evaluate(() => document.querySelector('#mallarna')?.scrollIntoView())
  await vila(1500)
  await bild(page, `${steg}-02-galleri`)
  const premium = await page.evaluate(() => document.querySelector('[data-premium-rad]')?.textContent ?? '')
  kontroll(/Premium/.test(premium) && /kr/.test(premium), `${steg}: Premium-raden under galleriet med pris ("${premium.slice(0, 80)}...")`)
  const knappar = await page.evaluate(() =>
    [...document.querySelectorAll('#mallarna a[data-cta-klick]')].map((a) => (a as HTMLElement).innerText.trim()),
  )
  kontroll(knappar.includes('Prova med ditt CV') && knappar.includes('Fyll i gratis'), `${steg}: korten har Fyll i gratis och Prova med ditt CV`)
  kontroll((await ingenSidled(page)) <= 0, `${steg}: ingen sidled`)
  await bild(page, `${steg}-03-hela`, true)

  if (ladda) {
    await page.evaluate(() => window.scrollTo(0, 0))
    const input = await page.$('#ladda-upp input[type=file]')
    kontroll(Boolean(input), `${steg}: uppladdningens filfält finns`)
    if (input) {
      await input.uploadFile(await testPdf(browser))
      const klar = await page
        .waitForFunction(() => /Vi hittade|Visa alla \d+ mallar/.test(document.body.innerText), { timeout: 120000 })
        .then(() => true)
        .catch(() => false)
      await vila(2500)
      await bild(page, `${steg}-04-efter-uppladdning`)
      const visaAlla = await page.evaluate(() => document.body.innerText.match(/Visa alla (\d+) mallar/)?.[1] ?? null)
      kontroll(klar, `${steg}: uppladdningen läste CV:t och visade arbetsytan`)
      if (visaAlla) kontroll(Number(visaAlla) === s.antal, `${steg}: arbetsytan visar sidans ${visaAlla} mallar`)
    }
  }

  // Ett premiumkort till provsidan.
  const href = await page.evaluate(() => {
    const a = [...document.querySelectorAll<HTMLAnchorElement>('#mallarna a[data-cta-klick]')].find((x) => x.innerText.trim() === 'Prova med ditt CV')
    return a?.getAttribute('href') ?? null
  })
  if (href) {
    await page.goto(`${BAS}${href}`, { waitUntil: 'networkidle2', timeout: 180000 })
    await vila(2000)
    const p = await page.evaluate(() => ({ url: location.pathname + location.search, robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '' }))
    kontroll(p.url.startsWith('/cv-mallar/prova?mall='), `${steg}: mallkortet till ${p.url}`)
    kontroll(/noindex/.test(p.robots), `${steg}: provsidan är noindex`)
    await bild(page, `${steg}-05-prova`)
  }
  kontroll(f.length === 0, `${steg}: inga JS-fel eller 5xx (${f.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function pilot(browser: Browser, vy: Vy) {
  const steg = `pilot-saljare-${vy}`
  const { page, ctx, fel: f } = await nySida(browser, vy)
  await page.goto(`${BAS}/cv-exempel/saljare`, { waitUntil: 'networkidle2', timeout: 180000 })
  const titel = await page.title()
  kontroll(titel === 'CV för säljare: exempel och mall att fylla i', `${steg}: titel "${titel}"`)
  await bild(page, `${steg}-01-hjalte`)
  const block = await page.$('#cv-mall')
  kontroll(Boolean(block), `${steg}: mallblocket finns`)
  if (block) {
    await block.scrollIntoView()
    await vila(1500)
    await bild(page, `${steg}-02-mallblock`)
    const info = await page.evaluate(() => {
      const b = document.querySelector('#cv-mall')!
      return {
        h2: b.querySelector('h2')?.textContent ?? '',
        mallar: [...b.querySelectorAll('a.ib-pilot-mall')].map((a) => a.getAttribute('href')),
        h3: [...b.querySelectorAll('h3')].map((h) => h.textContent),
        korslank: Boolean(document.querySelector('a[href="/cv-mallar/saljare"]')),
      }
    })
    kontroll(info.h2 === 'CV-mall för säljare: välj och fyll i', `${steg}: H2 "${info.h2}"`)
    kontroll(info.mallar.length === 3 && new Set(info.mallar).size === 3, `${steg}: tre olika miniatyrer (${info.mallar.join(', ')})`)
    kontroll(info.mallar.every((h) => /^\/cv-mallar\/prova\?mall=[a-z]+&yrke=saljare$/.test(h ?? '')), `${steg}: miniatyrerna har mall och yrke i adressen`)
    kontroll(!info.korslank, `${steg}: ingen länk kvar till /cv-mallar/saljare`)
    kontroll(info.h3.length >= 2, `${steg}: H3 i mallblocket (${info.h3.join(' | ')})`)
    const forsta = info.mallar[0]
    if (forsta) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 180000 }), page.click(`a.ib-pilot-mall[href="${forsta}"]`)])
      await vila(2000)
      kontroll(page.url().includes('/cv-mallar/prova?mall='), `${steg}: miniatyren till ${page.url().replace(BAS, '')}`)
      await bild(page, `${steg}-03-prova`)
    }
  }
  kontroll((await ingenSidled(page)) <= 0, `${steg}: ingen sidled`)
  kontroll(f.length === 0, `${steg}: inga JS-fel eller 5xx (${f.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function yrkesmall(browser: Browser, vy: Vy) {
  const steg = `yrkesmall-underskoterska-${vy}`
  const { page, ctx, fel: f } = await nySida(browser, vy)
  await page.goto(`${BAS}/cv-mallar/underskoterska`, { waitUntil: 'networkidle2', timeout: 180000 })
  await vila(1500)
  const titel = await page.title()
  kontroll(titel.startsWith('CV-mall för undersköterska') && titel.length <= 60 && !/[\u2013\u2014]|2026/.test(titel), `${steg}: titel "${titel}"`)
  const tillbaka = await page.evaluate(() => [...document.querySelectorAll('a[href="/cv-exempel/underskoterska"]')].map((a) => (a as HTMLElement).innerText.trim()))
  kontroll(tillbaka.includes('Se ett färdigt CV-exempel för undersköterska'), `${steg}: länken tillbaka till exemplet (${tillbaka.join(' | ')})`)
  await bild(page, `${steg}-01-hjalte`)
  kontroll((await ingenSidled(page)) <= 0, `${steg}: ingen sidled`)
  kontroll(f.length === 0, `${steg}: inga JS-fel eller 5xx (${f.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function omdirigeringar(browser: Browser, vy: Vy) {
  for (const [fran, till] of OMDIRIGERINGAR) {
    const svar = await fetch(BAS + fran, { redirect: 'manual' })
    const plats = (svar.headers.get('location') ?? '').replace(BAS, '').replace(/^https:\/\/www\.jobbcoach\.ai/, '')
    kontroll(svar.status === 308 && plats === till, `308 ${fran}: ${svar.status} till ${plats}`)
    // Ett hopp: målet svarar 200 direkt.
    const mal = await fetch(BAS + till, { redirect: 'manual' })
    kontroll(mal.status === 200, `308 ${fran}: målet ${till} svarar ${mal.status}`)
  }
  // I webbläsaren: en av dem som ny besökare.
  const { page, ctx } = await nySida(browser, vy)
  await page.goto(`${BAS}/cv-mallar/larare`, { waitUntil: 'networkidle2', timeout: 180000 })
  kontroll(new URL(page.url()).pathname === '/cv-exempel/larare', `webbläsaren ${vy}: /cv-mallar/larare landar på ${new URL(page.url()).pathname}`)
  await bild(page, `omdirigering-larare-${vy}`)
  await ctx.close()
}

async function main() {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
  try {
    for (const vy of ['pixel7', 'dator'] as Vy[]) {
      await skapaCv(browser, vy)
      for (const s of STIL) await stilsida(browser, vy, s, true)
      await pilot(browser, vy)
      await yrkesmall(browser, vy)
      await omdirigeringar(browser, vy)
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, 'resultat.txt'), resultat.join('\n') + `\n\nFel: ${fel}\n`)
  console.log(`\nKontroller: ${resultat.length}, fel: ${fel}. Skärmdumpar i ${UT}`)
  process.exit(fel ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
