/**
 * Att skriva brevets text med AI: genereringen (generate-preview) och
 * omskrivningen (POST /api/letters/[id]/skriv-om) går samma väg.
 *
 * CV-texten maskeras med guardCvTextForModel innan den lämnar servern.
 * Kravanropet får bara annonsen och modellens egna stycken. Avsändarens namn
 * och kontakt sätts in först i mallen (ritaBrev.ts).
 *
 * Kvoten (veckans gratisbrev) räknas här också, med samma profilkolumner som
 * förut, så att generering och omskrivning delar en kvot.
 *
 * Bara server.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateCoverLetter } from '@/lib/openai/api'
import { lasKravIAnnonsen } from '@/lib/openai/brevKrav'
import { guardCvTextForModel } from '@/lib/privacy/guard'
import { calculateCostFromDatabase } from '@/lib/openai/pricing-sync'
import { kandaUppgifterForMaskning, type ProfilKontakt } from '@/lib/profile/dokumentKontakt'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import {
  DAILY_LIMIT_LETTERS,
  brevSparrMeddelande,
  letterResetAtFromNow,
  quotaExceededBody,
  resolveDailyLetterCounter,
} from '@/lib/quota/quotaService'
import { paketKort } from '@/lib/plans/plans'
import type { BrevKrav } from './brevmall/typer'
import { styckenFranText } from './stycken'

type Klient = SupabaseClient<any, any, any>

export interface SkrivenText {
  stycken: string[]
  /** Validerade krav, [] = inget kravmått, null = kraven kunde inte läsas. */
  krav: BrevKrav[] | null
  ai_model: string
  ai_tokens: number | null
  ai_cost: number | null
  generation_time_ms: number
}

export async function skrivBrevtext(opts: {
  supabase: Klient
  userId: string
  cvText: string
  cvStrukturerad: unknown
  profil: ProfilKontakt
  annons: string
  ton: string
  sprak: 'sv' | 'en'
  /** Flödets namn i maskningens mätpunkt. */
  flode: string
}): Promise<SkrivenText> {
  const start = Date.now()
  const guarded = await guardCvTextForModel(
    opts.cvText,
    opts.flode,
    opts.userId,
    kandaUppgifterForMaskning(opts.profil, opts.cvStrukturerad)
  )
  const brev = await generateCoverLetter(guarded.text, opts.annons, opts.ton || 'professional', opts.sprak)
  const stycken = styckenFranText(brev.content)
  if (stycken.length === 0) throw new Error('Det genererade brevet är tomt')

  // Kraven: brevet levereras även om anropet går fel (krav blir null).
  const kravSvar = await lasKravIAnnonsen(opts.annons, stycken, opts.sprak)

  const kostnad = await calculateCostFromDatabase(
    opts.supabase,
    brev.model,
    brev.tokens?.prompt || 0,
    brev.tokens?.completion || 0
  )

  return {
    stycken,
    krav: kravSvar.krav,
    ai_model: brev.model,
    ai_tokens: (brev.tokens?.total ?? 0) + (kravSvar.tokens?.total ?? 0) || null,
    ai_cost: kostnad + (kravSvar.cost ?? 0),
    generation_time_ms: Date.now() - start,
  }
}

/* ------------------------------- Kvoten -------------------------------- */

export interface KvotProfilRad {
  weekly_letter_count?: number | null
  weekly_letter_first_used_at?: string | null
}

export interface KvotLage {
  effectiveCount: number
  windowIsStale: boolean
  nextResetDate: Date
}

export function kvotLage(profil: KvotProfilRad | null, nu: Date = new Date()): KvotLage {
  const { effectiveCount, windowIsStale } = resolveDailyLetterCounter(
    profil?.weekly_letter_count ?? 0,
    profil?.weekly_letter_first_used_at ?? null,
    nu
  )
  return { effectiveCount, windowIsStale, nextResetDate: letterResetAtFromNow(profil?.weekly_letter_first_used_at ?? null, nu) }
}

/** 429-kroppen när veckans gratisbrev är skrivet, samma som generate-preview ger. */
export function kvotSlutSvar(lage: KvotLage) {
  return quotaExceededBody(
    'letter_generation',
    {
      allowed: false,
      isPremium: false,
      used: lage.effectiveCount,
      limit: DAILY_LIMIT_LETTERS,
      nextResetAt: lage.nextResetDate.toISOString(),
    },
    brevSparrMeddelande(lage.nextResetDate, paketKort())
  )
}

export function kvotArSlut(lage: KvotLage): boolean {
  return lage.effectiveCount >= DAILY_LIMIT_LETTERS
}

/** Räknar ett brev mot kvoten (admin-klienten: kolumnerna är spärrade för sessionen). */
export async function raknaBrevMotKvot(userId: string, lage: KvotLage, nu: Date = new Date()): Promise<void> {
  const { error } = await (getSupabaseAdmin() as any)
    .from('profiles')
    .update(
      lage.windowIsStale
        ? {
            weekly_letter_count: 1,
            weekly_letter_first_used_at: nu.toISOString(),
            weekly_letter_reset_at: lage.nextResetDate.toISOString(),
          }
        : {
            weekly_letter_count: lage.effectiveCount + 1,
            weekly_letter_reset_at: lage.nextResetDate.toISOString(),
          }
    )
    .eq('id', userId)
  if (error) console.error('Fel vid uppdatering av brevräknare:', error)
}
