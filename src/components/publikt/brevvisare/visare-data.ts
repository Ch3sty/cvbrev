/**
 * Mallvisaren för personliga brev (byggspecen våg 2, 2026-11-21): det som
 * räknas på servern och går till klientön som props, och översättningen
 * från de publika exempelbreven (text med hälsning och avslut) till
 * brevmotorns BrevData. Samma översättning används av rutten som ritar
 * arket och av "Läs brevet som text", så att arket och texten alltid är
 * samma brev med samma avslut.
 *
 * Ren data och rena funktioner, inga Node-moduler.
 */
import type { BrevData } from '@/lib/letters/brevmall/typer'
import { arendeRad, avslutsRad, halsningsRad, rensadeStycken } from '@/lib/letters/brevmall/text'
import { ARTIKEL, antalOrd } from '@/components/cv/Dokument/texter'
import { BREV_MALL_ANTAL, brevMallKortFor, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import { brevStycken } from '@/components/publikt/innehall/exempel/exempel-data'

/** Visarens fem mallar, i den här ordningen (byggnoten: fast i komponenten). */
export const VISARE_MALL_IDS = ['linne', 'bjork', 'koppar', 'kalksten', 'granit'] as const
export type VisareMallId = (typeof VISARE_MALL_IDS)[number]

/** En mall som klientön ser den: namn, namnradens mening och miniatyren. */
export interface VisarMall {
  id: string
  namn: string
  /** "Gratis, även som Word." eller "Ingår i Premium, även som Word." (utan Word faller tillägget bort). */
  rad: string
  bild: string
}

/** Namnradens mening ur katalogen, med punkt. */
export function namnradMening(gratis: boolean, word: boolean): string {
  return `${ARTIKEL.mallrad(gratis, word)}.`
}

/** De fem mallarna ur brevets katalog (aldrig skrivna för hand). */
export function visarMallar(): VisarMall[] {
  return brevMallKortFor(VISARE_MALL_IDS).map((k) => ({
    id: k.id,
    namn: k.namn,
    rad: namnradMening(k.niva === 'gratis', k.word),
    bild: brevMiniatyrSrc(k.id),
  }))
}

/** Fotraden: "Det här är fem av 40 mallar. Med ett konto provar du alla med ditt eget brev." */
export function visarFot(visade: number = VISARE_MALL_IDS.length, alla: number = BREV_MALL_ANTAL): string {
  return `Det här är ${antalOrd(visade)} av ${alla} mallar. Med ett konto provar du alla med ditt eget brev.`
}

/**
 * Orten ur en adress: allt efter postnumret ("Exportgatan 12, 422 46 Hisings
 * Backa" ger "Hisings Backa"), inte sista ordet. Utan postnummer den sista
 * delen efter komma ("Södermalm, Stockholm" ger "Stockholm").
 */
export function ortUrAdress(adress: string | null | undefined): string | null {
  const a = (adress ?? '').replace(/\s+/g, ' ').trim()
  if (!a) return null
  const m = /(?:^|[\s,])\d{3} ?\d{2} (.+)$/.exec(a)
  if (m) return m[1].trim() || null
  const delar = a.split(',').map((d) => d.trim()).filter(Boolean)
  return delar[delar.length - 1] ?? null
}

/** Fälten i ett publikt exempelbrev (exempelsidornas exampleData och artiklarnas sex brev). */
export interface PubliktBrevFalt {
  namn: string
  adress?: string | null
  stad?: string | null
  telefon?: string | null
  epost?: string | null
  arbetsgivare?: string | null
  foretag?: string | null
  roll?: string | null
  brevText: string
}

/** En hälsning utan punkt eller komma sist ("Hej!") räknas också som hälsning. */
const HALSNING = /^(hej|hejsan|hallå|bästa|god dag|till)\b/i

/**
 * Exempelbrevet som BrevData. Brevets egen hälsning följer med; avslutet
 * ("Varma hälsningar," och namnet) tas bort, eftersom motorn skriver sitt
 * eget avslut och namnet. Brev utan hälsning får motorns ("Hej,").
 */
export function brevDataFranFalt(f: PubliktBrevFalt, datum: string): BrevData {
  const delar = brevStycken(f.brevText ?? '')
  let halsning = delar.halsning ?? null
  let stycken = delar.stycken
  if (!halsning && stycken[0] && stycken[0].length < 40 && HALSNING.test(stycken[0]) && !/[.?]$/.test(stycken[0])) {
    halsning = stycken[0]
    stycken = stycken.slice(1)
  }
  return {
    avsandare: {
      namn: f.namn,
      titel: null,
      epost: f.epost ?? '',
      telefon: f.telefon || null,
      ort: ortUrAdress(f.adress ?? f.stad),
    },
    mottagare: { foretag: f.arbetsgivare || f.foretag || null, person: null },
    tjanst: f.roll || null,
    datum,
    halsning,
    stycken,
    sprak: 'sv',
  }
}

/** Dagens datum i svensk tid, ÅÅÅÅ-MM-DD. */
export function idagISverige(nu: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(nu)
}

/** Brevet som text för "Läs brevet som text": samma rader som arket, i samma ordning. */
export function brevTextDelar(data: BrevData): { namn: string; foretag: string | null; arende: string | null; halsning: string; stycken: string[]; avslut: string } {
  return {
    namn: data.avsandare.namn,
    foretag: data.mottagare.foretag,
    arende: arendeRad(data),
    halsning: halsningsRad(data),
    stycken: rensadeStycken(data),
    avslut: avslutsRad(data.sprak),
  }
}
