/**
 * CV:t som riktig Word-fil, ur samma MallDef och samma Dokument som PDF:en
 * (docs/plan-mallar-2026-11-15.md avsnitt 3.4, spec mallar-utbud avsnitt 2
 * "Word, så att det blir likadant").
 *
 * Words egna medel, i alla mallar:
 *  - riktiga stilar: Rubrik 1 för namnet (första stycket i dokumentet),
 *    Rubrik 2 för avsnitten (samma text som h2 i HTML:en), Yrkestitel,
 *    Kontakt, Posttitel med högerställt tabbstopp, Arbetsgivare,
 *  - riktiga punktlistor via numrering, linjer som styckekanter, band och
 *    spalter som tabeller utan kanter med cellbakgrund, foto som ImageRun
 *    (runt foto förbeskuret till png med genomskinliga hörn),
 *  - sidbrytningen: rubriker, posttitlar och arbetsgivare hålls ihop med
 *    nästa, inga punkter bryts mitt i, en post hålls ihop, tabellrader med en
 *    post bryts aldrig, änke- och horungekontroll i varje stycke,
 *  - inga tomma stycken för luft (bara där formatet kräver ett stycke i en
 *    tom cell), svenska (sv-SE), A4.
 *
 * Huvudband som går ut i papperskanten (Koppar, Granit): sidans övre
 * marginal är noll och sidhuvudet på sida 2 och framåt bär marginalen, så
 * att bandet ligger i kanten på sida 1 och texten får luft på resten.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Paragraph,
  ShadingType,
  Tab,
  TabStopType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type IBorderOptions,
  type IParagraphOptions,
  type IRunOptions,
} from 'docx'
import { getFontNameForDocx } from '@/lib/documents/typsnitt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { los, matt, palett, typsnittFor, WORD_TYPSNITT, type Matt, type Palett } from '@/lib/cv/mallar/farg'
import { byggDokument, intygDetalj, kompetensForm, visaFoto, type Avsnitt, type Dokument, type Post } from '@/lib/cv/mallar/innehall'
import type { Farg, Linje, MallDef, TextStil } from '@/lib/cv/mallar/typer'

/* ------------------------------------------------------------- enheter */

const TWIP_PER_MM = 56.6929
const mm = (v: number) => Math.round(v * TWIP_PER_MM)
/** Punkter till tjugondelar (styckeavstånd). */
const pt = (v: number) => Math.round(v * 20)
/** Punkter till halvpunkter (teckenstorlek). */
const hp = (v: number) => Math.round(v * 2)
/** mm till bildpunkter (96 dpi) för ImageRun. */
const px = (v: number) => Math.round((v * 96) / 25.4)

const A4 = { bredd: 11906, hojd: 16838 }
const SPRAK = { value: 'sv-SE' }
const INGEN: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: 'auto' }
const INGA_KANTER = { top: INGEN, bottom: INGEN, left: INGEN, right: INGEN }
const INGA_TABELLKANTER = { ...INGA_KANTER, insideHorizontal: INGEN, insideVertical: INGEN }

/** Hex utan # och utan genomskinlighet, som Word vill ha den. */
const ord = (h: string) => h.replace('#', '').slice(0, 6).toUpperCase()

/* -------------------------------------------------------------- sammanhang */

interface B {
  def: MallDef
  val: MallVal
  p: Palett
  m: Matt
  brod: string
  rubrik: string
  /** En Farg som Word-hex. */
  f: (x: Farg | undefined, reserv: string) => string
  /** Bilden till fotot (png), när fotot ska med. */
  foto?: Buffer
  /** Textbredden på sidan, twips. */
  textbredd: number
}

/** Textens färg och grad i en container (sidospalten har egen). */
interface Ruta {
  bredd: number
  iSpalt: boolean
  /** Textfärg i containern (sidospalt med mörk bakgrund). */
  text?: string
  /** Brödtextens grad i containern. */
  grad: number
}

/* ------------------------------------------------------------- byggstenar */

/** Varje stycke: änke- och horungekontroll alltid på. */
function stycke(opts: IParagraphOptions): Paragraph {
  return new Paragraph({ widowControl: true, ...opts })
}

const kant = (l: Linje, b: B, reserv: string, space = 4): IBorderOptions => ({
  style: BorderStyle.SINGLE,
  size: Math.max(2, Math.round(l.pt * 8)),
  color: b.f(l.farg, reserv),
  space,
})

function stilRun(t: TextStil | undefined, b: B, reservFarg: string): IRunOptions {
  return {
    ...(t?.vikt ? { bold: t.vikt >= 600 } : {}),
    ...(t?.versaler ? { allCaps: true } : {}),
    ...(t?.kursiv ? { italics: true } : {}),
    ...(t?.sparrning ? { characterSpacing: Math.round(t.sparrning * 20 * 10) } : {}),
    color: b.f(t?.farg, reservFarg),
  }
}

/**
 * Punkterna i en post: listan får brytas mellan punkter, men aldrig så att
 * en ensam punkt blir kvar. Första punkten följer med arbetsgivaren och
 * nästa punkt, och de två sista punkterna står alltid på samma sida.
 */
export function hallIhopPunkt(i: number, antal: number): boolean {
  return (i === 0 && antal >= 2) || i === antal - 2
}

/**
 * Korta rader (språk, kompetensgrupper, certifieringar): upp till fyra rader
 * hålls ihop som ett block, längre listor får brytas men aldrig med en ensam
 * rad före eller efter brytningen.
 */
export function hallIhopRad(i: number, antal: number): boolean {
  if (antal <= 4) return i < antal - 1
  return i === 0 || i === antal - 2
}

function textRun(text: string, r: Ruta, extra: IRunOptions = {}): TextRun {
  return new TextRun({ text, ...(r.text ? { color: r.text } : {}), ...extra })
}

function rubrik2(a: Avsnitt | { rubrik: string }, b: B, r: Ruta, fore: number): Paragraph {
  const d = b.def
  const R = d.rubrik
  const s = d.layout.typ === 'sidospalt' && r.iSpalt ? d.layout.spalt.rubrik : undefined
  const stil: TextStil = { vikt: 700, ...R, ...(s ?? {}) }
  const linje = r.iSpalt && s ? (s.linje ? { ...s.linje, var: 'under' as const } : undefined) : R.linje
  const border: Record<string, IBorderOptions> = {}
  if (linje && !('langd' in linje && linje.langd)) {
    const k = kant(linje, b, ord(b.p.linje), Math.round(linje.luft * 2.83))
    if (linje.var === 'under') border.bottom = k
    else if (linje.var === 'over') border.top = k
    else border.left = k
  }
  const band = !r.iSpalt ? R.band : undefined
  const indrag = !r.iSpalt && R.indrag ? { firstLine: mm(R.indrag) } : undefined
  return stycke({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    keepLines: true,
    alignment: !r.iSpalt && R.justering === 'centrerad' ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: fore, after: mm(R.luftUnder) },
    ...(Object.keys(border).length ? { border } : {}),
    ...(band
      ? {
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: b.f(band.bakgrund, ord(b.p.ton)) },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.lodratt * 2.83) },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.lodratt * 2.83) },
            left: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.sidor * 2.83) },
            right: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.sidor * 2.83) },
          },
        }
      : {}),
    ...(linje?.var === 'vanster' ? { indent: { left: mm(linje.luft) } } : {}),
    ...(indrag ? { indent: indrag } : {}),
    children: [
      new TextRun({
        text: a.rubrik,
        font: b.rubrik,
        size: hp(b.m.grad(s?.pt ?? d.grad.rubrik)),
        ...stilRun(stil, b, ord(b.p.accent)),
      }),
    ],
  })
}

/** Posttiteln: titeln och perioden högerställd med tabbstopp vid containerns kant. */
function posttitel(p: Post, b: B, r: Ruta, hallIhop: boolean): Paragraph {
  const d = b.def
  return stycke({
    style: 'Posttitel',
    keepNext: hallIhop,
    keepLines: true,
    tabStops: [{ type: TabStopType.RIGHT, position: r.bredd }],
    children: [
      textRun(p.titel, r, { color: r.text ?? b.f(d.farger.posttitel, ord(b.p.text)), size: hp(b.m.grad(d.grad.posttitel)) }),
      ...(p.period
        ? [
            new TextRun({
              children: [new Tab(), p.period],
              bold: Boolean(d.post.periodFet),
              italics: Boolean(d.post.periodKursiv),
              size: hp(b.m.grad(d.grad.period)),
              color: r.text ?? b.f(d.farger.period, ord(b.p.dampad)),
            }),
          ]
        : []),
    ],
  })
}

function punkt(text: string, r: Ruta, hallIhop: boolean, ref = 'punkter'): Paragraph {
  return stycke({
    numbering: { reference: ref, level: 0 },
    keepLines: true,
    keepNext: hallIhop,
    spacing: { after: mm(0.6) },
    children: [textRun(text, r, { size: hp(r.grad) })],
  })
}

/** En post: titel, arbetsgivare, text och punkter, hållna ihop. */
function postStycken(p: Post, b: B, r: Ruta, medTitel = true): Paragraph[] {
  const d = b.def
  const ut: Paragraph[] = []
  const efterTitel = Boolean(p.under) || p.text.length > 0 || p.punkter.length > 0
  if (medTitel) ut.push(posttitel(p, b, r, efterTitel))
  if (p.under)
    ut.push(
      stycke({
        style: 'Arbetsgivare',
        keepNext: p.text.length > 0 || p.punkter.length > 0,
        keepLines: true,
        children: [textRun(p.under, r, { ...stilRun(d.post.arbetsgivare, b, ord(b.p.dampad)), ...(r.text ? { color: r.text } : {}), size: hp(r.grad) })],
      })
    )
  p.text.forEach((t, i) =>
    ut.push(
      stycke({
        keepNext: i < p.text.length - 1 || p.punkter.length > 0,
        keepLines: true,
        spacing: { before: mm(0.8), after: 0 },
        children: [textRun(t, r, { color: r.text ?? ord(b.p.dampad), size: hp(r.grad) })],
      })
    )
  )
  // En post hålls ihop i sin helhet (som break-inside: avoid i PDF:en).
  p.punkter.forEach((t, i) => ut.push(punkt(t, r, i < p.punkter.length - 1)))
  return ut
}

/** Ett stycke med vänsterkant och tonad bakgrund för intygsfältet. */
function falt(b: B, opts: IParagraphOptions): IParagraphOptions {
  if (b.def.layout.typ !== 'sidospalt' || !b.def.layout.spalt.intygsfalt) return opts
  const fl = b.def.layout.spalt.intygsfalt
  const k = kant(fl.kant, b, ord(b.p.linje), Math.round(fl.luft * 2.83))
  return {
    ...opts,
    border: { top: k, bottom: k, left: k, right: k },
    ...(fl.bakgrund ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill: b.f(fl.bakgrund, 'FFFFFF') } } : {}),
    indent: { left: mm(fl.luft), right: mm(fl.luft) },
  }
}

/* ---------------------------------------------------------------- avsnitt */

const tabellCell = (children: (Paragraph | Table)[], bredd: number, extra: Partial<ConstructorParameters<typeof TableCell>[0]> = {}) =>
  new TableCell({
    width: { size: bredd, type: WidthType.DXA },
    borders: INGA_KANTER,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    // En tom cell måste ha ett stycke enligt formatet; det fyller ingen höjd.
    children: children.length ? children : [stycke({ spacing: { after: 0 }, children: [] })],
    ...extra,
  })

function marginalBredd(def: MallDef): number | null {
  const l = def.layout
  return l.typ === 'marginalrubrik' || l.typ === 'marginalperiod' ? l.bredd : null
}

function tabell(rader: TableRow[], kolumner: number[], indrag = 0): Table {
  return new Table({
    width: { size: kolumner.reduce((a, c) => a + c, 0), type: WidthType.DXA },
    columnWidths: kolumner,
    layout: TableLayoutType.FIXED,
    borders: INGA_TABELLKANTER,
    ...(indrag ? { indent: { size: indrag, type: WidthType.DXA } } : {}),
    rows: rader,
  })
}

/** Innehållet i ett avsnitt (utan rubrik), som block. Varje block är en post eller en rad. */
function block(a: Avsnitt, b: B, r: Ruta): (Paragraph | Table)[][] {
  const d = b.def
  const inn = a.innehall
  const liten = hp(b.m.grad(d.grad.period))
  const dampad = r.text ?? ord(b.p.dampad)
  switch (inn.typ) {
    case 'text':
      return inn.stycken.map((t) => [stycke({ keepLines: true, spacing: { after: pt(4) }, children: [textRun(t, r, { size: hp(r.grad), ...(a.sektion === 'referenser' ? { color: dampad } : {}) })] })])
    case 'poster':
      return inn.poster.map((p) => postStycken(p, b, r))
    case 'lista':
      if (r.iSpalt) return [inn.rader.map((t, i) => punkt(t, r, hallIhopRad(i, inn.rader.length)))]
      return [[stycke({ keepLines: true, children: inn.rader.flatMap((t, i) => [...(i ? [textRun(' · ', r, { color: dampad })] : []), textRun(t, r, { size: hp(r.grad) })]) })]]
    case 'intyg': {
      const form = r.iSpalt ? 'lista' : d.intyg
      return [
        inn.rader.map((x, i) => {
          const ihop = hallIhopRad(i, inn.rader.length)
          if (form === 'lista')
            return stycke(
              falt(b, {
                keepNext: ihop,
                keepLines: true,
                spacing: { after: pt(4) },
                children: [
                  textRun(x.namn, r, { size: hp(r.grad) }),
                  ...(intygDetalj(x) ? [textRun(intygDetalj(x, ', '), r, { break: 1, size: liten, color: dampad })] : []),
                ],
              })
            )
          return stycke({
            keepNext: ihop,
            keepLines: true,
            spacing: { after: pt(2) },
            tabStops: [{ type: TabStopType.RIGHT, position: r.bredd }],
            children: [textRun(x.namn, r, { size: hp(r.grad) }), ...(intygDetalj(x) ? [new TextRun({ children: [new Tab(), intygDetalj(x)], size: liten, color: dampad })] : [])],
          })
        }),
      ]
    }
    case 'sprak': {
      const form = r.iSpalt ? 'lista' : d.sprak
      if (form === 'rad')
        return [[stycke({ keepLines: true, children: inn.rader.flatMap((x, i) => [...(i ? [textRun(' · ', r, { color: dampad })] : []), textRun(x.sprak, r, { bold: true }), ...(x.niva ? [textRun(` ${x.niva}`, r)] : [])]) })]]
      return [
        inn.rader.map((x, i) =>
          stycke({
            keepNext: hallIhopRad(i, inn.rader.length),
            keepLines: true,
            spacing: { after: pt(2) },
            tabStops: [{ type: TabStopType.RIGHT, position: r.bredd }],
            children: [textRun(x.sprak, r, { size: hp(r.grad) }), ...(x.niva ? [new TextRun({ children: [new Tab(), x.niva], bold: true, size: hp(r.grad), ...(r.text ? { color: r.text } : {}) })] : [])],
          })
        ),
      ]
    }
    case 'kompetenser': {
      const form = kompetensForm(d, r.iSpalt)
      const grupper = inn.grupper
      if (form === 'grupp')
        return grupper.map((g, i) => [
          stycke({
            keepLines: true,
            keepNext: hallIhopRad(i, grupper.length),
            spacing: { after: pt(4) },
            children: [...(g.namn ? [textRun(`${g.namn}: `, r, { bold: true, size: hp(r.grad) })] : []), textRun(g.lista.join(', '), r, { size: hp(r.grad) })],
          }),
        ])
      if (form === 'mittpunkt')
        return grupper.map((g) => [
          ...(g.namn ? [stycke({ keepNext: true, keepLines: true, spacing: { after: pt(1) }, children: [textRun(g.namn, r, { bold: true, size: hp(r.grad) })] })] : []),
          // Varje kompetens är en egen run, så att läsaren får dem som egna ord.
          stycke({ keepLines: true, spacing: { after: pt(4) }, children: g.lista.flatMap((s, i) => [...(i ? [textRun(' · ', r, { color: dampad })] : []), textRun(s, r, { size: hp(r.grad) })]) }),
        ])
      if (form === 'lista')
        return grupper.map((g) => [
          ...(g.namn ? [stycke({ keepNext: true, keepLines: true, spacing: { before: pt(3), after: pt(1) }, children: [textRun(g.namn, r, { bold: true, size: hp(r.grad) })] })] : []),
          ...g.lista.map((s, i) => punkt(s, r, hallIhopRad(i, g.lista.length))),
        ])
      if (form === 'marginal') return grupper.map((g) => [stycke({ children: [textRun(g.namn, r, { bold: true })] }), stycke({ children: [textRun(g.lista.join(', '), r)] })])
      // Spalter: tabell utan kanter, två grupper i bredd, raden bryts aldrig.
      const halv = Math.floor(r.bredd / 2)
      const rader: TableRow[] = []
      for (let i = 0; i < grupper.length; i += 2) {
        const par = grupper.slice(i, i + 2)
        rader.push(
          new TableRow({
            cantSplit: true,
            children: [0, 1].map((k) => {
              const g = par[k]
              return tabellCell(
                g
                  ? [
                      ...(g.namn ? [stycke({ keepNext: true, keepLines: true, spacing: { after: pt(1) }, children: [textRun(g.namn, r, { bold: true, size: hp(r.grad) })] })] : []),
                      ...g.lista.map((s) => punkt(s, r, false)),
                    ]
                  : [],
                halv,
                { margins: { top: 0, bottom: pt(4), left: 0, right: k === 0 ? mm(6) : 0 } }
              )
            }),
          })
        )
      }
      return [[tabell(rader, [halv, halv])]]
    }
  }
}

/** Ett avsnitt i en vanlig spalt: rubrik och block. `fore` är luften före rubriken, twips. */
function avsnitt(a: Avsnitt, b: B, r: Ruta, fore: number): (Paragraph | Table)[] {
  const delar = block(a, b, r)
  const d = b.def
  const intygsfalt = r.iSpalt && a.sektion === 'intyg' && d.layout.typ === 'sidospalt' && d.layout.spalt.intygsfalt
  const spaltRubrik = d.layout.typ === 'sidospalt' ? d.layout.spalt.rubrik : undefined
  const rubrik = intygsfalt
    ? stycke(
        falt(b, {
          heading: HeadingLevel.HEADING_2,
          keepNext: true,
          keepLines: true,
          spacing: { before: fore, after: pt(3) },
          children: [
            new TextRun({
              text: a.rubrik,
              font: b.rubrik,
              size: hp(b.m.grad((spaltRubrik?.pt ?? d.grad.rubrik) - 0.5)),
              ...stilRun({ vikt: 700, ...d.rubrik, ...(spaltRubrik ?? {}) }, b, ord(b.p.accent)),
            }),
          ],
        })
      )
    : rubrik2(a, b, r, fore)
  return [rubrik, ...delar.flat()]
}

/**
 * Rubriken i marginalen (Kolumn): alla avsnitt i en tabell, en rad per
 * block, rubriken i radens vänstercell. Raderna bryts aldrig; linjen över
 * ett avsnitt är cellkant upp. En tabell, eftersom två tabeller utan stycke
 * emellan smälter ihop i Word.
 */
function marginalrubrikTabell(lista: Avsnitt[], b: B, bredd: number, foreForsta: number): Table {
  const d = b.def
  const l = d.layout as Extract<MallDef['layout'], { typ: 'marginalrubrik' }>
  const mb = mm(l.bredd)
  const r: Ruta = { bredd: bredd - mb, iSpalt: false, grad: b.m.grad(d.grad.brod) }
  const rader: TableRow[] = []
  lista.forEach((a, ai) => {
    const delar = block(a, b, r)
    const overkant = ai > 0 && l.linjeOver ? kant(l.linjeOver, b, ord(b.p.linje), 0) : undefined
    delar.forEach((del, i) => {
      const forstaRad = i === 0
      const kanter = forstaRad && overkant ? { ...INGA_KANTER, top: overkant } : INGA_KANTER
      const luft = forstaRad
        ? ai === 0
          ? foreForsta
          : mm(b.m.luftOver) + (l.linjeOver ? mm(l.linjeOver.luft) : 0)
        : mm(d.post.luftMellan)
      // Rubrikens rad följer med nästa rad, så att rubriken aldrig blir ensam.
      const innehall = forstaRad && delar.length > 1 ? del.map((x) => (x instanceof Paragraph ? x : x)) : del
      rader.push(
        new TableRow({
          cantSplit: true,
          children: [
            tabellCell(forstaRad ? [rubrik2(a, b, r, 0)] : [], mb, { borders: kanter, margins: { top: luft, bottom: 0, left: 0, right: mm(4) } }),
            tabellCell(innehall, bredd - mb, { borders: kanter, margins: { top: luft, bottom: 0, left: 0, right: 0 } }),
          ],
        })
      )
    })
  })
  return tabell(rader, [mb, bredd - mb])
}

/** Perioden i marginalen (Årsring): rubriken som stycke, posterna som tabellrader. */
function marginalperiodAvsnitt(a: Avsnitt, b: B, bredd: number, fore: number): (Paragraph | Table)[] {
  const d = b.def
  const l = d.layout as Extract<MallDef['layout'], { typ: 'marginalperiod' }>
  const mb = mm(l.bredd)
  const lodratLuft = l.lodrat ? mm(l.lodrat.luft) : 0
  const r: Ruta = { bredd: bredd - mb - lodratLuft, iSpalt: false, grad: b.m.grad(d.grad.brod) }
  const inn = a.innehall
  const rubrik = rubrik2(a, b, { ...r, bredd }, fore)
  const lodrat = l.lodrat ? kant(l.lodrat, b, ord(b.p.accent), 0) : undefined
  const rad = (etikett: Paragraph[], innehall: (Paragraph | Table)[], medLinje: boolean) =>
    new TableRow({
      cantSplit: true,
      children: [
        tabellCell(etikett, mb, { margins: { top: 0, bottom: 0, left: 0, right: mm(3) } }),
        tabellCell(innehall, bredd - mb, {
          borders: medLinje && lodrat ? { ...INGA_KANTER, left: lodrat } : INGA_KANTER,
          margins: { top: 0, bottom: medLinje ? mm(d.post.luftMellan) : pt(3), left: medLinje ? lodratLuft : 0, right: 0 },
        }),
      ],
    })
  const etikettStycke = (text: string, opts: IRunOptions = {}) => [stycke({ keepLines: true, spacing: { after: 0 }, children: [new TextRun({ text, size: hp(r.grad), ...opts })] })]
  if (inn.typ === 'poster') {
    const rader = inn.poster.map((p) =>
      rad(
        p.period ? etikettStycke(p.period, { bold: Boolean(d.post.periodFet), size: hp(b.m.grad(d.grad.period)), color: b.f(d.farger.period, ord(b.p.dampad)) }) : [],
        postStycken({ ...p, period: '' }, b, r),
        true
      )
    )
    return [rubrik, tabell(rader, [mb, bredd - mb])]
  }
  const ut = (rader: TableRow[]) => [rubrik, tabell(rader, [mb, bredd - mb])]
  if (inn.typ === 'kompetenser' && d.kompetenser === 'marginal')
    return ut(inn.grupper.map((g) => rad(etikettStycke(g.namn, { bold: true }), etikettStycke(g.lista.join(', ')), false)))
  if (inn.typ === 'intyg' && d.intyg === 'marginal')
    return ut(inn.rader.map((x) => rad(etikettStycke(x.ar, { bold: true }), etikettStycke([x.namn, x.utgivare].filter(Boolean).join(', ')), false)))
  if (inn.typ === 'sprak' && d.sprak === 'marginal') return ut(inn.rader.map((x) => rad(etikettStycke(x.sprak, { bold: true }), etikettStycke(x.niva), false)))
  // Övriga avsnitt (profil, referenser) indragna till innehållskolumnen.
  const delar = block(a, b, { ...r, bredd: bredd - mb })
  if (!l.indragAvsnitt) return [rubrik, ...delar.flat()]
  const indrag = (x: Paragraph | Table) => x
  void indrag
  return [rubrik, tabell([new TableRow({ cantSplit: true, children: [tabellCell([], mb), tabellCell(delar.flat(), bredd - mb)] })], [mb, bredd - mb])]
}

/** Huvudspaltens avsnitt i layoutens form. */
function huvudspaltDelar(lista: Avsnitt[], b: B, r: Ruta, foreForsta: number): (Paragraph | Table)[] {
  const l = b.def.layout
  if (l.typ === 'marginalrubrik' && !r.iSpalt) return lista.length ? [marginalrubrikTabell(lista, b, r.bredd, foreForsta)] : []
  return lista.flatMap((a, i) => {
    const fore = i === 0 ? foreForsta : mm(b.m.luftOver)
    return l.typ === 'marginalperiod' && !r.iSpalt ? marginalperiodAvsnitt(a, b, r.bredd, fore) : avsnitt(a, b, r, fore)
  })
}

/* ---------------------------------------------------------------- huvudet */

function kontaktRun(dok: Dokument, b: B, farg: string): TextRun[] {
  return dok.kontakt.flatMap((k, i) => [
    ...(i ? [new TextRun({ text: ' · ', color: farg })] : []),
    new TextRun({ text: k.text, color: farg, size: hp(b.m.grad(b.def.grad.kontakt)) }),
  ])
}

type Just = (typeof AlignmentType)[keyof typeof AlignmentType]

function bild(b: B): ImageRun {
  const s = px(b.def.foto!.storlek)
  return new ImageRun({ type: 'png', data: b.foto!, transformation: { width: s, height: s }, altText: { name: 'Foto', description: 'Foto', title: 'Foto' } })
}

/** Namn, titel och kontakt som stycken. Linjen under huvudet ligger på sista stycket. */
function huvudStycken(dok: Dokument, b: B, just: Just, textFarg: string | undefined, medKontakt: boolean, fotoForst: boolean): Paragraph[] {
  const d = b.def
  const h = d.huvud
  const stapel = h.stapel ? { border: { left: kant(h.stapel, b, ord(b.p.accent), Math.round(h.stapel.indrag * 2.83)) }, indent: { left: mm(h.stapel.indrag) } } : {}
  const opts: IParagraphOptions[] = []
  opts.push({
    heading: HeadingLevel.HEADING_1,
    alignment: just,
    keepNext: true,
    keepLines: true,
    ...stapel,
    spacing: { before: 0, after: 0, line: Math.round(240 * (h.namn.radavstand ?? 1.1)) },
    children: [
      // Fotot överst i namnets stycke (Björk): Rubrik 1 är fortfarande dokumentets första stycke.
      ...(fotoForst ? [bild(b), new TextRun({ break: 1 })] : []),
      new TextRun({ text: dok.namn, font: b.rubrik, size: hp(b.m.grad(d.grad.namn)), ...stilRun({ vikt: 700, ...h.namn }, b, ord(b.p.text)), ...(textFarg ? { color: textFarg } : {}) }),
    ],
  })
  if (dok.titel)
    opts.push({
      style: 'Yrkestitel',
      alignment: just,
      keepNext: true,
      keepLines: true,
      ...stapel,
      spacing: { before: mm(h.luftTitel), after: 0 },
      children: [new TextRun({ text: dok.titel, size: hp(b.m.grad(d.grad.titel)), ...stilRun(h.titel, b, ord(b.p.accent)), ...(textFarg ? { color: textFarg } : {}) })],
    })
  if (medKontakt && dok.kontakt.length) {
    const farg = textFarg ?? ord(b.p.dampad)
    if (h.kontakt === 'lista') {
      dok.kontakt.forEach((k, i) =>
        opts.push({
          style: 'Kontakt',
          alignment: just,
          keepNext: i < dok.kontakt.length - 1,
          ...stapel,
          spacing: { before: i ? 0 : mm(h.luftKontakt), after: 0 },
          children: [new TextRun({ text: k.text, color: farg, size: hp(b.m.grad(d.grad.kontakt)) })],
        })
      )
    } else {
      opts.push({ style: 'Kontakt', alignment: just, keepLines: true, ...stapel, spacing: { before: mm(h.luftKontakt), after: 0 }, children: kontaktRun(dok, b, farg) })
    }
  }
  if (h.linjeUnder) {
    const lu = h.linjeUnder
    const sista = opts[opts.length - 1]
    opts[opts.length - 1] = {
      ...sista,
      border: { bottom: { ...kant(lu, b, ord(b.p.linje), Math.round(lu.luft * 2.83)), ...(lu.dubbel ? { style: BorderStyle.DOUBLE, size: Math.round(lu.pt * 8) } : {}) } },
    }
  }
  return opts.map(stycke)
}

/**
 * Huvudets innehåll i en given bredd: stycken, eller en tabell utan kanter
 * med fotot i egen cell (Kalksten, Fasad, Koppar, Granit).
 */
function huvudInnehall(dok: Dokument, b: B, bredd: number, textFarg?: string): (Paragraph | Table)[] {
  const d = b.def
  const h = d.huvud
  const medKontakt = !(d.layout.typ === 'sidospalt' && d.layout.spalt.kontakt)
  const foto = d.foto && b.foto ? d.foto : undefined
  const just: Just = h.form === 'centrerad' ? AlignmentType.CENTER : h.form === 'hoger' ? AlignmentType.RIGHT : AlignmentType.LEFT
  if (foto && foto.plats !== 'huvud-topp' && foto.plats !== 'sidospalt') {
    const fb = mm(foto.storlek + (foto.plats === 'huvud-vanster' ? 8 : 6))
    const text = tabellCell(huvudStycken(dok, b, AlignmentType.LEFT, textFarg, medKontakt, false), bredd - fb, {
      verticalAlign: h.form === 'band' || foto.plats === 'huvud-vanster' ? VerticalAlign.CENTER : VerticalAlign.TOP,
    })
    const bildCell = tabellCell(
      [stycke({ alignment: foto.plats === 'huvud-hoger' ? AlignmentType.RIGHT : AlignmentType.LEFT, keepNext: true, spacing: { after: 0, line: 240 }, children: [bild(b)] })],
      fb,
      { verticalAlign: h.form === 'band' ? VerticalAlign.CENTER : VerticalAlign.TOP }
    )
    const hoger = foto.plats === 'huvud-hoger'
    return [tabell([new TableRow({ cantSplit: true, children: hoger ? [text, bildCell] : [bildCell, text] })], hoger ? [bredd - fb, fb] : [fb, bredd - fb])]
  }
  return huvudStycken(dok, b, just, textFarg, medKontakt, Boolean(foto && foto.plats === 'huvud-topp'))
}

/** Bandets cell: bakgrund och luft som i PDF:en. */
function bandCell(dok: Dokument, b: B, helBredd: number, span = 1): TableCell {
  const band = b.def.huvud.band!
  const fill = b.f(band.bakgrund, ord(b.p.accent))
  return tabellCell(huvudInnehall(dok, b, helBredd - mm(band.luft.sidor) * 2, b.f(band.text, 'FFFFFF')), helBredd, {
    columnSpan: span,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: mm(band.luft.topp), bottom: mm(band.luft.botten), left: mm(band.luft.sidor), right: mm(band.luft.sidor) },
  })
}

/* ------------------------------------------------------------------ stilar */

function stilar(b: B) {
  const d = b.def
  const line = Math.round(240 * d.radavstand * 0.87)
  return {
    default: {
      document: {
        run: { font: b.brod, size: hp(b.m.grad(d.grad.brod)), color: ord(d.farger.text), language: SPRAK },
        paragraph: { spacing: { line, after: 0 } },
      },
      heading1: {
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: b.rubrik, size: hp(b.m.grad(d.grad.namn)), color: ord(b.p.text) },
        paragraph: { spacing: { before: 0, after: 0, line: 240 }, keepNext: true, keepLines: true, outlineLevel: 0 },
      },
      heading2: {
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: b.rubrik, size: hp(b.m.grad(d.grad.rubrik)), color: ord(b.p.accent) },
        paragraph: { spacing: { before: mm(b.m.luftOver), after: mm(d.rubrik.luftUnder), line: 240 }, keepNext: true, keepLines: true, outlineLevel: 1 },
      },
    },
    paragraphStyles: [
      { id: 'Yrkestitel', name: 'Yrkestitel', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: hp(b.m.grad(d.grad.titel)) }, paragraph: { keepNext: true, keepLines: true } },
      { id: 'Kontakt', name: 'Kontakt', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: hp(b.m.grad(d.grad.kontakt)), color: ord(b.p.dampad) }, paragraph: { keepLines: true } },
      {
        id: 'Posttitel',
        name: 'Posttitel',
        basedOn: 'Normal',
        next: 'Arbetsgivare',
        quickFormat: true,
        run: { bold: true, size: hp(b.m.grad(d.grad.posttitel)) },
        paragraph: { spacing: { before: mm(d.post.luftMellan), after: pt(1) }, keepNext: true, keepLines: true },
      },
      { id: 'Arbetsgivare', name: 'Arbetsgivare', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { color: ord(b.p.dampad) }, paragraph: { spacing: { after: pt(2) }, keepLines: true } },
    ],
  }
}

function numrering(b: B) {
  const d = b.def
  const indrag = mm(d.punkt.indrag)
  return {
    config: [
      {
        reference: 'punkter',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: d.punkt.tecken,
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: indrag, hanging: indrag } }, run: { color: b.f(d.punkt.farg, ord(b.p.text)) } },
          },
        ],
      },
    ],
  }
}

/* ------------------------------------------------------------------ fotot */

/** Fotot som png i rätt form: runt med genomskinliga hörn, eller kvadratiskt beskuret. */
export async function fotoSomPng(url: string, form: 'rund' | 'kvadrat', storlekMm: number): Promise<Buffer | undefined> {
  try {
    let data: Buffer
    if (url.startsWith('data:')) {
      data = Buffer.from(url.slice(url.indexOf(',') + 1), url.includes(';base64,') ? 'base64' : 'utf8')
    } else if (/^https?:\/\//.test(url)) {
      const svar = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!svar.ok) return undefined
      data = Buffer.from(await svar.arrayBuffer())
    } else return undefined
    const sharp = (await import('sharp')).default
    const sida = Math.max(240, Math.round((storlekMm / 25.4) * 300))
    const bild = sharp(data).resize(sida, sida, { fit: 'cover' })
    if (form === 'kvadrat') return await bild.png().toBuffer()
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${sida}" height="${sida}"><circle cx="${sida / 2}" cy="${sida / 2}" r="${sida / 2}" fill="#fff"/></svg>`)
    return await bild.composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
  } catch {
    return undefined
  }
}

/* ------------------------------------------------------------------ bygget */

/** Word-typsnittets namn: användarens val om det finns i Word, annars mallens. */
function wordTypsnitt(def: MallDef, val: MallVal): { brod: string; rubrik: string } {
  const t = typsnittFor(def, val)
  const brod = WORD_TYPSNITT.includes(t.brod) ? t.brod : def.typsnitt.brod
  return { brod: getFontNameForDocx(brod), rubrik: getFontNameForDocx(t.rubrik) }
}

export async function byggWordDokument(cv: CVMetadata, def: MallDef, val: MallVal = {}): Promise<Document> {
  const dok = byggDokument(cv, def, val)
  const p = palett(def, val)
  const m = matt(def, val)
  const typ = wordTypsnitt(def, val)
  const foto = dok.foto && def.foto && visaFoto(def, val) ? await fotoSomPng(dok.foto, def.foto.form, def.foto.storlek) : undefined
  const marg = { top: mm(m.sida.topp), bottom: mm(m.sida.botten), left: mm(m.sida.vanster), right: mm(m.sida.hoger) }
  const textbredd = A4.bredd - marg.left - marg.right
  const b: B = { def, val, p, m, brod: typ.brod, rubrik: typ.rubrik, f: (x, reserv) => ord(los(x, p, `#${reserv}`)), foto, textbredd }
  const grad = m.grad(def.grad.brod)
  const l = def.layout
  const h = def.huvud
  const band = h.form === 'band' && h.band
  const luftUnder = mm(h.luftUnder)
  const barn: (Paragraph | Table)[] = []

  if (l.typ === 'sidospalt') {
    // En tabell för hela sidan: rad 1 är huvudet över båda spalterna, rad 2 spalterna.
    const s = l.spalt
    const helBredd = A4.bredd
    const spaltBredd = mm(s.bredd)
    const textFarg = s.text ? b.f(s.text, ord(p.text)) : undefined
    const ytter = s.sida === 'vanster' ? marg.left : marg.right
    const inre = mm(s.luft.inre)
    const rSpalt: Ruta = { bredd: spaltBredd - ytter - inre, iSpalt: true, text: textFarg, grad: m.grad(def.grad.sidospalt ?? def.grad.brod) }
    const huvudBredd = helBredd - spaltBredd - mm(s.mellanrum) - (s.sida === 'vanster' ? marg.right : marg.left)
    const kontakt =
      s.kontakt && dok.kontakt.length
        ? [
            rubrik2({ rubrik: 'Kontakt' }, b, rSpalt, 0),
            ...dok.kontakt.map((k, i) =>
              stycke({ keepNext: i < dok.kontakt.length - 1, spacing: { after: pt(1) }, children: [textRun(k.text, rSpalt, { size: hp(m.grad(def.grad.kontakt)) })] })
            ),
          ]
        : []
    const sido = [...kontakt, ...dok.sidospalt.flatMap((a, i) => avsnitt(a, b, rSpalt, i === 0 && !kontakt.length ? 0 : mm(m.luftOver)))]
    const fill = s.bakgrund ? b.f(s.bakgrund, ord(p.ton)) : undefined
    const sidoCell = tabellCell(sido, spaltBredd, {
      ...(fill ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill } } : {}),
      margins: { top: mm(s.luft.topp), bottom: mm(4), left: s.sida === 'vanster' ? ytter : inre, right: s.sida === 'vanster' ? inre : ytter },
    })
    const huvudCell = tabellCell(huvudspaltDelar(dok.huvudspalt, b, { bredd: huvudBredd, iSpalt: false, grad }, 0), helBredd - spaltBredd, {
      margins: {
        top: mm(s.luft.topp),
        bottom: 0,
        left: s.sida === 'vanster' ? mm(s.mellanrum) : marg.left,
        right: s.sida === 'vanster' ? marg.right : mm(s.mellanrum),
      },
    })
    const huvudRad = band
      ? bandCell(dok, b, helBredd, 2)
      : tabellCell(huvudInnehall(dok, b, helBredd - marg.left - marg.right), helBredd, {
          columnSpan: 2,
          margins: { top: 0, bottom: luftUnder, left: marg.left, right: marg.right },
        })
    const kol = s.sida === 'vanster' ? [spaltBredd, helBredd - spaltBredd] : [helBredd - spaltBredd, spaltBredd]
    barn.push(
      tabell(
        [
          new TableRow({ cantSplit: true, children: [huvudRad] }),
          new TableRow({ cantSplit: false, children: s.sida === 'vanster' ? [sidoCell, huvudCell] : [huvudCell, sidoCell] }),
        ],
        kol,
        -marg.left
      )
    )
  } else {
    if (band) {
      barn.push(tabell([new TableRow({ cantSplit: true, ...(h.band!.minHojd ? { height: { value: mm(h.band!.minHojd), rule: 'atLeast' as const } } : {}), children: [bandCell(dok, b, A4.bredd)] })], [A4.bredd], -marg.left))
    } else {
      barn.push(...huvudInnehall(dok, b, textbredd))
    }
    if (l.typ === 'tvaspalt') {
      barn.push(...huvudspaltDelar(dok.fullBredd, b, { bredd: textbredd, iSpalt: false, grad }, luftUnder))
      const vb = Math.round(textbredd * l.vansterAndel)
      const hb = textbredd - vb
      const mitten = mm(l.mellanrum / 2)
      const rH: Ruta = { bredd: hb - mitten, iSpalt: true, grad: m.grad(def.grad.sidospalt ?? def.grad.brod) }
      const vanster = huvudspaltDelar(dok.huvudspalt, b, { bredd: vb - mitten, iSpalt: false, grad }, 0)
      const hoger = dok.sidospalt.flatMap((a, i) => avsnitt(a, b, rH, i === 0 ? 0 : mm(m.luftOver)))
      barn.push(
        tabell(
          [
            new TableRow({
              cantSplit: false,
              children: [
                tabellCell(vanster, vb, { margins: { top: mm(m.luftOver), bottom: 0, left: 0, right: mitten } }),
                tabellCell(hoger, hb, { margins: { top: mm(m.luftOver), bottom: 0, left: mitten, right: 0 } }),
              ],
            }),
          ],
          [vb, hb]
        )
      )
    } else {
      barn.push(...huvudspaltDelar(dok.huvudspalt, b, { bredd: textbredd, iSpalt: false, grad }, luftUnder))
    }
  }

  // Huvudband i papperskanten: övre marginalen noll och sidhuvudet bär
  // marginalen på sida 2 och framåt.
  const kant0 = Boolean(band)
  const namn = dok.namn
  return new Document({
    creator: 'Jobbcoach.ai',
    lastModifiedBy: 'Jobbcoach.ai',
    title: namn ? `CV ${namn}` : 'CV',
    description: `CV i mallen ${def.namn}`,
    styles: stilar(b),
    numbering: numrering(b),
    sections: [
      {
        properties: {
          titlePage: kant0,
          page: { size: { width: A4.bredd, height: A4.hojd }, margin: kant0 ? { ...marg, top: 0, header: 0 } : marg },
        },
        ...(kant0
          ? {
              headers: {
                first: new Header({ children: [stycke({ spacing: { before: 0, after: 0, line: 20, lineRule: 'exact' as const }, children: [new TextRun({ text: ' ', size: 2 })] })] }),
                default: new Header({ children: [stycke({ spacing: { before: 0, after: 0, line: marg.top, lineRule: 'exact' as const }, children: [new TextRun({ text: ' ', size: 2 })] })] }),
              },
            }
          : {}),
        children: barn,
      },
    ],
  })
}
