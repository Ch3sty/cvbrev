/**
 * Granskningen av CV:t som Word-fil (docs/plan-cv-word-2026-11-15.md avsnitt 7).
 *
 *  1. Bygger de sex Word-mallarna i tre CV-längder (kort, normalt, långt).
 *  2. Läser varje fil tillbaka med mammoth: rubrikerna i rätt ordning, alla
 *     å/ä/ö, inga HTML-rester, inga varningar.
 *  3. Öppnar varje fil i Word via COM (scripts/word-mallar-render.ps1):
 *     sidor, ensamma rubriker, delade poster, tomma stycken, PDF-export.
 *  4. Ritar varje PDF-sida som png med pdf.js i Chrome, för ögonen.
 *
 * Bilderna hamnar utanför git (feedback om QA-bilder). Kör:
 *   npx tsx scripts/word-mallar-granska.ts <utmapp> [--bara-docx | --bara-png]
 */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import http from 'http'
import { execFileSync } from 'child_process'
import mammoth from 'mammoth'
import { WORD_MALLAR, byggWordCv } from '../src/lib/cv/word'
import { WORD_TEMPLATE_IDS } from '../src/lib/cv/template-antal'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'

const ut = path.resolve(process.argv[2] ?? 'word-qa')
const baraDocx = process.argv.includes('--bara-docx')
// Bara png av PDF:er som redan finns i mappen (t.ex. från LibreOffice).
const baraPng = process.argv.includes('--bara-png')
mkdirSync(ut, { recursive: true })

async function bygg() {
  const fel: string[] = []
  for (const id of WORD_TEMPLATE_IDS) {
    for (const [langd, cv] of Object.entries(CV_LANGDER)) {
      const fil = path.join(ut, `${id}-${langd}.docx`)
      const buf = await byggWordCv(cv, id)
      writeFileSync(fil, buf)
      const { value, messages } = await mammoth.extractRawText({ buffer: buf })
      const html = (await mammoth.convertToHtml({ buffer: buf })).value
      const rubriker = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1].replace(/&amp;/g, '&'))
      const def = WORD_MALLAR[id]
      const problem: string[] = []
      if (messages.length) problem.push(`mammoth-varningar: ${messages.map((m) => m.message).join('; ')}`)
      if (!/<h1>/.test(html)) problem.push('ingen Rubrik 1')
      const kalla = JSON.stringify(cv)
      for (const t of ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']) if (kalla.includes(t) && !value.includes(t)) problem.push(`saknar ${t}`)
      if (/&amp;|&nbsp;|<\/?[a-z]+>/i.test(value)) problem.push('HTML-rester i texten')
      if (!value.includes(cv.personalInfo.fullName)) problem.push('namnet saknas')
      for (const e of cv.experience) if (!value.includes(e.position)) problem.push(`tjänsten saknas: ${e.position}`)
      // Rubrikerna ska komma i mallens ordning.
      const forvantad = def.sektioner.map((s) => def.rubriker[s])
      let senast = -1
      for (const r of rubriker) {
        const i = forvantad.indexOf(r)
        if (i < 0) problem.push(`okänd rubrik ${r}`)
        else if (i < senast) problem.push(`rubriken ${r} i fel ordning`)
        senast = Math.max(senast, i)
      }
      // Stacks spalter: varje grupp läses i sin helhet, rubriken före sina punkter.
      if (id === 'stack-developer') {
        for (const g of cv.skills) {
          const a = value.indexOf(g.category)
          const b = value.indexOf(g.skills[0], a)
          const c = value.indexOf(g.skills[g.skills.length - 1], a)
          if (a < 0 || b < a || c < b) problem.push(`spalten ${g.category} läses i fel ordning`)
        }
      }
      writeFileSync(fil.replace(/\.docx$/, '.txt'), value)
      console.log(`${id}-${langd}: ${buf.length} byte, ${rubriker.length} rubriker${problem.length ? ', PROBLEM: ' + problem.join(' | ') : ', mammoth ok'}`)
      if (problem.length) fel.push(`${id}-${langd}`)
    }
  }
  return fel
}

async function ritaPng() {
  const pdfjs = path.resolve('node_modules/pdfjs-dist/build')
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0])
    let fil: string
    if (url.startsWith('/pdfjs/')) fil = path.join(pdfjs, url.slice(7))
    else if (url === '/') {
      res.setHeader('Content-Type', 'text/html')
      res.end(`<!doctype html><html><body style="margin:0;background:#fff"><canvas id="c"></canvas><script type="module">
        import * as pdfjs from '/pdfjs/pdf.mjs';
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
        window.rita = async (namn, sida) => {
          const doc = await pdfjs.getDocument('/fil/' + namn).promise;
          const p = await doc.getPage(sida);
          const vp = p.getViewport({ scale: 1.5 });
          const c = document.getElementById('c');
          c.width = vp.width; c.height = vp.height;
          await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          return { sidor: doc.numPages, w: vp.width, h: vp.height };
        };
        window.klar = true;
      </script></body></html>`)
      return
    } else fil = path.join(ut, url.replace(/^\/fil\//, ''))
    if (!existsSync(fil)) {
      res.statusCode = 404
      res.end()
      return
    }
    res.setHeader('Content-Type', fil.endsWith('.mjs') ? 'text/javascript' : fil.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream')
    res.end(readFileSync(fil))
  })
  await new Promise<void>((r) => server.listen(0, r))
  const port = (server.address() as { port: number }).port
  const puppeteer = (await import('puppeteer-core')).default
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 900, height: 1300 })
    await page.goto(`http://localhost:${port}/`)
    await page.waitForFunction('window.klar === true')
    for (const pdf of readdirSync(ut).filter((f) => f.endsWith('.pdf')).sort()) {
      let sida = 1
      let sidor = 1
      do {
        const r = (await page.evaluate((n, s) => (window as any).rita(n, s), pdf, sida)) as { sidor: number; w: number; h: number }
        sidor = r.sidor
        const el = await page.$('#c')
        await el!.screenshot({ path: path.join(ut, `${pdf.replace(/\.pdf$/, '')}-s${sida}.png`) as `${string}.png` })
        sida++
      } while (sida <= sidor)
      console.log(`${pdf}: ${sidor} sidor ritade`)
    }
  } finally {
    await browser.close()
    server.close()
  }
}

async function main() {
  if (baraPng) return ritaPng()
  const fel = await bygg()
  if (baraDocx) return
  const ps = path.resolve('scripts/word-mallar-render.ps1')
  console.log(execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps, '-Mapp', ut], { encoding: 'utf8', timeout: 600000 }))
  const rapport = JSON.parse(readFileSync(path.join(ut, 'word-rapport.json'), 'utf8').replace(/^\uFEFF/, '')) as any[]
  for (const r of rapport) {
    const anm: string[] = []
    if (r.ensammaRubriker?.length) anm.push(`ensamma rubriker: ${r.ensammaRubriker.join('; ')}`)
    if (r.deladePoster?.length) anm.push(`delade poster: ${r.deladePoster.join('; ')}`)
    if (r.tommaStycken?.length) anm.push(`tomma stycken: ${r.tommaStycken.length}`)
    if (r.sidor > 1 && r.raderSistaSidan < 3) anm.push(`sista sidan har ${r.raderSistaSidan} rad(er)`)
    if (r.ejSvenska?.length) anm.push(`stycken som inte är svenska: ${r.ejSvenska.length}`)
    console.log(`${r.fil}: ${r.sidor} s, ${r.tabeller} tabeller, ${r.listpunkter} listpunkter, rader sista sidan ${r.raderSistaSidan}${anm.length ? ' | ' + anm.join(' | ') : ' | ren'}`)
  }
  await ritaPng()
  if (fel.length) console.log('mammoth-problem i:', fel.join(', '))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
