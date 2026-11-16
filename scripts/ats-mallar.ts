/**
 * ATS-spärren för CV-mallarna (docs/plan-mallar-2026-11-15.md avsnitt 6b).
 *
 * Varje mall i registret (src/lib/cv/mallar) renderas med tre CV-längder
 * (kort, normalt och långt, med foto i mallar med fotoplats) och med
 * ordningsvalen intyg och utbildning först, genom samma PDF-kedja som nedladdningen (generateSwedishCVPDF:
 * A4, printBackground, marginal 0) och läses tillbaka med pdf-parse, samma
 * läsare som CV-uppladdningen. Word-mallarna byggs med byggWordCv och läses
 * med mammoth. Skriptet fallerar om
 *   (a) en rubrik saknas eller står i fel ordning,
 *   (b) ett tecken är trasigt eller å, ä, ö saknas,
 *   (c) namnet inte kommer bland de första 700 tecknen,
 *   (d) ett jobb inte står sammanhållet från arbetsgivare till sista punkten,
 *       eller en annan arbetsgivare hamnar inne i posten.
 *
 * Kör: npm run test:ats [-- --mall <id>] [--ut <mapp>]   (PDF:erna sparas bara
 * med --ut, aldrig i git).
 *
 * Lokalt används Chrome från puppeteer-cachen eller systemets Chrome.
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import mammoth from 'mammoth'
import type { CVMetadata } from '../src/lib/cv/cv-metadata'
import type { MallVal } from '../src/lib/cv/mallar/kontrakt'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'

const require_ = createRequire(import.meta.url)
// pdf-parse:s index läser en testfil vid import; själva läsaren ligger i lib.
const pdfParse = require_('pdf-parse/lib/pdf-parse.js') as (b: Buffer, o?: object) => Promise<{ text: string; numpages: number }>

const arg = (namn: string) => {
  const i = process.argv.indexOf(namn)
  return i > 0 ? process.argv[i + 1] : undefined
}
const BARA = arg('--mall')
const UT = arg('--ut')
if (UT) fs.mkdirSync(UT, { recursive: true })

/** Ett litet foto (grå ruta) som data-URL, för mallar med fotoplats. */
const FOTO =
  'data:image/svg+xml;base64,' +
  Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#9aa4ae"/></svg>').toString('base64')

// Ett ord som radbryts vid sitt bindestreck ("IT-" + "direktör") läses som ett ord.
const n = (s: string) => s.normalize('NFC').replace(/-\s+/g, '-').replace(/\s+/g, ' ').toLowerCase()

interface Resultat {
  mall: string
  format: 'pdf' | 'docx'
  langd: string
  fel: string[]
  sidor?: number
}

/**
 * Kontrollerna på utläst text. `rubriker` är rubrikerna i den ordning de
 * står i dokumentet (DOM eller Word), en lista per spalt: i en tvåspaltig
 * mall läses spalterna var för sig, och ordningen gäller inom spalten.
 * `cv` är CV:t som renderades.
 */
export function kontrollera(text: string, rubriker: string[] | string[][], cv: CVMetadata): string[] {
  const fel: string[] = []
  const t = n(text)

  // (a) rubrikerna finns och står i ordning inom sin spalt
  const grupper = (Array.isArray(rubriker[0]) ? rubriker : [rubriker]) as string[][]
  for (const grupp of grupper) {
    let pos = -1
    for (const r of grupp) {
      const i = t.indexOf(n(r), pos + 1)
      if (i < 0) {
        fel.push(t.includes(n(r)) ? `rubriken "${r}" står i fel ordning` : `rubriken "${r}" saknas`)
        continue
      }
      pos = i
    }
  }

  // (b) tecknen
  if (/\uFFFD/.test(text) || /[\u0300-\u036f]/.test(text)) fel.push('trasiga tecken i texten')
  const kalla = JSON.stringify(cv).normalize('NFC')
  for (const tkn of ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']) {
    if (kalla.includes(tkn) && !text.normalize('NFC').includes(tkn)) fel.push(`tecknet ${tkn} saknas`)
  }

  // (c) namnet tidigt
  const iNamn = t.indexOf(n(cv.personalInfo.fullName))
  if (iNamn < 0) fel.push('namnet saknas')
  else if (iNamn > 700) fel.push(`namnet kommer efter ${iNamn} tecken`)

  // (d) varje jobb sammanhållet
  const jobb = cv.experience ?? []
  for (let j = 0; j < jobb.length; j++) {
    const post = jobb[j]
    const punkter = Array.isArray(post.description) ? post.description : post.description ? [post.description] : []
    if (!punkter.length) continue
    const forsta = t.indexOf(n(punkter[0]))
    const sista = t.indexOf(n(punkter[punkter.length - 1]))
    if (forsta < 0 || sista < 0) {
      fel.push(`jobb ${j + 1}: en punkt saknas eller är bruten`)
      continue
    }
    const start = t.lastIndexOf(n(post.company), forsta)
    if (start < 0) {
      fel.push(`jobb ${j + 1}: punkterna står före sin arbetsgivare`)
      continue
    }
    const block = t.slice(start + n(post.company).length, sista)
    const andra = jobb
      .filter((_, k) => k !== j)
      .map((x) => n(x.company))
      .filter((x) => x && block.includes(x))
    if (andra.length) fel.push(`jobb ${j + 1}: ${andra.join(', ')} hamnar inne i posten`)
    for (const p of punkter) if (!t.includes(n(p))) fel.push(`jobb ${j + 1}: punkten "${p.slice(0, 30)}" är bruten`)
    // Kompetenser eller språk får inte stå mellan arbetsgivaren och sista
    // punkten (ord som också står i jobbets egen text räknas inte).
    const egen = n([post.position, post.company, post.location ?? '', ...punkter].join(' '))
    const frammande = [
      ...(cv.skills ?? []).flatMap((g) => (typeof g === 'string' ? [g] : g.skills ?? [])).slice(0, 6),
      ...(cv.languages ?? []).map((l) => (typeof l === 'string' ? l : l.language)),
    ]
      .map((x) => n(String(x)))
      .filter((x) => x.length > 4 && !egen.includes(x) && block.includes(x))
    if (frammande.length) fel.push(`jobb ${j + 1}: annat innehåll inne i posten (${frammande.slice(0, 3).join(', ')})`)
  }
  return [...new Set(fel)]
}

async function chromeSokvag(): Promise<string | undefined> {
  try {
    const p = (require_('puppeteer') as { executablePath: () => string }).executablePath()
    if (fs.existsSync(p)) return p
  } catch {
    /* faller till systemets Chrome */
  }
  const sys = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  return fs.existsSync(sys) ? sys : undefined
}

async function main() {
  const { MALLAR } = await import('../src/lib/cv/mallar/register')
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const { generateSwedishCVPDF, closeSwedishCVPDFGenerator } = await import('../src/lib/cv/swedish-cv-pdf-generator')
  const { byggWordCv } = await import('../src/lib/cv/word')
  const puppeteer = (await import('puppeteer')).default

  const chrome = await chromeSokvag()
  const browser = await puppeteer.launch({ headless: true, executablePath: chrome })
  const resultat: Resultat[] = []
  const mallar = MALLAR.filter((m) => !BARA || BARA.split(",").includes(m.id))

  // Tre längder i standardordning, plus normalt CV med intyg och utbildning först.
  const fall: { namn: string; cv: CVMetadata; val: MallVal }[] = [
    { namn: 'kort', cv: CV_LANGDER.kort, val: {} },
    { namn: 'normalt', cv: CV_LANGDER.normalt, val: {} },
    { namn: 'langt', cv: CV_LANGDER.langt, val: {} },
    { namn: 'intyg', cv: CV_LANGDER.normalt, val: { ordning: 'intyg' } },
    { namn: 'utbildning', cv: CV_LANGDER.langt, val: { ordning: 'utbildning' } },
  ]

  for (const def of mallar) {
    for (const f of fall) {
      const cv: CVMetadata = structuredClone(f.cv)
      if (def.foto && f.namn !== 'kort') cv.personalInfo.profilePhotoUrl = FOTO
      const html = renderaMallHtml(cv, def.id, f.val)
      if (!html) {
        resultat.push({ mall: def.id, format: 'pdf', langd: f.namn, fel: ['mallen renderas inte'] })
        continue
      }

      // Rubrikerna i dokumentordning ur DOM:en.
      const sida = await browser.newPage()
      await sida.setContent(html, { waitUntil: 'load' })
      // Rubrikerna per spalt i dokumentordning (huvud och full bredd räknas till huvudspalten).
      const spalter: { huvud: string[]; sido: string[] } = await sida.evaluate(() => {
        const ut = { huvud: [] as string[], sido: [] as string[] }
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('h2'))) {
          const sido = Boolean(el.closest('.spalt-sido'))
          ;(sido ? ut.sido : ut.huvud).push((el.textContent || '').trim())
        }
        return ut
      })
      const rubriker = [...spalter.huvud, ...spalter.sido]
      await sida.close()

      const pdf = await generateSwedishCVPDF(html, cv, {
        template: def.id,
        format: 'A4',
        margins: { top: '0', right: '0', bottom: '0', left: '0' },
        colorScheme: 'navy',
        swedishSettings: { dateFormat: 'YYYY-MM', phoneFormat: 'international', pageLimit: 4, includePhoto: Boolean(def.foto) },
      } as Parameters<typeof generateSwedishCVPDF>[2])
      if (UT) fs.writeFileSync(path.join(UT, `${def.id}-${f.namn}.pdf`), pdf)
      const las = await pdfParse(Buffer.from(pdf), { max: 0 })
      if (UT) fs.writeFileSync(path.join(UT, `${def.id}-${f.namn}.txt`), las.text)
      resultat.push({ mall: def.id, format: 'pdf', langd: f.namn, fel: kontrollera(las.text, [spalter.huvud, spalter.sido], cv), sidor: las.numpages })

      if (def.word) {
        const buf = await byggWordCv(cv, def.id, f.val)
        if (UT) fs.writeFileSync(path.join(UT, `${def.id}-${f.namn}.docx`), buf)
        const { value } = await mammoth.extractRawText({ buffer: buf })
        const wordHtml = (await mammoth.convertToHtml({ buffer: buf })).value
        const wRubriker = [...wordHtml.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/^\d{2}\s+/, '').trim())
        const fel = kontrollera(value, [wRubriker.filter((r) => spalter.huvud.includes(r)), wRubriker.filter((r) => !spalter.huvud.includes(r))], cv)
        // Word-rubrikerna är samma som HTML:ens (samma CV, samma val).
        const a = [...wRubriker].sort().join(' | ')
        const b = [...rubriker].sort().join(' | ')
        if (a !== b) fel.push(`Word-rubrikerna skiljer från HTML: ${a} mot ${b}`)
        resultat.push({ mall: def.id, format: 'docx', langd: f.namn, fel })
      }
    }
  }
  await browser.close()
  await closeSwedishCVPDFGenerator()

  const fallerade = resultat.filter((r) => r.fel.length)
  for (const r of resultat) {
    const status = r.fel.length ? 'FEL' : 'ok '
    console.log(`${status} ${r.mall.padEnd(12)} ${r.format.padEnd(4)} ${r.langd.padEnd(10)} ${r.sidor ? r.sidor + ' s' : ''}${r.fel.length ? '\n      ' + r.fel.join('\n      ') : ''}`)
  }
  const mallarMedFel = [...new Set(fallerade.map((r) => r.mall))]
  console.log(`\n${resultat.length - fallerade.length} av ${resultat.length} gröna. Mallar med fel: ${mallarMedFel.length ? mallarMedFel.join(', ') : 'inga'}`)
  if (UT) fs.writeFileSync(path.join(UT, 'ats-resultat.json'), JSON.stringify(resultat, null, 2))
  process.exit(fallerade.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
