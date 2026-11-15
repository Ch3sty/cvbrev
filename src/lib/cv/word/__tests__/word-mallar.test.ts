/**
 * Word-mallarnas dokumentstruktur (docs/plan-cv-word-2026-11-15.md avsnitt 7).
 *
 * Ägarens krav: filerna ska inte delas upp konstigt i stycken eller brytas
 * konstigt över sidor. Det här testet vaktar de egenskaper i filen som avgör
 * det, i alla sex mallar och tre CV-längder. Själva sidbrytningen i Word
 * granskas med scripts/word-mallar-granska.ts (Word via COM och png).
 */
import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import mammoth from 'mammoth'
import { Packer } from 'docx'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import {
  WORD_MALL_TYPSNITT,
  WORD_TEMPLATE_COUNT,
  WORD_TEMPLATE_COUNT_ORD,
  WORD_TEMPLATE_IDS,
  harWordVersion,
} from '@/lib/cv/template-antal'
import { getFontById } from '@/lib/cv/preview-utils'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { WORD_MALLAR, byggDokument } from '..'
import { hallIhopPunkt, hallIhopRad, rensa, stycken } from '../base'
import { CV_LANGDER } from './fixtures'

async function packa(cv: CVMetadata, id: (typeof WORD_TEMPLATE_IDS)[number], typsnitt?: string) {
  const buf = await Packer.toBuffer(byggDokument(structuredClone(cv), WORD_MALLAR[id], typsnitt))
  const zip = await JSZip.loadAsync(buf)
  const doc = await zip.file('word/document.xml')!.async('string')
  const stilar = await zip.file('word/styles.xml')!.async('string')
  return { buf, doc, stilar }
}

/** Styckena i brödtexten, med tabellerna borttagna. */
function styckenUtanforTabeller(doc: string): string[] {
  const kropp = doc.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, '')
  return kropp.match(/<w:p>[\s\S]*?<\/w:p>|<w:p [\s\S]*?<\/w:p>/g) ?? []
}

/** Stilen i ett styckes egenskaper. */
const stil = (p: string) => p.match(/<w:pStyle w:val="([^"]+)"/)?.[1] ?? ''
const text = (p: string) =>
  (p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? [])
    .map((t) => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
    .join('')

/** Stildefinitionen för ett id i styles.xml. */
function stilDef(stilar: string, id: string): string {
  return stilar.match(new RegExp(`<w:style [^>]*w:styleId="${id}"[\\s\\S]*?</w:style>`))?.[0] ?? ''
}

describe('Word-mallarna, registret', () => {
  it('sex mallar, alla i mallregistret och alla enspaltiga utan foto', () => {
    expect(WORD_TEMPLATE_COUNT).toBe(6)
    expect(WORD_TEMPLATE_COUNT_ORD).toBe('sex')
    for (const id of WORD_TEMPLATE_IDS) {
      const t = SIMPLE_TEMPLATES.find((m) => m.id === id)
      expect(t, id).toBeTruthy()
      expect(t!.features?.columns, id).toBe(1)
      expect(t!.features?.supportsPhoto ?? false, id).toBe(false)
      expect(WORD_MALLAR[id].id).toBe(id)
      expect(harWordVersion(id)).toBe(true)
    }
    expect(harWordVersion('sidebar-icons')).toBe(false)
    expect(harWordVersion(undefined)).toBe(false)
  })

  it('klientens typsnittskarta säger samma typsnitt som Word-filen får', () => {
    for (const id of WORD_TEMPLATE_IDS) {
      expect(getFontById(WORD_MALL_TYPSNITT[id]).name, id).toBe(WORD_MALLAR[id].typsnitt)
    }
  })
})

describe('Word-mallarna, hjälparna', () => {
  it('rensa tar bort HTML, entiteter och tecken som XML inte tål', () => {
    expect(rensa('<b>Ledde</b> &amp; utvecklade&nbsp;team')).toBe('Ledde & utvecklade team')
    expect(rensa('Rad ett\nrad två')).toBe('Rad ett rad två')
    expect(rensa('Fel\u0007tecken\u0000')).toBe('Feltecken')
    expect(rensa(undefined)).toBe('')
  })

  it('stycken delar på tom rad men inte på enkel radbrytning', () => {
    expect(stycken('Ett\nstycke.\n\nAndra stycket.')).toEqual(['Ett stycke.', 'Andra stycket.'])
    expect(stycken('')).toEqual([])
  })

  it('punkterna lämnar aldrig en ensam punkt vid en sidbrytning', () => {
    // Två punkter hålls ihop; i längre listor de två första och de två sista.
    expect([0, 1].map((i) => hallIhopPunkt(i, 2))).toEqual([true, false])
    expect([0, 1, 2, 3, 4].map((i) => hallIhopPunkt(i, 5))).toEqual([true, false, false, true, false])
    // Korta rader (språk, kompetensgrupper) hålls ihop upp till fyra.
    expect([0, 1, 2].map((i) => hallIhopRad(i, 3))).toEqual([true, true, false])
    expect([0, 1, 2, 3, 4, 5].map((i) => hallIhopRad(i, 6))).toEqual([true, false, false, false, true, false])
  })
})

for (const id of WORD_TEMPLATE_IDS) {
  describe(`Word-mallen ${id}`, () => {
    for (const [langd, cv] of Object.entries(CV_LANGDER)) {
      it(`${langd}: riktiga stilar, inga tomma stycken, håll ihop och svenska`, async () => {
        const { buf, doc, stilar } = await packa(cv, id)
        const def = WORD_MALLAR[id]
        const p = styckenUtanforTabeller(doc)

        // Varje stil finns en gång. Två stilar med samma id (docx har egna
        // Heading1 och Heading2) läses olika av Word, LibreOffice och Docs.
        const idn = [...stilar.matchAll(/w:styleId="([^"]+)"/g)].map((m) => m[1])
        expect(idn.filter((x, i) => idn.indexOf(x) !== i)).toEqual([])
        expect(stilDef(stilar, 'Heading2')).toContain(`w:color w:val="${def.rubrik2.farg}"`)

        // A4, svenska och inga sektionsbrytningar utöver dokumentets egen.
        expect(doc).toContain('w:w="11906"')
        expect(doc).toContain('w:h="16838"')
        expect(stilar).toContain('<w:lang w:val="sv-SE"/>')
        expect((doc.match(/<w:sectPr/g) ?? []).length).toBe(1)

        // Inga manuella radbrytningar, textrutor eller bilder.
        expect(doc).not.toMatch(/<w:br\b/)
        expect(doc).not.toMatch(/<w:txbxContent|<w:drawing|<w:pict/)

        // Tabeller bara för Stacks kompetensspalter.
        expect((doc.match(/<w:tbl>/g) ?? []).length).toBe(id === 'stack-developer' ? 1 : 0)

        // Inga tomma stycken för luft, och änke- och horungekontroll i varje stycke.
        for (const s of p) {
          expect(text(s).trim(), `tomt stycke med stilen ${stil(s) || 'Normal'}`).not.toBe('')
          expect(s).toContain('<w:widowControl/>')
        }

        // Namnet är Rubrik 1, en gång.
        expect(p.filter((s) => stil(s) === 'Heading1')).toHaveLength(1)

        // Rubrik 2 håller ihop med nästa stycke och med sina rader, i stilen.
        const h2 = stilDef(stilar, 'Heading2')
        expect(h2).toContain('<w:keepNext/>')
        expect(h2).toContain('<w:keepLines/>')
        expect(stilDef(stilar, 'Posttitel')).toContain('<w:keepNext/>')

        // Posttitlarna: alltid håll ihop rader, perioden högerställd med tabb.
        const poster = p.filter((s) => stil(s) === 'Posttitel')
        expect(poster.length).toBeGreaterThanOrEqual(cv.experience.length)
        for (const s of poster) {
          expect(s).toContain('<w:keepLines/>')
          expect(s).toMatch(/<w:tab w:val="right"/)
        }
        // En arbetsgivare med punkter efter sig hålls ihop med första punkten.
        p.forEach((s, i) => {
          if (stil(s) === 'Arbetsgivare' && p[i + 1] && /<w:numPr>/.test(p[i + 1])) expect(s).toContain('<w:keepNext/>')
        })

        // Punktlistor är riktiga listor, och ingen punkt skrivs som text.
        const punkter = p.filter((s) => /<w:numPr>/.test(s))
        const antal = cv.experience.reduce((n, e) => n + e.description.length, 0)
        expect(punkter.length).toBeGreaterThanOrEqual(antal)
        for (const s of p) expect(text(s)).not.toMatch(/^\s*[•§–-]\s/)

        // Läses tillbaka rätt: rubrikerna i mallens ordning, alla tecken kvar.
        const { value, messages } = await mammoth.extractRawText({ buffer: buf })
        expect(messages).toEqual([])
        const kalla = JSON.stringify(cv)
        for (const t of ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']) if (kalla.includes(t)) expect(value, t).toContain(t)
        expect(value).not.toMatch(/&amp;|&nbsp;|<\/?[a-z]+>/)
        const html = (await mammoth.convertToHtml({ buffer: buf })).value
        const rubriker = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1].replace(/&amp;/g, '&'))
        const ordning = def.sektioner.map((s) => def.rubriker[s])
        const index = rubriker.map((r) => ordning.indexOf(r))
        expect(index.every((i) => i >= 0), rubriker.join(', ')).toBe(true)
        expect([...index].sort((a, b) => a - b)).toEqual(index)
      })
    }

    it('ett CV med bara namn och en tjänst ger inga tomma sektioner', async () => {
      const minsta: CVMetadata = {
        personalInfo: { fullName: 'Ö Ä', email: '' },
        experience: [{ position: 'Lagerarbetare', company: '', startDate: '2024', description: [] }],
        education: [],
        skills: [],
      }
      const { doc } = await packa(minsta, id)
      const p = styckenUtanforTabeller(doc)
      for (const s of p) expect(text(s).trim()).not.toBe('')
      expect(p.filter((s) => stil(s) === 'Heading2').map(text)).toEqual([WORD_MALLAR[id].rubriker.erfarenhet])
    })

    it('användarens Word-typsnitt ersätter mallens', async () => {
      const { stilar } = await packa(CV_LANGDER.kort, id, 'Georgia')
      expect(stilar).toContain('w:ascii="Georgia"')
    })
  })
}

describe('Word-mallarna, referensraden', () => {
  it('stycket före referensraden hålls ihop med den', async () => {
    for (const id of WORD_TEMPLATE_IDS) {
      if (!WORD_MALLAR[id].referenser) continue
      const { doc } = await packa(CV_LANGDER.langt, id)
      const p = styckenUtanforTabeller(doc)
      const i = p.findIndex((s) => stil(s) === 'Referenser')
      expect(i, id).toBeGreaterThan(0)
      expect(p[i - 1], id).toContain('<w:keepNext/>')
    }
  })
})
