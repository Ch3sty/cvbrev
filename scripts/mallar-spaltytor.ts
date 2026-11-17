/**
 * Spaltytorna på sida 2 och framåt (granskningsvarv 2 av utbud 2): i
 * sidospaltsmallarna får panelens bakgrund och spaltens linje bara stå där
 * spalten har innehåll. Varje sidospaltsmall (utom Ritning, vars spalt går i
 * hela sidans höjd med flit) renderas med normalt och långt CV, och sidorna
 * efter den första ritas som bild. Skriptet fallerar om spaltens yta på en
 * sida har mer än 6 mm panelfärg (rader där minst 90 procent av spaltens
 * bredd har bakgrundsfärgen) eller linjefärg (spaltlinjen) nedanför spaltens
 * sista textrad på sidan.
 *
 *   npx tsx scripts/mallar-spaltytor.ts [--mall a,b] [--ut <mapp>]
 *
 * Bilderna sparas i --ut (standard en mapp i os.tmpdir()), aldrig i git.
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import type { CVMetadata } from '../src/lib/cv/cv-metadata'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'
import { lasPdfGeometri, norm, ritaPdfSidor } from './lib/pdf-verktyg'

const arg = (n: string) => {
  const i = process.argv.indexOf(n)
  return i > 0 ? process.argv[i + 1] : undefined
}
const BARA = arg('--mall')?.split(',')
const UT = path.resolve(arg('--ut') ?? path.join(os.tmpdir(), 'mallar-spaltytor'))
fs.mkdirSync(UT, { recursive: true })

const FOTO =
  'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#9aa4ae"/></svg>').toString('base64')
const SKALA = 2
const PT_MM = 2.835

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const nara = (a: number[], b: number[], tol = 18) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol

async function main() {
  const { MALLAR } = await import('../src/lib/cv/mallar/register')
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const { generateSwedishCVPDF, closeSwedishCVPDFGenerator } = await import('../src/lib/cv/swedish-cv-pdf-generator')
  const { palett, los } = await import('../src/lib/cv/mallar/farg')
  const puppeteer = (await import('puppeteer')).default
  const browser = await puppeteer.launch({ headless: true })
  const rapport: { mall: string; langd: string; fel: string[] }[] = []
  const mallar = MALLAR.filter((m) => m.layout.typ === 'sidospalt' && !m.layout.spalt.helSida && (!BARA || BARA.includes(m.id)))
  for (const def of mallar) {
    if (def.layout.typ !== 'sidospalt') continue
    const s = def.layout.spalt
    const p = palett(def, {})
    const bg = s.bakgrund ? hex(los(s.bakgrund, p, p.ton)) : null
    const lin = s.linje ? hex(los(s.linje.farg, p, p.accent)) : null
    for (const [langd, bas] of [['normalt', CV_LANGDER.normalt], ['langt', CV_LANGDER.langt]] as [string, CVMetadata][]) {
      const cv: CVMetadata = structuredClone(bas)
      if (def.foto) cv.personalInfo.profilePhotoUrl = FOTO
      const html = renderaMallHtml(cv, def.id)!
      // Spaltens texter ur DOM:en, för att känna igen spaltens rader i PDF:en.
      const sida = await browser.newPage()
      await sida.setContent(html, { waitUntil: 'load' })
      const spaltText: string[] = await sida.evaluate(() =>
        Array.from(document.querySelectorAll('.spalt-sido li, .spalt-sido p, .spalt-sido h2')).map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean)
      )
      await sida.close()
      const pdf = await generateSwedishCVPDF(html, cv, { template: def.id, format: 'A4', swedishSettings: { pageLimit: 4 } } as Parameters<typeof generateSwedishCVPDF>[2])
      const fil = path.join(UT, `${def.id}-${langd}.pdf`)
      fs.writeFileSync(fil, pdf)
      const g = await lasPdfGeometri(pdf)
      const bilder = (await ritaPdfSidor([fil], SKALA))[fil]
      const fel: string[] = []
      // Spaltens yta i punkter: från papperskanten, bredden minus 1 mm vid innerkanten.
      const x0 = s.sida === 'vanster' ? 0 : 595 - s.bredd * PT_MM
      const x1 = s.sida === 'vanster' ? s.bredd * PT_MM : 595
      const linjeX = s.sida === 'vanster' ? x1 : x0
      const arSpalt = (t: string) => spaltText.some((x) => norm(x).includes(norm(t)) || norm(t).includes(norm(x)))
      for (let nr = 2; nr <= g.sidor; nr++) {
        const rader = g.rader.filter((r) => r.sida === nr && r.x >= x0 - 2 && r.x <= x1 && arSpalt(r.text))
        const slutY = rader.length ? Math.max(...rader.map((r) => r.y)) + 8 * PT_MM : 0
        const { data, info } = await sharp(bilder[nr - 1]).raw().toBuffer({ resolveWithObject: true })
        const px = (x: number, y: number) => {
          const i = (Math.round(y) * info.width + Math.round(x)) * info.channels
          return [data[i], data[i + 1], data[i + 2]]
        }
        const skala = info.width / 595
        let panel = 0
        let linje = 0
        for (let y = Math.ceil(slutY * skala); y < info.height - 2; y++) {
          if (bg) {
            let traff = 0
            let alla = 0
            for (let x = Math.ceil((x0 + 3) * skala); x < Math.floor((x1 - 3) * skala); x += 2) {
              alla++
              if (nara(px(x, y), bg, 6)) traff++
            }
            if (alla && traff / alla >= 0.9) panel++
          }
          if (lin) {
            const xs = [-2, -1, 0, 1, 2].map((d) => linjeX * skala + d)
            if (xs.some((x) => x >= 0 && x < info.width && nara(px(x, y), lin))) linje++
          }
        }
        const mm = (n: number) => n / skala / PT_MM
        if (mm(panel) > 6) fel.push(`sida ${nr}: ${Math.round(mm(panel))} mm panelfärg utan spaltinnehåll`)
        if (mm(linje) > 6) fel.push(`sida ${nr}: ${Math.round(mm(linje))} mm spaltlinje utan spaltinnehåll`)
      }
      rapport.push({ mall: def.id, langd: `${langd} (${g.sidor} s)`, fel })
    }
  }
  await browser.close()
  await closeSwedishCVPDFGenerator()
  for (const r of rapport) console.log(`${r.fel.length ? 'FEL' : 'ok '} ${r.mall.padEnd(10)} ${r.langd}${r.fel.length ? '\n      ' + r.fel.join('\n      ') : ''}`)
  const fall = rapport.filter((r) => r.fel.length)
  console.log(`\n${rapport.length - fall.length} av ${rapport.length} gröna. Bilder i ${UT}`)
  process.exit(fall.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
