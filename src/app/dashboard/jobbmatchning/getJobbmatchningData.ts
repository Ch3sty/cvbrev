/**
 * Serverhämtningen bakom Jobbmatchning.
 *
 * Förut var hela sidan 'use client' och visade en spinner tills tre kedjor
 * gått i mål efter hydrering:
 *   - useCvQuota: auth.getUser() över nätet, sedan profiles, sedan cv_texts
 *   - fetchCVs: getSession, sedan cv_texts en gång till
 *   - fetchActiveCV: getSession, sedan active_cv_for_matching
 * Mätningen landade på 8 rundturer och 2024 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses allt här i en parallell omgång, och första HTML innehåller
 * CV-korten färdiga.
 *
 * Ingenting om själva matchningen ändras. Jobben hämtas fortfarande av
 * edge-funktionen match-jobs när användaren söker, och vad gratisnivån får se
 * avgörs fortfarande av POST /api/jobs/redact på servern. Den här filen
 * hämtar aldrig jobb och fattar inga beslut om vad som får visas.
 */
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import {
  toJobPreferences,
  EMPTY_JOB_PREFERENCES,
  type JobPreferences,
} from '@/types/user.types';

export interface JobbmatchningCv {
  id: string;
  file_name: string;
  created_at: string;
}

export interface ActiveCVData {
  cv_id: string;
  extracted_occupations: Array<{
    original: string;
    normalized: string;
    concept_id: string | null;
    alternative_labels: string[];
    confidence: 'high' | 'medium' | 'low';
  }>;
  extracted_skills: string[];
  extracted_educations: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  extracted_location: string | null;
  parsed_at: string;
}

export interface JobbmatchningData {
  cvs: JobbmatchningCv[];
  /**
   * Gick läsningen av CV-listan fel?
   *
   * Utan det här fältet betydde en tom lista två helt olika saker: användaren
   * har inte laddat upp något CV, eller vi kunde inte läsa. Sidan visade
   * introduktionen "Ladda upp ditt första CV" i båda fallen, så ett konto med
   * nio CV:n kunde få onboarding vid en hård omladdning om frågan råkade gå
   * fel. Nu säger sidan att det gick fel, och erbjuder ett nytt försök.
   */
  loadFailed: boolean;
  /**
   * Id på CV som är låsta av CV-kvoten. Free har två aktiva CV, premium
   * femtio, räknat med samma getActiveCvIds som useCvQuota använde. Regeln är
   * oförändrad, bara flyttad hit.
   */
  lockedCvIds: string[];
  /** Det aktiverade CV:t, alltså underlaget matchningen utgår från. */
  activeCV: ActiveCVData | null;
  /**
   * Preferenserna från profilen: orter, distans, omfattning och lägsta lön.
   * Läses här så att panelen "Så söker vi åt dig" står ifylld i första HTML,
   * utan en egen rundtur efter hydrering.
   */
  jobPreferences: JobPreferences;
}

/**
 * Reservdata när hämtningen kastade. Den säger uttryckligen att läsningen gick
 * fel, så sidan visar ett felmeddelande i stället för introduktionen.
 */
export const EMPTY_JOBBMATCHNING_DATA: JobbmatchningData = {
  cvs: [],
  loadFailed: true,
  lockedCvIds: [],
  activeCV: null,
  jobPreferences: EMPTY_JOB_PREFERENCES,
};

/**
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId.
 */
export async function getJobbmatchningData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<JobbmatchningData> {
  const [cvRes, activeRes, profileRes] = await Promise.all([
    supabase
      .from('cv_texts')
      .select('id, file_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('active_cv_for_matching')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('subscription_tier, premium_until, job_preferences')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  if (cvRes.error) {
    console.error('Jobbmatchning: kunde inte läsa CV-listan', cvRes.error);
  }
  if (activeRes.error) {
    console.error('Jobbmatchning: kunde inte läsa aktivt CV', activeRes.error);
  }
  if (profileRes.error) {
    console.error('Jobbmatchning: kunde inte läsa profilen', profileRes.error);
  }

  const cvs = (cvRes.data ?? []) as JobbmatchningCv[];

  const profileRow = profileRes.data as
    | {
        subscription_tier?: string | null;
        premium_until?: string | null;
        job_preferences?: unknown;
      }
    | null;
  const untilOk =
    !profileRow?.premium_until ||
    new Date(profileRow.premium_until).getTime() > Date.now();
  const isPremium = profileRow?.subscription_tier === 'premium' && untilOk;

  const active = getActiveCvIds(
    cvs.map((cv) => ({ id: cv.id, created_at: cv.created_at ?? '' })),
    isPremium ? 50 : 2
  );

  return {
    cvs,
    // Bara CV-listan avgör det här. Går den fel vet vi inte om användaren har
    // några CV:n, och då får sidan inte gissa att hon saknar dem. Att aktivt
    // CV eller profilen inte gick att läsa är mindre allvarligt: sidan
    // fungerar ändå, den vet bara mindre om sökningen.
    loadFailed: !!cvRes.error,
    lockedCvIds: cvs.filter((cv) => !active.has(cv.id)).map((cv) => cv.id),
    activeCV: (activeRes.data ?? null) as ActiveCVData | null,
    jobPreferences: toJobPreferences(profileRow?.job_preferences),
  };
}
