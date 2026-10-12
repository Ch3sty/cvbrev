/**
 * Klicktest för publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 9) i riktig Chrome via puppeteer-core, mot ett lokalt
 * produktionsbygge. En skärmdump per steg i docs/qa/publikt-v2/vagN/.
 *
 *   npx tsx scripts/klicktest-publikt-v2.ts --vag 1 --port 8300
 *   npx tsx scripts/klicktest-publikt-v2.ts --vag 2 --port 8300
 *   npx tsx scripts/klicktest-publikt-v2.ts --vag 3 --port 8300
 *
 * Varje steg kontrollerar scrollWidth mot bredden och skriver en rad i
 * resultat.md. Ett misslyckat steg ger exit 1.
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const VAG = arg('vag', '1')!
const BAS = `http://localhost:${arg('port', '8300')}`
/** --del b: del B:s vågor (spec del B avsnitt 6), modulerna klicktest-publikt-v2-bN.ts. */
const DEL = arg('del', 'a')!
const UT = DEL === 'b' ? path.join('docs/qa/publikt-v2-b', `vag${VAG}`) : path.join('docs/qa/publikt-v2', `vag${VAG}`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

type Enhet = { namn: string; bredd: number; hojd: number; dpr: number; mobil: boolean }
const ENHETER: Enhet[] = [
  { namn: 'pixel7', bredd: 412, hojd: 915, dpr: 2.625, mobil: true },
  { namn: 'desktop', bredd: 1280, hojd: 800, dpr: 1, mobil: false },
]
const LAGEN = ['ljus', 'mork'] as const

const rader: string[] = []
let fel = 0
let nr = 0

async function ny(b: Browser, e: Enhet, lage: (typeof LAGEN)[number], reducerad = false): Promise<Page> {
  const p = await b.newPage()
  await p.setViewport({ width: e.bredd, height: e.hojd, deviceScaleFactor: e.mobil ? 1 : 1, isMobile: e.mobil, hasTouch: e.mobil })
  await p.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: lage === 'mork' ? 'dark' : 'light' },
    { name: 'prefers-reduced-motion', value: reducerad ? 'reduce' : 'no-preference' },
  ])
  // Samtycket besvarat, så att cookieraden inte täcker skärmdumparna.
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  return p
}

/** --steg <del av namn>: kör bara de stegen (omkörning), resultatet i resultat-omkorning.md. */
const FILTER = arg('steg')

async function steg(p: Page, e: Enhet, lage: string, namn: string, kontroll: () => Promise<string | null>, helsida = false) {
  nr++
  if (FILTER && !namn.includes(FILTER)) return
  const fil = `${String(nr).padStart(2, '0')}-${e.namn}-${lage}-${namn}.jpg`
  let problem: string | null = null
  try {
    problem = await kontroll()
    const sw = await p.evaluate(() => document.documentElement.scrollWidth)
    if (sw > e.bredd) problem = (problem ? problem + '; ' : '') + `scrollWidth ${sw} > ${e.bredd}`
  } catch (err) {
    problem = String(err).slice(0, 200)
  }
  await p.screenshot({ path: path.join(UT, fil) as `${string}.jpeg`, fullPage: helsida, type: 'jpeg', quality: 70 })
  if (problem) fel++
  rader.push(`| ${nr} | ${e.namn} | ${lage} | ${namn} | ${problem ? 'FEL: ' + problem : 'ok'} | ${fil} |`)
  console.log(`${problem ? 'FEL' : 'ok '} ${fil}${problem ? ' ' + problem : ''}`)
}

async function ga(p: Page, url: string) {
  const r = await p.goto(BAS + url, { waitUntil: 'load', timeout: 90000 })
  await new Promise((res) => setTimeout(res, 1200))
  const s = r?.status() ?? 0
  // 304 är samma svar ur webbläsarens cache.
  return s === 304 ? 200 : s
}

/** Klicka på första länken som matchar och vänta på navigationen. Returnerar ny sökväg. */
async function klicka(p: Page, selektor: string): Promise<string> {
  await p.waitForSelector(selektor, { timeout: 10000 })
  await p.$eval(selektor, (el) => (el as HTMLElement).scrollIntoView({ block: 'center' }))
  await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(() => null), p.click(selektor)])
  await new Promise((res) => setTimeout(res, 600))
  const u = new URL(p.url())
  return u.pathname + u.search
}

async function vag1(b: Browser) {
  for (const e of ENHETER) {
    for (const lage of LAGEN) {
      for (const reducerad of [false, true]) {
        const p = await ny(b, e, lage, reducerad)
        await steg(
          p,
          e,
          lage,
          `forhandsvisning${reducerad ? '-reducerad' : ''}`,
          async () => {
            const s = await ga(p, '/forhandsvisning-publikt')
            if (s !== 200) return `status ${s}`
            const antal = await p.$$eval('.pub-tel', (l) => l.length)
            return antal >= 11 ? null : `bara ${antal} telefoner`
          },
          true
        )
        await p.close()
      }
    }
  }
  // 360 px: hjältens knapp inom 640 px.
  const e360: Enhet = { namn: 'mobil360', bredd: 360, hojd: 800, dpr: 1, mobil: true }
  for (const lage of LAGEN) {
    const p = await ny(b, e360, lage)
    await steg(p, e360, lage, 'forhandsvisning-360', async () => {
      await ga(p, '/forhandsvisning-publikt')
      const k = await p.$eval('[data-primar]', (el) => el.getBoundingClientRect().bottom)
      return k <= 640 ? null : `knappen slutar på ${Math.round(k)} px`
    })
    await p.close()
  }
}

async function main() {
  fs.mkdirSync(UT, { recursive: true })
  const b = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--hide-scrollbars'] })
  try {
    if (DEL === 'b') {
      const mod = await import(`./klicktest-publikt-v2-b${VAG}`)
      await mod.kor({ b, ENHETER, LAGEN, ny, steg, ga, klicka, BAS, UT })
    } else if (VAG === '1') await vag1(b)
    else {
      const mod = await import(`./klicktest-publikt-v2-vag${VAG}`)
      await mod.kor({ b, ENHETER, LAGEN, ny, steg, ga, klicka, BAS, UT })
    }
  } finally {
    await b.close()
  }
  const md = `# Klicktest publikt v2${DEL === 'b' ? ' del B' : ''}, våg ${VAG}\n\nKört ${new Date().toISOString()} mot ${BAS} (lokalt produktionsbygge), Chrome via puppeteer-core.\n\n| # | Enhet | Läge | Steg | Utfall | Skärmdump |\n|---|---|---|---|---|---|\n${rader.join('\n')}\n\nFel: ${fel}\n`
  fs.writeFileSync(path.join(UT, FILTER ? 'resultat-omkorning.md' : 'resultat.md'), md)
  console.log(`\nFel: ${fel}`)
  process.exit(fel ? 1 : 0)
}

export type KlickVerktyg = {
  b: Browser
  ENHETER: Enhet[]
  LAGEN: typeof LAGEN
  ny: typeof ny
  steg: typeof steg
  ga: typeof ga
  klicka: typeof klicka
  BAS: string
  UT: string
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
