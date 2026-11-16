/**
 * Word-filen ur MallDef (mallsystemet A2, plan avsnitt 7): varje mall med
 * word: true i tre CV-längder. Riktiga stilar, inga tomma stycken utanför
 * tabeller, håll ihop, svenska, riktiga punktlistor, och Rubrik 2 i Word är
 * samma rubriker som h2 i HTML:en för samma CV och samma val.
 */
import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import mammoth from 'mammoth'
import { byggWordCv, hallIhopPunkt, hallIhopRad } from '..'
import { MALLAR } from '@/lib/cv/mallar/register'
import { renderDefHtml } from '@/lib/cv/mallar/render/html'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { CV_LANGDER } from './fixtures'

const WORD = MALLAR.filter((m) => m.word)

const FOTO =
  'data:image/svg+xml;base64,' +
  Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#9aa4ae"/></svg>').toString('base64')

async function packa(cv: CVMetadata, id: string, val: MallVal = {}) {
  const buf = await byggWordCv(cv, id, val)
  const zip = await JSZip.loadAsync(buf)
  return {
    buf,
    doc: await zip.file('word/document.xml')!.async('string'),
    stilar: await zip.file('word/styles.xml')!.async('string'),
  }
}

/** Kroppens stycken utanför tabeller (tabellerna, också nästlade, tas bort först). */
function styckenUtanforTabeller(doc: string): string[] {
  // Stycket som Word kräver efter en tabell sist i dokumentet (1 pt) räknas inte.
  let kropp = doc.replace(/(<\/w:tbl>)<w:p>(?:(?!<w:p[ >])[\s\S])*?<\/w:p>(<w:sectPr)/, '$1$2')
  for (let i = 0; i < 5; i++) kropp = kropp.replace(/<w:tbl>(?:(?!<w:tbl>)[\s\S])*?<\/w:tbl>/g, '')
  return allaStycken(kropp)
}
const allaStycken = (doc: string) => [...doc.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map((m) => m[0])
const text = (s: string) => [...s.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('')
const stil = (s: string) => s.match(/<w:pStyle w:val="([^"]+)"/)?.[1] ?? ''
const harBild = (s: string) => /<w:drawing/.test(s)

/** h2-texterna i HTML:en för samma CV och val. */
function htmlRubriker(cv: CVMetadata, def: (typeof MALLAR)[number], val: MallVal): string[] {
  const doc = new DOMParser().parseFromString(renderDefHtml(cv, def, val), 'text/html')
  return Array.from(doc.querySelectorAll('h2')).map((h) => h.textContent ?? '')
}

describe('hjälparna för håll ihop', () => {
  it('punkter: första och näst sista följer med nästa', () => {
    expect([0, 1, 2, 3].map((i) => hallIhopPunkt(i, 4))).toEqual([true, false, true, false])
    expect([0].map((i) => hallIhopPunkt(i, 1))).toEqual([false])
  })
  it('korta rader hålls ihop, långa bryts aldrig med en ensam rad', () => {
    expect([0, 1, 2].map((i) => hallIhopRad(i, 3))).toEqual([true, true, false])
    expect([0, 1, 2, 3, 4, 5].map((i) => hallIhopRad(i, 6))).toEqual([true, false, false, false, true, false])
  })
})

describe('Word-mallarna', () => {
  it('Word-mallarna har ingen egen CSS', () => {
    expect(WORD.length).toBeGreaterThanOrEqual(2)
    for (const d of WORD) expect(d.extraCss).toBeUndefined()
  })
})

for (const def of WORD) {
  describe(`Word-mallen ${def.id}`, () => {
    for (const [langd, bas] of Object.entries(CV_LANGDER)) {
      it(`${langd}: stilar, inga tomma stycken, håll ihop, svenska, rubrikerna som i HTML`, async () => {
        const cv = structuredClone(bas)
        if (def.foto && langd !== 'kort') cv.personalInfo.profilePhotoUrl = FOTO
        const val: MallVal = langd === 'langt' ? { ordning: 'intyg' } : {}
        const { buf, doc, stilar } = await packa(cv, def.id, val)

        // A4, svenska, en sektion, varje stil en gång.
        expect(doc).toContain('w:w="11906"')
        expect(doc).toContain('w:h="16838"')
        expect(stilar).toContain('<w:lang w:val="sv-SE"/>')
        expect((doc.match(/<w:sectPr/g) ?? []).length).toBe(1)
        const idn = [...stilar.matchAll(/w:styleId="([^"]+)"/g)].map((m) => m[1])
        expect(idn.filter((x, i) => idn.indexOf(x) !== i)).toEqual([])

        // Namnet är Rubrik 1, en gång, och första stycket med text.
        const alla = allaStycken(doc)
        expect(alla.filter((s) => stil(s) === 'Heading1')).toHaveLength(1)
        // Remsan (Skylt) står överst med kontakten; namnet är första stycket efter den.
        const forstaText = alla.find((s) => text(s).trim() && !(def.huvud.form === 'remsa' && stil(s) !== 'Heading1' && alla.indexOf(s) < 2))!
        expect(stil(forstaText)).toBe('Heading1')
        expect(text(forstaText)).toBe(cv.personalInfo.fullName)

        // Inga tomma stycken för luft utanför tabeller; änke- och horungekontroll överallt.
        for (const s of styckenUtanforTabeller(doc)) {
          if (!harBild(s)) expect(text(s).trim(), `tomt stycke ${stil(s) || 'Normal'}`).not.toBe('')
        }
        for (const s of alla) if (text(s).trim() || harBild(s)) expect(s).toContain('<w:widowControl/>')

        // Rubrik 2 håller ihop med nästa; posttitlarna med sina rader.
        // (I spaltceller håller en inre tabellrad som inte bryts ihop rubriken och posten.)
        for (const s of styckenUtanforTabeller(doc).filter((x) => stil(x) === 'Heading2')) expect(s).toContain('<w:keepNext/>')
        const poster = alla.filter((s) => stil(s) === 'Posttitel')
        expect(poster.length).toBeGreaterThanOrEqual(cv.experience.length)
        for (const s of poster) expect(s).toContain('<w:keepLines/>')

        // Riktiga punktlistor, inga punkter som text.
        const punkter = alla.filter((s) => /<w:numPr>/.test(s))
        expect(punkter.length).toBeGreaterThanOrEqual(cv.experience.reduce((n, e) => n + e.description.length, 0))
        for (const s of alla) expect(text(s)).not.toMatch(/^\s*[•–-]\s/)

        // Läses tillbaka rätt och rubrikerna är desamma som h2 i HTML:en.
        const { value } = await mammoth.extractRawText({ buffer: buf })
        const kalla = JSON.stringify(cv)
        for (const t of ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']) if (kalla.includes(t)) expect(value, t).toContain(t)
        expect(value).not.toMatch(/&amp;|&nbsp;|<\/?[a-z]+>/)
        const html = (await mammoth.convertToHtml({ buffer: buf })).value
        const wordRubriker = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/^\d{2}\s+/, '').trim())
        expect([...wordRubriker].sort()).toEqual([...htmlRubriker(cv, def, val)].sort())

        // Fotot är en inbäddad bild när mallen har fotoplats och CV:t ett foto.
        // (Korta linjer och tidslinjens punkter är också bilder, med andra namn.)
        if (def.foto && cv.personalInfo.profilePhotoUrl) expect(doc).toMatch(/<wp:docPr[^>]*name="Foto"/)
        else expect(doc).not.toMatch(/<wp:docPr[^>]*name="Foto"/)
      })
    }

    it('användarens Word-typsnitt ersätter brödtexten', async () => {
      const { stilar } = await packa(CV_LANGDER.kort, def.id, { typsnitt: 'georgia' })
      expect(stilar).toContain('w:ascii="Georgia"')
      const { stilar: lato } = await packa(CV_LANGDER.kort, def.id, { typsnitt: 'lato' })
      expect(lato).not.toContain('Lato')
    })

    it('ett CV med bara namn och en tjänst ger inga tomma avsnitt', async () => {
      const minsta: CVMetadata = {
        personalInfo: { fullName: 'Ö Ä', email: '' },
        experience: [{ position: 'Lagerarbetare', company: '', startDate: '2024', description: [] }],
        education: [],
        skills: [],
      }
      const { doc } = await packa(minsta, def.id)
      for (const s of styckenUtanforTabeller(doc)) if (!harBild(s)) expect(text(s).trim()).not.toBe('')
      // Avsnittets nummer (Index) står i rubrikens stycke men hör inte till rubriken.
      const h2 = allaStycken(doc)
        .filter((s) => stil(s) === 'Heading2')
        .map((s) => text(s).replace(/^\d{2}\s+/, '').trim())
      expect([...h2].sort()).toEqual([...htmlRubriker(minsta, def, {})].sort())
    })
  })
}
