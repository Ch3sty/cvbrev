/**
 * Sidbrytningstestet för mallarna (docs/plan-mallar-2026-11-15.md avsnitt 7).
 *
 * Varje mall i registret renderas med tre CV-längder (foto där mallen har
 * fotoplats) genom nedladdningens PDF-kedja, och PDF:en läses med pdf.js:
 * vilken text som står på vilken sida. Skriptet fallerar om
 *   - en post (jobb, utbildning, projekt) delas mellan två sidor,
 *   - en rubrik står sist på en sida utan början av sitt innehåll,
 *   - en sida har en eller två rader,
 *   - sidantalet ligger utanför förväntan (kort 1, normalt 1 till 2, långt 2 till 3).
 *
 * Kör: npx tsx scripts/mallar-sidbrytning.ts [--mall <id>] [--ut <mapp>] [--png]
 * PDF:er och bilder sparas bara med --ut, och då utanför git.
 */
import fs from 'fs'
import path from 'path'
import type { CVMetadata } from '../src/lib/cv/cv-metadata'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'
import { lasPdfGeometri, norm, ritaPdfSidor, sidaFor, sidaForRubrik, sidaForSlut } from './lib/pdf-verktyg'

const arg = (namn: string) => {
  const i = process.argv.indexOf(namn)
  return i > 0 ? process.argv[i + 1] : undefined
}
const BARA = arg('--mall')
const UT = arg('--ut')
const PNG = process.argv.includes('--png')
if (UT) fs.mkdirSync(UT, { recursive: true })

const FOTO =
  'data:image/svg+xml;base64,' +
  Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#9aa4ae"/></svg>').toString('base64')

const FORVANTAT: Record<string, [number, number]> = { kort: [1, 1], normalt: [1, 2], langt: [2, 3] }

interface Struktur {
  poster: { forsta: string; sista: string }[]
  rubriker: { rubrik: string; nasta: string }[]
}

async function main() {
  const { MALLAR } = await import('../src/lib/cv/mallar/register')
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const { generateSwedishCVPDF, closeSwedishCVPDFGenerator } = await import('../src/lib/cv/swedish-cv-pdf-generator')
  const puppeteer = (await import('puppeteer')).default
  const browser = await puppeteer.launch({ headless: true })

  const rapport: { mall: string; langd: string; sidor: number; fel: string[] }[] = []
  const pdfer: string[] = []
  for (const def of MALLAR.filter((m) => !BARA || m.id === BARA)) {
    for (const [langd, bas] of Object.entries(CV_LANGDER)) {
      const cv: CVMetadata = structuredClone(bas)
      if (def.foto && langd !== 'kort') cv.personalInfo.profilePhotoUrl = FOTO
      const html = renderaMallHtml(cv, def.id, {})!

      // Posternas första och sista text, och texten efter varje rubrik, ur DOM:en.
      const sida = await browser.newPage()
      await sida.setContent(html, { waitUntil: 'load' })
      await sida.evaluate('globalThis.__name = globalThis.__name || ((f) => f)')
      const s: Struktur = await sida.evaluate(() => {
        const txt = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()
        const poster = Array.from(document.querySelectorAll('[data-post]')).map((p) => {
          const delar = Array.from(p.querySelectorAll('h3, .under, .posttext, li')).filter((e) => txt(e))
          return { forsta: txt(p.querySelector('h3')), sista: txt(delar[delar.length - 1]) }
        })
        const rubriker = Array.from(document.querySelectorAll('h2')).map((h) => {
          const efter = Array.from(h.closest('.start')?.querySelectorAll('h3, p, li') ?? []).find((e) => txt(e) && !h.contains(e))
          return { rubrik: txt(h), nasta: txt(efter) }
        })
        return { poster, rubriker }
      })
      await sida.close()

      const pdf = await generateSwedishCVPDF(html, cv, { template: def.id, format: 'A4', swedishSettings: { pageLimit: 4 } } as Parameters<typeof generateSwedishCVPDF>[2])
      const g = await lasPdfGeometri(pdf)
      const fel: string[] = []

      for (const p of s.poster) {
        const a = sidaFor(g, p.forsta)
        const b = sidaForSlut(g, p.sista, Math.max(1, a))
        if (a < 0 || b < 0) fel.push(`posten "${p.forsta.slice(0, 30)}" hittas inte i PDF:en`)
        else if (a !== b) fel.push(`posten "${p.forsta.slice(0, 30)}" delas mellan sida ${a} och ${b}`)
      }
      for (const r of s.rubriker) {
        if (!r.nasta) continue
        const a = sidaForRubrik(g, r.rubrik)
        const b = sidaFor(g, r.nasta, Math.max(1, a))
        if (a > 0 && b > 0 && a !== b) fel.push(`rubriken "${r.rubrik}" står ensam sist på sida ${a}`)
      }
      for (let sidnr = 1; sidnr <= g.sidor; sidnr++) {
        const rader = new Set(g.rader.filter((r) => r.sida === sidnr).map((r) => Math.round(r.y)))
        if (rader.size <= 2) fel.push(`sida ${sidnr} har bara ${rader.size} rad(er): ${g.rader.filter((r) => r.sida === sidnr).map((r) => norm(r.text)).join(' | ').slice(0, 80)}`)
      }
      const [min, max] = FORVANTAT[langd]
      if (g.sidor < min || g.sidor > max) fel.push(`${g.sidor} sidor, förväntat ${min === max ? min : `${min} till ${max}`}`)

      if (UT) {
        const f = path.join(UT, `${def.id}-${langd}.pdf`)
        fs.writeFileSync(f, pdf)
        pdfer.push(f)
      }
      rapport.push({ mall: def.id, langd, sidor: g.sidor, fel })
    }
  }
  await browser.close()
  await closeSwedishCVPDFGenerator()
  if (UT && PNG) await ritaPdfSidor(pdfer, 1)

  for (const r of rapport) console.log(`${r.fel.length ? 'FEL' : 'ok '} ${r.mall.padEnd(12)} ${r.langd.padEnd(8)} ${r.sidor} s${r.fel.length ? '\n      ' + r.fel.join('\n      ') : ''}`)
  const fall = rapport.filter((r) => r.fel.length)
  console.log(`\n${rapport.length - fall.length} av ${rapport.length} gröna. Mallar med fel: ${[...new Set(fall.map((r) => r.mall))].join(', ') || 'inga'}`)
  if (UT) fs.writeFileSync(path.join(UT, 'sidbrytning.json'), JSON.stringify(rapport, null, 2))
  process.exit(fall.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
