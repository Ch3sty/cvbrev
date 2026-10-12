/**
 * Gemensamma typer och små tolkare för exempelsidorna (spec-publikt-v2 del B
 * 3.3). Datan i cv-exempel/[yrke]/page.tsx och personligt-brev-exempel/[yrke]/
 * exempel-data.ts är innehållet och rörs inte här; vi läser bara båda
 * formaten ({rubrik, text} och {titel, beskrivning}, {fraga, svar} och {q, a}).
 */

export type ExempelTyp = 'cv' | 'brev'

/** Var en not pekar i papperet. CV:ts sektioner eller brevets stycken. */
export type Ankare =
  | 'profil'
  | 'erfarenhet'
  | 'certifieringar'
  | 'kompetenser'
  | 'utbildning'
  | 'stycke-1'
  | 'stycke-2'
  | 'stycke-3'
  | 'stycke-4'
  | 'stycke-5'

export interface RaPunkt {
  rubrik?: string
  text?: string
  titel?: string
  beskrivning?: string
  ankare?: Ankare
}

export interface RaFraga {
  fraga?: string
  svar?: string
  q?: string
  a?: string
}

export interface Punkt {
  titel: string
  text: string
  ankare?: Ankare
  /** Notens nummer i papperet, om punkten har ett ankare. */
  nr?: number
}

export interface Not {
  nr?: number
  rubrik: string
  text?: string
}

export function punkter(lista: RaPunkt[] | undefined): Punkt[] {
  return (lista ?? [])
    .map((p) => ({ titel: p.titel || p.rubrik || '', text: p.beskrivning || p.text || '', ankare: p.ankare }))
    .filter((p) => p.titel || p.text)
}

export function fragor(lista: RaFraga[] | undefined): { q: string; a: string }[] {
  return (lista ?? [])
    .map((f) => ({ q: (f.q || f.fraga || '').trim(), a: (f.a || f.svar || '').trim() }))
    .filter((f) => f.q && f.a)
}

/** Sektionernas ordning i papperet, så att noternas nummer följer läsningen. */
const ORDNING: Ankare[] = [
  'profil',
  'certifieringar',
  'erfarenhet',
  'kompetenser',
  'utbildning',
  'stycke-1',
  'stycke-2',
  'stycke-3',
  'stycke-4',
  'stycke-5',
]

/**
 * Numrerar punkterna med ankare (högst fyra) i papperets ordning. Punkter
 * utan ankare får inget nummer. Saknas ankare helt visar marginalen de fyra
 * första titlarna utan nummer (spec 3.3, Ankare).
 */
export function numrera(lista: Punkt[]): { punkter: Punkt[]; noter: Not[] } {
  const medAnkare = lista
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.ankare)
    .slice(0, 4)
    .sort((a, b) => ORDNING.indexOf(a.p.ankare!) - ORDNING.indexOf(b.p.ankare!) || a.i - b.i)
  const nummer = new Map<number, number>()
  medAnkare.forEach(({ i }, n) => nummer.set(i, n + 1))
  const ut = lista.map((p, i) => ({ ...p, nr: nummer.get(i) }))
  const noter: Not[] = medAnkare.length
    ? medAnkare.map(({ p, i }) => ({ nr: nummer.get(i), rubrik: p.titel, text: kortText(p.text) }))
    : lista.slice(0, 4).map((p) => ({ rubrik: p.titel, text: kortText(p.text) }))
  return { punkter: ut, noter }
}

/** Notens rad: första meningen i punkten, utan markdown, om den är kort. */
export function kortText(text: string): string | undefined {
  const forsta = rensa(text.split(/\n\n+/)[0] ?? '')
  const mening = forsta.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? forsta
  return mening.length <= 120 ? mening : undefined
}

export function rensa(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^[❌✅]\s*/u, '').trim()
}

/** Nummer per ankare, för siffrorna i papperet. */
export function ankarNummer(lista: Punkt[]): Map<Ankare, number[]> {
  const karta = new Map<Ankare, number[]>()
  for (const p of lista) {
    if (!p.ankare || !p.nr) continue
    karta.set(p.ankare, [...(karta.get(p.ankare) ?? []), p.nr])
  }
  return karta
}

/** Brevets stycken: hälsningen, brödtexten och avslutningen. stycke-N räknas i brödtexten. */
export function brevStycken(brevText: string): { halsning?: string; stycken: string[]; avslut?: string } {
  const delar = brevText
    .split(/\n\s*\n/)
    .map((d) => d.trim())
    .filter(Boolean)
  const halsning = delar[0] && delar[0].length < 40 && !/[.!?]$/.test(delar[0]) ? delar.shift() : undefined
  const sista = delar[delar.length - 1]
  const avslut = sista && sista.length < 80 && /\n/.test(sista) ? delar.pop() : undefined
  return { halsning, stycken: delar, avslut }
}

/** Kategorins rum (kickerns färg på yrkeskorten). */
export function kategoriRum(kategori: string | undefined): 'cv' | 'tran' | 'brev' | 'jobb' | 'neu' {
  switch (kategori) {
    case 'vard':
      return 'cv'
    case 'tech':
    case 'teknik':
    case 'industri':
      return 'tran'
    case 'ekonomi':
      return 'brev'
    case 'student':
    case 'utbildning':
    case 'service':
      return 'jobb'
    default:
      return 'neu'
  }
}
