/**
 * Det publika brevflödets val på väg in i kontot (publikt omgång 3,
 * byggbriefens beslut 6). Samma mönster som CV-flödet: CV-provet ligger i
 * localStorage (jc_cv_prova) och CV-starten bär "yrke:mall" bredvid
 * smakprovet. Brevet gör likadant, utan ny kolumn och utan att något mer
 * sparas på servern före kontot:
 *
 *  - Annonsen från säljsidan (/verktyg/personligt-brev) till startflödet:
 *    sessionStorage under jc_brev_annons, läses och tas bort när startflödet
 *    öppnas. Aldrig i adressen.
 *  - Mallen, tonen och annonsen bredvid utkastets token: localStorage under
 *    jc_pending_draft_val i sju dagar (utkastets livslängd), knutna till
 *    token så att ett gammalt val aldrig följer med ett annat utkast.
 *    localStorage och inte sessionStorage, så att valet också överlever en
 *    bekräftelselänk som öppnas i en ny flik. Claim läser valet och tar bort
 *    det (claim-draft-client.ts).
 *
 * Alla läsningar och skrivningar i try/catch: privat läge och blockerad
 * lagring ger ett flöde som fungerar, bara utan valet (brevet blir Linne).
 * Klientsäker, inga beroenden.
 */

export const ANNONS_NYCKEL = 'jc_brev_annons'
export const UTKAST_VAL_NYCKEL = 'jc_pending_draft_val'
/** Samma tak som /api/public/letter-draft för annonsen. */
export const MAX_ANNONS = 8000
const VAL_LIVSLANGD_MS = 7 * 24 * 60 * 60 * 1000

/** Lägger annonsen från säljsidan i fliken, inför startflödet. Tom text tar bort den. */
export function sparaAnnonsTillStart(text: string): void {
  const t = (text ?? '').trim().slice(0, MAX_ANNONS)
  try {
    if (t) sessionStorage.setItem(ANNONS_NYCKEL, t)
    else sessionStorage.removeItem(ANNONS_NYCKEL)
  } catch {
    // Lagringen är avstängd: startflödet öppnas utan annonsen.
  }
}

/** Annonsen från säljsidan, en gång: läses och tas bort. */
export function hamtaAnnonsTillStart(): string | null {
  try {
    const t = sessionStorage.getItem(ANNONS_NYCKEL)
    sessionStorage.removeItem(ANNONS_NYCKEL)
    return t && t.trim() ? t.trim().slice(0, MAX_ANNONS) : null
  } catch {
    return null
  }
}

/** Det besökaren valde före kontot. Servern validerar allt igen vid claim. */
export interface UtkastVal {
  mall?: string | null
  ton?: string | null
  annons?: string | null
}

interface SparatVal extends UtkastVal {
  token: string
  sparad: number
}

/** Sparar valet bredvid utkastets token. */
export function sparaUtkastVal(token: string, val: UtkastVal, nu: number = Date.now()): void {
  if (!token) return
  const rad: SparatVal = {
    token,
    mall: val.mall ?? null,
    ton: val.ton ?? null,
    annons: val.annons ? val.annons.slice(0, MAX_ANNONS) : null,
    sparad: nu,
  }
  try {
    localStorage.setItem(UTKAST_VAL_NYCKEL, JSON.stringify(rad))
  } catch {
    // Full eller avstängd lagring: brevet följer med ändå, i Linne.
  }
}

/** Valet för just den här token, eller null (annan token, för gammalt, trasigt). */
export function lasUtkastVal(token: string | null | undefined, nu: number = Date.now()): UtkastVal | null {
  if (!token) return null
  try {
    const raw = localStorage.getItem(UTKAST_VAL_NYCKEL)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<SparatVal> | null
    if (!v || typeof v !== 'object' || v.token !== token || typeof v.sparad !== 'number') return null
    if (nu - v.sparad > VAL_LIVSLANGD_MS) {
      localStorage.removeItem(UTKAST_VAL_NYCKEL)
      return null
    }
    const str = (x: unknown) => (typeof x === 'string' && x ? x : null)
    return { mall: str(v.mall), ton: str(v.ton), annons: str(v.annons) }
  } catch {
    return null
  }
}

export function rensaUtkastVal(): void {
  try {
    localStorage.removeItem(UTKAST_VAL_NYCKEL)
  } catch {
    // Se ovan.
  }
}
