/**
 * Renderar PWA-ikonerna i public/pwa från SVG till PNG.
 *
 * Kör: npx tsx scripts/render-pwa-icons.ts
 *
 * Vägen är densamma som för Stripe-bilderna (scripts/render-stripe-images.ts):
 * läs SVG-källan, rita den i exakt den storlek som ska ut, skriv PNG och
 * verifiera resultatet genom att läsa in det igen. Här sker ritningen i
 * Chrome via puppeteer-core i stället för på en canvas, eftersom ikonerna
 * innehåller roterade grupper och nästlade transformer som ska se likadana
 * ut som i webbläsaren.
 *
 * Bakgrunden är benvit (#EDE8DF) och ligger redan i varje SVG. Sidan ritas
 * med transparent bakgrund så att icon.svg:s hörnradie förblir genomskinlig
 * i hörnen: Android och iOS lägger sin egen mask utanför.
 */

import puppeteer, { type Browser } from 'puppeteer-core'
import { existsSync } from 'node:fs'
import { loadImage } from '@napi-rs/canvas'
import { readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'public', 'pwa')

const CHROME_KANDIDATER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]

interface Uppgift {
  /** SVG-källa i public/pwa, utan ändelse. */
  kalla: string
  /** PNG-mål i public/pwa, utan ändelse. */
  mal: string
  /** Kantlängd i px. */
  storlek: number
}

const UPPGIFTER: Uppgift[] = [
  { kalla: 'icon', mal: 'icon-192', storlek: 192 },
  { kalla: 'icon', mal: 'icon-512', storlek: 512 },
  { kalla: 'icon-maskable', mal: 'icon-maskable-512', storlek: 512 },
  { kalla: 'apple-touch-icon', mal: 'apple-touch-icon-180', storlek: 180 },
]

function hittaChrome(): string {
  for (const bana of CHROME_KANDIDATER) {
    if (existsSync(bana)) return bana
  }
  throw new Error(
    'Hittade varken Chrome eller Edge. Lägg till sökvägen i CHROME_KANDIDATER.'
  )
}

async function rendera(browser: Browser, uppgift: Uppgift) {
  const svgBana = path.join(DIR, `${uppgift.kalla}.svg`)
  const pngBana = path.join(DIR, `${uppgift.mal}.png`)

  const svg = await readFile(svgBana, 'utf8')
  const sida = await browser.newPage()
  await sida.setViewport({
    width: uppgift.storlek,
    height: uppgift.storlek,
    deviceScaleFactor: 1,
  })

  // SVG:n skalas till hela ytan. margin 0 och overflow hidden så att inget
  // extra vitt utrymme hamnar i bilden.
  await sida.setContent(
    `<!doctype html><html><head><meta charset="utf-8">
     <style>
       html,body{margin:0;padding:0;overflow:hidden;background:transparent}
       svg{display:block;width:${uppgift.storlek}px;height:${uppgift.storlek}px}
     </style></head><body>${svg}</body></html>`,
    { waitUntil: 'load' }
  )

  const png = (await sida.screenshot({
    type: 'png',
    omitBackground: true,
    clip: { x: 0, y: 0, width: uppgift.storlek, height: uppgift.storlek },
  })) as Buffer

  await writeFile(pngBana, png)
  await sida.close()

  // Verifiera: läs in PNG:en igen och kontrollera måtten.
  const kontroll = await loadImage(await readFile(pngBana))
  if (kontroll.width !== uppgift.storlek || kontroll.height !== uppgift.storlek) {
    throw new Error(
      `${uppgift.mal}: fick ${kontroll.width}×${kontroll.height}, väntade ${uppgift.storlek}×${uppgift.storlek}`
    )
  }

  const svgStorlek = (await stat(svgBana)).size
  const pngStorlek = (await stat(pngBana)).size

  console.log(
    `${uppgift.mal.padEnd(22)} svg ${String(svgStorlek).padStart(6)} B  ` +
      `png ${String(pngStorlek).padStart(7)} B  ` +
      `verifierad ${kontroll.width}×${kontroll.height}`
  )
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: hittaChrome(),
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  })

  try {
    for (const uppgift of UPPGIFTER) {
      await rendera(browser, uppgift)
    }
  } finally {
    await browser.close()
  }

  console.log(`\nKlart. ${UPPGIFTER.length} PNG skrivna till public/pwa.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
