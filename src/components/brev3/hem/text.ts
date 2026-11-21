/**
 * Dina brev: texterna och måtten vyn räknar själv (BYGGSPEC avsnitt 7,
 * "Dina brev"). Motorn (src/lib/letters/lage.ts) ger läget, rubriken och
 * datorns texter; här står det skissen ritar utöver dem: telefonens kortare
 * rader, datumraderna på korten, längdens bild i ord och jobbens taggar.
 *
 * Klientsäker och ren. Nuet går att skicka in.
 */
import type { NastaSteg } from '@/lib/letters/lage'
import { kortDatum } from '@/lib/rum/copy'

const TZ = 'Europe/Stockholm'
const DAG = 86_400_000

/** Kalenderdagen i svensk tid som ett tal (dagar sedan 1970), för att räkna "i går". */
function svenskDag(d: Date): number {
  const [y, m, dd] = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(d)
    .split('-')
    .map(Number)
  return Math.floor(Date.UTC(y, m - 1, dd) / DAG)
}

const VECKODAG = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', timeZone: TZ })

/** "i dag", "i går", "i tisdags" (inom en vecka), annars "14 nov". */
export function narRelativt(iso: string | null | undefined, nu: Date = new Date()): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const dagar = svenskDag(nu) - svenskDag(d)
  if (dagar <= 0) return 'i dag'
  if (dagar === 1) return 'i går'
  if (dagar < 7) return `i ${VECKODAG.format(d)}s`
  return kortDatum(d)
}

function versal(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** "Skrivet i går", "Skrivet 14 nov". */
export function skrivetRad(iso: string | null | undefined, nu?: Date): string | null {
  const n = narRelativt(iso, nu)
  return n ? `Skrivet ${n}` : null
}

/** Jobbets tagg ur publiceringsdagen: "I dag", "I går", "I tisdags", "12 nov". */
export function jobbTagg(iso: string | null | undefined, nu?: Date): string | null {
  const n = narRelativt(iso, nu)
  return n ? versal(n) : null
}

/** "Sista dag 6 dec", eller null. */
export function sistaDag(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : `Sista dag ${kortDatum(d)}`
}

/**
 * Tjänsten kort, för telefonens kort ("IT-projektledare" ur
 * "IT-projektledare till kundplattformen", "Projektledare" ur
 * "Projektledare, digitala hyresgästtjänster").
 */
export function rollKort(roll: string): string {
  const t = roll.trim()
  const kapad = t.split(/,|\s+(?:till|inom|för|på|hos|med|i)\s+/i)[0]?.trim()
  return kapad || t
}

/**
 * Väggens stora tal delat på två rader som i skissen: "av 7 krav" / "i
 * annonsen", "ansökningar" / "skickade". Ett ord ("ord") står på en rad.
 */
export function stortTalRader(rest: string): { rad1: string; rad2: string | null } {
  const iAnnonsen = / i annonsen$/.exec(rest)
  if (iAnnonsen) return { rad1: rest.slice(0, iAnnonsen.index), rad2: 'i annonsen' }
  const sista = rest.lastIndexOf(' ')
  if (sista < 0) return { rad1: rest, rad2: null }
  return { rad1: rest.slice(0, sista), rad2: rest.slice(sista + 1) }
}

const ORD = ['Inget', 'Ett', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta']

/** Telefonens överrad: "Nästa steg · Nordanvind Energi" i stället för "... · brevet till ...". */
export function overradMobil(steg: NastaSteg): string {
  return steg.overrad.replace('Nästa steg · brevet till ', 'Nästa steg · ')
}

/** Telefonens ingress, kortare än datorns (Mobil-hem). */
export function ingressMobil(steg: NastaSteg, saknas: number): string {
  switch (steg.lage) {
    case 'krav-saknas':
      return `${saknas === 1 ? 'Ett krav' : `${ORD[saknas] ?? saknas} krav`} saknas, sedan är brevet klart.`
    case 'las-igenom':
      return 'Läs igenom det en gång, sedan är brevet klart.'
    case 'skicka':
      return 'Markera det som sökt när ansökan är inne.'
    case 'alla-skickade':
      return 'Klistra in nästa annons, eller välj ett jobb.'
    default:
      return steg.text
  }
}

/**
 * Längden i ord, för skärmläsaren och raden under stapeln. andel är hur stor
 * del av en sida brevet fyller (över 1: går över till sida två).
 */
export function langdOrd(andel: number): string {
  if (andel > 1) return 'Brevet går över till sida två.'
  if (andel < 0.5) return 'Brevet fyller mindre än halva sidan.'
  if (andel < 0.66) return 'Brevet fyller drygt halva sidan.'
  if (andel < 0.75) return 'Brevet fyller knappt tre fjärdedelar av en sida.'
  if (andel < 0.9) return 'Brevet fyller ungefär tre fjärdedelar av en sida.'
  return 'Brevet fyller nästan hela sidan.'
}

/** Kravbitarnas etikett: "Sex av sju krav besvaras i brevet. Engelska i tal och skrift saknas." */
export function kravEtikett(medSvar: number, antal: number, saknade: readonly string[]): string {
  const tal = (n: number) => (ORD[n] ?? String(n)).toLowerCase()
  const forsta = `${versal(tal(medSvar))} av ${tal(antal)} krav besvaras i brevet.`
  if (!saknade.length) return forsta
  return `${forsta} ${saknade.join(', ')} saknas.`
}

/** "Sökta tjänster · 1 ansökan", "Sökta tjänster · 3 ansökningar", utan tal när inget är sökt. */
export function soktaOgon(antal: number): string {
  if (antal <= 0) return 'Sökta tjänster'
  return `Sökta tjänster · ${antal} ${antal === 1 ? 'ansökan' : 'ansökningar'}`
}

/** Matchningens skäl som en rad: "Passar ditt CV: din roll matchar och 3 av dina kompetenser nämns i annonsen." */
export function skalRad(skal: readonly string[]): string | null {
  const delar = skal.map((s) => s.trim()).filter(Boolean)
  if (!delar.length) return null
  const sma = delar.map((s) => (/^[A-ZÅÄÖ][a-zåäö]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s))
  const text = sma.length === 1 ? sma[0] : `${sma.slice(0, -1).join(', ')} och ${sma[sma.length - 1]}`
  return `Passar ditt CV: ${text}.`
}
