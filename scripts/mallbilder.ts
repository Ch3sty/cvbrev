/**
 * Miniatyrerna för mallväljaren (plan avsnitt 3.4, spec avsnitt 4 punkt 15):
 * varje mall i katalogen renderas ur sin definition med NORMALT_CV (Erik
 * Lindberg), sida 1, foto på i mallar med fotoplats, förvald accent, och
 * sparas som webp i två storlekar:
 *   public/mallar/v2/<id>-liten.webp  112 x 158
 *   public/mallar/v2/<id>-stor.webp   300 x 424
 *
 * Testet i src/lib/cv/mallar/__tests__/mallbilder.test.ts fäller om en mall
 * i katalogen saknar bild. Kör efter varje ändring i en definition:
 *   npx tsx scripts/mallbilder.ts [--mall <id>]
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { NORMALT_CV } from '../src/lib/cv/word/__tests__/fixtures'

const i = process.argv.indexOf('--mall')
const BARA = i > 0 ? process.argv[i + 1] : undefined
const UT = path.resolve('public/mallar/v2')

/** En neutral silhuett i fotoplatsen, samma i alla miniatyrer. */
const FOTO =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#c9ced6"/><circle cx="100" cy="82" r="38" fill="#eef0f2"/><rect x="42" y="132" width="116" height="80" rx="56" fill="#eef0f2"/></svg>'
  ).toString('base64')

async function main() {
  const { MALLAR } = await import('../src/lib/cv/mallar/register')
  const { renderDefHtml } = await import('../src/lib/cv/mallar/render/html')
  const { baddaInTypsnitt } = await import('../src/lib/cv/mallar/typsnitt-inbaddning')
  const puppeteer = (await import('puppeteer')).default
  fs.mkdirSync(UT, { recursive: true })
  const browser = await puppeteer.launch({ headless: true })
  const sida = await browser.newPage()
  await sida.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
  for (const def of MALLAR.filter((m) => !BARA || m.id === BARA)) {
    const cv = structuredClone(NORMALT_CV)
    if (def.foto) cv.personalInfo.profilePhotoUrl = FOTO
    // Typsnitten inbäddade som i PDF:en, så att miniatyren visar samma typsnitt.
    await sida.setContent(baddaInTypsnitt(renderDefHtml(cv, def, {})), { waitUntil: 'load', timeout: 60000 })
    await sida.evaluate('document.fonts.ready')
    const png = await sida.screenshot({ clip: { x: 0, y: 0, width: 794, height: 1123 }, type: 'png' })
    for (const [namn, b, h] of [['liten', 112, 158], ['stor', 300, 424]] as const) {
      await sharp(png).resize(b, h, { fit: 'cover', position: 'top' }).webp({ quality: namn === 'liten' ? 80 : 82 }).toFile(path.join(UT, `${def.id}-${namn}.webp`))
    }
    const kb = (f: string) => Math.round(fs.statSync(path.join(UT, f)).size / 1024)
    console.log(`${def.id}: liten ${kb(`${def.id}-liten.webp`)} kB, stor ${kb(`${def.id}-stor.webp`)} kB`)
  }
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
