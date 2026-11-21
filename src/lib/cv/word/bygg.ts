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
  UnderlineType,
  VerticalAlign,
  WidthType,
  PageBorderDisplay,
  PageBorderOffsetFrom,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  TextWrappingType,
  type IBorderOptions,
  type IParagraphOptions,
  type IRunOptions,
} from 'docx'
import { getFontNameForDocx } from '@/lib/documents/typsnitt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { los, matt, palett, typsnittFor, WORD_TYPSNITT, type Matt, type Palett } from '@/lib/cv/mallar/farg'
import { byggDokument, intygDetalj, kompetensForm, slutgruppAntal, spaltAntal, visaFoto, type Avsnitt, type Dokument, type Post } from '@/lib/cv/mallar/innehall'
import type { Farg, FotoForm, Linje, MallDef, TextStil } from '@/lib/cv/mallar/typer'

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

/**
 * Words radhöjd i spaltcellernas listor mot CSS:ens, kalibrerad mot
 * Chrome-PDF:en (G5, omkalibrerad till 0,98 när punkterna fick sina 0,6 mm i R8).
 */
const WORD_RADFAKTOR = 0.98

/**
 * Det som dras från spaltradens minsta höjd utöver huvudet, mm, så att
 * Word-panelen slutar vid bottenmarginalen som Chromes (kalibrerat, R3).
 */
const PANEL_MARGINAL_MM = 13

/**
 * Words bottenmarginal är 0,8 mm större än CSS:ens. Chrome räknar radens
 * hela höjd under baslinjen mot marginalen, Word bara texten, så utan
 * tillägget får Word plats med en rad till på sidan (Björk, R7).
 */
const WORD_BOTTEN_MM = 0.8

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
  /** Namnets, titelns och kontaktens typsnitt (utbud 2: Lind, Index). */
  namn: string
  titel: string
  kontakt: string
  /** Korta linjer som bilder (Valv under huvudet, Betong över rubrikerna), png per nyckel. */
  linjer: Map<string, Buffer>
  /** Avsnittens nummer i huvudspalten (Index), räknas upp per rubrik. */
  nr: number
  /** En Farg som Word-hex. */
  f: (x: Farg | undefined, reserv: string) => string
  /** Bilden till fotot (png), när fotot ska med. */
  foto?: Buffer
  /** Textbredden på sidan, twips. */
  textbredd: number
  /**
   * Huvudet står i en tabellrad ovanför spalterna. Då får det ingen "håll
   * ihop med nästa": Word håller annars ihop raden med hela nästa rad och
   * skjuter spalterna till sida 2.
   */
  huvudITabell?: boolean
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
  const radhojd = RADHOJD && !opts.heading ? { spacing: { line: RADHOJD, lineRule: 'atLeast' as const, ...(opts.spacing ?? {}) } } : {}
  return new Paragraph({ widowControl: true, ...opts, ...radhojd, ...(HALL_IHOP ? { keepNext: true } : {}), ...(I_SPALTCELL ? { keepNext: false } : {}) })
}

/** Sant medan avsnittet före referenser, språk eller intressen byggs: dess sista block hålls ihop med nästa. */
let HALL_SISTA = false

/** Sant medan ett avsnitt i slutgruppen byggs: alla dess stycken hålls ihop med nästa. */
let HALL_IHOP = false
function hallIhop<T>(f: () => T): T {
  const fore = HALL_IHOP
  HALL_IHOP = true
  try {
    return f()
  } finally {
    HALL_IHOP = fore
  }
}

/** Radhöjden (tjugondels pt) i den cell som byggs, eller null: dokumentets. */
let RADHOJD: number | null = null
/** Sant i tabellceller där varje post står i en egen rad: posttiteln får inget avstånd före. */
let I_CELL = false
function iCell<T>(radhojd: number | null, f: () => T): T {
  const [r0, c0] = [RADHOJD, I_CELL]
  RADHOJD = radhojd
  I_CELL = true
  try {
    return f()
  } finally {
    RADHOJD = r0
    I_CELL = c0
  }
}

/**
 * Sant medan innehållet i en spaltcell byggs. Word håller ihop en tabellrad
 * med nästa så fort ett stycke i den har "håll ihop med nästa", och skjuter
 * då hela spalten till nästa sida. I spaltcellerna hålls rubrik och post
 * ihop med en inre tabellrad som inte får brytas i stället (spaltRader).
 */
let I_SPALTCELL = false
function iSpaltcell<T>(f: () => T): T {
  const fore = I_SPALTCELL
  I_SPALTCELL = true
  try {
    return f()
  } finally {
    I_SPALTCELL = fore
  }
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

/** En kort linje som bild (inline), mm lång och pt tjock, i en färg. */
function linjeBild(b: B, langdMm: number, tjockPt: number, farg: string): ImageRun | null {
  const data = b.linjer.get(`${langdMm}-${tjockPt}-${farg}`)
  if (!data) return null
  return new ImageRun({
    type: 'png',
    data,
    transformation: { width: (langdMm * 96) / 25.4, height: Math.max(1, (tjockPt * 96) / 72) },
    altText: { name: 'Linje', description: 'Linje', title: 'Linje' },
  })
}

/** Linjerna som bilder ett dokument behöver, nycklade som linjeBild läser dem. */
function linjerSomBehovs(def: MallDef, p: Palett): { langd: number; pt: number; farg: string }[] {
  const ut: { langd: number; pt: number; farg: string }[] = []
  const lu = def.huvud.linjeUnder
  if (lu?.langd) ut.push({ langd: lu.langd, pt: lu.pt, farg: ord(los(lu.farg, p, p.accent)) })
  const rl = def.rubrik.linje
  if (rl?.langd && rl.var === 'over') ut.push({ langd: rl.langd, pt: rl.pt, farg: ord(los(rl.farg, p, p.accent)) })
  return ut
}

async function skapaLinjer(lista: { langd: number; pt: number; farg: string }[], prick?: { mm: number; farg: string }): Promise<Map<string, Buffer>> {
  const ut = new Map<string, Buffer>()
  if (!lista.length && !prick) return ut
  const sharp = (await import('sharp')).default
  if (prick) {
    const s = Math.round((prick.mm / 25.4) * 600)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#${prick.farg}"/></svg>`
    ut.set(`prick-${prick.farg}`, await sharp(Buffer.from(svg)).png().toBuffer())
  }
  for (const l of lista) {
    // 600 dpi, så att linjen är skarp i utskrift.
    const w = Math.max(4, Math.round((l.langd / 25.4) * 600))
    const h = Math.max(2, Math.round((l.pt / 72) * 600))
    const hex = l.farg.padStart(6, '0')
    const png = await sharp({ create: { width: w, height: h, channels: 3, background: `#${hex}` } }).png().toBuffer()
    ut.set(`${l.langd}-${l.pt}-${l.farg}`, png)
  }
  return ut
}

/**
 * Den korta linjen ovanför en rubrik (Betong) som eget stycke med exakt
 * radhöjd, hållet ihop med rubriken. Stycket bär luften före avsnittet.
 */
function kortLinjeStycke(b: B, fore: number): Paragraph | null {
  const R = b.def.rubrik
  const l = R.linje?.var === 'over' && R.linje.langd ? R.linje : undefined
  if (!l) return null
  const bild = linjeBild(b, l.langd!, l.pt, b.f(l.farg, ord(b.p.accent)))
  if (!bild) return null
  return stycke({
    keepNext: true,
    keepLines: true,
    spacing: { before: fore, after: mm(l.luft), line: pt(l.pt + 0.6), lineRule: 'exact' as const },
    children: [bild],
  })
}

function rubrik2(a: Avsnitt | { rubrik: string }, b: B, r: Ruta, fore: number, efter?: number, vanster?: number): Paragraph {
  const d = b.def
  const R = d.rubrik
  const s = d.layout.typ === 'sidospalt' && r.iSpalt ? d.layout.spalt.rubrik : undefined
  const stil: TextStil = { vikt: 700, ...R, ...(s ?? {}) }
  const huvudspalt = !r.iSpalt
  // Kort linje ovanför rubriken (Betong): bilden på en egen rad i rubrikens stycke.
  const kortOver = huvudspalt && R.linje?.var === 'over' && R.linje.langd ? R.linje : undefined
  const linje = r.iSpalt && s ? (s.linje ? { ...s.linje, var: 'under' as const } : undefined) : kortOver ? undefined : R.linje
  const border: Record<string, IBorderOptions> = {}
  if (linje && !('langd' in linje && linje.langd)) {
    const k = kant(linje, b, ord(b.p.linje), Math.round(linje.luft * 2.83))
    if (linje.var === 'under') border.bottom = k
    else if (linje.var === 'over') border.top = k
    else border.left = k
  }
  const band = !r.iSpalt ? R.band : undefined
  const indrag = !r.iSpalt && R.indrag ? { firstLine: mm(R.indrag) } : undefined
  const grad = b.m.grad(s?.pt ?? d.grad.rubrik)
  const textRunOpts = { font: b.rubrik, size: hp(grad), ...stilRun(stil, b, ord(b.p.accent)) }
  const barn: (TextRun | ImageRun)[] = []
  if (kortOver && I_SPALTCELL) {
    // I en spaltcell står linjen i rubrikens stycke (en rad), utanför i ett eget stycke (kortLinjeStycke).
    const bild = linjeBild(b, kortOver.langd!, kortOver.pt, b.f(kortOver.farg, ord(b.p.accent)))
    if (bild) barn.push(bild, new TextRun({ text: '', break: 1, size: 2 }))
  }
  if (huvudspalt && R.nummer) {
    // Avsnittets nummer (Index): Georgia-siffran i samma stycke som rubriken.
    b.nr += 1
    const nr = String(b.nr).padStart(2, '0')
    const nu = R.nummer
    const siffra = { font: getFontNameForDocx(nu.typsnitt), size: hp(b.m.grad(nu.pt)), color: b.f(nu.farg, ord(b.p.accent)), bold: false, allCaps: false }
    barn.push(new TextRun({ text: nr.slice(0, -1), ...siffra }))
    // Luften efter siffran som spärrning på sista siffran, minus mellanslagets bredd.
    barn.push(new TextRun({ text: nr.slice(-1), ...siffra, characterSpacing: Math.max(0, Math.round((nu.luft - grad * 0.3528 * 0.23) * 56.69)) }))
    barn.push(new TextRun({ text: ' ', ...textRunOpts }))
  }
  if (huvudspalt && R.linjeEfter && a.rubrik.length > 1) {
    // Hårlinjen efter texten (Valv): en understruken tabb till högermarginalen,
    // höjd så att linjen står ovanför baslinjen. Luften före linjen är
    // spärrning på rubrikens sista tecken.
    const le = R.linjeEfter
    barn.push(new TextRun({ text: a.rubrik.slice(0, -1), ...textRunOpts }))
    barn.push(new TextRun({ text: a.rubrik.slice(-1), ...textRunOpts, characterSpacing: Math.round(le.luft * 56.69) }))
    barn.push(
      new TextRun({
        children: [new Tab()],
        size: 12,
        position: `${Number((le.hojd * 2.835 + 0.9).toFixed(1))}pt`,
        underline: { type: UnderlineType.SINGLE, color: b.f(le.farg, ord(b.p.linje)) },
      })
    )
  } else {
    barn.push(
      new TextRun({
        text: a.rubrik,
        ...textRunOpts,
        ...(huvudspalt && R.understruken ? { underline: { type: UnderlineType.SINGLE, color: b.f(R.understruken.farg, ord(b.p.accent)) } } : {}),
      })
    )
  }
  return stycke({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    keepLines: true,
    alignment: !r.iSpalt && R.justering === 'centrerad' ? AlignmentType.CENTER : !r.iSpalt && R.justering === 'hoger' ? AlignmentType.RIGHT : AlignmentType.LEFT,
    ...(huvudspalt && R.linjeEfter ? { tabStops: [{ type: TabStopType.RIGHT, position: r.bredd }] } : {}),
    spacing: { before: fore, after: efter ?? mm(b.m.luftUnderRubrik) },
    ...(Object.keys(border).length ? { border } : {}),
    ...(band
      ? {
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: b.f(band.bakgrund, ord(b.p.ton)) },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.lodratt * b.m.bandLuftSkala * 2.83) },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.lodratt * b.m.bandLuftSkala * 2.83) },
            left: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.sidor * 2.83) },
            right: { style: BorderStyle.SINGLE, size: 1, color: b.f(band.bakgrund, ord(b.p.ton)), space: Math.round(band.sidor * 2.83) },
          },
        }
      : {}),
    ...(linje?.var === 'vanster' ? { indent: { left: mm(linje.luft) } } : {}),
    ...(indrag ? { indent: indrag } : {}),
    ...(vanster ? { indent: { left: vanster } } : {}),
    children: barn,
  })
}

/** Posttiteln: titeln och perioden högerställd med tabbstopp vid containerns kant. */
function posttitel(p: Post, b: B, r: Ruta, hallIhop: boolean, forst = false, efter = 0): Paragraph {
  const d = b.def
  return stycke({
    style: 'Posttitel',
    keepNext: hallIhop,
    keepLines: true,
    // Första posten under rubriken utan luft ovanför, som .start>.post i CSS:en;
    // Word tar det största av rubrikens luft under och postens luft över.
    ...(I_CELL || forst ? { spacing: { before: 0, after: pt(1) + efter } } : {}),
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

function punkt(text: string, r: Ruta, hallIhop: boolean, ref = 'punkter', fore = 0, efter = 0): Paragraph {
  return stycke({
    numbering: { reference: ref, level: 0 },
    keepLines: true,
    keepNext: hallIhop,
    spacing: { before: fore, after: mm(0.6) + efter },
    children: [textRun(text, r, { size: hp(r.grad) })],
  })
}

/** En post: titel, arbetsgivare, text och punkter, hållna ihop. */
/**
 * `efter` är luften till nästa post i en spaltcell, som avstånd efter postens
 * sista stycke. Word låter det hänga ut i bottenmarginalen, så sidan får samma
 * plats som i Chrome, som kapar marginalen vid en sidbrytning (Granit långt).
 */
function postStycken(p: Post, b: B, r: Ruta, medTitel = true, forst = false, efter = 0): Paragraph[] {
  const d = b.def
  const ut: Paragraph[] = []
  // Perioden efter arbetsgivaren (Lind): "Arbetsgivare · 2018 – 2021" på raden under titeln.
  let periodEfter: TextRun[] = []
  if (d.post.periodPlats === 'efter-arbetsgivare' && p.period) {
    periodEfter = [
      ...(p.under ? [textRun(' · ', r, { color: r.text ?? ord(b.p.dampad), size: hp(r.grad) })] : []),
      new TextRun({
        text: p.period,
        italics: Boolean(d.post.periodKursiv),
        size: hp(b.m.grad(d.grad.period)),
        color: r.text ?? b.f(d.farger.period, ord(b.p.dampad)),
      }),
    ]
    p = { ...p, period: '', under: p.under || '​' }
  }
  const efterTitel = Boolean(p.under) || p.text.length > 0 || p.punkter.length > 0
  if (medTitel) ut.push(posttitel(p, b, r, efterTitel, forst, efterTitel ? 0 : efter))
  if (p.under)
    ut.push(
      stycke({
        style: 'Arbetsgivare',
        keepNext: p.text.length > 0 || p.punkter.length > 0,
        keepLines: true,
        ...(efter && !p.text.length && !p.punkter.length ? { spacing: { after: pt(2) + efter } } : {}),
        children: [
          ...(p.under !== '​' ? [textRun(p.under, r, { ...stilRun(d.post.arbetsgivare, b, ord(b.p.dampad)), ...(r.text ? { color: r.text } : {}), size: hp(r.grad) })] : []),
          ...periodEfter,
        ],
      })
    )
  p.text.forEach((t, i) =>
    ut.push(
      stycke({
        keepNext: i < p.text.length - 1 || p.punkter.length > 0,
        keepLines: true,
        spacing: { before: mm(0.8), after: i === p.text.length - 1 && !p.punkter.length ? efter : 0 },
        children: [textRun(t, r, { color: r.text ?? ord(b.p.dampad), size: hp(r.grad) })],
      })
    )
  )
  // En post hålls ihop i sin helhet (som break-inside: avoid i PDF:en).
  // Första punkten 1,1 mm under arbetsgivaren, som listans marginal i CSS:en (kalibrerat).
  p.punkter.forEach((t, i) => ut.push(punkt(t, r, i < p.punkter.length - 1, 'punkter', i === 0 && !I_CELL ? mm(1.1) : 0, i === p.punkter.length - 1 ? efter : 0)))
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
      // Luft bara mellan styckena, som .text+.text i CSS:en; efter sista stycket lägger
      // tabellcellerna (Kolumn, Årsring) annars till den ovanpå radens luft.
      return inn.stycken.map((t, i) => [stycke({ keepLines: true, spacing: { after: i < inn.stycken.length - 1 ? pt(4) : 0 }, children: [textRun(t, r, { size: hp(r.grad), ...(a.sektion === 'referenser' ? { color: dampad } : {}) })] })])
    case 'poster':
      return inn.poster.map((p, i) => postStycken(p, b, r, true, i === 0, I_CELL && i < inn.poster.length - 1 ? mm(b.m.luftMellan) : 0))
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
            // Upp till sex grupper hålls ihop (R6), annars aldrig en ensam rad.
            keepNext: grupper.length <= 6 ? i < grupper.length - 1 : hallIhopRad(i, grupper.length),
            spacing: { before: i ? mm(1.4) : 0, after: 0 },
            children: [...(g.namn ? [textRun(`${g.namn}: `, r, { bold: true, size: hp(r.grad) })] : []), textRun(g.lista.join(', '), r, { size: hp(r.grad) })],
          }),
        ])
      if (form === 'mittpunkt')
        return grupper.map((g, gi) => {
          const storlek = hp(r.iSpalt ? Math.min(9, r.grad) : r.grad)
          return [
            ...(g.namn ? [stycke({ keepNext: true, keepLines: true, spacing: { before: gi ? mm(1.4) : 0, after: pt(1) }, children: [textRun(g.namn, r, { bold: true, size: hp(r.grad) })] })] : []),
            // Varje kompetens är en egen run, så att läsaren får dem som egna ord;
            // punkten sitter fast vid föregående kompetens med ett fast mellanslag.
            stycke({
              keepLines: true,
              // Upp till sex grupper hålls ihop (R6).
              keepNext: grupper.length <= 6 && gi < grupper.length - 1,
              spacing: { before: g.namn || !gi ? 0 : mm(1.4), after: 0 },
              children: g.lista.flatMap((s, i) => [
                textRun(s, r, { size: storlek }),
                ...(i < g.lista.length - 1 ? [textRun('\u00A0·', r, { color: r.text ?? dampad, size: storlek }), textRun(' ', r, { size: storlek })] : []),
              ]),
            }),
          ]
        })
      if (form === 'lista')
        return grupper.map((g, gi) => [
          ...(g.namn ? [stycke({ keepNext: true, keepLines: true, spacing: { before: pt(3), after: pt(1) }, children: [textRun(g.namn, r, { bold: true, size: hp(r.grad) })] })] : []),
          ...g.lista.map((s, i) => punkt(s, r, hallIhopRad(i, g.lista.length) || (grupper.length <= 6 && gi < grupper.length - 1))),
        ])
      if (form === 'marginal') return grupper.map((g) => [stycke({ children: [textRun(g.namn, r, { bold: true })] }), stycke({ children: [textRun(g.lista.join(', '), r)] })])
      // Spalter: tabell utan kanter, två (Not: tre) grupper i bredd, raden bryts aldrig.
      const n = spaltAntal(d, grupper.length)
      const halv = Math.floor(r.bredd / n)
      const mellan = n === 3 ? mm(5) : mm(6)
      const rader: TableRow[] = []
      for (let i = 0; i < grupper.length; i += n) {
        const par = grupper.slice(i, i + n)
        rader.push(
          new TableRow({
            cantSplit: true,
            children: Array.from({ length: n }, (_, k) => k).map((k) => {
              const g = par[k]
              return tabellCell(
                g
                  ? [
                      // keepNext i en cell håller ihop raden med nästa rad. Sista raden får inget,
                      // annars följer nästa avsnitt med och hela kedjan flyttade blocket (Raster, R8).
                      // Upp till sex grupper hålls ihop (R6); cantSplit håller gruppen ihop.
                      ...(g.namn ? [stycke({ keepNext: grupper.length <= 6 && i + n < grupper.length, keepLines: true, spacing: { after: pt(1) }, children: [textRun(g.namn, r, { bold: true, size: hp(r.grad) })] })] : []),
                      ...g.lista.map((s) => punkt(s, r, false)),
                    ]
                  : [],
                halv,
                { margins: { top: 0, bottom: pt(4), left: 0, right: k < n - 1 ? mellan : 0 } }
              )
            }),
          })
        )
      }
      return [[tabell(rader, Array.from({ length: n }, () => halv))]]
    }
  }
}

/** Ett avsnitt i en vanlig spalt: rubrik och block. `fore` är luften före rubriken, twips. */
function avsnitt(a: Avsnitt, b: B, r: Ruta, fore: number): (Paragraph | Table)[] {
  const delar = block(a, b, r)
  if (HALL_SISTA && !I_SPALTCELL && delar.length) {
    HALL_SISTA = false
    try {
      const igen = hallIhop(() => block(a, b, r))
      delar[delar.length - 1] = igen[igen.length - 1]
    } finally {
      HALL_SISTA = true
    }
  }
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
    : null
  if (rubrik) return [rubrik, ...delar.flat()]
  const linje = !r.iSpalt && !I_SPALTCELL ? kortLinjeStycke(b, fore) : null
  if (linje) return [linje, rubrik2(a, b, r, 0), ...delar.flat()]
  return [rubrik2(a, b, r, fore), ...delar.flat()]
}

/**
 * Rubriken i marginalen (Kolumn): alla avsnitt i en tabell, en rad per
 * block, rubriken i radens vänstercell. Raderna bryts aldrig; linjen över
 * ett avsnitt är cellkant upp. En tabell, eftersom två tabeller utan stycke
 * emellan smälter ihop i Word.
 */
function marginalrubrikTabell(lista: Avsnitt[], b: B, bredd: number, foreForsta: number): Table {
  return iCell(null, () => marginalrubrikTabellInre(lista, b, bredd, foreForsta))
}

function marginalrubrikTabellInre(lista: Avsnitt[], b: B, bredd: number, foreForsta: number): Table {
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
        : mm(b.m.luftMellan)
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
  return iCell(null, () => marginalperiodAvsnittInre(a, b, bredd, fore))
}

function marginalperiodAvsnittInre(a: Avsnitt, b: B, bredd: number, fore: number): (Paragraph | Table)[] {
  const d = b.def
  const l = d.layout as Extract<MallDef['layout'], { typ: 'marginalperiod' }>
  const mb = mm(l.bredd)
  const lodratLuft = l.lodrat ? mm(l.lodrat.luft) : 0
  const r: Ruta = { bredd: bredd - mb - lodratLuft, iSpalt: false, grad: b.m.grad(d.grad.brod) }
  const inn = a.innehall
  const rubrik = rubrik2(a, b, { ...r, bredd }, fore)
  const lodrat = l.lodrat ? kant(l.lodrat, b, ord(b.p.accent), 0) : undefined
  // Periodkolumnen till höger (Furu): innehållet först, perioden högerställd med 4 mm luft före.
  const hoger = l.sida === 'hoger'
  const rad = (etikett: Paragraph[], innehall: (Paragraph | Table)[], medLinje: boolean, fore = 0) => {
    const e = tabellCell(etikett, mb, { margins: { top: fore, bottom: 0, left: hoger ? mm(4) : 0, right: hoger ? 0 : mm(3) } })
    const inn = tabellCell(innehall, bredd - mb, {
      borders: medLinje && lodrat ? { ...INGA_KANTER, left: lodrat } : INGA_KANTER,
      // Luften mellan posterna är cellmarginal upptill, inne i cellen, så
      // att den lodräta linjen (cellkanten) är obruten och perioden står
      // på samma höjd som titeln.
      margins: { top: fore, bottom: medLinje ? 0 : pt(3), left: medLinje ? lodratLuft : 0, right: 0 },
    })
    return new TableRow({ cantSplit: true, children: hoger ? [inn, e] : [e, inn] })
  }
  const kol = hoger ? [bredd - mb, mb] : [mb, bredd - mb]
  const etikettStycke = (text: string, opts: IRunOptions = {}) => [
    stycke({ keepLines: true, alignment: hoger ? AlignmentType.RIGHT : AlignmentType.LEFT, spacing: { after: 0 }, children: [new TextRun({ text, size: hp(r.grad), ...opts })] }),
  ]
  if (inn.typ === 'poster') {
    const rader = inn.poster.map((p, i) =>
      rad(
        p.period ? etikettStycke(p.period, { bold: Boolean(d.post.periodFet), size: hp(b.m.grad(d.grad.period)), color: b.f(d.farger.period, ord(b.p.dampad)) }) : [],
        // Med perioden till höger är innehållscellen radens första: Word läser då
        // dess "håll ihop med nästa" som radens och kedjar ihop alla rader (Furu).
        // Raden bryts aldrig, så posten hålls ihop ändå.
        hoger ? iSpaltcell(() => postStycken({ ...p, period: '' }, b, r)) : postStycken({ ...p, period: '' }, b, r),
        true,
        i ? mm(b.m.luftMellan) : 0
      )
    )
    return [rubrik, tabell(rader, kol)]
  }
  const ut = (rader: TableRow[]) => [rubrik, tabell(rader, kol)]
  if (inn.typ === 'kompetenser' && d.kompetenser === 'marginal')
    return ut(inn.grupper.map((g) => rad(etikettStycke(g.namn, { bold: true }), etikettStycke(g.lista.join(', ')), false)))
  if (inn.typ === 'intyg' && d.intyg === 'marginal') {
    // Året i en högerkolumn i periodens stil (Furu), fetstil i vänsterkolumnen (Årsring).
    const ar = hoger ? { size: hp(b.m.grad(d.grad.period)), color: b.f(d.farger.period, ord(b.p.dampad)) } : { bold: true }
    const innehall = (x: { namn: string; utgivare: string }) =>
      hoger
        ? [stycke({ keepLines: true, spacing: { after: 0 }, children: [new TextRun({ text: x.namn, size: hp(r.grad) }), ...(x.utgivare ? [new TextRun({ text: `, ${x.utgivare}`, size: hp(b.m.grad(d.grad.period)), color: ord(b.p.dampad) })] : [])] })]
        : etikettStycke([x.namn, x.utgivare].filter(Boolean).join(', '))
    return ut(inn.rader.map((x) => rad(etikettStycke(x.ar, ar), innehall(x), false)))
  }
  if (inn.typ === 'sprak' && d.sprak === 'marginal') return ut(inn.rader.map((x) => rad(etikettStycke(x.sprak, { bold: true }), etikettStycke(x.niva), false)))
  // Övriga avsnitt (profil, referenser) indragna till innehållskolumnen.
  const delar = block(a, b, { ...r, bredd: bredd - mb })
  if (!l.indragAvsnitt) return [rubrik, ...delar.flat()]
  const indrag = (x: Paragraph | Table) => x
  void indrag
  return [rubrik, tabell([new TableRow({ cantSplit: true, children: [tabellCell([], mb), tabellCell(delar.flat(), bredd - mb)] })], [mb, bredd - mb])]
}

/**
 * Prickad tidslinje (Spår): avsnitten med poster som tabell med en
 * marginalcell (punkten "●" på linjen) och en innehållscell med prickad
 * vänsterkant; övriga avsnitt indragna i en rad med tom marginalcell.
 */
function prickAvsnitt(a: Avsnitt, b: B, bredd: number, fore: number): (Paragraph | Table)[] {
  return iCell(null, () => prickAvsnittInre(a, b, bredd, fore))
}

function prickAvsnittInre(a: Avsnitt, b: B, bredd: number, fore: number): (Paragraph | Table)[] {
  const d = b.def
  const l = d.layout as Extract<MallDef['layout'], { typ: 'marginalprick' }>
  const kol = mm(l.kolumn)
  const ut2 = mm(l.indrag - l.kolumn)
  const innerBredd = bredd - kol - ut2
  const r: Ruta = { bredd: innerBredd, iSpalt: false, grad: b.m.grad(d.grad.brod) }
  const inn = a.innehall
  const prick = inn.typ === 'poster' && l.sektioner.includes(a.sektion)
  const rubrik = rubrik2(a, b, { ...r, bredd: bredd - mm(l.indrag) }, fore, prick ? 0 : undefined, mm(l.indrag))
  if (prick && inn.typ === 'poster') {
    const linje: IBorderOptions = { style: BorderStyle.DOTTED, size: Math.max(2, Math.round(l.linje.pt * 8)), color: b.f(l.linje.farg, ord(b.p.accent)), space: 0 }
    const radhojd = pt(b.m.grad(d.grad.posttitel) * b.m.radavstand)
    const rader = inn.poster.map((p, i) => {
      const topp = i ? mm(b.m.luftMellan) : mm(b.m.luftUnderRubrik)
      // Punkten centrerad på linjen: högerställd i marginalcellen, utskjuten med halva sin bredd.
      // Punkten är en bild (ingen text som läsaren tar med i jobbet).
      const data = b.linjer.get(`prick-${b.f(l.linje.farg, ord(b.p.accent))}`)
      const s = (l.punkt * 96) / 25.4
      // Punkten ligger över cellgränsen och skulle klippas som vanlig bild i cellen; den
      // förankras därför i cellens stycke och flyttar med posten (ingen fast plats på sidan).
      const EMU = 36000
      const punkt = stycke({
        keepLines: true,
        spacing: { before: 0, after: 0, line: radhojd, lineRule: 'exact' as const },
        children: data
          ? [
              new ImageRun({
                type: 'png',
                data,
                transformation: { width: s, height: s },
                altText: { name: 'Punkt', description: 'Punkt', title: 'Punkt' },
                floating: {
                  horizontalPosition: { relative: HorizontalPositionRelativeFrom.COLUMN, offset: Math.round((l.kolumn - l.punkt / 2) * EMU) },
                  verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: Math.round(1.6 * EMU) },
                  wrap: { type: TextWrappingType.NONE },
                  allowOverlap: true,
                  layoutInCell: true,
                },
              }),
            ]
          : [],
      })
      return new TableRow({
        cantSplit: true,
        children: [
          tabellCell([punkt], kol, { margins: { top: topp, bottom: 0, left: 0, right: 0 } }),
          tabellCell(postStycken(p, b, r), bredd - kol, { borders: { ...INGA_KANTER, left: linje }, margins: { top: topp, bottom: 0, left: ut2, right: 0 } }),
        ],
      })
    })
    return [rubrik, tabell(rader, [kol, bredd - kol])]
  }
  const ind = mm(l.indrag)
  const delar = block(a, b, { ...r, bredd: bredd - ind })
  return [rubrik, tabell([new TableRow({ cantSplit: true, children: [tabellCell([], ind), tabellCell(delar.flat(), bredd - ind)] })], [ind, bredd - ind])]
}

/**
 * En spalts avsnitt som en inre tabell utan kanter: rubriken och första
 * blocket i en rad, varje följande block (post, rad) i en egen rad. Raderna
 * bryts aldrig, så en post delas aldrig och en rubrik står aldrig ensam.
 */
function spaltRader(
  lista: { a: Avsnitt | null; rubrik?: Paragraph; block: (Paragraph | Table)[][] }[],
  bredd: number,
  luftMellan = 0,
  linjeMellan?: IBorderOptions
): Table | null {
  // Raderna samlas först: luften mellan två poster läggs som nedre marginal på
  // raden före, inte som övre på nästa. Word upprepar annars luften överst på en
  // ny sida, där Chrome kapar den, och sidan fick 3,8 mm mindre plats (Granit långt).
  const celler: { innehall: (Paragraph | Table)[]; under: number; linje?: boolean; topp?: number }[] = []
  let vantandeTopp = 0
  const lagg = (innehall: (Paragraph | Table)[], fore = 0) => {
    if (fore && celler.length) celler[celler.length - 1].under += fore
    celler.push({ innehall, under: 0, ...(vantandeTopp ? { topp: vantandeTopp } : {}) })
    vantandeTopp = 0
  }
  for (const x of lista) {
    const poster = x.a?.innehall.typ === 'poster'
    x.block.forEach((del, i) => {
      // Hårlinjen mellan posterna (Sand): nedre cellkant på postens sista rad,
      // nästa post börjar luften under linjen, som border-top och padding i CSS:en.
      if (linjeMellan && poster && i > 0 && celler.length) {
        celler[celler.length - 1].linje = true
        vantandeTopp = luftMellan
      }
      const innehall = i === 0 && x.rubrik ? [x.rubrik, ...del] : del
      // Luften mellan posterna ligger som avstånd efter postens sista stycke (postStycken).
      const luft = 0
      // Samma brytregel som html.ts (UX U6): titeln och två punkter i en rad, sedan
      // en rad per punkt; en kort sista punkt följer med punkten före.
      const post = poster && x.a?.innehall.typ === 'poster' ? x.a.innehall.poster[i] : undefined
      const n = post?.punkter.length ?? 0
      const sista = post?.punkter[n - 1] ?? ''
      if (post && (n >= 4 || (n === 3 && sista.length >= 70)) && innehall.length > n) {
        const resten = innehall.slice(innehall.length - n + 2)
        const grupper = resten.map((x) => [x])
        if (sista.length < 70 && grupper.length >= 2) grupper.splice(-2, 2, [...grupper[grupper.length - 2], ...grupper[grupper.length - 1]])
        lagg(innehall.slice(0, innehall.length - n + 2), luft)
        for (const g of grupper) lagg(g)
        return
      }
      lagg(innehall, luft)
    })
    if (!x.block.length && x.rubrik) lagg([x.rubrik])
  }
  const rader = celler.map(
    (c) =>
      new TableRow({
        cantSplit: true,
        children: [
          tabellCell(c.innehall, bredd, {
            ...(c.under || c.topp ? { margins: { top: c.topp ?? 0, bottom: c.under, left: 0, right: 0 } } : {}),
            ...(c.linje && linjeMellan ? { borders: { ...INGA_KANTER, bottom: linjeMellan } } : {}),
          }),
        ],
      })
  )
  return rader.length ? tabell(rader, [bredd]) : null
}

/** Avsnitten i en spaltcell (sidospalt, tvåspalt) som spaltrader. */
function spaltInnehall(lista: Avsnitt[], b: B, r: Ruta, foreForsta: number, fore: (Paragraph | Table)[][] = []): (Paragraph | Table)[] {
  return iSpaltcell(() =>
    iCell(pt(r.grad * b.m.radavstand * WORD_RADFAKTOR), () => {
      let delar: { a: Avsnitt | null; rubrik?: Paragraph; block: (Paragraph | Table)[][] }[] = lista.map((a, i) => {
        const f = i === 0 && !fore.length ? foreForsta : mm(b.m.luftOver)
        const allt = avsnitt(a, b, r, f)
        return { a, rubrik: allt[0] as Paragraph, block: block(a, b, r) }
      })
      // De korta avsnitten sist i huvudspalten i en rad som aldrig bryts, som slutgruppen i PDF:en.
      const slut = r.iSpalt ? 0 : slutgruppAntal(lista.map((a) => a.sektion))
      if (slut > 1) {
        const grupp = delar.slice(-slut).flatMap((x) => [...(x.rubrik ? [x.rubrik] : []), ...x.block.flat()])
        delar = [...delar.slice(0, -slut), { a: null, block: [grupp] }]
      }
      const lm = !r.iSpalt && b.def.post.linjeMellan ? kant(b.def.post.linjeMellan, b, ord(b.p.linje), 0) : undefined
      const t = spaltRader([...fore.map((block) => ({ a: null, block: [block] })), ...delar], r.bredd, mm(b.m.luftMellan), lm)
      return t ? [t] : []
    })
  )
}

/** Huvudspaltens avsnitt i layoutens form. */
function huvudspaltDelar(lista: Avsnitt[], b: B, r: Ruta, foreForsta: number): (Paragraph | Table)[] {
  const l = b.def.layout
  if (l.typ === 'marginalrubrik' && !r.iSpalt) return lista.length ? [marginalrubrikTabell(lista, b, r.bredd, foreForsta)] : []
  // De korta avsnitten sist (slutgruppen i PDF:en) hålls ihop med nästa, utom det sista.
  const slut = slutgruppAntal(lista.map((a) => a.sektion))
  return lista.flatMap((a, i) => {
    if (slut > 1 && i >= lista.length - slut && i < lista.length - 1) return hallIhop(() => huvudspaltAvsnitt(a, i))
    // Referenser, språk och intressen står aldrig ensamma överst på en sida
    // (break-before: avoid i PDF:en): sista blocket före dem hålls ihop med dem.
    const nasta = lista[i + 1]?.sektion
    if (nasta && ['referenser', 'sprak', 'intressen'].includes(nasta) && l.typ !== 'marginalprick' && l.typ !== 'marginalperiod') {
      HALL_SISTA = true
      try {
        return huvudspaltAvsnitt(a, i)
      } finally {
        HALL_SISTA = false
      }
    }
    return huvudspaltAvsnitt(a, i)
  })
  function huvudspaltAvsnitt(a: Avsnitt, i: number): (Paragraph | Table)[] {
    const fore = i === 0 ? foreForsta : mm(b.m.luftOver)
    if (l.typ === 'marginalprick' && !r.iSpalt) return prickAvsnitt(a, b, r.bredd, fore)
    return l.typ === 'marginalperiod' && !r.iSpalt ? marginalperiodAvsnitt(a, b, r.bredd, fore) : avsnitt(a, b, r, fore)
  }
}

/* ---------------------------------------------------------------- huvudet */

function kontaktRun(dok: Dokument, b: B, farg: string): TextRun[] {
  return dok.kontakt.flatMap((k, i) => [
    ...(i ? [new TextRun({ text: ' · ', color: farg, font: b.kontakt })] : []),
    new TextRun({ text: k.text, color: farg, font: b.kontakt, size: hp(b.m.grad(b.def.grad.kontakt)) }),
  ])
}

type Just = (typeof AlignmentType)[keyof typeof AlignmentType]

function bild(b: B): ImageRun {
  return new ImageRun({
    type: 'png',
    data: b.foto!,
    transformation: { width: px(b.m.fotoMm), height: px(b.m.fotoHojdMm) },
    altText: { name: 'Foto', description: 'Foto', title: 'Foto' },
  })
}

/** Ramen runt huvudet (Pergament): samma kanter på varje stycke, så att Word ritar en gemensam ram. */
function ramKanter(b: B): Partial<IParagraphOptions> {
  const ram = b.def.huvud.ram
  if (!ram) return {}
  const k = (space: number): IBorderOptions => ({
    style: ram.dubbel ? BorderStyle.DOUBLE : BorderStyle.SINGLE,
    size: Math.max(2, Math.round(ram.pt * 8)),
    color: b.f(ram.farg, ord(b.p.accent)),
    space,
  })
  const lodratt = Math.round(ram.luft.lodratt * 2.835)
  const sidor = Math.round(ram.luft.sidor * 2.835)
  return { border: { top: k(lodratt), bottom: k(lodratt), left: k(sidor), right: k(sidor) }, indent: { left: mm(ram.luft.sidor), right: mm(ram.luft.sidor) } }
}

/** Namn, titel och kontakt som stycken. Linjen under huvudet ligger på sista stycket. */
function huvudStycken(dok: Dokument, b: B, just: Just, textFarg: string | undefined, medKontakt: boolean, fotoForst: boolean): Paragraph[] {
  const d = b.def
  const h = d.huvud
  const stapel = h.stapel ? { border: { left: kant(h.stapel, b, ord(b.p.accent), Math.round(h.stapel.indrag * 2.83)) }, indent: { left: mm(h.stapel.indrag) } } : {}
  // Ramen runt huvudet (Pergament) och stapeln (Fasad) är kanter på varje stycke.
  const kanter = h.ram ? ramKanter(b) : stapel
  const opts: IParagraphOptions[] = []
  opts.push({
    heading: HeadingLevel.HEADING_1,
    alignment: just,
    keepNext: true,
    keepLines: true,
    ...kanter,
    // Linjen ovanför namnet (Lind) är styckekant upp på namnet.
    ...(h.linjeOver ? { border: { top: kant(h.linjeOver, b, ord(b.p.text), Math.round(h.linjeOver.luft * 2.835)) } } : {}),
    // Minsta radhöjd i punkter som CSS:ens line-height. En multipel räknas på
    // typsnittets egen radhöjd (Calibri 1,22) och gjorde huvudet 2 till 3 mm högre än i PDF:en.
    // Med fotot överst (Björk) är stycket en multipel som också gör fotoraden högre:
    // 1,17 ger CSS:ens 4 mm mellan fotot och namnet (kalibrerat mot PDF:en).
    spacing: fotoForst
      ? { before: 0, after: 0, line: Math.round(240 * 1.17) }
      : {
          // Linjen ovanför (Lind): luften är kantens avstånd till texten, inget avstånd före.
          before: h.form === 'remsa' && h.remsa ? mm(h.remsa.luft) : 0,
          after: 0,
          line: pt(b.m.grad(d.grad.namn) * (h.namn.radavstand ?? 1.1)),
          lineRule: h.namn.exakt ? ('exact' as const) : ('atLeast' as const),
        },
    children: [
      // Fotot överst i namnets stycke (Björk): Rubrik 1 är fortfarande dokumentets första stycke.
      ...(fotoForst ? [bild(b), new TextRun({ break: 1 })] : []),
      new TextRun({ text: dok.namn, font: b.namn, size: hp(b.m.grad(d.grad.namn)), ...stilRun({ vikt: 700, ...h.namn }, b, ord(b.p.text)), ...(textFarg ? { color: textFarg } : {}) }),
    ],
  })
  if (dok.titel)
    opts.push({
      style: 'Yrkestitel',
      alignment: just,
      keepNext: true,
      keepLines: true,
      ...kanter,
      // Med exakt radhöjd på namnet står titeln 1,5 pt lägre i Word än i PDF:en (kalibrerat på Alm, Loft, Skylt).
      spacing: { before: Math.max(0, mm(h.luftTitel) - (h.namn.exakt ? pt(1.5) : 0)), after: 0 },
      children: [
        new TextRun({ text: dok.titel, font: b.titel, size: hp(b.m.grad(d.grad.titel)), ...stilRun(h.titel, b, ord(b.p.accent)), ...(textFarg ? { color: textFarg } : {}) }),
      ],
    })
  if (medKontakt && dok.kontakt.length) {
    const farg = textFarg ?? ord(b.p.dampad)
    if (h.kontakt === 'lista') {
      dok.kontakt.forEach((k, i) =>
        opts.push({
          style: 'Kontakt',
          alignment: just,
          keepNext: i < dok.kontakt.length - 1,
          ...kanter,
          spacing: { before: i ? 0 : mm(h.luftKontakt), after: 0 },
          children: [new TextRun({ text: k.text, color: farg, font: b.kontakt, size: hp(b.m.grad(d.grad.kontakt)) })],
        })
      )
    } else {
      opts.push({ style: 'Kontakt', alignment: just, keepLines: true, ...kanter, spacing: { before: mm(h.luftKontakt), after: 0 }, children: kontaktRun(dok, b, farg) })
    }
  }
  const lu = h.linjeUnder
  if (lu && !lu.langd) {
    const sista = opts[opts.length - 1]
    opts[opts.length - 1] = {
      ...sista,
      border: { bottom: { ...kant(lu, b, ord(b.p.linje), Math.round(lu.luft * 2.83)), ...(lu.dubbel ? { style: BorderStyle.DOUBLE, size: Math.round(lu.pt * 8) } : {}) } },
    }
  }
  // Kort linje under huvudet (Valv): en bild i ett eget stycke, centrerad som huvudet.
  if (lu?.langd) {
    const linje = linjeBild(b, lu.langd, lu.pt, b.f(lu.farg, ord(b.p.accent)))
    if (linje)
      opts.push({
        alignment: just,
        keepNext: true,
        keepLines: true,
        spacing: { before: mm(lu.luft), after: 0, line: Math.max(20, Math.round(lu.pt * 20) + 10), lineRule: 'exact' as const },
        children: [linje],
      })
  }
  return opts.map((o) => stycke(b.huvudITabell ? { ...o, keepNext: false } : o))
}

/** Kontakten som högerställd lista i ett delat huvud (Alm), eller i två kolumner (Not). */
function kontaktDelad(dok: Dokument, b: B, bredd: number): Paragraph[] {
  const d = b.def
  const h = d.huvud
  const farg = ord(b.p.dampad)
  const grad = b.m.grad(d.grad.kontakt)
  const run = (t: string) => new TextRun({ text: t, color: farg, font: b.kontakt, size: hp(grad) })
  const rad = { line: pt(grad * 1.45), lineRule: 'atLeast' as const }
  if (h.kontaktKolumner === 2) {
    // Två uppgifter per rad, var och en högerställd i sin kolumn. Kolumnens
    // bredd uppskattas ur den längsta texten (Calibri, ungefär 0,5 em per tecken).
    const rader: string[][] = []
    for (let i = 0; i < dok.kontakt.length; i += 2) rader.push(dok.kontakt.slice(i, i + 2).map((k) => k.text))
    const bredast = Math.max(0, ...rader.map((r) => (r[1] ?? '').length))
    const andra = Math.round(bredast * grad * 0.5 * 20) + mm(5)
    const tabb = Math.max(mm(10), bredd - andra)
    return rader.map((r, i) =>
      stycke({
        keepNext: !b.huvudITabell && i < rader.length - 1,
        keepLines: true,
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, ...rad },
        tabStops: [
          { type: TabStopType.RIGHT, position: tabb },
          { type: TabStopType.RIGHT, position: bredd },
        ],
        children: r.length > 1 ? [new TextRun({ children: [new Tab()] }), run(r[0]), new TextRun({ children: [new Tab()] }), run(r[1])] : [new TextRun({ children: [new Tab(), new Tab()] }), run(r[0])],
      })
    )
  }
  return dok.kontakt.map((k, i) =>
    stycke({
      keepNext: !b.huvudITabell && i < dok.kontakt.length - 1,
      keepLines: true,
      alignment: AlignmentType.RIGHT,
      spacing: { before: i ? pt(1.1) : 0, after: 0, ...rad },
      children: [run(k.text)],
    })
  )
}

/**
 * Delat huvud (Alm, Not): en tabell med fotot (om det finns), namn och titel,
 * och kontakten till höger. Linjen under huvudet är nedre cellkant på alla
 * celler, med cellmarginalen som luft, så att den hamnar under huvudet
 * oavsett fotots höjd.
 */
function deladHuvud(dok: Dokument, b: B, bredd: number): Table {
  const d = b.def
  const h = d.huvud
  const lu = h.linjeUnder
  const kantNer = lu ? { ...INGA_KANTER, bottom: kant(lu, b, ord(b.p.linje), 0) } : INGA_KANTER
  const botten = lu ? mm(lu.luft) : 0
  const lage = h.kontaktLage === 'botten' ? VerticalAlign.BOTTOM : VerticalAlign.CENTER
  const kontaktBredd = mm(h.kontaktKolumner === 2 ? 70 : 50)
  const fotoBredd = d.foto && b.foto ? mm(b.m.fotoMm + (d.foto.luft ?? 6)) : 0
  const textBredd = bredd - kontaktBredd - fotoBredd
  const cell = (barn: (Paragraph | Table)[], w: number) => tabellCell(barn, w, { verticalAlign: lage, borders: kantNer, margins: { top: 0, bottom: botten, left: 0, right: 0 } })
  const huvudUtan = { ...b, def: { ...d, huvud: { ...h, linjeUnder: undefined } } } as B
  const celler = [
    ...(fotoBredd ? [cell([stycke({ keepNext: !b.huvudITabell, spacing: { after: 0, line: 240 }, children: [bild(b)] })], fotoBredd)] : []),
    cell(huvudStycken(dok, huvudUtan, AlignmentType.LEFT, undefined, false, false), textBredd),
    cell(kontaktDelad(dok, b, kontaktBredd), kontaktBredd),
  ]
  return tabell([new TableRow({ cantSplit: true, children: celler })], [...(fotoBredd ? [fotoBredd] : []), textBredd, kontaktBredd])
}

/**
 * Huvudets innehåll i en given bredd: stycken, eller en tabell utan kanter
 * med fotot i egen cell (Kalksten, Fasad, Koppar, Granit, Loft, Betong).
 */
function huvudInnehall(dok: Dokument, b: B, bredd: number, textFarg?: string): (Paragraph | Table)[] {
  const d = b.def
  const h = d.huvud
  const medKontakt = !(d.layout.typ === 'sidospalt' && d.layout.spalt.kontakt)
  const foto = d.foto && b.foto ? d.foto : undefined
  const just: Just = h.form === 'centrerad' ? AlignmentType.CENTER : h.form === 'hoger' ? AlignmentType.RIGHT : AlignmentType.LEFT
  if (h.form === 'delad') return [deladHuvud(dok, b, bredd)]
  if (foto && foto.plats !== 'huvud-topp' && foto.plats !== 'huvud-topp-vanster' && foto.plats !== 'sidospalt-topp') {
    const vanster = foto.plats === 'huvud-vanster' || foto.plats === 'band-vanster'
    const fb = mm(b.m.fotoMm + (foto.luft ?? (foto.plats === 'huvud-vanster' ? 8 : 6)))
    const text = tabellCell(huvudStycken(dok, b, AlignmentType.LEFT, textFarg, medKontakt, false), bredd - fb, {
      verticalAlign: vanster ? VerticalAlign.CENTER : VerticalAlign.TOP,
    })
    // Fotot som hänger ned i luften under huvudet (Loft) är förankrat i cellen och
    // räknas inte in i radens höjd; raden är minst så hög att fotot slutar 2 mm ovanför första avsnittet.
    const hanger = foto.hanger && foto.plats === 'huvud-hoger'
    const bildRun = hanger
      ? new ImageRun({
          type: 'png',
          data: b.foto!,
          transformation: { width: px(b.m.fotoMm), height: px(b.m.fotoHojdMm) },
          altText: { name: 'Foto', description: 'Foto', title: 'Foto' },
          floating: {
            horizontalPosition: { relative: HorizontalPositionRelativeFrom.COLUMN, offset: Math.round((fb / TWIP_PER_MM - b.m.fotoMm) * 36000) },
            verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
            wrap: { type: TextWrappingType.NONE },
            allowOverlap: true,
            layoutInCell: true,
          },
        })
      : bild(b)
    const bildCell = tabellCell(
      [stycke({ alignment: vanster ? AlignmentType.LEFT : AlignmentType.RIGHT, keepNext: !b.huvudITabell, spacing: { after: 0, line: 240 }, children: [bildRun] })],
      fb,
      { verticalAlign: h.form === 'band' ? VerticalAlign.CENTER : VerticalAlign.TOP }
    )
    const minHojd = hanger ? { height: { value: mm(Math.max(0, b.m.fotoHojdMm - b.m.luftUnderHuvud + 2)), rule: 'atLeast' as const } } : {}
    return [tabell([new TableRow({ cantSplit: true, ...minHojd, children: vanster ? [bildCell, text] : [text, bildCell] })], vanster ? [fb, bredd - fb] : [bredd - fb, fb])]
  }
  return huvudStycken(dok, b, just, textFarg, medKontakt, Boolean(foto && foto.plats === 'huvud-topp'))
}

/** Bandets cell: bakgrund och luft som i PDF:en. Ett ljust band utan textfärg (Betong) behåller texternas egna färger. */
function bandCell(dok: Dokument, b: B, helBredd: number, span = 1): TableCell {
  const band = b.def.huvud.band!
  const fill = b.f(band.bakgrund, ord(b.p.accent))
  return tabellCell(huvudInnehall(dok, b, helBredd - mm(band.luft.sidor) * 2, band.text ? b.f(band.text, 'FFFFFF') : undefined), helBredd, {
    columnSpan: span,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: mm(band.luft.topp), bottom: mm(band.luft.botten), left: mm(band.luft.sidor), right: mm(band.luft.sidor) },
  })
}

/** Remsan överst (Skylt): en rad i full sidbredd med exakt höjd och kontakten i vitt. */
function remsaTabell(dok: Dokument, b: B): Table {
  const rm = b.def.huvud.remsa!
  const fill = b.f(rm.bakgrund, ord(b.p.accent))
  const farg = b.f(rm.text, 'FFFFFF')
  const cell = tabellCell(dok.kontakt.length ? [stycke({ keepNext: true, keepLines: true, spacing: { before: 0, after: 0 }, children: kontaktRun(dok, b, farg) })] : [], A4.bredd, {
    shading: { type: ShadingType.CLEAR, color: 'auto', fill },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 0, bottom: 0, left: mm(rm.sidor), right: mm(rm.sidor) },
  })
  return tabell([new TableRow({ cantSplit: true, height: { value: mm(rm.hojd), rule: 'exact' as const }, children: [cell] })], [A4.bredd], -mm(b.m.sida.vanster))
}


/** Huvudets höjd i mm, ungefär, för spaltradens minsta höjd. */
function huvudHojdMm(dok: Dokument, def: MallDef, m: Matt): number {
  const h = def.huvud
  const PT = 0.3528
  const text = m.grad(def.grad.namn) * 1.15 * PT + (dok.titel ? h.luftTitel + m.grad(def.grad.titel) * 1.3 * PT : 0)
  // Fotot överst i spalten (Sand, Ek) står inte i huvudet.
  const foto = def.foto && dok.foto && def.foto.plats !== 'sidospalt-topp' ? m.fotoHojdMm : 0
  // Bandet växer med fotot (Granit: 15 + 30 + 9 mm), granskningen R2.
  if (h.form === 'band' && h.band) return Math.max(m.bandHojd(h.band.minHojd) ?? 0, h.band.luft.topp + Math.max(text, foto) + h.band.luft.botten) + m.luftUnderHuvud
  return Math.max(foto, text) + m.luftUnderHuvud
}

/* ------------------------------------------------------------------ stilar */

function stilar(b: B) {
  const d = b.def
  // Radavståndet som minsta höjd i punkter, samma som CSS:ens line-height
  // (Words multipel räknas på typsnittets egen radhöjd och blir olika per typsnitt).
  const line = pt(b.m.grad(d.grad.brod) * b.m.radavstand)
  return {
    default: {
      document: {
        // Kerning från 8 pt, som font-kerning: normal i PDF:en (annars bryter Word raderna tidigare).
        run: { font: b.brod, size: hp(b.m.grad(d.grad.brod)), color: ord(d.farger.text), language: SPRAK, kern: 16 },
        paragraph: { spacing: { line, lineRule: 'atLeast' as const, after: 0 } },
      },
      heading1: {
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: b.rubrik, size: hp(b.m.grad(d.grad.namn)), color: ord(b.p.text) },
        paragraph: { spacing: { before: 0, after: 0, line: 240 }, keepLines: true, outlineLevel: 0 },
      },
      heading2: {
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: b.rubrik, size: hp(b.m.grad(d.grad.rubrik)), color: ord(b.p.accent) },
        paragraph: { spacing: { before: mm(b.m.luftOver), after: mm(b.m.luftUnderRubrik), line: 240 }, keepLines: true, outlineLevel: 1 },
      },
    },
    paragraphStyles: [
      { id: 'Yrkestitel', name: 'Yrkestitel', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: hp(b.m.grad(d.grad.titel)) }, paragraph: { keepLines: true, spacing: { line: pt(b.m.grad(d.grad.titel) * b.m.radavstand), lineRule: 'atLeast' as const } } },
      { id: 'Kontakt', name: 'Kontakt', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: hp(b.m.grad(d.grad.kontakt)), color: ord(b.p.dampad) }, paragraph: { keepLines: true, spacing: { line: pt(b.m.grad(d.grad.kontakt) * b.m.radavstand), lineRule: 'atLeast' as const } } },
      {
        id: 'Posttitel',
        name: 'Posttitel',
        basedOn: 'Normal',
        next: 'Arbetsgivare',
        quickFormat: true,
        run: { bold: true, size: hp(b.m.grad(d.grad.posttitel)) },
        paragraph: { spacing: { before: mm(b.m.luftMellan), after: pt(1) }, keepLines: true },
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
            style: { paragraph: { indent: { left: indrag, hanging: indrag } }, run: { color: b.f(d.punkt.farg, ord(b.p.text)), font: b.brod } },
          },
        ],
      },
    ],
  }
}

/* ------------------------------------------------------------------ fotot */

/**
 * Fotot som png i rätt form: runt med genomskinliga hörn, rundad kvadrat
 * (3 mm hörnradie), kvadratiskt eller stående (bredd x höjd, beskuret med
 * fit cover).
 */
export async function fotoSomPng(url: string, form: FotoForm, storlekMm: number, hojdMm = storlekMm): Promise<Buffer | undefined> {
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
    const hojd = form === 'staende' ? Math.round((sida * hojdMm) / storlekMm) : sida
    const bild = sharp(data).resize(sida, hojd, { fit: 'cover' })
    if (form === 'kvadrat' || form === 'staende') return await bild.png().toBuffer()
    const mask = Buffer.from(
      form === 'rundad'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="${sida}" height="${sida}"><rect width="${sida}" height="${sida}" rx="${(sida * 3) / storlekMm}" fill="#fff"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${sida}" height="${sida}"><circle cx="${sida / 2}" cy="${sida / 2}" r="${sida / 2}" fill="#fff"/></svg>`
    )
    return await bild.composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
  } catch {
    return undefined
  }
}

/* ------------------------------------------------------------------ bygget */

/** Word-typsnittets namn: användarens val om det finns i Word, annars mallens. */
function wordTypsnitt(def: MallDef, val: MallVal): { brod: string; rubrik: string; namn: string; titel: string; kontakt: string } {
  const t = typsnittFor(def, val)
  const brod = WORD_TYPSNITT.includes(t.brod) ? t.brod : def.typsnitt.brod
  // Titel och kontakt följer brödtexten om mallen inte säger annat (Lind: Calibri).
  return {
    brod: getFontNameForDocx(brod),
    rubrik: getFontNameForDocx(t.rubrik),
    namn: getFontNameForDocx(t.namn),
    titel: getFontNameForDocx(def.typsnitt.titel ?? brod),
    kontakt: getFontNameForDocx(def.typsnitt.kontakt ?? brod),
  }
}

export async function byggWordDokument(cv: CVMetadata, def: MallDef, val: MallVal = {}): Promise<Document> {
  const dok = byggDokument(cv, def, val)
  const p = palett(def, val)
  const m = matt(def, val)
  const typ = wordTypsnitt(def, val)
  const foto = dok.foto && def.foto && visaFoto(def, val) ? await fotoSomPng(dok.foto, def.foto.form, def.foto.storlek, m.fotoHojdMm / (m.fotoMm / def.foto.storlek)) : undefined
  const marg = { top: mm(m.sida.topp), bottom: mm(m.sida.botten + WORD_BOTTEN_MM), left: mm(m.sida.vanster), right: mm(m.sida.hoger) }
  const textbredd = A4.bredd - marg.left - marg.right
  const prick = def.layout.typ === 'marginalprick' ? { mm: def.layout.punkt, farg: ord(los(def.layout.linje.farg, p, p.accent)) } : undefined
  const linjer = await skapaLinjer(linjerSomBehovs(def, p), prick)
  const b: B = {
    def,
    val,
    p,
    m,
    ...typ,
    linjer,
    nr: 0,
    f: (x, reserv) => ord(los(x, p, `#${reserv}`)),
    foto,
    textbredd,
  }
  const grad = m.grad(def.grad.brod)
  const l = def.layout
  const h = def.huvud
  const band = h.form === 'band' && h.band
  const luftUnder = mm(m.luftUnderHuvud)
  const barn: (Paragraph | Table)[] = []
  // Word lägger cellens övre marginal på varje sida som en delad rad fortsätter på.
  // I sidospaltsmallarna dras den från sidans övre marginal (sidhuvudet i bandmallar)
  // och läggs på huvudets cell i stället, så att sida 2 börjar där Chromes gör.
  let avdragTopp = 0

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
    const kontakt = iSpaltcell(() =>
      s.kontakt && dok.kontakt.length
        ? [
            rubrik2({ rubrik: 'Kontakt' }, b, rSpalt, 0),
            ...dok.kontakt.map((k, i) =>
              stycke({ keepNext: i < dok.kontakt.length - 1, spacing: { after: pt(1) }, children: [textRun(k.text, rSpalt, { size: hp(m.grad(def.grad.kontakt)) })] })
            ),
          ]
        : []
    )
    // Fotot överst i spalten (Sand centrerat, Ek vänsterställt), 5 mm luft under.
    const fotoISpalt =
      def.foto?.plats === 'sidospalt-topp' && foto
        ? [
            stycke({
              alignment: def.foto.justering === 'centrerad' ? AlignmentType.CENTER : AlignmentType.LEFT,
              keepLines: true,
              spacing: { before: 0, after: mm(5), line: 240 },
              children: [bild(b)],
            }),
          ]
        : []
    const sido = spaltInnehall(dok.sidospalt, b, rSpalt, 0, [...(fotoISpalt.length ? [fotoISpalt] : []), ...(kontakt.length ? [kontakt] : [])])
    const fill = s.bakgrund ? b.f(s.bakgrund, ord(p.ton)) : undefined
    // Linjen längs spaltens innerkant (Ek): cellkant; radens minsta höjd för den till bottenmarginalen.
    const spaltLinje = s.linje ? kant(s.linje, b, ord(p.accent), 0) : undefined
    const sidoCell = tabellCell(sido, spaltBredd, {
      ...(fill ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill } } : {}),
      ...(spaltLinje ? { borders: { ...INGA_KANTER, [s.sida === 'vanster' ? 'right' : 'left']: spaltLinje } } : {}),
      // Ingen nedre cellmarginal: Word håller den fri i botten av varje sida som raden
      // fortsätter över, också i huvudspalten bredvid (Granit långt). Panelens höjd
      // kommer från radens minsta höjd.
      margins: { top: mm(s.luft.topp), bottom: 0, left: s.sida === 'vanster' ? ytter : inre, right: s.sida === 'vanster' ? inre : ytter },
    })
    const huvudCell = tabellCell(spaltInnehall(dok.huvudspalt, b, { bredd: huvudBredd, iSpalt: false, grad }, 0), helBredd - spaltBredd, {
      margins: {
        top: mm(s.luft.topp),
        bottom: 0,
        left: s.sida === 'vanster' ? mm(s.mellanrum) : marg.left,
        right: s.sida === 'vanster' ? marg.right : mm(s.mellanrum),
      },
    })
    b.huvudITabell = true
    avdragTopp = mm(s.luft.topp)
    const huvudRad = band
      ? bandCell(dok, b, helBredd, 2)
      : tabellCell(huvudInnehall(dok, b, helBredd - marg.left - marg.right), helBredd, {
          columnSpan: 2,
          margins: { top: mm(s.luft.topp), bottom: luftUnder, left: marg.left, right: marg.right },
        })
    const kol = s.sida === 'vanster' ? [spaltBredd, helBredd - spaltBredd] : [helBredd - spaltBredd, spaltBredd]
    barn.push(
      tabell(
        [
          new TableRow({
            cantSplit: true,
            ...(band && h.band!.minHojd ? { height: { value: mm(Math.max(0, h.band!.minHojd - h.band!.luft.topp - h.band!.luft.botten)), rule: 'atLeast' as const } } : {}),
            children: [huvudRad],
          }),
          new TableRow({
            cantSplit: false,
            height: { value: Math.max(0, A4.hojd - (band ? 0 : marg.top) - marg.bottom - mm(huvudHojdMm(dok, def, m) + PANEL_MARGINAL_MM)), rule: 'atLeast' as const },
            children: s.sida === 'vanster' ? [sidoCell, huvudCell] : [huvudCell, sidoCell],
          }),
        ],
        kol,
        -marg.left
      )
    )
  } else {
    if (band) {
      barn.push(tabell([new TableRow({ cantSplit: true, ...(h.band!.minHojd ? { height: { value: mm(Math.max(0, h.band!.minHojd - h.band!.luft.topp - h.band!.luft.botten)), rule: 'atLeast' as const } } : {}), children: [bandCell(dok, b, A4.bredd)] })], [A4.bredd], -marg.left))
    } else if (h.form === 'remsa' && h.remsa) {
      // Remsan i papperskanten (Skylt), namnet på vitt under.
      barn.push(remsaTabell(dok, b), ...huvudStycken(dok, b, AlignmentType.LEFT, undefined, false, false))
    } else {
      barn.push(...huvudInnehall(dok, b, textbredd))
    }
    if (l.typ === 'tvaspalt') {
      barn.push(...huvudspaltDelar(dok.fullBredd, b, { bredd: textbredd, iSpalt: false, grad }, luftUnder))
      const vb = Math.round(textbredd * l.vansterAndel)
      const hb = textbredd - vb
      const mitten = mm(l.mellanrum / 2)
      const rH: Ruta = { bredd: hb - mitten, iSpalt: true, grad: m.grad(def.grad.sidospalt ?? def.grad.brod) }
      // Luften över spalterna som luft före första rubriken, inte som cellmarginal:
      // Word upprepar cellmarginalen överst på varje sida som raden fortsätter på.
      const vanster = spaltInnehall(dok.huvudspalt, b, { bredd: vb - mitten, iSpalt: false, grad }, mm(m.luftOver))
      const hoger = spaltInnehall(dok.sidospalt, b, rH, mm(m.luftOver))
      barn.push(
        tabell(
          [
            new TableRow({
              cantSplit: false,
              children: [
                tabellCell(vanster, vb, { margins: { top: 0, bottom: 0, left: 0, right: mitten } }),
                tabellCell(hoger, hb, { margins: { top: 0, bottom: 0, left: mitten, right: 0 } }),
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

  // Word kräver ett stycke efter en tabell sist i dokumentet och lägger
  // annars själv till ett i normal radhöjd, som kan skjuta över en egen
  // sida. Vårt är 0,1 pt högt.
  if (barn[barn.length - 1] instanceof Table) {
    barn.push(new Paragraph({ spacing: { before: 0, after: 0, line: 2, lineRule: 'exact' }, children: [new TextRun({ text: '', size: 2 })] }))
  }

  // Huvudband i papperskanten: övre marginalen noll och sidhuvudet bär
  // marginalen på sida 2 och framåt.
  const kant0 = Boolean(band) || h.form === 'remsa'
  const namn = dok.namn
  // Ram runt sidan (Ramverk): sidkanter på alla sidor, mätta från papperskanten.
  const sr = def.sidram
  const sidkant = sr
    ? (() => {
        const k: IBorderOptions = { style: BorderStyle.SINGLE, size: Math.max(2, Math.round(sr.pt * 8)), color: b.f(sr.farg, ord(p.accent)), space: Math.round(sr.avstand * 2.835) }
        return {
          pageBorders: { display: PageBorderDisplay.ALL_PAGES, offsetFrom: PageBorderOffsetFrom.PAGE },
          pageBorderTop: k,
          pageBorderRight: k,
          pageBorderBottom: k,
          pageBorderLeft: k,
        }
      })()
    : undefined
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
          page: {
            size: { width: A4.bredd, height: A4.hojd },
            margin: kant0 ? { ...marg, top: 0, header: 0 } : { ...marg, top: marg.top - avdragTopp },
            ...(sidkant ? { borders: sidkant } : {}),
          },
        },
        ...(kant0
          ? {
              headers: {
                first: new Header({ children: [stycke({ spacing: { before: 0, after: 0, line: 20, lineRule: 'exact' as const }, children: [new TextRun({ text: ' ', size: 2 })] })] }),
                default: new Header({ children: [stycke({ spacing: { before: 0, after: 0, line: marg.top - avdragTopp, lineRule: 'exact' as const }, children: [new TextRun({ text: ' ', size: 2 })] })] }),
              },
            }
          : {}),
        children: barn,
      },
    ],
  })
}

/* Brevmallen (src/lib/letters/brevmall/word.ts) bygger brevets huvud med samma delar. Bara exporter, inget ändrat. */
export { huvudInnehall, huvudStycken, bandCell, remsaTabell, stilar, wordTypsnitt, skapaLinjer, linjerSomBehovs, rubrik2, iSpaltcell, stycke, tabell, tabellCell }
export type { B as WordSammanhang, Ruta as WordRuta }
