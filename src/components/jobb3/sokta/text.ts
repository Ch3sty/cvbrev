/**
 * Små textfunktioner för Sökta tjänster (etapp 2B). Rena och klientsäkra.
 * Motorns funktioner (@/lib/jobbsok) räknar läget; här blir läget till de
 * rader och brickor som kitet tar emot.
 */
import {
  antalText,
  dagarMellan,
  intervjuEtikett,
  kortDag,
  ordtal,
  type ApplicationChannel,
  type BrickTon as MotorTon,
  type TjanstLage,
} from '@/lib/jobbsok'

/** Kanalen i löptext, som skissen skriver den. */
export const KANAL_TEXT: Record<ApplicationChannel, string> = {
  ad: 'svar på annons',
  unsolicited: 'spontanansökan',
  network: 'via kontakt',
}

/** Kanalen som rubrik ("Hur du sökte", "Om tjänsten"). */
export const KANAL_NAMN: Record<ApplicationChannel, string> = {
  ad: 'Svar på annons',
  unsolicited: 'Spontanansökan',
  network: 'Via kontakt',
}

export const stor = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)

/** "Fem", "Två": ordtal med stor bokstav. */
export const Ordtal = (n: number) => stor(ordtal(n))

/**
 * Rapportens sista rad i "Kopiera som text", med rätt form vid ett:
 * "Totalt: 10 sökta jobb (9 annonserade, 1 spontan), 1 intervju."
 */
export function rapportTotalt(t: { applications: number; advertised: number; unsolicited: number; interviews: number }): string {
  return `Totalt: ${antalText(t.applications, 'sökt jobb', 'sökta jobb')} (${antalText(t.advertised, 'annonserad', 'annonserade')}, ${antalText(t.unsolicited, 'spontan', 'spontana')}), ${antalText(t.interviews, 'intervju', 'intervjuer')}.`
}

/** "Sökt 6 nov, svar på annons, med personligt brev". */
export function soktRad(t: TjanstLage): string {
  return `Sökt ${kortDag(t.appliedAt)}, ${KANAL_TEXT[t.kanal]}${t.harBrev ? ', med personligt brev' : ''}`
}

/** Arbetsgivaren med ort: "Norrmejerier, Umeå". */
export function varRad(t: { company: string; location: string | null }): string {
  return t.location ? `${t.company}, ${t.location}` : t.company
}

/** Golvets brickton ur motorns ton. */
export function golvTon(ton: MotorTon): 'standard' | 'tyst' | 'tom' | 'slut' | 'int' {
  switch (ton) {
    case 'tyst':
      return 'tyst'
    case 'intervju':
    case 'erbjudande':
      return 'int'
    case 'avslag':
      return 'slut'
    case 'ska_sokas':
      return 'tom'
    default:
      return 'standard'
  }
}

/** Tratten och veckostaplarna har fyra toner. */
export function trattTon(ton: MotorTon): 'int' | 'standard' | 'tyst' | 'slut' {
  const g = golvTon(ton)
  return g === 'tom' ? 'standard' : g
}

/** Väggens brickton. */
export function vaggTon(ton: MotorTon): 'vit' | 'tyst' | 'tom' | 'int' | 'av' {
  switch (ton) {
    case 'tyst':
      return 'tyst'
    case 'intervju':
    case 'erbjudande':
      return 'int'
    case 'avslag':
      return 'av'
    case 'ska_sokas':
      return 'tom'
    default:
      return 'vit'
  }
}

/** Fyrstegsbanans steg för en tjänst i listan. */
export function fyrsteg(t: TjanstLage): { steg: 1 | 2 | 3 | 4; tyst?: boolean; avslutad?: boolean } {
  if (t.avslutad) return { steg: 2, avslutad: true }
  if (t.station === 'erbjudande') return { steg: 4 }
  if (t.station === 'intervju') return { steg: 3, tyst: t.tyst }
  return { steg: 1, tyst: t.tyst }
}

/** "Tis 24 nov 10.00" med stor bokstav. */
export function intervjuPiller(tid: string | null): string | null {
  const e = intervjuEtikett(tid)
  return e ? stor(e) : null
}

/** "11 dagar", "1 dag", "I dag" sedan sökt. */
export function dagarSedan(fran: string, idag: string): string {
  const n = Math.max(0, dagarMellan(fran, idag))
  if (n === 0) return 'I dag'
  return n === 1 ? '1 dag' : `${n} dagar`
}

/** "Bostaden, Swedbank och PwC". */
export function uppraknat(namn: string[]): string {
  if (namn.length <= 1) return namn[0] ?? ''
  return `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`
}
