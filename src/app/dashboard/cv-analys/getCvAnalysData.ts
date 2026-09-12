/**
 * Serverhämtningen bakom CV-analysen.
 *
 * Förut var hela sidan 'use client' och visade en spinner tills tre kedjor
 * gått i mål efter hydrering:
 *   - useCvQuota: auth.getUser() över nätet, sedan profiles, sedan cv_texts
 *   - cv-store fetchCVs: getSession, sedan cv_texts en gång till
 *   - refreshProfile vid mount: en hel omhämtning av dashboard-summaryn, bara
 *     för att undvika att ett inaktuellt klienttillstånd spärrade användaren
 * Mätningen landade på 8 rundturer och 2588 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses allt här, i en parallell omgång, vid request-tid. Omhämtningen vid
 * mount behövs inte längre: serverns siffror ÄR färska, de lästes just nu.
 *
 * KVOTEN ÄR ORÖRD. Den avgörs fortfarande på två ställen, båda oförändrade:
 * POST /api/cv/analyze svarar 429 med limitReached och nextResetAt när den
 * rullande 72-timmarskvoten är slut, och profilens räknare speglar samma sak i
 * gränssnittet. Den här filen läser bara de kolumner useProfile redan läste
 * och räknar exakt som SUBSCRIPTION_LIMITS gör. Ingen ny regel, ingen ändrad
 * gräns. Analysens tre gratisfynd ligger kvar där de ligger, i wizarden och i
 * analyssvaret, och rörs inte av den här filen.
 */
import { getActiveCvIds } from '@/lib/cv/cv-quota';

/** Gratisnivåns analyskvot, samma värde som SUBSCRIPTION_LIMITS i useProfile. */
const FREE_ANALYSIS_LIMIT = 1;

/** CV-raden så som cv-store och wizarden bär den. */
export interface CvAnalysRow {
  id: string;
  user_id: string;
  file_name: string;
  original_file_path: string;
  cv_text: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structured_data: any;
}

export interface CvAnalysData {
  /** Inloggad användare, för aktivitetsloggningen när en analys startas. */
  userId: string;
  cvs: CvAnalysRow[];
  /** Antal CV totalt. Noll skickar användaren till CV-uppladdningen. */
  cvCount: number;
  isPremium: boolean;
  /**
   * Kvar av gratisanalyserna. null för premium, som saknar gräns.
   * Räknad precis som useProfile räknar den.
   */
  remainingAnalyses: number | null;
  /** När kvoten öppnar igen, ISO-sträng. null när den inte är slut. */
  nextResetAt: string | null;
}

/**
 * Fallback när läsningen går fel. Gratisnivåns fulla kvot, ingen spärr: ett
 * läsfel ska aldrig i sig låsa någon ute. Den verkliga spärren ligger kvar i
 * POST /api/cv/analyze, som svarar 429 oavsett vad klienten tror.
 */
export function emptyCvAnalysData(userId: string): CvAnalysData {
  return {
    userId,
    cvs: [],
    cvCount: 0,
    isPremium: false,
    remainingAnalyses: FREE_ANALYSIS_LIMIT,
    nextResetAt: null,
  };
}

/**
 * Nästa återställning för kompetensanalysens veckofönster. Speglar
 * calculateNextResetDate i useProfile: sju dygn efter senaste nollställningen,
 * och utan tidigare nollställning finns ingen spärrtid att visa.
 */
function nextResetFrom(lastReset: string | null): string | null {
  if (!lastReset) return null;
  const next = new Date(lastReset);
  next.setDate(next.getDate() + 7);
  return next.toISOString();
}

/**
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId. Funktionen läser
 * bara, den skriver ingenting och startar ingen analys.
 */
export async function getCvAnalysData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<CvAnalysData> {
  const [cvRes, profileRes] = await Promise.all([
    supabase
      .from('cv_texts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select(
        'subscription_tier, premium_until, weekly_competence_analysis_count, last_competence_analysis_reset'
      )
      .eq('id', userId)
      .maybeSingle(),
  ]);

  if (cvRes.error) {
    console.error('CV-analys: kunde inte läsa CV-listan', cvRes.error);
  }
  if (profileRes.error) {
    console.error('CV-analys: kunde inte läsa profilen', profileRes.error);
  }

  const cvs = (cvRes.data ?? []) as CvAnalysRow[];

  const row = profileRes.data as {
    subscription_tier?: string | null;
    premium_until?: string | null;
    weekly_competence_analysis_count?: number | null;
    last_competence_analysis_reset?: string | null;
  } | null;

  // Samma validering som useProfile: 'premium' i tabellen räknas som premium,
  // premium_until läses som säkerhetsnät mot en utgången rad.
  const untilOk =
    !row?.premium_until || new Date(row.premium_until).getTime() > Date.now();
  const isPremium = row?.subscription_tier === 'premium' && untilOk;

  if (isPremium) {
    return {
      userId,
      cvs,
      cvCount: cvs.length,
      isPremium: true,
      remainingAnalyses: null,
      nextResetAt: null,
    };
  }

  const used = row?.weekly_competence_analysis_count ?? 0;
  const remaining = Math.max(0, FREE_ANALYSIS_LIMIT - used);

  return {
    userId,
    cvs,
    cvCount: cvs.length,
    isPremium: false,
    remainingAnalyses: remaining,
    nextResetAt:
      remaining <= 0
        ? nextResetFrom(row?.last_competence_analysis_reset ?? null)
        : null,
  };
}

/**
 * Vilka CV som är låsta av CV-kvoten. Free har två aktiva CV, premium femtio,
 * samma regel som useCvQuota körde på klienten. Oförändrad, bara flyttad.
 */
export function lockedCvIds(cvs: CvAnalysRow[], isPremium: boolean): Set<string> {
  const active = getActiveCvIds(
    cvs.map((cv) => ({ id: cv.id, created_at: cv.created_at ?? '' })),
    isPremium ? 50 : 2
  );
  return new Set(cvs.filter((cv) => !active.has(cv.id)).map((cv) => cv.id));
}
