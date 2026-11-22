// src/lib/recruiter/candidateAccess.ts
//
// Ingången för allt som läser en kandidat åt en rekryterare. Rutterna
// (poolen, detaljen, inkorgen, projekten, intresset, anteckningarna,
// delningen) och den publika delningslänken hämtar profiler här och formar
// svaret med vitlistan i recruiterView.ts. Ingen rutt läser
// candidate_profiles själv.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import {
  buildCandidateCard,
  buildCandidateDetail,
  createPercentileContext,
  type CandidateProfileRow,
} from './candidateData';
import {
  accessFor,
  toRecruiterCard,
  toRecruiterDetail,
  type RecruiterCard,
  type RecruiterDetail,
} from './recruiterView';

type Admin = SupabaseClient<Database>;

/** Profilkolumnerna kandidatdatan byggs av. Lönespannet läses aldrig. */
export const CANDIDATE_PROFILE_COLUMNS =
  'user_id, cv_id, visibility, show_personality, show_full_workstyle, context_tags, availability, workplace, extent, employment_types, regions, drivers_license, pitch, consent_given_at, created_at';

/**
 * Frågan efter profiler som får synas för en rekryterare. Anroparen kan
 * kedja egna villkor (filter, in, eq).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function visibleProfilesQuery(admin: Admin): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (admin as any)
    .from('candidate_profiles')
    .select(CANDIDATE_PROFILE_COLUMNS)
    .neq('visibility', 'off');
}

/** En synlig kandidat, eller null. Dold och obefintlig går inte att skilja åt. */
export async function findVisibleProfile(
  admin: Admin,
  candidateRef: string
): Promise<CandidateProfileRow | null> {
  const ref = candidateRef?.trim();
  if (!ref) return null;
  const { data, error } = await visibleProfilesQuery(admin).eq('user_id', ref).maybeSingle();
  if (error) {
    console.error('candidateAccess: kunde inte läsa profilen', error);
    return null;
  }
  return (data as CandidateProfileRow | null) ?? null;
}

/** Rekryterarens intressestatus för kandidaten, null om inget intresse. */
export async function interestStatusFor(
  admin: Admin,
  recruiterUserId: string,
  candidateUserId: string
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('candidate_interests')
    .select('status')
    .eq('recruiter_user_id', recruiterUserId)
    .eq('candidate_user_id', candidateUserId)
    .maybeSingle();
  return (data?.status as string | undefined) ?? null;
}

/**
 * Detaljprofilen som en viss rekryterare får se. Den publika delningslänken
 * använder skaparens id, så länken aldrig visar mer än skaparen själv ser.
 */
export async function recruiterDetailFor(
  admin: Admin,
  row: CandidateProfileRow,
  recruiterUserId: string,
  opts: { sharedLink?: boolean } = {}
): Promise<{ detail: RecruiterDetail; interestStatus: string | null }> {
  const interestStatus = await interestStatusFor(admin, recruiterUserId, row.user_id);
  const access = accessFor(row.visibility, interestStatus);
  // Den som öppnar en delad länk är inte den kandidaten tackade ja till:
  // e-posten stannar hos rekryteraren även efter ja.
  if (opts.sharedLink) access.emailUnlocked = false;
  const internal = await buildCandidateDetail(admin, row, access.contactUnlocked, {
    emailUnlocked: access.emailUnlocked,
  });
  return { detail: toRecruiterDetail(internal, access), interestStatus };
}

/** Träffkort för synliga kandidater bland userIds, nyckel = kandidatens user_id. */
export async function recruiterCardsFor(
  admin: Admin,
  userIds: string[]
): Promise<Map<string, RecruiterCard>> {
  const result = new Map<string, RecruiterCard>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return result;

  const { data, error } = await visibleProfilesQuery(admin).in('user_id', unique);
  if (error) {
    console.error('candidateAccess: kunde inte läsa profiler', error);
    throw error;
  }
  const ctx = createPercentileContext(admin);
  await Promise.all(
    ((data ?? []) as CandidateProfileRow[]).map(async (row) => {
      const card = await buildCandidateCard(admin, row, ctx);
      result.set(row.user_id, toRecruiterCard(card));
    })
  );
  return result;
}
