/**
 * ATS-spärren för CV-mallarna (docs/plan-mallar-2026-11-15.md avsnitt 6b).
 *
 * Varje mall i registret renderas med tre CV-längder (kort, normalt, långt
 * med foto) genom samma PDF-kedja som nedladdningen (generateSwedishCVPDF:
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
 * står i dokumentet (DOM eller Word), `cv` CV:t som renderades.
 */
export function kontrollera(text: string, rubriker: string[], cv: CVMetadata): string[] {
  const fel: string[] = []
  const t = n(text)

  // (a) rubrikerna finns och står i ordning
  let pos = -1
  for (const r of rubriker) {
    const i = t.indexOf(n(r), pos + 1)
    if (i < 0) {
      fel.push(t.includes(n(r)) ? `rubriken "${r}" står i fel ordning` : `rubriken "${r}" saknas`)
      continue
    }
    pos = i
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
  const { SIMPLE_TEMPLATES } = await import('../src/lib/cv/simple-templates')
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const { generateSwedishCVPDF, closeSwedishCVPDFGenerator } = await import('../src/lib/cv/swedish-cv-pdf-generator')
  const { byggWordCv } = await import('../src/lib/cv/word')
  const { harWordVersion } = await import('../src/lib/cv/template-antal')
  const puppeteer = (await import('puppeteer')).default

  const chrome = await chromeSokvag()
  const browser = await puppeteer.launch({ headless: true, executablePath: chrome })
  const resultat: Resultat[] = []
  const mallar = SIMPLE_TEMPLATES.map((m) => m.id).filter((id) => !BARA || id === BARA)

  for (const id of mallar) {
    const mall = SIMPLE_TEMPLATES.find((m) => m.id === id)!
    for (const [langd, bas] of Object.entries(CV_LANGDER)) {
      const cv: CVMetadata = structuredClone(bas)
      const medFoto = langd === 'langt' && mall.features?.supportsPhoto === true
      if (medFoto) cv.personalInfo.profilePhotoUrl = FOTO
      const html = renderaMallHtml(cv, id, { includePhoto: medFoto })
      if (!html) {
        resultat.push({ mall: id, format: 'pdf', langd, fel: ['mallen saknar generator'] })
        continue
      }

      // Rubrikerna i dokumentordning ur DOM:en (h2 eller [data-sektion]).
      const sida = await browser.newPage()
      await sida.setContent(html, { waitUntil: 'load' })
      const rubriker: string[] = await sida.evaluate(() => {
        const noder = Array.from(document.querySelectorAll<HTMLElement>('[data-sektion-rubrik], h2'))
        const sedda = new Set<string>()
        return noder
          .map((el) => (el.innerText || '').trim())
          .filter((s) => s && s.length < 60 && !sedda.has(s.toLowerCase()) && sedda.add(s.toLowerCase()))
      })
      await sida.close()

      const pdf = await generateSwedishCVPDF(html, cv, {
        template: id,
        format: 'A4',
        margins: { top: '0', right: '0', bottom: '0', left: '0' },
        colorScheme: 'navy',
        swedishSettings: { dateFormat: 'YYYY-MM', phoneFormat: 'international', pageLimit: 4, includePhoto: medFoto },
      } as Parameters<typeof generateSwedishCVPDF>[2])
      if (UT) fs.writeFileSync(path.join(UT, `${id}-${langd}.pdf`), pdf)
      const las = await pdfParse(Buffer.from(pdf), { max: 0 })
      if (UT) fs.writeFileSync(path.join(UT, `${id}-${langd}.txt`), las.text)
      resultat.push({ mall: id, format: 'pdf', langd, fel: kontrollera(las.text, rubriker, cv), sidor: las.numpages })

      if (harWordVersion(id)) {
        const buf = await byggWordCv(cv, id as Parameters<typeof byggWordCv>[1])
        if (UT) fs.writeFileSync(path.join(UT, `${id}-${langd}.docx`), buf)
        const { value } = await mammoth.extractRawText({ buffer: buf })
        const wordHtml = (await mammoth.convertToHtml({ buffer: buf })).value
        const wRubriker = [...wordHtml.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1].replace(/&amp;/g, '&'))
        resultat.push({ mall: id, format: 'docx', langd, fel: kontrollera(value, wRubriker, cv) })
      }
    }
  }
  await browser.close()
  await closeSwedishCVPDFGenerator()

  const fallerade = resultat.filter((r) => r.fel.length)
  for (const r of resultat) {
    const status = r.fel.length ? 'FEL' : 'ok '
    console.log(`${status} ${r.mall.padEnd(20)} ${r.format.padEnd(4)} ${r.langd.padEnd(8)} ${r.sidor ? r.sidor + ' s' : ''}${r.fel.length ? '\n      ' + r.fel.join('\n      ') : ''}`)
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
