/**
 * Brevets fasta rader, datum, ordräkning och markeringar (brevrummet,
 * omgång 1). Klientsäker: ren text, ingen renderare, inga Node-moduler.
 *
 * Samma funktioner används av HTML-renderaren (render.ts), Word-byggaren
 * (word.ts) och vyerna, så att brevet säger samma sak i alla tre.
 */
import type { BrevData, BrevKrav, BrevSprak } from './typer'

/** De fasta raderna per språk. */
export const FASTA_RADER: Record<BrevSprak, { arende: string; halsning: string; avslut: string; manader: readonly string[] }> = {
  sv: {
    arende: 'Ansökan',
    halsning: 'Hej',
    avslut: 'Med vänlig hälsning',
    manader: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  },
  en: {
    arende: 'Application',
    halsning: 'Dear',
    avslut: 'Kind regards',
    manader: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
}

/** "21 november 2026" eller "21 November 2026". Ogiltigt datum ger tom sträng. */
export function formateraDatum(iso: string, sprak: BrevSprak): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  if (!m) return ''
  const man = Number(m[2]) - 1
  if (man < 0 || man > 11) return ''
  return `${Number(m[3])} ${FASTA_RADER[sprak].manader[man]} ${m[1]}`
}

/** Datumraden med orten först när den finns: "Stockholm, 21 november 2026". */
export function datumRad(data: BrevData): string {
  const datum = formateraDatum(data.datum, data.sprak)
  const ort = data.avsandare.ort?.trim()
  return ort && datum ? `${ort}, ${datum}` : datum
}

/** "Ansökan: IT-projektledare" eller "Application: ...". Ingen tjänst ger null. */
export function arendeRad(data: BrevData): string | null {
  const t = data.tjanst?.trim()
  return t ? `${FASTA_RADER[data.sprak].arende}: ${t}` : null
}

/**
 * Hälsningen: brevets egen, annars mallens förval efter språk. Med en
 * namngiven mottagare ("Maria Ekström, rekryterande chef") hälsar svenskan
 * på förnamnet och engelskan på hela namnet.
 */
export function halsningsRad(data: BrevData): string {
  const egen = data.halsning?.trim()
  if (egen) return egen
  const namn = (data.mottagare.person ?? '').split(',')[0].trim()
  const f = FASTA_RADER[data.sprak]
  if (data.sprak === 'en') return namn ? `${f.halsning} ${namn},` : 'Dear Hiring Manager,'
  const fornamn = namn.split(/\s+/)[0]
  return fornamn ? `${f.halsning} ${fornamn},` : `${f.halsning},`
}

export function avslutsRad(sprak: BrevSprak): string {
  return FASTA_RADER[sprak].avslut
}

/** Styckena utan tomma. */
export function rensadeStycken(data: BrevData): string[] {
  return (data.stycken ?? []).map((s) => (s ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/**
 * Brevets ordantal: brödtextens stycken, utan hälsning, avslut och huvud.
 * Det är talet vyerna visar ("150 ord").
 */
export function brevOrd(data: BrevData): number {
  return rensadeStycken(data).reduce((sum, s) => sum + (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-.,:/%]*/gu)?.length ?? 0), 0)
}

/** Brevet som ren text: hälsning, stycken och avslut med namn (Kopiera text). */
export function brevSomText(data: BrevData): string {
  return [halsningsRad(data), ...rensadeStycken(data), `${avslutsRad(data.sprak)}\n${data.avsandare.namn}`].join('\n\n')
}

/* ------------------------------------------------------------ markeringar */

export interface Traff {
  /** Stycket (0-baserat). */
  stycke: number
  fran: number
  till: number
  /** Kravets nummer, 1-baserat (platsen i markeringar). */
  nr: number
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Citatets läge i en text, med blanksteg normaliserade. Skiftläge spelar roll först, sedan inte. */
export function hittaCitat(text: string, citat: string): { fran: number; till: number } | null {
  const delar = citat.trim().split(/\s+/).filter(Boolean)
  if (!delar.length) return null
  const monster = delar.map(escRe).join('\\s+')
  for (const flagga of ['u', 'iu']) {
    const m = new RegExp(monster, flagga).exec(text)
    if (m) return { fran: m.index, till: m.index + m[0].length }
  }
  return null
}

/**
 * Var kravens citat står i styckena. Varje krav märks där det först står;
 * ett citat som överlappar ett redan märkt hoppas över. Krav utan citat (eller
 * med ett citat som inte längre står i texten) ger ingen träff.
 */
export function hittaMarkeringar(stycken: string[], krav: BrevKrav[] | undefined): Traff[] {
  const ut: Traff[] = []
  ;(krav ?? []).forEach((k, i) => {
    if (!k?.citat) return
    for (let s = 0; s < stycken.length; s++) {
      const r = hittaCitat(stycken[s], k.citat)
      if (!r) continue
      const krock = ut.some((t) => t.stycke === s && r.fran < t.till && t.fran < r.till)
      if (!krock) ut.push({ stycke: s, ...r, nr: i + 1 })
      return
    }
  })
  return ut
}
