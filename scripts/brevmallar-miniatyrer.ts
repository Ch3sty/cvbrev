/**
 * Brevets miniatyrer för de publika sidorna (byggspecen våg 1, avsnitt 1 och
 * 2): säljsidans mallsektion och dekoren på /funktioner. Varje mall ritas av
 * brevmotorn (renderBrevHtml) med exempelBrev('kort'), i full A4 med
 * typsnitten inbäddade som i PDF-kedjan, och sparas som webp under
 * public/mallar/brev/<id>.webp i måtten ur src/components/publikt/brevmallar.ts.
 *
 * Statiska bilder i stället för serverritad HTML: sju miniatyrer som HTML
 * vägde cirka 113 kB rå CSS och markup (plus samma igen i sidans RSC-data)
 * och laddade mallarnas webbtypsnitt på säljsidan.
 *
 * Ingen server, ingen databas.
 *
 *   npx tsx scripts/brevmallar-miniatyrer.ts [--bara linne,koppar]
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import puppeteer from 'puppeteer'
import { baddaInTypsnitt } from '../src/lib/cv/mallar/typsnitt-inbaddning'
import { renderBrevHtml } from '../src/lib/letters/brevmall'
import { exempelBrev } from '../src/lib/letters/brevmall/exempel'
import { MINIATYR_BREDD, MINIATYR_HOJD, SALJ_MALL_IDS, FUNKTIONER_MALL_IDS, brevMiniatyrSrc } from '../src/components/publikt/brevmallar'

const arg = (namn: string) => {
  const i = process.argv.indexOf(namn)
  return i > 0 ? process.argv[i + 1] : undefined
}

/** A4 i CSS-pixlar vid 96 dpi. */
const A4_BREDD = 794
const A4_HOJD = 1123

async function main() {
  const alla = [...new Set<string>([...SALJ_MALL_IDS, ...FUNKTIONER_MALL_IDS])]
  const bara = arg('--bara')?.split(',')
  const ids = bara ? alla.filter((id) => bara.includes(id)) : alla
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    // Ritas i dubbel skärpa och skalas ner, så att brödtexten blir läsbar som grå rader och rubrikerna skarpa.
    await page.setViewport({ width: A4_BREDD, height: A4_HOJD, deviceScaleFactor: 2 })
    for (const id of ids) {
      const html = renderBrevHtml(id, exempelBrev('kort'))
      await page.setContent(baddaInTypsnitt(html), { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await new Promise((r) => setTimeout(r, 80))
      const png = Buffer.from(await page.screenshot({ clip: { x: 0, y: 0, width: A4_BREDD, height: A4_HOJD }, type: 'png' }))
      const ut = path.join('public', brevMiniatyrSrc(id))
      fs.mkdirSync(path.dirname(ut), { recursive: true })
      await sharp(png)
        .resize(MINIATYR_BREDD, MINIATYR_HOJD, { fit: 'fill', kernel: 'lanczos3' })
        .webp({ quality: 82, effort: 6 })
        .toFile(ut)
      console.log(`${id.padEnd(12)} ${ut} ${(fs.statSync(ut).size / 1024).toFixed(1)} kB`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
