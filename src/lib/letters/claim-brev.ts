/**
 * Claim av det publika brevutkastet (POST /api/public/letter-draft/claim),
 * reglerna utan databas (publikt omgång 3, byggbriefens beslut 6).
 *
 * Brevet skrivs i brevrummets format: styckena i body_stycken och mallen i
 * mall_id, så att det öppnas i mallen direkt i stället för i den gamla formen.
 * Mallen följer samma regel som brevrummet (brevRegler.farSparaMall): Linne
 * och Björk sparas på gratisnivån. En Premiummall sparas inte för den som
 * inte har betalt; brevet sparas i Linne och öppnas i Mallar med Premium-
 * mallen provad (/dashboard/mina-brev/mallar?brev=<id>&mall=<id>), precis som
 * när en gratisanvändare provar en Premiummall i kontot. Inga nya gränser.
 *
 * Ren och serversäker, så att reglerna testas utan server.
 */
import { BREV_FORVALD_MALL, BREV_TONER_FRI, brevMallId, farSparaMall } from './brevRegler'
import { styckenFranText } from './stycken'
import { MAX_ANNONS } from './publikt-brev-val'

/** Tonen det publika utkastet skrivs i när ingen ton väljs (som före omgång 3). */
export const PUBLIK_FORVALD_TON = 'professional'

/** En av de fem tonerna (aldrig auto, som ingår i Premium), annars null. */
export function publikTon(v: unknown): string | null {
  return typeof v === 'string' && (BREV_TONER_FRI as readonly string[]).includes(v) ? v : null
}

export interface ClaimVal {
  /** Mallen besökaren valde, i katalogen (alias lösta), eller null. */
  mall: string | null
  ton: string
  /** Annonsen hon klistrade in, eller null. */
  annons: string | null
}

/** Valet i claim-anropets kropp. Okänd mall och okänd ton blir förval. */
export function lasClaimVal(body: unknown): ClaimVal {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const annons = typeof b.annons === 'string' ? b.annons.trim().slice(0, MAX_ANNONS) : ''
  return {
    mall: brevMallId(b.mall),
    ton: publikTon(b.ton) ?? PUBLIK_FORVALD_TON,
    annons: annons || null,
  }
}

export interface ClaimMall {
  /** Mallen brevet sparas i. */
  sparad: string
  /** Premiummallen som provas, eller null. */
  provas: string | null
}

/** Brevrummets regel: tillåten mall sparas, en Premiummall på gratisnivån provas. */
export function claimMall(begard: string | null, harBetalt: boolean): ClaimMall {
  if (!begard) return { sparad: BREV_FORVALD_MALL, provas: null }
  if (farSparaMall(begard, harBetalt)) return { sparad: begard, provas: null }
  return { sparad: BREV_FORVALD_MALL, provas: begard }
}

/** Dit kontot landar: brevet, eller Mallar med Premiummallen provad. */
export function claimRedirect(letterId: string, mall: ClaimMall): string {
  const id = encodeURIComponent(letterId)
  if (mall.provas) return `/dashboard/mina-brev/mallar?brev=${id}&mall=${encodeURIComponent(mall.provas)}`
  return `/dashboard/mina-brev/${id}`
}

export interface UtkastForClaim {
  role: string
  employer: string
  letter_text: string
}

/**
 * Raden som läggs i letters (utan content, som ritas av anroparen).
 * Styckena ur utkastets text på samma sätt som generate-preview gör med
 * modellens text (styckenFranText). Saknas stycken skrivs brevet som förut:
 * ren text utan mall, så att inget brev blir tomt.
 */
export function claimRad(utkast: UtkastForClaim, userId: string, val: ClaimVal, mall: ClaimMall, nu: Date = new Date()) {
  const stycken = styckenFranText(utkast.letter_text)
  const bas = {
    user_id: userId,
    title: utkast.role,
    company: utkast.employer,
    job_title: utkast.role,
    tonality: val.ton,
    language: 'sv',
    job_description: val.annons,
    is_saved: true,
    created_at: nu.toISOString(),
    updated_at: nu.toISOString(),
  }
  if (stycken.length === 0) return { ...bas, mall_id: null as string | null, body_stycken: null as string[] | null }
  return {
    ...bas,
    body_stycken: stycken as string[] | null,
    halsning: null,
    mottagare_person: null,
    mall_id: mall.sparad as string | null,
    font_id: null,
  }
}
