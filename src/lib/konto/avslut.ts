// src/lib/konto/avslut.ts
// Avslutsstatistiken (docs/beslut-mejl-och-radering-2026-11-22.md, 2b):
// en rad per konto som användaren själv raderat, utan id, e-post, IP eller
// tid utöver kvartal. Tal anges bara i intervall, så att raden aldrig pekar
// ut en person. Rena funktioner, klientsäkra; läsningen ligger i
// avslut.server.ts.

export type Kalla = 'webb' | 'app'

export type KontotsAlder = 'under_1_dag' | '1_7_dagar' | '8_30_dagar' | '31_90_dagar' | '91_365_dagar' | 'over_1_ar'
export type AntalIntervall = '0' | '1' | '2_5' | '6_plus'
export type TestIntervall = '0' | '1_5' | '6_20' | '21_plus'
export type AktivitetIntervall = 'under_1' | '1_7' | '8_30' | '31_90' | 'over_90' | 'okant'

/** Anledningarna i ordning, med etiketterna R8 (copywritern). */
export const ANLEDNINGAR = [
  { nyckel: 'fick_jobb', etikett: 'Har fått jobb' },
  { nyckel: 'soker_inte', etikett: 'Söker inte jobb längre' },
  { nyckel: 'for_dyrt', etikett: 'För dyrt' },
  { nyckel: 'annan_tjanst', etikett: 'Använder en annan tjänst' },
  { nyckel: 'fungerade_inte', etikett: 'Gjorde inte det jag behövde' },
  { nyckel: 'integritet', etikett: 'Vill ta bort mina uppgifter' },
] as const

export type Anledning = (typeof ANLEDNINGAR)[number]['nyckel']

/** En rad i konto_avslut, exakt migreringens kolumner utom id. */
export interface AvslutRad {
  kvartal: string
  kalla: Kalla
  kontots_alder: KontotsAlder
  hade_premium: boolean
  har_betalat: boolean
  antal_cv: AntalIntervall
  antal_brev: AntalIntervall
  antal_test: TestIntervall
  antal_sokta: AntalIntervall
  dagar_sedan_aktivitet: AktivitetIntervall
  anledning: Anledning | null
}

/** Kolumnerna i konto_avslut som koden skriver (id sätts av databasen). */
export const AVSLUT_KOLUMNER: ReadonlyArray<keyof AvslutRad> = [
  'kvartal',
  'kalla',
  'kontots_alder',
  'hade_premium',
  'har_betalat',
  'antal_cv',
  'antal_brev',
  'antal_test',
  'antal_sokta',
  'dagar_sedan_aktivitet',
  'anledning',
]

const DYGN = 86_400_000

/** Hela dygn mellan två tidpunkter, avrundat nedåt, aldrig under noll. */
export function helaDygn(fran: Date, till: Date): number {
  return Math.max(0, Math.floor((till.getTime() - fran.getTime()) / DYGN))
}

/** Första dagen i kvartalet i svensk tid, som 'YYYY-MM-DD'. */
export function kvartalFor(nu: Date): string {
  const [ar, man] = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit' })
    .format(nu)
    .split('-')
    .map(Number)
  const forsta = Math.floor((man - 1) / 3) * 3 + 1
  return `${ar}-${String(forsta).padStart(2, '0')}-01`
}

export function alderIntervall(dagar: number): KontotsAlder {
  if (dagar < 1) return 'under_1_dag'
  if (dagar <= 7) return '1_7_dagar'
  if (dagar <= 30) return '8_30_dagar'
  if (dagar <= 90) return '31_90_dagar'
  if (dagar <= 365) return '91_365_dagar'
  return 'over_1_ar'
}

export function antalIntervall(n: number): AntalIntervall {
  if (n <= 0) return '0'
  if (n === 1) return '1'
  if (n <= 5) return '2_5'
  return '6_plus'
}

export function testIntervall(n: number): TestIntervall {
  if (n <= 0) return '0'
  if (n <= 5) return '1_5'
  if (n <= 20) return '6_20'
  return '21_plus'
}

export function aktivitetIntervall(lastActive: string | null | undefined, nu: Date): AktivitetIntervall {
  if (!lastActive) return 'okant'
  const t = new Date(lastActive)
  if (Number.isNaN(t.getTime())) return 'okant'
  const dagar = helaDygn(t, nu)
  if (dagar < 1) return 'under_1'
  if (dagar <= 7) return '1_7'
  if (dagar <= 30) return '8_30'
  if (dagar <= 90) return '31_90'
  return 'over_90'
}

const NYCKLAR = new Set<string>(ANLEDNINGAR.map((a) => a.nyckel))

/** Bara de sex nycklarna släpps igenom, allt annat blir null. */
export function lasAnledning(v: unknown): Anledning | null {
  return typeof v === 'string' && NYCKLAR.has(v) ? (v as Anledning) : null
}
