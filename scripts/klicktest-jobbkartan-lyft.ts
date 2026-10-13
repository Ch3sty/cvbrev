/**
 * Klicktest för Jobbkartan-lyftet 2026-10-13: datan hämtas från /jobbkartan/data/karta.json i
 * stället för att följa med sidan, registreringskroken efter Ditt yrke, textlänken i bäddkoden,
 * Jobbkartans rad på startsidan. Pixel 7 och desktop, ny besökare, skärmdump per steg i
 * docs/qa/jobbkartan-lyft/.
 *
 *   npx tsx scripts/klicktest-jobbkartan-lyft.ts --port 8300
 *   npx tsx scripts/klicktest-jobbkartan-lyft.ts --port 8300 --bara-karta --tag fore
 *
 * --bara-karta tar bara skärmdumpar av hjältekartan (för pixeljämförelse före och efter).
 */
import puppeteer, { type Page } from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

function arg(namn: string, fallback?: string) {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const BAS = `http://localhost:${arg('port', '8300')}`
const UT = 'docs/qa/jobbkartan-lyft'
const TAG = arg('tag', 'efter')!
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => fs.existsSync(p))!

const ENHETER = [
  {
    namn: 'pixel7',
    viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
  },
  { namn: 'desktop', viewport: { width: 1280, height: 800 }, ua: undefined },
]

const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))
const resultat: { enhet: string; steg: string; fel: string | null }[] = []

async function main() {
  fs.mkdirSync(UT, { recursive: true })
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  await b.defaultBrowserContext().overridePermissions(BAS, ['clipboard-read', 'clipboard-write'])
  for (const e of ENHETER) {
    const p = await b.newPage()
    await p.setViewport(e.viewport)
    if (e.ua) await p.setUserAgent(e.ua)
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    const konsol: string[] = []
    const natfel: string[] = []
    p.on('console', (m) => {
      if (m.type() === 'error') konsol.push(m.text())
    })
    p.on('pageerror', (err) => konsol.push(String(err)))
    p.on('response', (r) => {
      if (r.status() >= 400 && r.url().startsWith(BAS)) natfel.push(`${r.status()} ${r.url()}`)
    })
    const steg = async (namn: string, fn: () => Promise<string | null>) => {
      let fel: string | null
      try {
        fel = await fn()
      } catch (err) {
        fel = String(err)
      }
      await p.screenshot({ path: path.join(UT, `${TAG}-${e.namn}-${namn}.png`) })
      resultat.push({ enhet: e.namn, steg: namn, fel })
      console.log(`${fel ? 'FEL' : 'OK '} ${e.namn.padEnd(8)} ${namn}${fel ? '  ' + fel : ''}`)
    }

    // 1. Sidan laddar, kartan startar med datan från routen.
    let karta: string | null = null
    await steg('jobbkartan-laddar', async () => {
      const dataSvar = p.waitForResponse((r) => r.url().includes('/jobbkartan/data/karta.json'), { timeout: 15000 }).catch(() => null)
      const r = await p.goto(BAS + '/jobbkartan', { waitUntil: 'load' })
      if (!r || r.status() >= 400) return `status ${r?.status()}`
      await p.waitForSelector('.jk.jk-redo', { timeout: 15000 })
      await vanta(800)
      const el = await p.$('#jk-karta')
      if (el) {
        karta = path.join(UT, `${TAG}-${e.namn}-hjaltekarta.png`)
        await el.screenshot({ path: karta })
      }
      if (process.argv.includes('--bara-karta')) return null
      const d = await dataSvar
      if (!d) return 'karta.json hämtades aldrig'
      const lanKlass = await p.$eval('#jk-karta .lan[data-kod="01"]', (g) => g.getAttribute('class'))
      const staplar = await p.$$eval('#jk-lanstaplar *', (x) => x.length)
      return staplar > 10 && lanKlass ? null : `staplarna ritades inte (${staplar} element)`
    })
    if (process.argv.includes('--bara-karta')) {
      await p.close()
      continue
    }

    // 2. Ditt yrke: ett annat yrke i chipsen ritar om faktarutan.
    await steg('ditt-yrke', async () => {
      await p.$eval('#jk-yrke', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
      await p.waitForFunction(() => (document.querySelector('#jk-yrke-lq')?.textContent ?? '').trim().length > 1, { timeout: 15000 })
      const chip = await p.$('#jk-yrkechips .chip:not([aria-pressed="true"])')
      if (!chip) return 'inga chips'
      const fore = await p.$eval('#jk-yrke-namn', (x) => x.textContent)
      await chip.click()
      await vanta(1200)
      const efter = await p.$eval('#jk-yrke-namn', (x) => x.textContent)
      return efter !== fore ? null : 'yrket byttes inte'
    })

    // 3. Kroken efter Ditt yrke, före lönekartan.
    await steg('kroken', async () => {
      await p.evaluate(() => document.querySelector('#jk-krok')?.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await vanta(600)
      const info = await p.evaluate(() => {
        const k = document.querySelector<HTMLElement>('#jk-krok')
        if (!k) return null
        const a = k.querySelector<HTMLAnchorElement>('a.knapp')
        const lon = document.querySelector('#jk-lonkarta')
        const yrke = document.querySelector('.yrke-grid')
        const r = a?.getBoundingClientRect()
        return {
          href: a?.getAttribute('href'),
          text: a?.textContent,
          h3: k.querySelector('h3')?.textContent,
          h2: k.querySelectorAll('h2').length,
          foreLon: !!lon && !!(k.compareDocumentPosition(lon) & Node.DOCUMENT_POSITION_FOLLOWING),
          efterYrke: !!yrke && !!(k.compareDocumentPosition(yrke) & Node.DOCUMENT_POSITION_PRECEDING),
          inomSkarm: !!r && r.top >= 0 && r.bottom <= innerHeight,
        }
      })
      await vanta(300)
      if (!info) return 'kroken saknas'
      const fel: string[] = []
      if (info.href !== '/register?borja=jobb') fel.push(`href ${info.href}`)
      if (info.text?.trim() !== 'Se mina träffar gratis') fel.push(`knapptext ${info.text}`)
      if (info.h3 !== 'Annonserna för ditt yrke, där kön är kortast') fel.push(`h3 ${info.h3}`)
      if (info.h2) fel.push('kroken har h2')
      if (!info.foreLon) fel.push('står inte före lönekartan')
      if (!info.efterYrke) fel.push('står inte efter yrket')
      if (!info.inomSkarm) fel.push('knappen syns inte i viewporten')
      return fel.length ? fel.join(', ') : null
    })

    // 4. Krokens knapp leder till registreringen med jobbvalet.
    await steg('kroken-klick', async () => {
      await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), p.click('#jk-krok a.knapp')])
      const u = new URL(p.url())
      const ok = u.pathname === '/register' && u.searchParams.get('borja') === 'jobb'
      return ok ? null : `landade på ${p.url()}`
    })

    // 5. Vägen vidare har samma mål som primärknapp.
    await steg('vagen-vidare', async () => {
      await p.goto(BAS + '/jobbkartan', { waitUntil: 'load' })
      await p.waitForSelector('.jk.jk-redo', { timeout: 15000 })
      const href = await p.$eval('#jk-vidare .vidare-knappar a.knapp', (a) => {
        a.scrollIntoView({ block: 'center', behavior: 'instant' })
        return a.getAttribute('href')
      })
      await vanta(300)
      return href === '/register?borja=jobb' ? null : `primärknappen går till ${href}`
    })

    // 6. Bäddkoden har textlänken efter iframen.
    await steg('baddkod', async () => {
      await p.$eval('#jk-badd', (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await p.click('#jk-badd')
      await vanta(500)
      const kod = await p.$eval('#jk-badd-kod', (x) => x.textContent ?? '')
      const urklipp = await p.evaluate(() => navigator.clipboard.readText().catch(() => ''))
      const lank = '<p>Källa: <a href="https://www.jobbcoach.ai/jobbkartan">Jobbkartan, jobbcoach.ai</a>, data från SCB och Arbetsförmedlingen</p>'
      const fel: string[] = []
      if (!kod.includes('</iframe>' + lank) && !kod.includes('</iframe>\n' + lank)) fel.push('textlänken saknas i den visade koden')
      if (urklipp && !urklipp.includes(lank)) fel.push('textlänken saknas i urklippet')
      return fel.length ? fel.join(', ') : null
    })

    // 7. CSV laddas ner.
    await steg('csv', async () => {
      const cdp = await p.createCDPSession()
      const dir = path.resolve(UT, 'nedladdat')
      fs.mkdirSync(dir, { recursive: true })
      await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir })
      await p.click('#jk-csv-konk')
      await vanta(1500)
      const filer = fs.readdirSync(dir).filter((f) => f.startsWith('jobbkartan-konkurrens'))
      return filer.length ? null : 'ingen CSV-fil'
    })

    // 8. Din kommun ritas när avsnittet närmar sig.
    await steg('din-kommun', async () => {
      await p.$eval('#jk-kommun', (el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
      await p.waitForFunction(() => (document.querySelector('#jk-kommun-al')?.textContent ?? '').trim().length > 1, { timeout: 15000 })
      return null
    })

    // 9. Inbäddningen startar med samma data.
    await steg('embed', async () => {
      const r = await p.goto(BAS + '/embed/jobbkartan', { waitUntil: 'load' })
      if (!r || r.status() >= 400) return `status ${r?.status()}`
      await p.waitForSelector('.jk.jk-redo', { timeout: 15000 })
      return null
    })

    // 10. Startsidans rad för Jobbkartan.
    await steg('startsidan-rad', async () => {
      const r = await p.goto(BAS + '/', { waitUntil: 'load' })
      if (!r || r.status() >= 400) return `status ${r?.status()}`
      const info = await p.evaluate(() => {
        const a = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="/jobbkartan"]')).find((x) =>
          (x.textContent ?? '').includes('Hur många som konkurrerar'),
        )
        if (!a) return null
        a.scrollIntoView({ block: 'center', behavior: 'instant' })
        return { text: a.textContent }
      })
      await vanta(400)
      return info ? null : 'raden för Jobbkartan saknas'
    })

    await steg('startsidan-rad-klick', async () => {
      const a = await p.evaluateHandle(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="/jobbkartan"]')).find((x) =>
          (x.textContent ?? '').includes('Hur många som konkurrerar'),
        ),
      )
      await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), (a as unknown as { click: () => Promise<void> }).click()])
      return new URL(p.url()).pathname === '/jobbkartan' ? null : `landade på ${p.url()}`
    })

    const brus = (s: string) => /posthog|Failed to load resource.*(favicon|_vercel)/i.test(s)
    const k = konsol.filter((x) => !brus(x))
    resultat.push({ enhet: e.namn, steg: 'konsol', fel: k.length ? k.slice(0, 5).join(' | ') : null })
    resultat.push({ enhet: e.namn, steg: 'natverk', fel: natfel.length ? natfel.slice(0, 5).join(' | ') : null })
    console.log(`${k.length ? 'FEL' : 'OK '} ${e.namn.padEnd(8)} konsol ${k.slice(0, 3).join(' | ')}`)
    console.log(`${natfel.length ? 'FEL' : 'OK '} ${e.namn.padEnd(8)} nätverk ${natfel.slice(0, 3).join(' | ')}`)
    await p.close()
  }
  await b.close()
  fs.writeFileSync(path.join(UT, `${TAG}-resultat.json`), JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => r.fel)
  console.log(`\n${resultat.length - fel.length} av ${resultat.length} steg utan fel`)
  process.exit(fel.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
