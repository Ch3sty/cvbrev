/**
 * Serverhämtningen bakom profilsidans rot.
 *
 * Förut var hela sidan 'use client'. Den monterade, väntade på att useProfile
 * skulle få sin summary genom en effekt, och visade under tiden ett
 * helsidesskelett. Ovanpå det hämtade varje sektion sitt eget:
 *   - NotisInstallningar: två fetchanrop (/api/email/digest-preference och
 *     /api/profile/quota-emails), båda med ett eget auth.getUser() före sin
 *     enda kolumnfråga
 *   - BliUpptacktSection via useCandidateInterests: getSession, sedan ett
 *     fetch mot /api/candidate/interests och en fråga mot candidate_profiles
 * Mätningen landade på 5 rundturer och 1680 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses allt här. Profilraden i sig kostar ingenting extra: layouten har
 * redan hämtat den och skickar den vidare som summary.profile, och de två
 * mailinställningarna är kolumner på precis samma rad (weekly_digest_opt_out
 * och quota_emails_opt_out). Kvar blir en enda fråga, synligheten i
 * candidate_profiles.
 *
 * Ingenting om hur data sparas ändras. Autosparningen per fält går kvar
 * genom updateProfile, och de två mailväxlarna postar till sina egna routes
 * precis som förut. Det här är bara läsvägen.
 */

export interface ProfilPageData {
  /** true när kandidatprofilen är synlig i rekryterarpoolen. */
  candidateVisible: boolean;
}

export const EMPTY_PROFIL_DATA: ProfilPageData = {
  candidateVisible: false,
};

/**
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId. Funktionen läser
 * bara, den fattar inga kvot- eller premiumbeslut.
 */
export async function getProfilData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<ProfilPageData> {
  const { data, error } = await supabase
    .from('candidate_profiles')
    .select('visibility')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Profilsidan: kunde inte läsa kandidatprofilens synlighet', error);
    return EMPTY_PROFIL_DATA;
  }

  const visibility = (data?.visibility as string | null) ?? 'off';

  return { candidateVisible: visibility !== 'off' };
}
