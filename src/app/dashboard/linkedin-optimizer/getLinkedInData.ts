/**
 * Serverhämtningen bakom LinkedIn-optimeringen.
 *
 * Förut var sidan 'use client' bakom en Suspense-skelett. Efter hydrering
 * gjorde LinkedInOptimizer två saker parallellt men båda efter JS: fetchCVs i
 * cv-store (getSession följt av frågan mot cv_texts) och ett auth.getUser()
 * över nätet bara för att få namnet till mockupen. Mätningen landade på 3
 * rundturer och 2288 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses båda här, i en parallell omgång, och första HTML innehåller
 * steg 1 med CV-listan färdig.
 *
 * Kvoten är orörd. Den avgörs av edge-funktionen optimize-linkedin när
 * användaren faktiskt startar en optimering, aldrig av något den här filen
 * läser.
 */
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import { getCvGrans } from '@/lib/supabase/premiumAccess';

/** CV-raden så som cv-store bär den. Samma kolumner som fetchCVs läste. */
export interface LinkedInCvRow {
  id: string;
  user_id: string;
  file_name: string;
  original_file_path: string;
  cv_text: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structured_data: any;
}

export interface LinkedInPageData {
  cvs: LinkedInCvRow[];
  /**
   * Id på CV som är låsta av CV-kvoten. Förut räknade CvSelectorList ut det
   * själv med useCvQuota, alltså ett auth.getUser() över nätet följt av två
   * frågor, mitt i första vyn. Regeln är oförändrad: free har två aktiva CV,
   * premium femtio, räknat med samma getActiveCvIds.
   */
  lockedCvIds: string[];
  /** Namnet till LinkedIn-mockupen. null när det saknas. */
  fullName: string | null;
}

export const EMPTY_LINKEDIN_DATA: LinkedInPageData = {
  cvs: [],
  lockedCvIds: [],
  fullName: null,
};

/**
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId samt namnet ur
 * sessionens user_metadata, som förut lästes med ett eget auth.getUser().
 */
export async function getLinkedInData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  metadataFullName: string | null
): Promise<LinkedInPageData> {
  // Profilens namn går före metadatans: har användaren själv skrivit in ett
  // namn på profilsidan är det hennes, inte Googles.
  const [cvRes, profileRes, grans] = await Promise.all([
    supabase
      .from('cv_texts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle(),
    getCvGrans(supabase, userId),
  ]);

  if (cvRes.error) {
    console.error('LinkedIn: kunde inte läsa CV-listan', cvRes.error);
  }
  if (profileRes.error) {
    console.error('LinkedIn: kunde inte läsa profilnamnet', profileRes.error);
  }

  const profileRow = profileRes.data as { full_name?: string | null } | null;

  const profileName = profileRow?.full_name || null;
  const cvs = (cvRes.data ?? []) as LinkedInCvRow[];

  // CV-låsen: samma regel som useCvQuota körde på klienten. Behörigheten
  // läses via premiumAccess, så att engångsköp i premium_grants och admin
  // räknas, inte bara profiles.subscription_tier.
  const active = getActiveCvIds(
    cvs.map((cv) => ({ id: cv.id, created_at: cv.created_at ?? '' })),
    grans.maxCvs
  );

  return {
    cvs,
    lockedCvIds: cvs.filter((cv) => !active.has(cv.id)).map((cv) => cv.id),
    fullName: profileName || metadataFullName || null,
  };
}
