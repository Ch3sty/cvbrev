/**
 * Granskningen av Word-mallarna i riktiga Word (plan avsnitt 7, spec
 * avsnitt 2 "Testmatris"):
 *
 *  1. Bygger varje mall med word: true i tre CV-längder (foto där mallen har
 *     fotoplats) och läser filen tillbaka med mammoth: alla å/ä/ö, inga
 *     HTML-rester, Word-rubrikerna = h2 i HTML:en.
 *  2. Renderar samma CV i samma mall som PDF genom nedladdningens kedja
 *     (Chrome), `<mall>-<längd>-chrome.pdf`.
 *  3. Öppnar varje .docx i Word via COM (scripts/word-mallar-render.ps1):
 *     ensamma rubriker, delade poster, tomma stycken, en sida med en rad,
 *     PDF-export `<mall>-<längd>.pdf`.
 *  4. Ritar båda PDF:erna som png och lägger dem sida vid sida,
 *     `<mall>-<längd>-jamforelse.png`: Chrome till vänster, Word till höger,
 *     sida för sida. Art-director granskar dem.
 *
 * Allt hamnar i utmappen, utanför git. Kör:
 *   npx tsx scripts/word-mallar-granska.ts <utmapp> [--mall <id>]
 */
import { mkdirSync, writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import mammoth from 'mammoth'
import type { CVMetadata } from '../src/lib/cv/cv-metadata'
import { CV_LANGDER } from '../src/lib/cv/word/__tests__/fixtures'
import { ritaPdfSidor } from './lib/pdf-verktyg'

const ut = path.resolve(process.argv[2] ?? 'word-qa')
const i = process.argv.indexOf('--mall')
const BARA = i > 0 ? process.argv[i + 1] : undefined
mkdirSync(ut, { recursive: true })

const FOTO =
  'data:image/svg+xml;base64,' +
  Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#9aa4ae"/><circle cx="100" cy="80" r="40" fill="#cfd5db"/><rect x="45" y="130" width="110" height="70" rx="50" fill="#cfd5db"/></svg>').toString('base64')

async function bygg(): Promise<{ filer: string[]; fel: string[] }> {
  const { MALLAR } = await import('../src/lib/cv/mallar/register')
  const { byggWordCv } = await import('../src/lib/cv/word')
  const { renderaMallHtml } = await import('../src/lib/cv/rendera-mall-html')
  const { generateSwedishCVPDF, closeSwedishCVPDFGenerator } = await import('../src/lib/cv/swedish-cv-pdf-generator')
  const fel: string[] = []
  const filer: string[] = []
  for (const def of MALLAR.filter((m) => m.word && (!BARA || m.id === BARA))) {
    for (const [langd, bas] of Object.entries(CV_LANGDER)) {
      const cv: CVMetadata = structuredClone(bas)
      if (def.foto && langd !== 'kort') cv.personalInfo.profilePhotoUrl = FOTO
      const namn = `${def.id}-${langd}`
      const buf = await byggWordCv(cv, def.id)
      writeFileSync(path.join(ut, `${namn}.docx`), buf)
      const html = renderaMallHtml(cv, def.id)!
      const pdf = await generateSwedishCVPDF(html, cv, { template: def.id, format: 'A4', swedishSettings: { pageLimit: 4 } } as Parameters<typeof generateSwedishCVPDF>[2])
      writeFileSync(path.join(ut, `${namn}-chrome.pdf`), pdf)
      filer.push(namn)

      const { value } = await mammoth.extractRawText({ buffer: buf })
      const wordHtml = (await mammoth.convertToHtml({ buffer: buf })).value
      const wRubriker = [...wordHtml.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'))
      const hRubriker = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1].replace(/&amp;/g, '&'))
      const problem: string[] = []
      const kalla = JSON.stringify(cv)
      for (const t of ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']) if (kalla.includes(t) && !value.includes(t)) problem.push(`saknar ${t}`)
      if (/&amp;|&nbsp;|<\/?[a-z]+>/i.test(value)) problem.push('HTML-rester i texten')
      if ([...wRubriker].sort().join('|') !== [...hRubriker].sort().join('|')) problem.push(`rubrikerna skiljer: ${wRubriker.join(', ')} mot ${hRubriker.join(', ')}`)
      console.log(`${namn}: ${buf.length} byte, ${wRubriker.length} rubriker${problem.length ? ', PROBLEM: ' + problem.join(' | ') : ', mammoth ok'}`)
      if (problem.length) fel.push(namn)
    }
  }
  await closeSwedishCVPDFGenerator()
  return { filer, fel }
}

async function jamfor(filer: string[]) {
  const sharp = (await import('sharp')).default
  const pdfer = filer.flatMap((n) => [path.join(ut, `${n}-chrome.pdf`), path.join(ut, `${n}.pdf`)])
  const bilder = await ritaPdfSidor(pdfer, 1)
  for (const n of filer) {
    const chrome = bilder[path.join(ut, `${n}-chrome.pdf`)] ?? []
    const word = bilder[path.join(ut, `${n}.pdf`)] ?? []
    const sidor = Math.max(chrome.length, word.length)
    const B = 595
    const H = 842
    const lager: { input: Buffer; left: number; top: number }[] = []
    for (let s = 0; s < sidor; s++) {
      for (const [k, lista] of [chrome, word].entries()) {
        if (!lista[s]) continue
        const bild = await sharp(lista[s]).resize({ width: B, height: H, fit: 'contain', background: '#ffffff' }).png().toBuffer()
        lager.push({ input: bild, left: k * (B + 16), top: s * (H + 16) })
      }
    }
    await sharp({ create: { width: B * 2 + 16, height: sidor * (H + 16), channels: 3, background: '#9aa0a6' } })
      .composite(lager)
      .png()
      .toFile(path.join(ut, `${n}-jamforelse.png`))
  }
}

async function main() {
  const { filer, fel } = await bygg()
  const ps = path.resolve('scripts/word-mallar-render.ps1')
  console.log(execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps, '-Mapp', ut], { encoding: 'utf8', timeout: 1200000 }))
  const rapport = JSON.parse(readFileSync(path.join(ut, 'word-rapport.json'), 'utf8').replace(/^﻿/, '')) as any[]
  const comFel: string[] = []
  for (const r of rapport) {
    const anm: string[] = []
    if (r.ensammaRubriker?.length) anm.push(`ensamma rubriker: ${r.ensammaRubriker.join('; ')}`)
    if (r.deladePoster?.length) anm.push(`delade poster: ${r.deladePoster.join('; ')}`)
    if (r.tommaStycken?.length) anm.push(`tomma stycken: ${r.tommaStycken.length}`)
    if (r.sidor > 1 && r.raderSistaSidan < 3) anm.push(`sista sidan har ${r.raderSistaSidan} rad(er)`)
    if (r.ejSvenska?.length) anm.push(`stycken som inte är svenska: ${r.ejSvenska.length}`)
    if (anm.length) comFel.push(r.fil)
    console.log(`${anm.length ? 'FEL' : 'ok '} ${r.fil}: ${r.sidor} s, ${r.tabeller} tabeller, ${r.listpunkter} listpunkter${anm.length ? ' | ' + anm.join(' | ') : ''}`)
  }
  await jamfor(filer)
  console.log(`\nJämförelsebilder: ${ut}\\<mall>-<längd>-jamforelse.png`)
  if (fel.length) console.log('mammoth-problem i:', fel.join(', '))
  console.log(`Word COM: ${rapport.length - comFel.length} av ${rapport.length} gröna${comFel.length ? ': fel i ' + comFel.join(', ') : ''}`)
  process.exit(fel.length || comFel.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
