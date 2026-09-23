// src/lib/quota/quotaService.ts
// =============================================================================
// Gemensam kvottjänst för gratisnivån
// (docs/plan-paket-och-onboarding.md, avsnitt 4, ägarens beslut 2026-09-22).
//
// Designprincip: räkna befintliga tabeller i stället för att hålla separata
// räknare. Fönstren är självrensande (rullande, eller "sedan midnatt svensk
// tid"), så inga reset-jobb behövs och ingen räknare kan hamna i osynk.
//
// Räknarkällor per funktion:
// - Tester/prov:  logic_test_v4_sessions (slutförda sessioner per test_type)
// - Chatt:        ai_messages (användarens egna meddelanden, role='user')
// - CV-analys:    cv_analysis_jobs (usage_counted=true, hela kontots historik)
// - Brev:         profiles-kolumnerna weekly_letter_* plus letters-historiken
// - Intervjuprov: anon_interview_samples (sparade svar sedan midnatt, per user_id)
//
// Gränserna efter paketomgången:
//   Brev      1 per konto, därefter 1 per rullande sju dygn
//   Chatt     10 per konto (inte per dygn)
//   Analys    1 per konto (inte per 72 h)
//   Tester    1 per test_type och dygn på grundnivån, oförändrat
//
// Behörigheten frågas per feature via userHasAccess. isPremium-parametrarna
// är borta: en kund med Träningspaketet har inte obegränsade brev, och en
// kund med CV-paketet har inte obegränsad chatt.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import type { Feature } from '@/lib/access/features';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

/* -------------------------------- Gränserna ------------------------------- */

/** Brev: det första är fritt, sedan ett per rullande sju dygn. */
export const FREE_LETTERS_PER_ACCOUNT = 1;
export const LETTER_WINDOW_DAYS = 7;
/**
 * Behålls som namn för de rutter som räknar "kvar i fönstret". Gränsen är
 * en per fönster, oavsett om fönstret är kontots första eller en vecka.
 */
export const DAILY_LIMIT_LETTERS = 1;

/** Chatt: tio meddelanden per konto, inte per dygn. */
export const FREE_CHAT_MESSAGES_PER_ACCOUNT = 10;
/** Gammalt namn, samma tal. Behålls tills alla vyer läser det nya. */
export const DAILY_LIMIT_CHAT_MESSAGES = FREE_CHAT_MESSAGES_PER_ACCOUNT;

/** Tester: en slutförd session per test_type och dygn på grundnivån. */
export const DAILY_LIMIT_TEST_SESSIONS = 1;

/** CV-analys: en per konto. Omkörningen är uttaget (avsnitt 4). */
export const CV_ANALYSIS_LIMIT = 1;
/**
 * Fönstret är borta: kvoten räknas över kontots hela historik. Konstanten
 * står kvar därför att svaren i cv/analyze anger en återkomsttid, och den
 * tiden är nu "aldrig utan paket".
 */
export const CV_ANALYSIS_WINDOW_HOURS = 0;

export interface QuotaResult {
  allowed: boolean;
  /** Sann när en betald behörighet gav funktionen. Namnet är historiskt. */
  isPremium: boolean;
  used: number;
  limit: number;
  /**
   * När kvoten öppnar igen (ISO). För kontokvoter, alltså analys och chatt,
   * öppnar den aldrig av sig själv, och då står nuvarande tid här: vyn ska
   * visa en betalvägg, inte en klocka.
   */
  nextResetAt: string;
  /** Sätts när kvoten inte återkommer av sig själv. */
  perAccount?: boolean;
}

/* ------------------------- Tidsfönster (svensk tid) ------------------------ */

function stockholmOffsetISO(date: Date): string {
  const tzPart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value; // t.ex. "GMT+2"
  return tzPart === 'GMT+1' ? '+01:00' : '+02:00';
}

/** Midnatt idag i Europe/Stockholm, som Date (UTC-korrekt). */
export function startOfTodayStockholm(now: Date = new Date()): Date {
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(now); // "2026-07-05"
  return new Date(`${day}T00:00:00${stockholmOffsetISO(now)}`);
}

/** Nästa midnatt i Europe/Stockholm (= när dagskvoter nollställs). */
export function nextMidnightStockholm(now: Date = new Date()): Date {
  // Räkna fram ett klockslag som säkert är "imorgon" i Stockholm och ta den
  // dagens midnatt. Hanterar DST-skiften korrekt nog för kvotsyften.
  const tomorrow = new Date(startOfTodayStockholm(now).getTime() + 26 * 60 * 60 * 1000);
  return startOfTodayStockholm(tomorrow);
}

/* ------------------------------- Kontroller ------------------------------- */

function accessResult(limit: number): QuotaResult {
  return {
    allowed: true,
    isPremium: true,
    used: 0,
    limit,
    nextResetAt: new Date().toISOString(),
  };
}

/**
 * Dagskvot för test-/provsessioner: max 1 SLUTFÖRD session per test_type och
 * dygn på grundnivån. Påbörjade men oavslutade sessioner bränner ingen kvot.
 *
 * Nivåspärren ligger inte här utan i testConfig och sessionsrutterna: allt
 * över grundnivån kräver featuren tests_above_base och når aldrig kvoten.
 */
export async function checkDailyTestQuota(
  supabase: AnySupabase,
  userId: string,
  testType: string
): Promise<QuotaResult> {
  if (await userHasAccess(supabase, userId, 'tests_above_base')) {
    return accessResult(DAILY_LIMIT_TEST_SESSIONS);
  }

  const since = startOfTodayStockholm().toISOString();
  const { count } = await supabase
    .from('logic_test_v4_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('test_type', testType)
    .not('completed_at', 'is', null)
    .gte('completed_at', since);

  const used = count ?? 0;
  return {
    allowed: used < DAILY_LIMIT_TEST_SESSIONS,
    isPremium: false,
    used,
    limit: DAILY_LIMIT_TEST_SESSIONS,
    nextResetAt: nextMidnightStockholm().toISOString(),
  };
}

/** Intervjuprovet i artiklarna: ett bedömt svar per dygn på gratisnivån. */
export const DAILY_LIMIT_INTERVIEW_SAMPLES = 1;

/**
 * Intervjuprovet för inloggade (docs/design/intervjuprov-spec-2026-09-23.md,
 * avsnitt 6). Räknar sparade rader i anon_interview_samples sedan midnatt
 * svensk tid. Irrelevanta svar från inloggade sparas som en rad markerad
 * irrelevant, så de räknas också (ägarens beslut 9, 2026-09-23).
 *
 * Tabellen har RLS utan policies, så klienten som skickas in måste vara
 * admin-klienten: en användarklient ser noll rader och släpper igenom allt.
 */
export async function checkDailyInterviewQuota(
  supabase: AnySupabase,
  userId: string,
  now: Date = new Date()
): Promise<QuotaResult> {
  if (await userHasAccess(supabase, userId, 'interview_unlimited')) {
    return accessResult(DAILY_LIMIT_INTERVIEW_SAMPLES);
  }

  const since = startOfTodayStockholm(now).toISOString();
  const { count } = await supabase
    .from('anon_interview_samples')
    .select('token', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  const used = count ?? 0;
  return {
    allowed: used < DAILY_LIMIT_INTERVIEW_SAMPLES,
    isPremium: false,
    used,
    limit: DAILY_LIMIT_INTERVIEW_SAMPLES,
    nextResetAt: nextMidnightStockholm(now).toISOString(),
  };
}

/**
 * Jobbcoachens chatt: tio meddelanden per konto, inte per dygn (avsnitt 4).
 * Chatten är dyr per svar och konsumeras av få, och en dagskvot ger bort
 * obegränsat värde över tid.
 */
export async function checkChatQuota(
  supabase: AnySupabase,
  userId: string
): Promise<QuotaResult> {
  if (await userHasAccess(supabase, userId, 'chat_unlimited')) {
    return accessResult(FREE_CHAT_MESSAGES_PER_ACCOUNT);
  }

  const { count } = await supabase
    .from('ai_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user');

  const used = count ?? 0;
  return {
    allowed: used < FREE_CHAT_MESSAGES_PER_ACCOUNT,
    isPremium: false,
    used,
    limit: FREE_CHAT_MESSAGES_PER_ACCOUNT,
    // Kontokvot: den öppnar inte igen imorgon.
    nextResetAt: new Date().toISOString(),
    perAccount: true,
  };
}

/**
 * CV-analys: en per konto (ägarens beslut 2). Räknar jobb som faktiskt
 * räknats som förbrukning (usage_counted=true, sätts vid completion och
 * rullas tillbaka vid failure av jobs-routen, den logiken är orörd).
 *
 * Omkörningen är uttaget: den som vill se poängen röra sig efter en rättning
 * betalar för det, och det är precis vad dag 2 i CV-paketet handlar om.
 */
export async function checkCvAnalysisQuota(
  supabase: AnySupabase,
  userId: string
): Promise<QuotaResult> {
  if (await userHasAccess(supabase, userId, 'cv_analysis_full')) {
    return accessResult(CV_ANALYSIS_LIMIT);
  }

  const { count } = await supabase
    .from('cv_analysis_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('usage_counted', true);

  const used = count ?? 0;
  return {
    allowed: used < CV_ANALYSIS_LIMIT,
    isPremium: false,
    used,
    limit: CV_ANALYSIS_LIMIT,
    nextResetAt: new Date().toISOString(),
    perAccount: true,
  };
}

/**
 * Brevräknaren: ett brev per konto, därefter ett per rullande sju dygn
 * (avsnitt 4). Brev konsumeras aldrig mer än ett per konto ens under trial,
 * så dagskvoten skyddade ingenting och gjorde löftet dyrare än det behövde.
 *
 * Fönstret räknas ur de befintliga profiles-kolumnerna: räknaren är logiskt
 * noll så snart fönsterstarten ligger mer än sju dygn bakåt, och anroparen
 * nollställer kolumnerna vid nästa förbrukning.
 */
export function resolveWeeklyLetterCounter(
  count: number | null,
  firstUsedAt: string | Date | null,
  now: Date = new Date()
): { effectiveCount: number; windowIsStale: boolean; windowEndsAt: Date | null } {
  const first = firstUsedAt ? new Date(firstUsedAt) : null;
  if (!first || Number.isNaN(first.getTime())) {
    return { effectiveCount: 0, windowIsStale: true, windowEndsAt: null };
  }

  const windowEndsAt = new Date(first.getTime() + LETTER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (windowEndsAt.getTime() <= now.getTime()) {
    return { effectiveCount: 0, windowIsStale: true, windowEndsAt: null };
  }
  return { effectiveCount: count ?? 0, windowIsStale: false, windowEndsAt };
}

/**
 * Gammalt namn, ny gräns. Rutterna anropar fortfarande det här, och de får
 * numera veckofönstret i stället för dygnsfönstret.
 */
export const resolveDailyLetterCounter = resolveWeeklyLetterCounter;

/**
 * När brevkvoten öppnar igen. Ligger sju dygn efter fönstrets start, eller
 * nu om det inte finns något levande fönster.
 */
export function nextLetterResetAt(
  firstUsedAt: string | Date | null,
  now: Date = new Date()
): string {
  const { windowEndsAt } = resolveWeeklyLetterCounter(0, firstUsedAt, now);
  return (windowEndsAt ?? now).toISOString();
}

/**
 * Brevkvoten i samma form som de andra. Används av kvotvyerna; rutterna
 * räknar själva eftersom de ändå läser profilraden.
 */
export async function checkLetterQuota(
  supabase: AnySupabase,
  userId: string
): Promise<QuotaResult> {
  if (await userHasAccess(supabase, userId, 'letter_download')) {
    return accessResult(DAILY_LIMIT_LETTERS);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('weekly_letter_count, weekly_letter_first_used_at')
    .eq('id', userId)
    .maybeSingle();

  const rad = profile as
    | { weekly_letter_count?: number | null; weekly_letter_first_used_at?: string | null }
    | null;

  const { effectiveCount } = resolveWeeklyLetterCounter(
    rad?.weekly_letter_count ?? 0,
    rad?.weekly_letter_first_used_at ?? null
  );

  return {
    allowed: effectiveCount < DAILY_LIMIT_LETTERS,
    isPremium: false,
    used: effectiveCount,
    limit: DAILY_LIMIT_LETTERS,
    nextResetAt: nextLetterResetAt(rad?.weekly_letter_first_used_at ?? null),
  };
}

/* ------------------------- Standardiserat 429-svar ------------------------- */

/**
 * Enhetlig payload när en kvot är slut, så alla spärrvyer kan visa exakt
 * återkomsttid och "påminn mig"-knapp (POST /api/quota/remind).
 *
 * perAccount säger åt vyn att inte erbjuda en påminnelse: kvoten kommer inte
 * tillbaka imorgon, och att lova det vore osant.
 */
export function quotaExceededBody(
  feature: string,
  result: QuotaResult,
  message: string
) {
  return {
    error: 'quota_exceeded',
    code: 'quota_exceeded',
    feature,
    used: result.used,
    limit: result.limit,
    nextResetAt: result.nextResetAt,
    // Bakåtkompatibelt fältnamn som befintliga klienter redan läser:
    nextResetDate: result.nextResetAt,
    limitReached: true,
    perAccount: result.perAccount === true,
    message,
  };
}

/* ----------------------- 402 när en feature saknas ------------------------ */

/**
 * Enhetlig payload när spärren är en feature och inte en kvot. Klienten
 * ritar betalväggen ur feature och suggestedPlan, så samma fyra fält räcker
 * överallt: mallvalet, testnivån, analysen, brevnedladdningen.
 */
export function featureRequiredBody(
  feature: Feature,
  suggestedPlan: string,
  extra?: Record<string, unknown>
) {
  return {
    error: 'premium_required' as const,
    feature,
    suggestedPlan,
    ...extra,
  };
}
