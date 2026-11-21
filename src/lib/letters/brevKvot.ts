/**
 * Veckokvoten för brev sett från vyerna (BYGGSPEC avsnitt 4, "Veckokvoten").
 *
 * Regeln är oförändrad och bor i quotaService: första brevet per konto fritt,
 * sedan ett per rullande sju dygn, räknat ur profiles.weekly_letter_count och
 * weekly_letter_first_used_at. Den här filen svarar bara på vyernas frågor:
 * finns veckans gratisbrev kvar, och vilken dag öppnar nästa.
 *
 * Klientsäker och ren (quotaService:s rena funktioner, ingen databas).
 */
import {
  DAILY_LIMIT_LETTERS,
  letterResetAtFromNow,
  resolveWeeklyLetterCounter,
} from '@/lib/quota/quotaService'

export interface BrevKvot {
  /** Betald behörighet: ingen kvot. */
  harBetalt: boolean
  /** Brev per fönster på gratisnivån. */
  grans: number
  /** Skrivna brev i det levande fönstret. */
  anvant: number
  /** Brev kvar att skriva nu. Betald: null (inget tak). */
  kvar: number | null
  /**
   * ISO-tid då nästa gratisbrev öppnar när kvoten är slut, annars null.
   * Vyerna skriver "Nästa gratisbrev fredag 27 nov" med formatGratisbrevDag.
   */
  nastaGratisbrev: string | null
}

export interface KvotProfil {
  weekly_letter_count?: number | null
  weekly_letter_first_used_at?: string | null
}

export function brevKvot(profil: KvotProfil | null | undefined, harBetalt: boolean, nu: Date = new Date()): BrevKvot {
  if (harBetalt) {
    return { harBetalt: true, grans: DAILY_LIMIT_LETTERS, anvant: 0, kvar: null, nastaGratisbrev: null }
  }
  const { effectiveCount, windowEndsAt } = resolveWeeklyLetterCounter(
    profil?.weekly_letter_count ?? 0,
    profil?.weekly_letter_first_used_at ?? null,
    nu
  )
  const kvar = Math.max(0, DAILY_LIMIT_LETTERS - effectiveCount)
  return {
    harBetalt: false,
    grans: DAILY_LIMIT_LETTERS,
    anvant: effectiveCount,
    kvar,
    nastaGratisbrev: kvar > 0 ? null : (windowEndsAt ?? nu).toISOString(),
  }
}

/**
 * Kvoten direkt efter att ett brev skrivits (eller skrivits om) på
 * gratisnivån: räknaren har ökat med ett, och nästa gratisbrev öppnar när
 * fönstret löper ut (eller sju dygn fram om ett nytt fönster startade nu).
 */
export function brevKvotEfterSkrivning(profilFore: KvotProfil | null | undefined, nu: Date = new Date()): BrevKvot {
  const { effectiveCount } = resolveWeeklyLetterCounter(
    profilFore?.weekly_letter_count ?? 0,
    profilFore?.weekly_letter_first_used_at ?? null,
    nu
  )
  const anvant = effectiveCount + 1
  const kvar = Math.max(0, DAILY_LIMIT_LETTERS - anvant)
  return {
    harBetalt: false,
    grans: DAILY_LIMIT_LETTERS,
    anvant,
    kvar,
    nastaGratisbrev: kvar > 0 ? null : letterResetAtFromNow(profilFore?.weekly_letter_first_used_at ?? null, nu).toISOString(),
  }
}

/** "fredag 27 nov", svensk tid. */
export function formatGratisbrevDag(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const delar = new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Stockholm',
  }).formatToParts(d)
  const del = (typ: string) => delar.find((p) => p.type === typ)?.value ?? ''
  return `${del('weekday')} ${del('day')} ${del('month').replace('.', '')}`.trim()
}
