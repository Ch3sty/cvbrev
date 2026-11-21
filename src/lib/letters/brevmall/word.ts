/**
 * Brevet som Word-fil i en CV-malls utseende (brevrummet, omgång 1). Bara
 * på servern: drar in docx och sharp.
 *
 * Huvudet byggs med Word-byggarens egna delar (huvudInnehall, bandCell,
 * remsaTabell, stilar i src/lib/cv/word/bygg.ts), så att brevets huvud blir
 * CV-filens. Under huvudet står brevets delar som vanliga stycken i mallens
 * brödtext. Sidospaltsmallarna (Kalksten, Granit, Sand, Ek) får en tabell
 * med spalten och kontakten till sidan och brevet i huvudspalten.
 *
 * Word bryter själv om raderna, så krympsteget väljs med uppskattningen
 * (render.ts, uppskattatSteg) i stället för att mätas.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Header,
  PageBorderDisplay,
  PageBorderOffsetFrom,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableRow,
  TextRun,
  type IBorderOptions,
  type IParagraphOptions,
} from 'docx'
import { los, matt, palett } from '@/lib/cv/mallar/farg'
import type { Dokument, KontaktRad } from '@/lib/cv/mallar/innehall'
import {
  bandCell,
  huvudInnehall,
  huvudStycken,
  iSpaltcell,
  linjerSomBehovs,
  remsaTabell,
  rubrik2,
  skapaLinjer,
  stilar,
  stycke,
  tabell,
  tabellCell,
  wordTypsnitt,
  type WordRuta,
  type WordSammanhang,
} from '@/lib/cv/word/bygg'
import { brevArendeFarg, brevDef, brevMallDef, brevMatt, harKontaktspalt, mallValFor, uppskattatSteg } from './render'
import { arendeRad, avslutsRad, datumRad, halsningsRad, rensadeStycken } from './text'
import type { BrevData, BrevVal } from './typer'

/* Enheterna, som i bygg.ts (små nog att upprepa i stället för att exportera fler namn). */
const TWIP_PER_MM = 56.6929
const mm = (v: number) => Math.round(v * TWIP_PER_MM)
const pt = (v: number) => Math.round(v * 20)
const hp = (v: number) => Math.round(v * 2)
const ord = (h: string) => h.replace('#', '').slice(0, 6).toUpperCase()
const A4 = { bredd: 11906, hojd: 16838 }
const INGEN: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: 'auto' }
const INGA_KANTER = { top: INGEN, bottom: INGEN, left: INGEN, right: INGEN }

/** Word-filens innehållstyp. */
export const BREV_DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function kontaktRader(data: BrevData): KontaktRad[] {
  const a = data.avsandare
  const ut: KontaktRad[] = []
  if (a.epost?.trim()) ut.push({ typ: 'epost', text: a.epost.trim() })
  if (a.telefon?.trim()) ut.push({ typ: 'telefon', text: a.telefon.trim() })
  if (a.ort?.trim()) ut.push({ typ: 'ort', text: a.ort.trim() })
  return ut
}

function huvudDokument(data: BrevData): Dokument {
  const namn = data.avsandare.namn?.trim() ?? ''
  return {
    namn,
    titel: data.avsandare.titel?.trim() ?? '',
    kontakt: kontaktRader(data),
    initial: '',
    fullBredd: [],
    huvudspalt: [],
    sidospalt: [],
    rubriker: {} as Dokument['rubriker'],
    tidsaxel: [],
  }
}

/**
 * Brevet som .docx-buffer i mallen. Bara mallar med Word (katalogens `word`);
 * andra kastar. Okänt id ger Linne, som har Word.
 */
export async function byggBrevDocx(mallId: string, data: BrevData, val: BrevVal = {}): Promise<Buffer> {
  return Packer.toBuffer(await byggBrevDokument(mallId, data, val))
}

/** Brevet som docx-dokument (testerna läser strukturen). */
export async function byggBrevDokument(mallId: string, data: BrevData, val: BrevVal = {}): Promise<Document> {
  const original = brevMallDef(mallId)
  if (!original.word) throw new Error(`Mallen ${original.id} finns inte som Word-fil`)
  const def = brevDef(original)
  const mv = mallValFor(def, val)
  const p = palett(def, mv)
  const m = matt(def, mv)
  const typ = wordTypsnitt(def, mv)
  const linjer = await skapaLinjer(linjerSomBehovs(def, p))
  const marg = { top: mm(m.sida.topp), bottom: mm(m.sida.botten + 0.8), left: mm(m.sida.vanster), right: mm(m.sida.hoger) }
  const textbredd = A4.bredd - marg.left - marg.right
  const b: WordSammanhang = { def, val: mv, p, m, ...typ, linjer, nr: 0, f: (x, reserv) => ord(los(x, p, `#${reserv}`)), textbredd }
  const dok = huvudDokument(data)
  const h = def.huvud
  const l = def.layout
  const band = h.form === 'band' && h.band
  const spalt = harKontaktspalt(def) && l.typ === 'sidospalt' ? l.spalt : null
  const sprak = { value: data.sprak === 'en' ? 'en-GB' : 'sv-SE' }

  // Brödtexten: brevets grad och radavstånd i det steg som uppskattningen säger räcker.
  const bm = brevMatt(def, uppskattatSteg(original, data, val))
  const grad = bm.grad
  const rad = { line: pt(grad * bm.rad), lineRule: 'atLeast' as const }
  const text = ord(p.text)
  const dampad = ord(p.dampad)
  const run = (t: string, extra: Record<string, unknown> = {}) => new TextRun({ text: t, font: b.brod, size: hp(grad), color: text, language: sprak, ...extra })
  const arendeFarg = ord(brevArendeFarg(def, p))

  // Skiljet under huvudet, som i HTML:en.
  const egenGrans = Boolean(h.linjeUnder || h.ram || band || h.form === 'tidningshuvud' || h.form === 'block-vanster')
  const rl = def.rubrik.linje
  const linje = egenGrans ? null : rl && rl.var !== 'vanster' ? rl : { pt: 0.75, farg: 'linje' as const, langd: undefined }
  const linjeKant: IBorderOptions | null = linje
    ? { style: BorderStyle.SINGLE, size: Math.max(4, Math.round(Math.max(0.5, linje.pt) * 8)), color: b.f(linje.farg, ord(p.linje)), space: 0 }
    : null

  const brevStycken = (bredd: number): Paragraph[] => {
    const ut: Paragraph[] = []
    const fore = (v: number) => ({ spacing: { before: v, after: 0, ...rad } })
    let forsta = egenGrans ? mm(band ? 10.5 : 8) : 0
    if (linje && linjeKant) {
      const langd = 'langd' in linje && linje.langd ? mm(linje.langd) : 0
      if (langd) {
        // Kort linje (Terrakotta, Betong): ett lågt stycke med nederkant, smalt med indrag.
        const rest = Math.max(0, bredd - langd)
        const indrag = h.form === 'centrerad' ? { left: Math.round(rest / 2), right: Math.round(rest / 2) } : h.form === 'hoger' ? { left: rest } : { right: rest }
        ut.push(stycke({ spacing: { before: mm(5.5), after: 0, line: 20, lineRule: 'exact' as const }, indent: indrag, border: { bottom: linjeKant }, children: [new TextRun({ text: '', size: 2 })] }))
        forsta = mm(8)
      } else {
        forsta = mm(5.5)
      }
    }
    const datum = datumRad(data)
    const fullLinje = linje && linjeKant && !('langd' in linje && linje.langd)
    // Hel linje: datumets överkant, med luften under linjen som kantens avstånd (högst 31 pt i Word).
    const datumKant = fullLinje ? { border: { top: { ...linjeKant!, space: 22 } } } : {}
    if (datum) ut.push(stycke({ ...fore(forsta), ...datumKant, keepNext: true, children: [run(datum, { color: dampad, size: hp(grad - 1) })] }))
    const foretag = data.mottagare.foretag?.trim()
    const person = data.mottagare.person?.trim()
    if (foretag) ut.push(stycke({ ...fore(datum ? mm(6.5) : forsta), keepNext: true, children: [run(foretag, { bold: true })] }))
    if (person) ut.push(stycke({ ...fore(foretag ? 0 : mm(6.5)), keepNext: true, children: [run(person)] }))
    const arende = arendeRad(data)
    if (arende)
      ut.push(stycke({ ...fore(mm(7.5)), keepNext: true, keepLines: true, children: [run(arende, { font: b.rubrik, bold: true, color: arendeFarg, size: hp(grad + 1) })] }))
    ut.push(stycke({ ...fore(mm(5)), keepNext: true, children: [run(halsningsRad(data))] }))
    for (const s of rensadeStycken(data)) ut.push(stycke({ ...fore(mm(bm.luft)), children: [run(s)] }))
    ut.push(stycke({ ...fore(mm(bm.luft)), keepNext: true, keepLines: true, children: [run(avslutsRad(data.sprak))] }))
    ut.push(stycke({ ...fore(mm(6.5)), keepLines: true, children: [run(data.avsandare.namn ?? '', { bold: true })] }))
    return ut
  }

  const barn: (Paragraph | Table)[] = []
  // Bandet och sidospalten går ut i papperskanten: sida 1 får ingen övre marginal, sidhuvudet bär den på sida 2.
  let kant0 = false

  if (spalt) {
    kant0 = true
    const spaltBredd = mm(spalt.bredd)
    const ytter = spalt.sida === 'vanster' ? marg.left : marg.right
    const inre = mm(spalt.luft.inre)
    const textFarg = spalt.text ? b.f(spalt.text, text) : undefined
    const rSpalt: WordRuta = { bredd: spaltBredd - ytter - inre, iSpalt: true, text: textFarg, grad: m.grad(def.grad.sidospalt ?? def.grad.brod) }
    const huvudBredd = A4.bredd - spaltBredd - mm(spalt.mellanrum) - (spalt.sida === 'vanster' ? marg.right : marg.left)
    const rubrik = data.sprak === 'en' ? 'Contact' : 'Kontakt'
    const kontakt = iSpaltcell(() =>
      dok.kontakt.length
        ? [
            rubrik2({ rubrik }, b, rSpalt, 0),
            ...dok.kontakt.map((k) =>
              stycke({ spacing: { after: pt(1) }, children: [new TextRun({ text: k.text, size: hp(m.grad(def.grad.kontakt)), ...(textFarg ? { color: textFarg } : {}) })] })
            ),
          ]
        : []
    )
    const fill = spalt.bakgrund ? b.f(spalt.bakgrund, ord(p.ton)) : undefined
    const spaltLinje = spalt.linje ? { style: BorderStyle.SINGLE, size: Math.max(2, Math.round(spalt.linje.pt * 8)), color: b.f(spalt.linje.farg, ord(p.accent)), space: 0 } : undefined
    const topp = band ? mm(8) : marg.top
    const sidoCell = tabellCell(kontakt, spaltBredd, {
      ...(fill ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill } } : {}),
      ...(spaltLinje ? { borders: { ...INGA_KANTER, [spalt.sida === 'vanster' ? 'right' : 'left']: spaltLinje } } : {}),
      margins: { top: topp, bottom: 0, left: spalt.sida === 'vanster' ? ytter : inre, right: spalt.sida === 'vanster' ? inre : ytter },
    })
    b.huvudITabell = true
    const huvudet = band ? [] : huvudInnehall(dok, b, huvudBredd)
    const huvudCell = tabellCell([...huvudet, ...brevStycken(huvudBredd)], A4.bredd - spaltBredd, {
      margins: {
        top: topp,
        bottom: 0,
        left: spalt.sida === 'vanster' ? mm(spalt.mellanrum) : marg.left,
        right: spalt.sida === 'vanster' ? marg.right : mm(spalt.mellanrum),
      },
    })
    const kol = spalt.sida === 'vanster' ? [spaltBredd, A4.bredd - spaltBredd] : [A4.bredd - spaltBredd, spaltBredd]
    const rader: TableRow[] = []
    if (band) {
      rader.push(
        new TableRow({
          cantSplit: true,
          ...(h.band!.minHojd ? { height: { value: mm(Math.max(0, h.band!.minHojd - h.band!.luft.topp - h.band!.luft.botten)), rule: 'atLeast' as const } } : {}),
          children: [bandCell(dok, b, A4.bredd, 2)],
        })
      )
    }
    // Spaltraden når bottenmarginalen på sida 1 (bandets höjd dras av ungefär).
    const bandHojd = band ? mm(Math.max(h.band!.minHojd ?? 0, h.band!.luft.topp + h.band!.luft.botten + def.grad.namn * 0.45 + 8)) : 0
    rader.push(
      new TableRow({
        cantSplit: false,
        height: { value: Math.max(0, A4.hojd - marg.bottom - bandHojd - mm(24)), rule: 'atLeast' as const },
        children: spalt.sida === 'vanster' ? [sidoCell, huvudCell] : [huvudCell, sidoCell],
      })
    )
    barn.push(tabell(rader, kol, -marg.left))
  } else {
    if (band) {
      kant0 = true
      barn.push(
        tabell(
          [
            new TableRow({
              cantSplit: true,
              ...(h.band!.minHojd ? { height: { value: mm(Math.max(0, h.band!.minHojd - h.band!.luft.topp - h.band!.luft.botten)), rule: 'atLeast' as const } } : {}),
              children: [bandCell(dok, b, A4.bredd)],
            }),
          ],
          [A4.bredd],
          -marg.left
        )
      )
    } else if (h.form === 'remsa' && h.remsa) {
      kant0 = true
      barn.push(remsaTabell(dok, b), ...huvudStycken(dok, b, AlignmentType.LEFT, undefined, false, false))
    } else {
      barn.push(...huvudInnehall(dok, b, textbredd))
    }
    barn.push(...brevStycken(textbredd))
  }

  if (barn[barn.length - 1] instanceof Table) {
    barn.push(new Paragraph({ spacing: { before: 0, after: 0, line: 2, lineRule: 'exact' }, children: [new TextRun({ text: '', size: 2 })] }))
  }

  const sr = def.sidram
  const sidkant = sr
    ? (() => {
        const k: IBorderOptions = { style: BorderStyle.SINGLE, size: Math.max(2, Math.round(sr.pt * 8)), color: b.f(sr.farg, ord(p.accent)), space: Math.round(sr.avstand * 2.835) }
        return { pageBorders: { display: PageBorderDisplay.ALL_PAGES, offsetFrom: PageBorderOffsetFrom.PAGE }, pageBorderTop: k, pageBorderRight: k, pageBorderBottom: k, pageBorderLeft: k }
      })()
    : undefined

  const namn = data.avsandare.namn?.trim() ?? ''
  const tom = (line: number) =>
    new Header({ children: [stycke({ spacing: { before: 0, after: 0, line, lineRule: 'exact' as const }, children: [new TextRun({ text: ' ', size: 2 })] })] })
  return new Document({
    creator: 'Jobbcoach.ai',
    lastModifiedBy: 'Jobbcoach.ai',
    title: data.sprak === 'en' ? `Cover letter ${namn}`.trim() : `Personligt brev ${namn}`.trim(),
    description: `Personligt brev i mallen ${def.namn}`,
    styles: stilar(b),
    sections: [
      {
        properties: {
          titlePage: kant0,
          page: {
            size: { width: A4.bredd, height: A4.hojd },
            margin: kant0 ? { ...marg, top: 0, header: 0 } : marg,
            ...(sidkant ? { borders: sidkant } : {}),
          },
        },
        ...(kant0 ? { headers: { first: tom(20), default: tom(marg.top) } } : {}),
        children: barn,
      },
    ],
  })
}
