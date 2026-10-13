/**
 * Klicktest av filmen i testartiklarna (ArtikelFilm.tsx) och av att Avvisa i
 * cookie-raden stänger av PostHog helt. Pixel 7 och desktop, skärmdumpar i
 * docs/qa/artikelfilm/.
 *
 *   npx next start -p 8300
 *   npx tsx scripts/klicktest-artikelfilm.ts --port 8300
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const port = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : '8300'
const BAS = `http://localhost:${port}`
const UT = 'docs/qa/artikelfilm'
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))!
const ENHETER = [
  { namn: 'pixel7', viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36' },
  { namn: 'desktop', viewport: { width: 1280, height: 800 }, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' },
]
const ARTIKLAR = ['logiska-tester', 'alva-labs-logiktest', 'matrislogik-test-guide', 'numeriskt-test-guide']
const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))
const arPosthog = (u: string) => /posthog|\/ingest\//i.test(u)

async function main() {
  fs.mkdirSync(UT, { recursive: true })
  const fel: string[] = []
  const logg: string[] = []
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] })
  for (const e of ENHETER) {
    for (const slug of ARTIKLAR) {
      const p = await b.newPage()
      await p.setViewport(e.viewport)
      await p.setUserAgent(e.ua)
      const video: string[] = []
      p.on('request', (r) => {
        if (r.url().includes('/videos/') && /\.(mp4|m4a)$/.test(r.url())) video.push(r.url())
      })
      await p.goto(`${BAS}/artiklar/${slug}`, { waitUntil: 'load', timeout: 60000 })
      const finns = await p.evaluate(() => !!document.querySelector('.artikel-film .pub-film'))
      if (!finns) {
        fel.push(`${e.namn} ${slug}: filmen saknas`)
        await p.close()
        continue
      }
      await p.evaluate(() => document.querySelector('.artikel-film')?.scrollIntoView({ block: 'center' }))
      await vanta(1500)
      if (video.length) fel.push(`${e.namn} ${slug}: video hämtad före klick (${video.join(', ')})`)
      const knapp = await p.$('.artikel-film .pub-film-spela')
      if (!knapp) fel.push(`${e.namn} ${slug}: Spela-knappen saknas`)
      if (slug === 'logiska-tester') await p.screenshot({ path: path.join(UT, `${e.namn}-01-fore-klick.png`) })
      await knapp?.click()
      await vanta(2000)
      const t = await p.evaluate(() => document.querySelector<HTMLVideoElement>('.artikel-film video')?.currentTime ?? 0)
      logg.push(`${e.namn} ${slug}: före klick ${video.length} filer, efter klick tid ${t.toFixed(2)}`)
      if (t < 0.5) fel.push(`${e.namn} ${slug}: filmen spelar inte efter klick`)
      if (slug === 'logiska-tester') await p.screenshot({ path: path.join(UT, `${e.namn}-02-spelar.png`) })
      await p.close()
    }
  }

  // Avvisa: ingen PostHog alls, varken direkt eller vid nästa sidladdning.
  const p = await b.newPage()
  await p.setViewport({ width: 1280, height: 800 })
  await p.setUserAgent(ENHETER[1].ua)
  const ph: string[] = []
  p.on('request', (r) => {
    if (arPosthog(r.url())) ph.push(r.url())
  })
  await p.goto(`${BAS}/`, { waitUntil: 'load' })
  await p.click('#rcc-decline-button')
  ph.length = 0
  await vanta(4000)
  const efterKlick = ph.filter((u) => /\/(e|i\/v0\/e|batch|capture)\b/.test(u)).length
  ph.length = 0
  await p.goto(`${BAS}/verktyg/rekryteringstester`, { waitUntil: 'load' })
  await vanta(5000)
  const cookies = (await p.cookies()).map((c) => c.name)
  logg.push(`Avvisa: händelser efter klick ${efterKlick}, anrop till PostHog vid nästa sida ${ph.length}, cookies ${JSON.stringify(cookies)}`)
  if (ph.length) fel.push(`Avvisa: PostHog laddas ändå (${ph.slice(0, 3).join(', ')})`)
  if (cookies.some((c) => c.startsWith('ph_'))) fel.push('Avvisa: ph_-cookie satt')
  await p.close()

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
