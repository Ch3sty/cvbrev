// src/lib/recruiter/candidateAccess.ts
//
// Ingången för allt som läser en kandidat åt en rekryterare. Rutterna
// (poolen, detaljen, inkorgen, projekten, intresset, anteckningarna,
// delningen) och den publika delningslänken hämtar profiler här och formar
// svaret med vitlistan i recruiterView.ts. Ingen rutt läser
// candidate_profiles själv.
//
// KANDIDATENS ID MOT REKRYTERAREN
// Rekryteraren ser aldrig kontots id (auth-användarens uuid). Kandidaten
// pekas ut med candidate_profiles.public_id, en slumpad uuid som inte har
// något med kontot att göra (migreringen 20261122180000). Innan migreringen
// är körd finns kolumnen inte, och då används kontots id som förut. Koden
// känner av kolumnen själv och byter utan ny driftsättning. När kolumnen
// finns ger ett gammalt id (kontots) 404, aldrig en omdirigering.

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// public_id: finns kolumnen?
// ---------------------------------------------------------------------------

type PublicIdState = { finns: boolean; kollad: number };
let publicIdState: PublicIdState | null = null;
/** Ett nej kollas om efter fem minuter, så migreringen slår igenom av sig själv. */
const NEJ_GILTIGT_MS = 5 * 60 * 1000;

/** Bara för tester. */
export function __resetPublicIdState(): void {
  publicIdState = null;
}

export async function hasPublicIdColumn(admin: Admin): Promise<boolean> {
  if (publicIdState?.finns) return true;
  if (publicIdState && Date.now() - publicIdState.kollad < NEJ_GILTIGT_MS) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('candidate_profiles').select('public_id').limit(1);
  if (!error) {
    publicIdState = { finns: true, kollad: Date.now() };
    return true;
  }
  if (error.code === '42703' || /public_id/.test(String(error.message ?? ''))) {
    publicIdState = { finns: false, kollad: Date.now() };
    return false;
  }
  // Annat fel: säg nej den här gången men spara inget svar.
  console.error('candidateAccess: kunde inte avgöra om public_id finns', error);
  return false;
}

/**
 * Kandidatens id mot rekryteraren. Kastar hellre än att falla tillbaka på
 * kontots id när kolumnen finns men raden lästes utan den.
 */
export function candidateRefOf(row: { user_id: string; public_id?: string | null }): string {
  if (row.public_id) return row.public_id;
  if (publicIdState && !publicIdState.finns) return row.user_id;
  throw new Error('candidateAccess: profilen lästes utan public_id');
}

async function profileColumns(admin: Admin): Promise<string> {
  return (await hasPublicIdColumn(admin))
    ? `${CANDIDATE_PROFILE_COLUMNS}, public_id`
    : CANDIDATE_PROFILE_COLUMNS;
}

// ---------------------------------------------------------------------------
// Läsningarna
// ---------------------------------------------------------------------------

/**
 * Frågan efter profiler som får synas för en rekryterare. Anroparen kan
 * kedja egna villkor (filter, in, eq). Frågan ligger inslagen i ett objekt:
 * ett frågeobjekt är självt awaitbart och skulle annars köras redan när
 * löftet från den här funktionen löses.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function visibleProfilesQuery(admin: Admin): Promise<{ query: any }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (admin as any)
    .from('candidate_profiles')
    .select(await profileColumns(admin))
    .neq('visibility', 'off');
  return { query };
}

/**
 * En synlig kandidat utifrån id:t rekryteraren har (public_id, eller kontots
 * id innan kolumnen finns). Dold och obefintlig går inte att skilja åt.
 */
export async function findVisibleProfile(
  admin: Admin,
  candidateRef: string
): Promise<CandidateProfileRow | null> {
  const ref = typeof candidateRef === 'string' ? candidateRef.trim() : '';
  if (!UUID_RE.test(ref)) return null;
  const key = (await hasPublicIdColumn(admin)) ? 'public_id' : 'user_id';
  const { data, error } = await (await visibleProfilesQuery(admin)).query.eq(key, ref).maybeSingle();
  if (error) {
    console.error('candidateAccess: kunde inte läsa profilen', error);
    return null;
  }
  return (data as CandidateProfileRow | null) ?? null;
}

/** Samma sak utifrån kontots id. Bara för serverns egna uppslag (delningslänken). */
export async function findVisibleProfileByUserId(
  admin: Admin,
  userId: string
): Promise<CandidateProfileRow | null> {
  if (!userId) return null;
  const { data, error } = await (await visibleProfilesQuery(admin)).query.eq('user_id', userId).maybeSingle();
  if (error) {
    console.error('candidateAccess: kunde inte läsa profilen', error);
    return null;
  }
  return (data as CandidateProfileRow | null) ?? null;
}

/**
 * Kontots id bakom ett id från rekryteraren, oavsett synlighet (anteckningar,
 * projektstatus och återkallade länkar ska gå att hantera även när kandidaten
 * dolt sig). null när id:t inte motsvarar någon profil.
 */
export async function userIdForRef(admin: Admin, candidateRef: string): Promise<string | null> {
  const ref = typeof candidateRef === 'string' ? candidateRef.trim() : '';
  if (!UUID_RE.test(ref)) return null;
  if (!(await hasPublicIdColumn(admin))) return ref;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('candidate_profiles')
    .select('user_id')
    .eq('public_id', ref)
    .maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
}

/** Rekryterarens id för en mängd kandidatkonton, oavsett synlighet. */
export async function refsForUserIds(
  admin: Admin,
  userIds: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const result = new Map<string, string>();
  if (unique.length === 0) return result;
  if (!(await hasPublicIdColumn(admin))) {
    for (const id of unique) result.set(id, id);
    return result;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('candidate_profiles')
    .select('user_id, public_id')
    .in('user_id', unique);
  for (const row of (data ?? []) as Array<{ user_id: string; public_id: string | null }>) {
    if (row.public_id) result.set(row.user_id, row.public_id);
  }
  return result;
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
  return { detail: toRecruiterDetail(internal, candidateRefOf(row), access), interestStatus };
}

/** Träffkort för synliga kandidater bland userIds, nyckel = kandidatens user_id. */
export async function recruiterCardsFor(
  admin: Admin,
  userIds: string[]
): Promise<Map<string, RecruiterCard>> {
  const result = new Map<string, RecruiterCard>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return result;

  const { data, error } = await (await visibleProfilesQuery(admin)).query.in('user_id', unique);
  if (error) {
    console.error('candidateAccess: kunde inte läsa profiler', error);
    throw error;
  }
  const ctx = createPercentileContext(admin);
  await Promise.all(
    ((data ?? []) as CandidateProfileRow[]).map(async (row) => {
      const card = await buildCandidateCard(admin, row, ctx);
      result.set(row.user_id, toRecruiterCard(card, candidateRefOf(row)));
    })
  );
  return result;
}
