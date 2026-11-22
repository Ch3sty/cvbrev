/**
 * Arket i startflödet (skissen skapa-brev-start, lägena 1 och 2): besökarens
 * brev i den valda mallen, ritat av brevmotorn med samma funktion som ritar
 * visarens exempelbrev (ritaArk i /api/public/exempel/brev/rita.ts), så att
 * arket är mallens riktiga huvud, typsnitt och färger.
 *
 * Avsändaren är platshållare (kontot fyller i namn och kontakt), tjänsten och
 * arbetsgivaren kommer ur fälten. Brödtexten är tomma streck, aldrig suddad
 * text: före utkastet tre stycken streck, efter utkastet första stycket och
 * två stycken streck. Strecken sätts in efter ritningen, i stället för
 * styckenas markörer, så att motorn är orörd.
 *
 * Bara server: rutten POST /api/public/letter-draft/ark anropar den.
 */
import type { BrevData } from '@/lib/letters/brevmall/typer'
import { brevMallKort } from '@/lib/letters/brevmall/katalog'
import { BREV_FORVALD_MALL } from '@/lib/letters/brevRegler'
import { ritaArk } from '@/app/api/public/exempel/brev/rita'

/** Tak för fälten som ritas (samma storlek som en tjänst och ett företag rimligen har). */
export const ARK_MAX_FALT = 160
export const ARK_MAX_STYCKE = 2400

/** Platshållarna i avsändaren (nytt-innehall.md, arket i startläget). */
export const ARK_PLATSHALLARE = {
  namn: 'Ditt namn',
  epost: 'din e-post',
  telefon: 'ditt telefonnummer',
  ort: 'din ort',
  foretag: 'Arbetsgivaren',
} as const

const MARKOR = 'SBSTRECKMARKOR'
/** Radernas bredd i procent, per stycke. */
const RADER: readonly (readonly number[])[] = [
  [100, 96, 100, 88, 42],
  [100, 90, 100, 72],
  [94, 84, 58],
]

const STRECK_CSS =
  '<style>.sb-streck{display:block}.sb-streck i{display:block;height:.62em;margin:.62em 0;border-radius:.31em;background:currentColor;opacity:.12}</style>'

function streck(rader: readonly number[]): string {
  return `<span class="sb-streck" aria-hidden="true">${rader.map((b) => `<i style="width:${b}%"></i>`).join('')}</span>`
}

/** Mallen om den finns i katalogen, annars Linne. */
export function arkMall(id: unknown): string {
  return typeof id === 'string' && brevMallKort(id) ? id : BREV_FORVALD_MALL
}

function falt(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

export interface StartArkIn {
  mall?: unknown
  tjanst?: unknown
  foretag?: unknown
  /** Utkastets första stycke, när det finns. */
  stycke?: unknown
  /** ÅÅÅÅ-MM-DD. */
  datum: string
}

/** Brevets data för arket: platshållare, fälten och markörerna för strecken. */
export function startArkData(inn: StartArkIn): BrevData {
  const stycke = falt(inn.stycke, ARK_MAX_STYCKE)
  const markorer = (stycke ? RADER.slice(1) : RADER).map((_, i) => `${MARKOR}${i}`)
  return {
    avsandare: { namn: ARK_PLATSHALLARE.namn, titel: null, epost: ARK_PLATSHALLARE.epost, telefon: ARK_PLATSHALLARE.telefon, ort: ARK_PLATSHALLARE.ort },
    mottagare: { foretag: falt(inn.foretag, ARK_MAX_FALT) || ARK_PLATSHALLARE.foretag, person: null },
    tjanst: falt(inn.tjanst, ARK_MAX_FALT) || 'tjänsten du söker',
    datum: inn.datum,
    halsning: null,
    stycken: stycke ? [stycke, ...markorer] : markorer,
    sprak: 'sv',
  }
}

/** Arket som HTML för iframens srcdoc, skalat till iframens bredd. */
export function ritaStartArk(inn: StartArkIn): { mall: string; html: string } {
  const mall = arkMall(inn.mall)
  const stycke = falt(inn.stycke, ARK_MAX_STYCKE)
  const rader = stycke ? RADER.slice(1) : RADER
  let html = ritaArk(mall, startArkData(inn))
  rader.forEach((r, i) => {
    html = html.split(`${MARKOR}${i}`).join(streck(r))
  })
  return { mall, html: html.replace('</head>', `${STRECK_CSS}</head>`) }
}
