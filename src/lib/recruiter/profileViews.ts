// src/lib/recruiter/profileViews.ts
// Loggning och uppslag av profilvisningar (docs/plan-inloggat-omdesign.md,
// avsnitt 5 och våg 3 punkt 24).
//
// Varför tabellen finns: Bli upptäckt bad kandidaten investera i tester, pitch
// och villkor, och gav sedan tillbaka meningen "Nu väntar vi bara på
// rekryterarna". Utan observerbar återkoppling mellan arbete och resultat
// tappar vi varje användare som faktiskt gjorde jobbet. Visningsräknaren är
// den minsta sanna signal vi kan ge.
//
// Integritetsregel: kandidaten ser ANTAL, aldrig VEM. recruiter_user_id lagras
// för avdubbling och missbruksspårning men lämnar aldrig servern mot
// kandidatsidan. Ingen RLS-policy tillåter kandidaten att läsa den kolumnen
// via select *, eftersom kandidatvyn går via en serverrutt som väljer kolumner
// explicit.

import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

/**
 * Avdubblingsfönster. Samma rekryterare som öppnar samma profil fem gånger på
 * en eftermiddag är ett intresse, inte fem. Utan fönstret blir siffran ett mått
 * på rekryterarens scrollande i stället för på kandidatens synlighet.
 */
const DEDUPE_HOURS = 24;

/**
 * Loggar att en rekryterare sett en kandidats detaljprofil.
 *
 * Får aldrig få anropet att misslyckas: en visningslogg som kraschar
 * rekryterarens sidhämtning är ett sämre fel än en tappad rad. Därför
 * fire-and-forget med egen felhantering.
 */
export async function logProfileView(
  admin: AnySupabase,
  candidateUserId: string,
  recruiterUserId: string
): Promise<void> {
  // Rekryterare som tittar på sin egen kandidatprofil ska inte räknas.
  if (candidateUserId === recruiterUserId) return;

  try {
    const since = new Date(Date.now() - DEDUPE_HOURS * 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await (admin as any)
      .from('candidate_profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('candidate_user_id', candidateUserId)
      .eq('recruiter_user_id', recruiterUserId)
      .gte('viewed_at', since);

    if (countError) {
      console.error('[profileViews] avdubbling misslyckades:', countError.message);
      return;
    }
    if ((count ?? 0) > 0) return;

    const { error } = await (admin as any).from('candidate_profile_views').insert({
      candidate_user_id: candidateUserId,
      recruiter_user_id: recruiterUserId,
    });

    if (error) console.error('[profileViews] kunde inte logga visning:', error.message);
  } catch (error: any) {
    console.error('[profileViews] oväntat fel:', error?.message);
  }
}

export interface ProfileViewStats {
  /** Visningar de senaste sju dygnen. */
  lastWeek: number;
  /** Visningar totalt sedan profilen aktiverades. */
  total: number;
}

/**
 * Kandidatens egen räknare. Returnerar nollor vid fel, eftersom en tom siffra
 * är bättre än ett brutet kort.
 */
export async function getProfileViewStats(
  client: AnySupabase,
  candidateUserId: string
): Promise<ProfileViewStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [weekRes, totalRes] = await Promise.all([
    (client as any)
      .from('candidate_profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('candidate_user_id', candidateUserId)
      .gte('viewed_at', weekAgo),
    (client as any)
      .from('candidate_profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('candidate_user_id', candidateUserId),
  ]);

  return {
    lastWeek: weekRes?.count ?? 0,
    total: totalRes?.count ?? 0,
  };
}
