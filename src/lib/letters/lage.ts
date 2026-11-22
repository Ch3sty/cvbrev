/**
 * Brevets väg och nästa steg på Dina brev (BYGGSPEC avsnitt 4).
 *
 * Vägen har fyra platser: annonsen, brevet, läs igenom, skickat.
 * - annonsen och brevet är klara så fort brevet finns.
 * - läs igenom är klar när forberett_at är satt eller brevet är sökt.
 * - skickat är klar när det finns en rad i job_applications med brevets id.
 *
 * Nästa steg väljs för det senast uppdaterade brevet som inte är skickat.
 * Texterna är skissens (Main, Hem-ny) ordagrant.
 *
 * Klientsäker och ren.
 */
import type { BrevKrav, BrevSteg } from './brevmall/typer'
import { kravMatt, kravMedTraffar, lasSparadeKrav } from './krav'
import { sorteraBrev } from './lista'
import { raknaOrd, styckenForBrev } from './stycken'

export const BREV_STEG: readonly BrevSteg[] = ['annonsen', 'brevet', 'las-igenom', 'skickat']

export interface BrevForVag {
  forberett_at?: string | null
}

export interface BrevetsVag {
  /** Platsen pricken står på: första platsen som inte är klar, eller skickat. */
  steg: BrevSteg
  klara: BrevSteg[]
}

/** Brevets väg. `sokt` = det finns en rad i job_applications med brevets id. */
export function brevetsVag(brev: BrevForVag, sokt: boolean): BrevetsVag {
  const klara: BrevSteg[] = ['annonsen', 'brevet']
  if (brev.forberett_at || sokt) klara.push('las-igenom')
  if (sokt) klara.push('skickat')
  const steg = BREV_STEG.find((s) => !klara.includes(s)) ?? 'skickat'
  return { steg, klara }
}

export type NastaStegLage =
  | 'forsta-brevet'
  | 'cv-saknas'
  | 'krav-saknas'
  | 'las-igenom'
  | 'skicka'
  | 'alla-skickade'

/** Det stora talet i väggen: talet och raden efter, t.ex. "6" + "av 7 krav i annonsen". */
export interface StortTal {
  tal: string
  rest: string
}

export interface NastaSteg {
  lage: NastaStegLage
  /** Brevet steget gäller, eller null (inga brev, alla skickade). */
  brevId: string | null
  overrad: string
  rubrik: string
  text: string
  knapp: { text: string; href: string }
  /** Väggens stora tal, eller null när det inte finns något brev att mäta. */
  stortTal: StortTal | null
  /** Vägen för brevet steget gäller (null utan brev). */
  vag: BrevetsVag | null
}

export interface BrevForNastaSteg extends BrevForVag {
  id: string
  company?: string | null
  updated_at?: string | null
  created_at?: string | null
  forberett_som?: string | null
  krav?: unknown
  body_stycken?: unknown
  content?: string | null
  /** Annonsen brevet skrevs mot; tom eller null när ingen annons klistrades in. */
  job_description?: string | null
  /** CV:t brevet skrevs mot; null för brev ur startflödet utan konto. */
  cv_id?: string | null
}

/** Har brevet en annons? Brev ur startflödet kan sakna en (job_description null). */
export function harAnnons(brev: { job_description?: string | null }): boolean {
  return !!(brev.job_description ?? '').trim()
}

/**
 * Första meningen i nästa steg: bara det som är sant om brevet. Annonsen
 * nämns när brevet har en, CV:t när brevet skrevs mot ett och kontot har
 * kvar ett (klicktesten 2026-11-22).
 */
export function skrivetMot(brev: BrevForNastaSteg, harCv: boolean): string {
  const annons = harAnnons(brev)
  const cv = harCv && !!brev.cv_id
  if (annons && cv) return 'Brevet är skrivet mot annonsen och ditt CV.'
  if (annons) return 'Brevet är skrivet mot annonsen.'
  if (cv) return 'Brevet är skrivet utifrån ditt CV.'
  return 'Brevet bygger på det du fyllde i om tjänsten.'
}

export interface NastaStegIndata {
  /** Användarens brev (listan efter avdubblering räcker; ordningen räknas om här). */
  brev: readonly BrevForNastaSteg[]
  /** Id:n på brev som har en rad i job_applications. */
  sokta: ReadonlySet<string>
  /** Har användaren minst ett CV? Avgör läget utan brev. */
  harCv: boolean
  /** Betald behörighet: överraden utan "ingår gratis". */
  harBetalt?: boolean
  /** Antal sökta tjänster att visa när alla brev är skickade. Förval: antal sökta brev. */
  antalAnsokningar?: number
}

export const SKRIV_BREV_HREF = '/dashboard/skapa-brev'
export const CV_HREF = '/dashboard/profil/cv'
export const brevHref = (id: string) => `/dashboard/mina-brev/${id}`

function foretagsrad(company: string | null | undefined): string {
  const f = (company ?? '').trim()
  return f ? `Nästa steg · brevet till ${f}` : 'Nästa steg · brevet'
}

/** Kraven med träffar omräknade mot brevets text. */
export function kravForBrev(brev: { krav?: unknown; body_stycken?: unknown; content?: string | null }): BrevKrav[] | null {
  return kravMedTraffar(lasSparadeKrav(brev.krav), styckenForBrev(brev))
}

/** Väggens stora tal för ett brev: kravmåttet när det finns, annars ordantalet. */
export function stortTalForBrev(brev: { krav?: unknown; body_stycken?: unknown; content?: string | null }): StortTal {
  const matt = kravMatt(kravForBrev(brev))
  if (matt) return { tal: String(matt.medSvar), rest: `av ${matt.antal} krav i annonsen` }
  return { tal: String(raknaOrd(styckenForBrev(brev))), rest: 'ord' }
}

export function nastaSteg(indata: NastaStegIndata): NastaSteg {
  const { brev, sokta, harCv, harBetalt = false } = indata

  if (brev.length === 0) {
    if (!harCv) {
      return {
        lage: 'cv-saknas',
        brevId: null,
        overrad: 'Börja med ditt CV',
        rubrik: 'Brevet skrivs mot ditt CV',
        text: 'Ladda upp ditt CV eller skriv det från början, så är du redo för första brevet.',
        knapp: { text: 'Öppna CV', href: CV_HREF },
        stortTal: null,
        vag: null,
      }
    }
    return {
      lage: 'forsta-brevet',
      brevId: null,
      overrad: harBetalt ? 'Ditt första brev' : 'Ditt första brev · ingår gratis',
      rubrik: 'Klistra in annonsen, så skriver vi brevet',
      text: 'Vi läser kraven i annonsen mot ditt CV. Du får ett färdigt utkast att ändra i, inte en tom sida.',
      knapp: { text: 'Skriv brevet', href: SKRIV_BREV_HREF },
      stortTal: null,
      vag: null,
    }
  }

  const aktuellt = sorteraBrev(brev).find((b) => !sokta.has(b.id))

  if (!aktuellt) {
    const antal = indata.antalAnsokningar ?? brev.filter((b) => sokta.has(b.id)).length
    return {
      lage: 'alla-skickade',
      brevId: null,
      overrad: 'Nästa brev',
      rubrik: 'Skriv nästa brev',
      text: 'Klistra in nästa annons, eller välj ett jobb ur dina matchningar.',
      knapp: { text: 'Skriv nytt brev', href: SKRIV_BREV_HREF },
      stortTal: { tal: String(antal), rest: antal === 1 ? 'ansökan skickad' : 'ansökningar skickade' },
      vag: null,
    }
  }

  const vag = brevetsVag(aktuellt, false)
  const gemensamt = {
    brevId: aktuellt.id,
    overrad: foretagsrad(aktuellt.company),
    knapp: { text: 'Öppna brevet', href: brevHref(aktuellt.id) },
    stortTal: stortTalForBrev(aktuellt),
    vag,
  }

  if (aktuellt.forberett_at) {
    const satt = aktuellt.forberett_som === 'kopierat' ? 'kopierat' : 'nedladdat'
    return {
      ...gemensamt,
      lage: 'skicka',
      rubrik: 'Skicka ansökan',
      text: `Brevet är ${satt}. Markera det som sökt när ansökan är inne, så håller vi ordning på den.`,
    }
  }

  // Ett brev ur startflödet utan konto skrivs på det hon fyllde i: ingen
  // annons om hon inte klistrade in en, och inget CV (klicktesten 2026-11-22).
  const skrivet = skrivetMot(aktuellt, harCv)
  const matt = kravMatt(kravForBrev(aktuellt))
  if (matt && matt.saknas > 0) {
    const saknas = matt.saknas === 1 ? 'Ett krav saknas' : `${antalOrd(matt.saknas)} krav saknas`
    return {
      ...gemensamt,
      lage: 'krav-saknas',
      rubrik: 'Läs igenom och skicka',
      text: `${skrivet} ${saknas}, sedan är det klart att skicka.`,
    }
  }

  return {
    ...gemensamt,
    lage: 'las-igenom',
    rubrik: 'Läs igenom och skicka',
    text: `${skrivet} Läs igenom det en gång, sedan är det klart att skicka.`,
  }
}

const ORD = ['Noll', 'Ett', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta']

/** "Två", "Tre" ... i början av en mening; över åtta som siffra. */
function antalOrd(n: number): string {
  return ORD[n] ?? String(n)
}
