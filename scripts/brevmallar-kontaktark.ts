/**
 * Kontaktarken för brevmallen (brevrummet, omgång 1, byggspecen avsnitt 5):
 * alla 40 mallar med exempelbrevet till Nordanvind Energi, en gång kort
 * (cirka 120 ord) och en gång långt (cirka 350 ord), åtta mallar per bild i
 * full skala, plus Linne, Björk, Koppar och Kalksten bredvid art directorns
 * förlagor och Word-filerna för fem mallar.
 *
 * Ritas med puppeteer direkt från renderBrevHtml, ingen server och ingen
 * databas. Typsnitten bäddas in som i PDF-kedjan.
 *
 *   npx tsx scripts/brevmallar-kontaktark.ts --ut <mapp> [--forlagor <mapp>] [--bara linne,koppar]
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import puppeteer from 'puppeteer'
import { MALLAR } from '../src/lib/cv/mallar/register'
import { baddaInTypsnitt } from '../src/lib/cv/mallar/typsnitt-inbaddning'
import { renderBrevHtml, byggBrevDocx, brevOrd } from '../src/lib/letters/brevmall'
import { exempelBrev, EXEMPEL_KRAV, type ExempelLangd } from '../src/lib/letters/brevmall/exempel'

const arg = (namn: string) => {
  const i = process.argv.indexOf(namn)
  return i > 0 ? process.argv[i + 1] : undefined
}
const UT = path.resolve(arg('--ut') ?? 'tmp/brev-kontaktark')
const FORLAGOR = arg('--forlagor')
const BARA = arg('--bara')?.split(',')
const BREDD = 794
const HOJD = 1123
const ETIKETT = 44

interface Ark {
  id: string
  namn: string
  langd: ExempelLangd
  ord: number
  steg: number
  slutMm: number
  gransMm: number
  sidor: number
  png: Buffer
}

function etikett(text: string, varning: boolean): Buffer {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BREDD}" height="${ETIKETT}"><rect width="100%" height="100%" fill="${varning ? '#7A1F2B' : '#2A1424'}"/><text x="14" y="29" font-family="Arial" font-size="20" font-weight="700" fill="#fff">${esc}</text></svg>`
  )
}

async function rita(page: puppeteer.Page, html: string): Promise<{ png: Buffer; steg: number; slutMm: number; hojdPx: number }> {
  await page.setContent(baddaInTypsnitt(html), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await new Promise((r) => setTimeout(r, 60))
  const m = await page.evaluate(() => {
    const b = document.querySelector('.cv.brev') as HTMLElement
    const s = b.querySelector('.brev-slut') as HTMLElement
    const top = b.getBoundingClientRect().top
    return { steg: Number(b.getAttribute('data-steg')), slutMm: ((s.getBoundingClientRect().top - top) * 25.4) / 96, hojdPx: b.getBoundingClientRect().height }
  })
  const png = (await page.screenshot({ clip: { x: 0, y: 0, width: BREDD, height: HOJD }, type: 'png' })) as Buffer
  return { png: Buffer.from(png), ...m }
}

async function blad(ark: { png: Buffer; text: string; varning: boolean }[], fil: string, kolumner = 4) {
  const rader = Math.ceil(ark.length / kolumner)
  const GAP = 24
  const w = kolumner * BREDD + (kolumner + 1) * GAP
  const h = rader * (HOJD + ETIKETT) + (rader + 1) * GAP
  const delar: sharp.OverlayOptions[] = []
  ark.forEach((a, i) => {
    const x = GAP + (i % kolumner) * (BREDD + GAP)
    const y = GAP + Math.floor(i / kolumner) * (HOJD + ETIKETT + GAP)
    delar.push({ input: etikett(a.text, a.varning), left: x, top: y })
    delar.push({ input: a.png, left: x, top: y + ETIKETT })
  })
  await sharp({ create: { width: w, height: h, channels: 3, background: '#d9d2d6' } }).composite(delar).png().toFile(fil)
  console.log('skrev', fil)
}

async function main() {
  fs.mkdirSync(UT, { recursive: true })
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: BREDD, height: HOJD, deviceScaleFactor: 1 })
  const mallar = MALLAR.filter((m) => !BARA || BARA.includes(m.id))
  const resultat: Ark[] = []
  try {
    for (const langd of ['kort', 'lang'] as const) {
      const data = exempelBrev(langd)
      for (const def of mallar) {
        const r = await rita(page, renderBrevHtml(def.id, data))
        const gransMm = 297 - def.sida.botten
        resultat.push({ id: def.id, namn: def.namn, langd, ord: brevOrd(data), steg: r.steg, slutMm: r.slutMm, gransMm, sidor: r.slutMm > gransMm + 0.5 ? 2 : 1, png: r.png })
      }
    }
    // Kontaktarken: åtta mallar per bild.
    for (const langd of ['kort', 'lang'] as const) {
      const lista = resultat.filter((r) => r.langd === langd)
      for (let i = 0; i < lista.length; i += 8) {
        const del = lista.slice(i, i + 8)
        await blad(
          del.map((a) => ({
            png: a.png,
            text: `${a.namn} · ${a.ord} ord · steg ${a.steg} · slutar ${a.slutMm.toFixed(0)}/${a.gransMm} mm${a.sidor > 1 ? ' · GÅR ÖVER' : ''}`,
            varning: a.sidor > 1,
          })),
          path.join(UT, `kontaktark-${langd}-${String(i / 8 + 1).padStart(2, '0')}.png`)
        )
      }
    }
    // Förlagorna bredvid: art directorns ritade brev och samma brev ur mallen.
    if (FORLAGOR) {
      const par: { png: Buffer; text: string; varning: boolean }[] = []
      for (const id of ['linne', 'bjork', 'koppar', 'kalksten']) {
        const fil = path.join(FORLAGOR, `${id}-nordanvind.png`)
        if (!fs.existsSync(fil)) continue
        const forlaga = await sharp(fil).resize(BREDD, HOJD).png().toBuffer()
        const egen = await rita(page, renderBrevHtml(id, exempelBrev('normal')))
        par.push({ png: forlaga, text: `${id}: förlagan`, varning: false }, { png: egen.png, text: `${id}: brevmallen`, varning: false })
      }
      if (par.length) await blad(par, path.join(UT, 'forlagor-bredvid.png'))
      // Markeringarna och skrivläget, för BrevArk.
      const mark = await rita(page, renderBrevHtml('linne', exempelBrev('normal'), {}, { markeringar: EXEMPEL_KRAV, aktivtStycke: 2 }))
      const skriv = await rita(page, renderBrevHtml('koppar', exempelBrev('normal'), {}, { skriverTill: 2 }))
      const eng = await rita(page, renderBrevHtml('kalksten', { ...exempelBrev('normal'), sprak: 'en', halsning: null }, { typsnitt: 'georgia' }))
      await blad(
        [
          { png: mark.png, text: 'linne: markeringar, aktivt stycke 3', varning: false },
          { png: skriv.png, text: 'koppar: skriver stycke 2', varning: false },
          { png: eng.png, text: 'kalksten: engelska, Georgia', varning: false },
        ],
        path.join(UT, 'lagen.png'),
        3
      )
    }
    // PDF:er som i nedladdningen (utskriftsmedia, sidan ur @page), långa brevet, med antalet sidor.
    if (process.argv.includes('--pdf')) {
      for (const id of ['linne', 'bjork', 'koppar', 'kalksten', 'granit', 'ritning', 'sockel', 'ramverk', 'kant', 'terrakotta']) {
        if (BARA && !BARA.includes(id)) continue
        await page.setContent(baddaInTypsnitt(renderBrevHtml(id, exempelBrev('lang'))), { waitUntil: 'load' })
        await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 30))))
        const pdf = Buffer.from(await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' }, preferCSSPageSize: true }))
        fs.writeFileSync(path.join(UT, `brev-${id}-lang.pdf`), pdf)
        const sidor = (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length
        console.log(`pdf ${id}: ${sidor} sida${sidor > 1 ? 'or' : ''}`)
      }
    }
  } finally {
    await browser.close()
  }

  // Word-filerna.
  if (!process.argv.includes('--utan-word')) {
    for (const id of ['linne', 'bjork', 'koppar', 'kalksten', 'sand', 'granit', 'skylt', 'alm']) {
      if (BARA && !BARA.includes(id)) continue
      const buf = await byggBrevDocx(id, exempelBrev('normal'))
      fs.writeFileSync(path.join(UT, `brev-${id}.docx`), buf)
      console.log('skrev', `brev-${id}.docx`)
    }
  }

  const sammandrag = resultat.map(({ png: _p, ...r }) => ({ ...r, slutMm: Math.round(r.slutMm) }))
  fs.writeFileSync(path.join(UT, 'matt.json'), JSON.stringify(sammandrag, null, 1))
  const over = sammandrag.filter((r) => r.sidor > 1)
  console.log(over.length ? `GÅR ÖVER: ${over.map((r) => `${r.id}/${r.langd}`).join(', ')}` : 'Alla brev ryms på en sida.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
