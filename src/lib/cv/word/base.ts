/**
 * CV som riktig Word-fil (docs/plan-cv-word-2026-11-15.md, skissen
 * docs/design/skiss-cv-word-2026-11-15.html).
 *
 * En byggare för alla sex mallarna. Varje mall är en WordMallDef med typsnitt,
 * färger, kantlinjer och sektionsordning (src/lib/cv/word/mallar/). Filen ska
 * gå att redigera som vilket Word-dokument som helst, och den ska inte delas
 * upp konstigt när texten blir längre. Därför gäller, i alla mallar:
 *
 *  - Bara Words egna medel: stilar (Rubrik 1 för namnet, Rubrik 2 för
 *    sektionerna, Posttitel och Arbetsgivare för posterna), riktiga
 *    punktlistor via numrering, hårlinjer som styckekanter och perioden
 *    högerställd med tabbstopp. Inga textrutor, inga bilder, inga tabeller
 *    för vanliga rader (Stacks kompetensspalter är det enda undantaget).
 *  - Inga tomma stycken för luft. Allt avstånd ligger i stilarnas
 *    styckeavstånd, och ingen radbrytning används för layout.
 *  - Sidbrytningen: rubriker och posttitlar har "håll ihop med nästa" och
 *    "håll ihop rader", arbetsgivarraden hålls ihop med första punkten,
 *    punkter bryts aldrig mitt i, och änke- och horungekontroll är på i
 *    varje stycke.
 *  - Svenska (sv-SE) som språk, så stavningskontrollen läser rätt.
 *  - A4.
 *
 * Ingen reklam i filen: bara CV:t. Metadatan säger Jobbcoach.ai som skapare.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Paragraph,
  ShadingType,
  Tab,
  TabStopType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type IBorderOptions,
  type IParagraphOptions,
  type IRunOptions,
} from 'docx'
import type { CVCertification, CVEducation, CVExperience, CVMetadata, CVProject } from '@/lib/cv/cv-metadata'
import { formatSwedishAddress } from '@/lib/cv/templates/base/address-formatter'
import type { WordTemplateId } from '@/lib/cv/template-antal'

/* ------------------------------------------------------------------ typer */

export type SektionId =
  | 'profil'
  | 'kompetensSpalter'
  | 'behorigheter'
  | 'arbetsplatser'
  | 'erfarenhet'
  | 'utbildning'
  | 'projekt'
  | 'kompetenser'
  | 'sprak'
  | 'certifieringar'

/** En kantlinje: färg (hex utan #) och tjocklek i punkter. */
export interface Linje {
  farg: string
  pt: number
}

export interface WordMallDef {
  id: WordTemplateId
  namn: string
  /** Brödtextens typsnitt. Användarens Word-typsnitt ersätter det. */
  typsnitt: string
  /** Typsnitt för datum, kontakt och kompetenser (Stack). Byts aldrig. */
  mono?: string
  /** Brödtextens storlek i punkter. */
  storlek: number
  /** Marginaler i millimeter. */
  marginal: { topp: number; sida: number; botten: number }
  farg: {
    text: string
    rubrik: string
    dampad: string
    yrkestitel: string
    arbetsgivare: string
    period: string
  }
  huvud: {
    justering: 'vanster' | 'centrerad'
    namnPt: number
    yrkestitelPt: number
    yrkestitelFet: boolean
    yrkestitelKursiv?: boolean
    kontaktPt: number
    /** Linjen under kontaktraden, alltså under hela huvudet. */
    linje: Linje
  }
  rubrik2: {
    justering: 'vanster' | 'centrerad'
    pt: number
    /** Spärrning i punkter. */
    sparrning: number
    farg: string
    vansterkant?: Linje
    underkant?: Linje
  }
  posttitelPt: number
  arbetsgivareFet: boolean
  /** Kursiv arbetsgivare och period (Tidlös). */
  arbetsgivareKursiv?: boolean
  periodKursiv?: boolean
  /** Hårlinje mellan posterna i erfarenheten (Norrsken). */
  linjeMellanPoster?: Linje
  punkt: { tecken: string; farg: string; typsnitt?: string }
  sektioner: SektionId[]
  rubriker: Record<SektionId, string>
  kompetensForm: 'grupper' | 'rad'
  /** Visar utbildningens beskrivning och kurser (Student). */
  utbildningDetaljer: boolean
  /** "Pågående" efter ett startår utan slut, också i utbildningen (Student). */
  utbildningPagaende: boolean
  /** Sorteras posterna nyast först, som mallens PDF. */
  sortera: boolean
  referenser: null | { text: string; justering: 'vanster' | 'centrerad'; kursiv: boolean; linje?: Linje }
  /** Behörighetsblocket (Hantverkare): tonad bakgrund och tunn kant. */
  block?: { bakgrund: string; kant: string; rubrikFarg: string }
}

/* -------------------------------------------------------------- enheter */

const TWIP_PER_MM = 56.6929
const mm = (v: number) => Math.round(v * TWIP_PER_MM)
/** Punkter till tjugondelar (styckeavstånd, spärrning). */
const pt = (v: number) => Math.round(v * 20)
/** Punkter till halvpunkter (teckenstorlek). */
const hp = (v: number) => Math.round(v * 2)
/** Kantlinjens tjocklek i åttondels punkter. */
const kant = (l: Linje): IBorderOptions => ({ style: BorderStyle.SINGLE, size: Math.round(l.pt * 8), color: l.farg, space: 4 })

const A4 = { bredd: 11906, hojd: 16838 }

/** Svenska i hela dokumentet, så stavningskontrollen inte rödmarkerar allt. */
const SPRAK = { value: 'sv-SE' }

/* ------------------------------------------------------------- texttvätt */

/**
 * Text ur CV-datan blir ren text. Datan kan bära HTML-rester och entiteter
 * från äldre parsning, och tecken som inte får finnas i XML gör filen
 * oläslig i Word, så de tas bort här. Radbrytningar inne i ett stycke blir
 * mellanslag: en sammanhängande text är ett stycke.
 */
export function rensa(text: unknown): string {
  if (text === null || text === undefined) return ''
  return String(text)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const c = Number(n)
      return c >= 32 && c < 0xd800 ? String.fromCharCode(c) : ''
    })
    // Tecken som XML 1.0 inte tillåter (styrtecken utom tabb och radslut).
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Ett textblock blir stycken: tom rad skiljer stycken, enkel radbrytning gör det inte. */
export function stycken(text: unknown): string[] {
  if (!text) return []
  return String(text)
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map(rensa)
    .filter(Boolean)
}

/** En punkt i en lista: inledande punkttecken som användaren skrivit själv tas bort. */
function punkttext(text: unknown): string {
  return rensa(text).replace(/^([•·▪■◦‣\-–—*]\s*)+/, '').trim()
}

/* ------------------------------------------------------------- perioder */

const tid = (s?: string) => (s ? new Date(s).getTime() : NaN)

function sorteraErfarenhet(lista: CVExperience[]): CVExperience[] {
  return [...lista].sort((a, b) => {
    const da = a.endDate ? tid(a.endDate) : Date.now()
    const db = b.endDate ? tid(b.endDate) : Date.now()
    return (db || 0) - (da || 0)
  })
}

function sorteraUtbildning(lista: CVEducation[]): CVEducation[] {
  const slut = (e: CVEducation) =>
    e.endDate ? tid(e.endDate) : e.graduationYear ? tid(e.graduationYear + '-12-31') : Date.now()
  return [...lista].sort((a, b) => (slut(b) || 0) - (slut(a) || 0))
}

/** Samma period som mallens PDF: "2021 – Pågående", "2018 – 2021". */
/** "2019 – 2019" blir "2019". */
function spann(start: string, slut: string): string {
  if (!start) return slut
  if (!slut || slut === start) return start
  return `${start} – ${slut}`
}

export function periodErfarenhet(e: CVExperience): string {
  const start = rensa(e.startDate)
  const slut = rensa(e.endDate)
  if (slut) return spann(start, slut)
  return start ? `${start} – Pågående` : ''
}

export function periodUtbildning(e: CVEducation, pagaende: boolean): string {
  const start = rensa(e.graduationYear) || rensa(e.startDate)
  const slut = rensa(e.endDate)
  if (slut) return spann(start, slut)
  if (pagaende && rensa(e.startDate) && !rensa(e.graduationYear)) return `${start} – Pågående`
  return start
}

function periodProjekt(p: CVProject): string {
  const start = rensa(p.startDate)
  const slut = rensa(p.endDate)
  return spann(start, slut)
}

/* --------------------------------------------------------- byggstenarna */

/**
 * Varje stycke går genom den här: änke- och horungekontroll alltid på, så att
 * en ensam rad aldrig hamnar överst eller nederst på en sida.
 */
function stycke(opts: IParagraphOptions): Paragraph {
  const alla = { widowControl: true, ...opts }
  const p = new Paragraph(alla)
  OPTIONER.set(p, alla)
  return p
}

/** Styckenas egenskaper, så att ett stycke kan byggas om med "håll ihop med nästa". */
const OPTIONER = new WeakMap<Paragraph, IParagraphOptions>()

/** Samma stycke, men hållet ihop med nästa. */
function hallIhopMedNasta(p: Paragraph): Paragraph {
  const o = OPTIONER.get(p)
  return o ? stycke({ ...o, keepNext: true }) : p
}

interface Bygg {
  def: WordMallDef
  font: string
  textbredd: number
}

function justering(j: 'vanster' | 'centrerad') {
  return j === 'centrerad' ? AlignmentType.CENTER : AlignmentType.LEFT
}

function rubrik2(b: Bygg, text: string): Paragraph {
  return stycke({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] })
}

/**
 * Posttiteln: titeln till vänster och perioden högerställd via ett tabbstopp
 * vid högermarginalen. Hålls ihop med nästa stycke och med sina egna rader.
 */
function posttitel(
  b: Bygg,
  titel: string,
  period: string,
  opts: { forst: boolean; hallIhop: boolean; linjeOver?: Linje }
): Paragraph {
  const { def } = b
  const periodRun: IRunOptions = {
    color: def.farg.period,
    size: hp(def.storlek - 1.5),
    bold: false,
    italics: Boolean(def.periodKursiv),
    ...(def.mono ? { font: def.mono } : {}),
  }
  return stycke({
    style: 'Posttitel',
    keepNext: opts.hallIhop,
    keepLines: true,
    tabStops: [{ type: TabStopType.RIGHT, position: b.textbredd }],
    ...(opts.forst ? { spacing: { before: 0 } } : {}),
    ...(opts.linjeOver ? { border: { top: { ...kant(opts.linjeOver), space: 7 } }, spacing: { before: pt(8) } } : {}),
    children: [
      new TextRun({ text: titel }),
      ...(period ? [new TextRun({ ...periodRun, children: [new Tab(), period] })] : []),
    ],
  })
}

function arbetsgivare(text: string, hallIhop: boolean): Paragraph {
  return stycke({ style: 'Arbetsgivare', keepNext: hallIhop, keepLines: true, children: [new TextRun(text)] })
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

/** En punkt i en riktig lista. Bryts aldrig mitt i, men gärna mellan punkter. */
function punkt(text: string, hallIhop = false): Paragraph {
  return stycke({
    numbering: { reference: 'punkter', level: 0 },
    keepLines: true,
    keepNext: hallIhop,
    children: [new TextRun(text)],
  })
}

/* ------------------------------------------------------------- sektioner */

function huvud(b: Bygg, cv: CVMetadata): Paragraph[] {
  const { def } = b
  const p = cv.personalInfo
  const ut: Paragraph[] = []
  const just = justering(def.huvud.justering)
  ut.push(stycke({ heading: HeadingLevel.HEADING_1, alignment: just, keepNext: true, children: [new TextRun(rensa(p.fullName))] }))
  const titel = rensa(p.title)
  if (titel) ut.push(stycke({ style: 'Yrkestitel', alignment: just, keepNext: true, children: [new TextRun(titel)] }))

  const adress = rensa(p.address) || rensa(p.location)
  const delar = [
    rensa(p.email),
    rensa(p.phone),
    adress ? formatSwedishAddress(adress) : '',
    rensa(p.linkedin || p.linkedIn).replace(/^https?:\/\/(www\.)?/i, ''),
  ].filter(Boolean)
  if (delar.length > 0) {
    // Kontaktraden är ett stycke; punkten mellan delarna är text, inte layout.
    const sep: IRunOptions = { text: '  ·  ', color: 'CBD5E1' }
    ut.push(
      stycke({
        style: 'Kontakt',
        alignment: just,
        children: delar.flatMap((d, i) => [
          ...(i ? [new TextRun(sep)] : []),
          new TextRun({ text: d, ...(def.mono ? { font: def.mono } : {}) }),
        ]),
      })
    )
  }
  return ut
}

function profil(b: Bygg, cv: CVMetadata): Paragraph[] {
  const delar = stycken(cv.summary)
  if (delar.length === 0) return []
  return [rubrik2(b, b.def.rubriker.profil), ...delar.map((t) => stycke({ style: 'Profiltext', children: [new TextRun(t)] }))]
}

function erfarenhet(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = (cv.experience ?? []).filter((e) => rensa(e.position) || rensa(e.company))
  if (lista.length === 0) return []
  const poster = b.def.sortera ? sorteraErfarenhet(lista) : lista
  const ut: Paragraph[] = [rubrik2(b, b.def.rubriker.erfarenhet)]
  poster.forEach((e, i) => {
    const titel = rensa(e.position) || rensa(e.company)
    const foretag = rensa(e.position) ? rensa(e.company) : ''
    const punkter = (Array.isArray(e.description) ? e.description : e.description ? [e.description] : [])
      .map(punkttext)
      .filter(Boolean)
    const harMer = Boolean(foretag) || punkter.length > 0
    ut.push(
      posttitel(b, titel, periodErfarenhet(e), {
        forst: i === 0,
        hallIhop: harMer,
        linjeOver: i > 0 ? b.def.linjeMellanPoster : undefined,
      })
    )
    if (foretag) ut.push(arbetsgivare(foretag, punkter.length > 0))
    punkter.forEach((t, j) => ut.push(punkt(t, hallIhopPunkt(j, punkter.length))))
  })
  return ut
}

function utbildning(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = (cv.education ?? []).filter((e) => rensa(e.degree) || rensa(e.institution))
  if (lista.length === 0) return []
  const poster = b.def.sortera ? sorteraUtbildning(lista) : lista
  const ut: Paragraph[] = [rubrik2(b, b.def.rubriker.utbildning)]
  poster.forEach((e, i) => {
    const titel = rensa(e.degree) || rensa(e.institution)
    let skola = rensa(e.degree) ? rensa(e.institution) : ''
    if (b.def.utbildningDetaljer && rensa(e.gpa)) skola = [skola, `Betyg: ${rensa(e.gpa)}`].filter(Boolean).join(' · ')
    const detaljer: string[] = []
    if (b.def.utbildningDetaljer && e.relevantCourses?.length) {
      detaljer.push(`Relevanta kurser: ${e.relevantCourses.map(rensa).filter(Boolean).join(', ')}`)
    }
    const beskrivning = rensa(e.description)
    if (beskrivning) detaljer.push(beskrivning)
    ut.push(posttitel(b, titel, periodUtbildning(e, b.def.utbildningPagaende), { forst: i === 0, hallIhop: Boolean(skola) || detaljer.length > 0 }))
    if (skola) ut.push(arbetsgivare(skola, detaljer.length > 0))
    detaljer.forEach((t, j) =>
      ut.push(
        b.def.utbildningDetaljer
          ? punkt(t, hallIhopPunkt(j, detaljer.length))
          : stycke({ style: 'Postdetalj', keepLines: true, keepNext: j < detaljer.length - 1, children: [new TextRun(t)] })
      )
    )
  })
  return ut
}

function projekt(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = (cv.projects ?? []).filter((p) => rensa(p.name || p.title))
  if (lista.length === 0) return []
  const ut: Paragraph[] = [rubrik2(b, b.def.rubriker.projekt)]
  lista.forEach((p, i) => {
    const beskrivning = stycken(p.description)
    const teknik = (p.technologies ?? []).map(rensa).filter(Boolean)
    const rader = [...beskrivning, ...(teknik.length ? [`Teknik: ${teknik.join(', ')}`] : [])]
    ut.push(posttitel(b, rensa(p.name || p.title), periodProjekt(p), { forst: i === 0, hallIhop: rader.length > 0 }))
    rader.forEach((t, j) =>
      ut.push(stycke({ style: 'Postdetalj', keepLines: true, keepNext: j < rader.length - 1, children: [new TextRun(t)] }))
    )
  })
  return ut
}

/** Kompetensgrupperna, utan språk som redan står under Språk (som mallens PDF). */
function kompetensGrupper(cv: CVMetadata): { namn: string; lista: string[] }[] {
  const sprak = (cv.languages ?? []).map((l) => rensa(l.language).toLowerCase()).filter(Boolean)
  return (cv.skills ?? [])
    .map((g) => ({
      namn: rensa(g.category),
      lista: (g.skills ?? []).map(rensa).filter((s) => s && !sprak.some((l) => s.toLowerCase().includes(l))),
    }))
    .filter((g) => g.lista.length > 0)
}

function kompetenser(b: Bygg, cv: CVMetadata): Paragraph[] {
  const grupper = kompetensGrupper(cv)
  if (grupper.length === 0) return []
  const ut: Paragraph[] = [rubrik2(b, b.def.rubriker.kompetenser)]
  if (b.def.kompetensForm === 'rad') {
    ut.push(stycke({ children: [new TextRun(grupper.flatMap((g) => g.lista).join('  ·  '))] }))
    return ut
  }
  grupper.forEach((g, i) =>
    ut.push(
      stycke({
        style: 'Kompetensrad',
        keepLines: true,
        keepNext: hallIhopRad(i, grupper.length),
        children: [
          ...(g.namn ? [new TextRun({ text: `${g.namn}: `, bold: true, color: b.def.farg.arbetsgivare })] : []),
          new TextRun(g.lista.join(', ')),
        ],
      })
    )
  )
  return ut
}

/**
 * Stacks kompetenser i spalter: en tabell utan kantlinjer med en grupp per
 * cell, tre i bredd. Varje cell läses som en helhet (rubrik och lista), så
 * ordningen blir rätt för den som läser filen maskinellt. Raden får aldrig
 * delas över en sida.
 */
function kompetensSpalter(b: Bygg, cv: CVMetadata): (Paragraph | Table)[] {
  let grupper = kompetensGrupper(cv)
  if (grupper.length === 0) return []
  // Som mallens PDF: en enda lång grupp delas i tre spalter.
  if (grupper.length === 1 && grupper[0].lista.length >= 6) {
    const l = grupper[0].lista
    const n = Math.ceil(l.length / 3)
    grupper = [
      { namn: 'Kompetenser', lista: l.slice(0, n) },
      { namn: 'Verktyg', lista: l.slice(n, n * 2) },
      { namn: 'Övrigt', lista: l.slice(n * 2) },
    ]
  }
  // Två eller fyra grupper står i två spalter, annars blir en tredjedel av
  // bredden tom eller en grupp ensam på sista raden (art-director 2026-11-15).
  const spalter = grupper.length === 2 || grupper.length === 4 ? 2 : 3
  const bredd = Math.floor(b.textbredd / spalter)
  const ingen = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const rader: TableRow[] = []
  for (let i = 0; i < grupper.length; i += spalter) {
    const del = grupper.slice(i, i + spalter)
    while (del.length < spalter) del.push({ namn: '', lista: [] })
    rader.push(
      new TableRow({
        cantSplit: true,
        children: del.map(
          (g) =>
            new TableCell({
              width: { size: bredd, type: WidthType.DXA },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 0, bottom: pt(4), left: 0, right: pt(8) },
              children: g.namn
                ? [
                    stycke({ style: 'Spaltrubrik', keepNext: true, keepLines: true, children: [new TextRun(g.namn)] }),
                    ...g.lista.map((s) => stycke({ style: 'Spaltpunkt', keepLines: true, children: [new TextRun(s)] })),
                  ]
                : // En tom cell måste ha ett stycke enligt formatet; det fyller ingen höjd.
                  [stycke({ style: 'Spaltpunkt', children: [] })],
            })
        ),
      })
    )
  }
  const tabell = new Table({
    width: { size: bredd * spalter, type: WidthType.DXA },
    columnWidths: Array(spalter).fill(bredd),
    borders: { top: ingen, bottom: ingen, left: ingen, right: ingen, insideHorizontal: ingen, insideVertical: ingen },
    rows: rader,
  })
  return [rubrik2(b, b.def.rubriker.kompetensSpalter), tabell]
}

function certNamn(c: CVCertification | string): string {
  if (typeof c === 'string') return rensa(c)
  const namn = rensa(c.name)
  if (!namn) return ''
  const utfardare = rensa(c.issuer)
  const ar = rensa(c.issueDate || c.date)
  return `${namn}${utfardare ? `, ${utfardare}` : ''}${ar ? ` (${ar})` : ''}`
}

function certifieringar(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = ((cv.certifications ?? []) as (CVCertification | string)[]).map(certNamn).filter(Boolean)
  if (lista.length === 0) return []
  return [rubrik2(b, b.def.rubriker.certifieringar), ...lista.map((t, i) => punkt(t, hallIhopRad(i, lista.length)))]
}

/**
 * Hantverkarens behörighetsblock: rubriken och behörigheterna i ett tonat
 * block med tunn kant. Stycken med samma kant och ton ritas av Word som en
 * enda ruta, så blocket är vanliga stycken, ingen textruta.
 */
function behorigheter(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = ((cv.certifications ?? []) as (CVCertification | string)[])
    .map((c) => (typeof c === 'string' ? rensa(c) : `${rensa(c.name)}${rensa(c.issuer) ? `, ${rensa(c.issuer)}` : ''}`))
    .filter(Boolean)
  const block = b.def.block
  if (lista.length === 0 || !block) return []
  const ram: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: block.kant, space: 6 }
  const ton = { type: ShadingType.CLEAR, color: 'auto', fill: block.bakgrund }
  const indrag = { left: pt(7), right: pt(7) }
  return [
    stycke({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      keepLines: true,
      shading: ton,
      indent: indrag,
      border: { top: ram, left: ram, right: ram, bottom: { style: BorderStyle.NONE, size: 0, color: 'auto', space: 0 } },
      spacing: { before: pt(14), after: 0 },
      children: [new TextRun({ text: b.def.rubriker.behorigheter, color: block.rubrikFarg })],
    }),
    stycke({
      style: 'Blocktext',
      keepLines: true,
      shading: ton,
      indent: indrag,
      border: { left: ram, right: ram, bottom: ram },
      children: [new TextRun(lista.join('  ·  '))],
    }),
  ]
}

function arbetsplatser(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = Array.from(new Set((cv.experience ?? []).map((e) => rensa(e.company)).filter(Boolean)))
  if (lista.length === 0) return []
  return [
    stycke({
      style: 'Blocktext',
      keepLines: true,
      spacing: { before: pt(10), after: pt(4) },
      children: [
        new TextRun({ text: `${b.def.rubriker.arbetsplatser}: `, bold: true, color: b.def.farg.arbetsgivare }),
        new TextRun(lista.join(', ')),
      ],
    }),
  ]
}

function sprak(b: Bygg, cv: CVMetadata): Paragraph[] {
  const lista = (cv.languages ?? []).filter((l) => rensa(l.language))
  if (lista.length === 0) return []
  return [
    rubrik2(b, b.def.rubriker.sprak),
    ...lista.map((l, i) =>
      stycke({
        style: 'Sprakrad',
        keepLines: true,
        keepNext: hallIhopRad(i, lista.length),
        children: [
          new TextRun({ text: rensa(l.language), bold: true }),
          ...(rensa(l.proficiency) ? [new TextRun({ text: `, ${rensa(l.proficiency).toLowerCase()}`, color: b.def.farg.dampad })] : []),
        ],
      })
    ),
  ]
}

function referenser(b: Bygg): Paragraph[] {
  const r = b.def.referenser
  if (!r) return []
  return [
    stycke({
      style: 'Referenser',
      alignment: justering(r.justering),
      keepLines: true,
      ...(r.linje ? { border: { top: { ...kant(r.linje), space: 8 } } } : {}),
      children: [new TextRun({ text: r.text, italics: r.kursiv, ...(b.def.mono ? { font: b.def.mono } : {}) })],
    }),
  ]
}

const BYGGARE: Record<SektionId, (b: Bygg, cv: CVMetadata) => (Paragraph | Table)[]> = {
  profil,
  kompetensSpalter,
  behorigheter,
  arbetsplatser,
  erfarenhet,
  utbildning,
  projekt,
  kompetenser,
  sprak,
  certifieringar,
}

/* --------------------------------------------------------------- stilarna */

function stilar(def: WordMallDef, font: string) {
  const f = def.farg
  const rubrikKanter = {
    ...(def.rubrik2.vansterkant ? { left: { ...kant(def.rubrik2.vansterkant), space: 6 } } : {}),
    ...(def.rubrik2.underkant ? { bottom: { ...kant(def.rubrik2.underkant), space: 3 } } : {}),
  }
  const harKant = Object.keys(rubrikKanter).length > 0
  return {
    default: {
      document: {
        run: { font, size: hp(def.storlek), color: f.text, language: SPRAK },
        // 1,15 radavstånd och 6 pt efter stycke (skissen, avsnitt 2).
        paragraph: { spacing: { line: 276, after: pt(6) } },
      },
      // Rubrik 1 och Rubrik 2 skrivs om här, inte som egna stilar: docx har
      // redan Heading1 och Heading2, och två stilar med samma id läses olika
      // av Word, LibreOffice och Google Docs.
      heading1: {
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font, size: hp(def.huvud.namnPt), bold: true, color: f.rubrik },
        paragraph: { spacing: { before: 0, after: pt(3), line: 240 }, keepNext: true, keepLines: true, outlineLevel: 0 },
      },
      heading2: {
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          font,
          size: hp(def.rubrik2.pt),
          bold: true,
          allCaps: true,
          color: def.rubrik2.farg,
          characterSpacing: pt(def.rubrik2.sparrning),
        },
        paragraph: {
          alignment: justering(def.rubrik2.justering),
          spacing: { before: pt(16), after: pt(8), line: 240 },
          keepNext: true,
          keepLines: true,
          outlineLevel: 1,
          ...(def.rubrik2.vansterkant ? { indent: { left: pt(9) } } : {}),
          ...(harKant ? { border: rubrikKanter } : {}),
        },
      },
    },
    paragraphStyles: [
      {
        id: 'Yrkestitel',
        name: 'Yrkestitel',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: hp(def.huvud.yrkestitelPt), color: f.yrkestitel, bold: def.huvud.yrkestitelFet, italics: Boolean(def.huvud.yrkestitelKursiv) },
        paragraph: { spacing: { after: pt(5) }, keepNext: true, keepLines: true },
      },
      {
        id: 'Kontakt',
        name: 'Kontakt',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: hp(def.huvud.kontaktPt), color: f.dampad },
        paragraph: {
          spacing: { after: pt(16) },
          keepLines: true,
          border: { bottom: { ...kant(def.huvud.linje), space: 10 } },
        },
      },
      {
        id: 'Profiltext',
        name: 'Profiltext',
        basedOn: 'Normal',
        next: 'Profiltext',
        quickFormat: true,
        paragraph: { spacing: { after: pt(6) } },
      },
      {
        id: 'Posttitel',
        name: 'Posttitel',
        basedOn: 'Normal',
        next: 'Arbetsgivare',
        quickFormat: true,
        run: { size: hp(def.posttitelPt), bold: true, color: f.rubrik },
        paragraph: { spacing: { before: pt(10), after: pt(1) }, keepNext: true, keepLines: true },
      },
      {
        id: 'Arbetsgivare',
        name: 'Arbetsgivare',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: hp(def.storlek - 0.5), color: f.arbetsgivare, bold: def.arbetsgivareFet, italics: Boolean(def.arbetsgivareKursiv) },
        paragraph: { spacing: { after: pt(4) }, keepLines: true },
      },
      {
        id: 'Postdetalj',
        name: 'Postdetalj',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: hp(def.storlek - 0.5) },
        paragraph: { spacing: { after: pt(3) } },
      },
      {
        id: 'Kompetensrad',
        name: 'Kompetensrad',
        basedOn: 'Normal',
        next: 'Kompetensrad',
        quickFormat: true,
        paragraph: { spacing: { after: pt(4) } },
      },
      {
        id: 'Sprakrad',
        name: 'Språkrad',
        basedOn: 'Normal',
        next: 'Sprakrad',
        quickFormat: true,
        paragraph: { spacing: { after: pt(2) } },
      },
      {
        id: 'Blocktext',
        name: 'Blocktext',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        paragraph: { spacing: { before: 0, after: pt(4) } },
      },
      {
        id: 'Spaltrubrik',
        name: 'Spaltrubrik',
        basedOn: 'Normal',
        next: 'Spaltpunkt',
        quickFormat: true,
        run: { size: hp(def.rubrik2.pt - 0.5), bold: true, allCaps: true, color: f.yrkestitel, characterSpacing: pt(1) },
        paragraph: { spacing: { before: 0, after: pt(3) } },
      },
      {
        id: 'Spaltpunkt',
        name: 'Spaltpunkt',
        basedOn: 'Normal',
        next: 'Spaltpunkt',
        quickFormat: true,
        run: { size: hp(def.storlek - 1.5), ...(def.mono ? { font: def.mono } : {}) },
        paragraph: { spacing: { before: 0, after: pt(1), line: 252 } },
      },
      {
        id: 'Referenser',
        name: 'Referenser',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: hp(def.storlek - 1.5), color: '94A3B8' },
        paragraph: { spacing: { before: pt(22), after: 0 } },
      },
    ],
  }
}

function numrering(def: WordMallDef) {
  return {
    config: [
      {
        reference: 'punkter',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: def.punkt.tecken,
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: pt(17), hanging: pt(11) }, spacing: { after: pt(2.5) } },
              run: { color: def.punkt.farg, ...(def.punkt.typsnitt ? { font: def.punkt.typsnitt } : {}) },
            },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: '◦',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: pt(34), hanging: pt(11) }, spacing: { after: pt(2) } },
              run: { color: def.punkt.farg },
            },
          },
        ],
      },
    ],
  }
}

/* ----------------------------------------------------------------- bygget */

/**
 * Bygger CV:t som Word-dokument. `typsnitt` är användarens Word-typsnitt
 * (src/lib/documents/typsnitt.ts); null ger mallens eget.
 */
export function byggDokument(cv: CVMetadata, def: WordMallDef, typsnitt?: string | null): Document {
  const font = typsnitt || def.typsnitt
  const marginal = { top: mm(def.marginal.topp), bottom: mm(def.marginal.botten), left: mm(def.marginal.sida), right: mm(def.marginal.sida) }
  const b: Bygg = { def, font, textbredd: A4.bredd - marginal.left - marginal.right }

  const barn: (Paragraph | Table)[] = [...huvud(b, cv)]
  for (const s of def.sektioner) barn.push(...BYGGARE[s](b, cv))
  const ref = referenser(b)
  // Referensraden står aldrig ensam överst på en sida: stycket före den
  // följer med.
  const sista = barn[barn.length - 1]
  if (ref.length > 0 && sista instanceof Paragraph) barn[barn.length - 1] = hallIhopMedNasta(sista)
  barn.push(...ref)

  const namn = rensa(cv.personalInfo.fullName)
  return new Document({
    creator: 'Jobbcoach.ai',
    lastModifiedBy: 'Jobbcoach.ai',
    title: namn ? `CV ${namn}` : 'CV',
    description: `CV i mallen ${def.namn}`,
    styles: stilar(def, font),
    numbering: numrering(def),
    sections: [
      {
        properties: { page: { size: { width: A4.bredd, height: A4.hojd }, margin: marginal } },
        children: barn,
      },
    ],
  })
}
