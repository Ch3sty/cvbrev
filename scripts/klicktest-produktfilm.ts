/**
 * Klicktest av produktfilmen på /verktyg/rekryteringstester (Produktfilm.tsx).
 * Pixel 7 och desktop, ny besökare, skärmdump per steg i docs/qa/produktfilm/.
 *
 * Kontrollerar: ingen videofil hämtas innan filmen syns, rätt variant per enhet,
 * filmen spelar när den är i bild, Slå på ljud hämtar ljudfilen först då och
 * spelar, länken över slutbildens knapp finns och leder till smakprovet,
 * reducerad rörelse spelar inget förrän Spela, och cachehuvudet på /videos.
 *
 *   npx next start -p 8300
 *   npx tsx scripts/klicktest-produktfilm.ts --port 8300
 */
import puppeteer, { type Page } from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

function arg(namn: string, fallback?: string) {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const BAS = `http://localhost:${arg('port', '8300')}`
const UT = 'docs/qa/produktfilm'
const SIDA = '/verktyg/rekryteringstester'
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => fs.existsSync(p))!

const ENHETER = [
  {
    namn: 'pixel7',
    viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    variant: '916',
  },
  { namn: 'desktop', viewport: { width: 1280, height: 800 }, ua: undefined, variant: '169' },
]

const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  fs.mkdirSync(UT, { recursive: true })
  const fel: string[] = []
  const logg: string[] = []
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
  for (const e of ENHETER) {
    for (const lugn of [false, true]) {
      const namn = `${e.namn}${lugn ? '-lugn' : ''}`
      const p: Page = await b.newPage()
      await p.setViewport(e.viewport)
      if (e.ua) await p.setUserAgent(e.ua)
      if (lugn) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      const hamtat: string[] = []
      const konsol: string[] = []
      p.on('request', (r) => {
        if (r.url().includes('/videos/')) hamtat.push(r.url().replace(BAS, ''))
      })
      p.on('console', (m) => {
        if (m.type() === 'error') konsol.push(m.text())
      })
      await p.goto(BAS + SIDA, { waitUntil: 'load', timeout: 60000 })
      await vanta(800)
      const fore = hamtat.filter((u) => u.endsWith('.mp4') || u.endsWith('.m4a'))
      if (fore.length) fel.push(`${namn}: videofil hämtad innan filmen syns: ${fore.join(', ')}`)
      logg.push(`${namn}: före scroll, hämtat ${JSON.stringify(hamtat)}`)

      await p.evaluate(() => document.querySelector('.pub-film')?.scrollIntoView({ block: 'center' }))
      await vanta(2500)
      const info = await p.evaluate(() => {
        const v = document.querySelector<HTMLVideoElement>('.pub-film-video')
        const r = document.querySelector('.pub-film')!.getBoundingClientRect()
        return { src: v?.currentSrc ?? '', tid: v?.currentTime ?? 0, pausad: v?.paused, b: Math.round(r.width), h: Math.round(r.height), spelaKnapp: !!document.querySelector('.pub-film-spela') }
      })
      logg.push(`${namn}: efter scroll ${JSON.stringify(info)}`)
      await p.screenshot({ path: path.join(UT, `${namn}-01-i-bild.png`) })
      if (!lugn) {
        if (!info.src.includes(`tester-v3-${e.variant}.mp4`)) fel.push(`${namn}: fel variant ${info.src}`)
        if (info.pausad || info.tid < 0.5) fel.push(`${namn}: filmen spelar inte (tid ${info.tid})`)
      } else {
        if (info.src) fel.push(`${namn}: filmen laddades trots reducerad rörelse`)
        if (!info.spelaKnapp) fel.push(`${namn}: Spela-knappen saknas vid reducerad rörelse`)
        await p.click('.pub-film-spela')
        await vanta(1500)
        const t = await p.evaluate(() => document.querySelector<HTMLVideoElement>('.pub-film-video')?.currentTime ?? 0)
        if (t < 0.3) fel.push(`${namn}: Spela startade inte filmen`)
        await p.screenshot({ path: path.join(UT, `${namn}-02-spelar.png`) })
        await p.close()
        continue
      }

      // Ljudet
      const ljudFore = hamtat.some((u) => u.endsWith('.m4a'))
      if (ljudFore) fel.push(`${namn}: ljudfilen hämtades före tryck`)
      await p.click('.pub-film-ljud')
      await vanta(1500)
      const ljud = await p.evaluate(() => document.querySelector('.pub-film-ljud')?.textContent)
      if (!hamtat.some((u) => u.endsWith('tester-v3-ljud.m4a'))) fel.push(`${namn}: ljudfilen hämtades inte efter tryck`)
      if (ljud !== 'Stäng av ljud') fel.push(`${namn}: ljudknappen bytte inte text (${ljud})`)
      await p.screenshot({ path: path.join(UT, `${namn}-02-ljud-pa.png`) })

      // Slutbilden och länken över knappen
      await p.evaluate(() => {
        const v = document.querySelector<HTMLVideoElement>('.pub-film-video')!
        v.currentTime = 17.4
      })
      await vanta(1200)
      const knapp = await p.evaluate(() => {
        const a = document.querySelector<HTMLAnchorElement>('.pub-film-knapp')
        const r = a?.getBoundingClientRect()
        return a ? { href: a.getAttribute('href'), x: Math.round(r!.x), y: Math.round(r!.y), b: Math.round(r!.width), h: Math.round(r!.height) } : null
      })
      logg.push(`${namn}: slutbildens länk ${JSON.stringify(knapp)}`)
      await p.screenshot({ path: path.join(UT, `${namn}-03-slutbild.png`) })
      if (!knapp || knapp.href !== '/verktyg/rekryteringstester/prova') fel.push(`${namn}: länken över slutbildens knapp saknas eller fel mål`)
      else {
        // Markera länkens yta i en egen skärmdump så att placeringen över den ritade knappen kan ses.
        await p.evaluate(() => {
          const a = document.querySelector<HTMLElement>('.pub-film-knapp')!
          a.style.outline = '3px solid #00e0ff'
        })
        await p.screenshot({ path: path.join(UT, `${namn}-04-lankyta.png`) })
        await Promise.all([p.waitForNavigation({ waitUntil: 'domcontentloaded' }), p.click('.pub-film-knapp')])
        if (!p.url().endsWith('/verktyg/rekryteringstester/prova')) fel.push(`${namn}: länken landade på ${p.url()}`)
      }
      if (konsol.length) fel.push(`${namn}: konsolfel ${konsol.join(' | ')}`)
      await p.close()
    }
  }

  // Cachehuvudet
  const svar = await fetch(BAS + '/videos/tester-v3-169.mp4', { method: 'HEAD' })
  const cache = svar.headers.get('cache-control')
  logg.push(`cache-control /videos: ${cache}`)
  if (!cache?.includes('immutable')) fel.push(`cachehuvudet saknas: ${cache}`)

  await b.close()
  fs.writeFileSync(path.join(UT, 'logg.txt'), [...logg, '', fel.length ? 'FEL:\n' + fel.join('\n') : 'Inga fel.'].join('\n'))
  console.log(logg.join('\n'))
  console.log(fel.length ? 'FEL:\n' + fel.join('\n') : 'Inga fel.')
  process.exit(fel.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
