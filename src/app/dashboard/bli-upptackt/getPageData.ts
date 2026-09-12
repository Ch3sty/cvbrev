/**
 * Serverhämtningen bakom Bli upptäckt.
 *
 * Förut gjorde sidan allt efter hydrering, och varje del hade sin egen kedja:
 *   - page.tsx: auth.getUser(), sedan tre frågor, sedan fetch mot
 *     /api/candidate/summary som gjorde ett eget auth.getUser() först
 *   - useCvQuota: auth.getUser(), profiles, cv_texts, tre seriella steg
 *   - useCollapsedSections: auth.getUser(), sedan user_ui_preferences
 *   - PendingInterestAlert och MessagesShortcut: samma
 *     /api/candidate/interests, hämtad två gånger, var gång med eget getUser
 *   - ProfileStrengthCard: /api/candidate/views med eget getUser
 * Mätningen landade på 24 rundturer och 5056 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses sessionen en gång och allt hämtas i en parallell omgång här.
 *
 * Affärsreglerna är oförändrade och ligger kvar där de låg. Projektreglerna
 * för sidan gäller fortfarande och bryts inte här: profilen är anonym tills
 * kandidaten själv väljer annat (visibility styrs bara av kandidatens egna
 * sparningar), styrkor lämnar servern som etiketter och aldrig som råpoäng
 * (samma STRENGTH_MAP-härledning som API-routen, numera delad i
 * src/lib/candidate/getCandidateSummary.ts), och lönespannet går bara till
 * kandidatens egen vy, aldrig utåt.
 */
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getProfileViewStats } from '@/lib/recruiter/profileViews';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
// Kandidatunderlaget är delat med GET /api/candidate/summary. Routen behövs
// fortfarande när kandidaten byter CV och sidan hämtar om utan omladdning,
// men uträkningen finns bara på ett ställe.
import { getCandidateSummary } from '@/lib/candidate/getCandidateSummary';
import {
  EMPTY_PROFILE,
  type CandidateProfileState,
  type CvOption,
  type SummaryData,
} from './components/types';

/** Räknarna bakom larmet och meddelandegenvägen högst upp på sidan. */
export interface InterestCounts {
  /** Obesvarade intressen. */
  pending: number;
  /** Olästa meddelanden över accepterade trådar. */
  unread: number;
  /** Antal intressen totalt, styr om genvägen visas alls. */
  total: number;
}

export interface ViewStats {
  lastWeek: number;
  total: number;
}

export interface BliUpptacktData {
  fullName: string | null;
  profile: CandidateProfileState;
  cvs: CvOption[];
  summary: SummaryData | null;
  interests: InterestCounts;
  /** Profilvisningar, bara när profilen är synlig. Annars null. */
  views: ViewStats | null;
  /** Hopfällda sektioner ur user_ui_preferences, null när raden saknas. */
  collapsedSections: string[] | null;
}

const PREF_KEY = 'bli_upptackt_collapsed';

/* -------------------------------------------------------------------------- */
/* Intresseräknarna: bara siffror, aldrig rekryterarens identitet.            */
/* -------------------------------------------------------------------------- */

async function getInterestCounts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<InterestCounts> {
  const empty: InterestCounts = { pending: 0, unread: 0, total: 0 };

  // Egna rader via RLS. Larmet och genvägen behöver antal, inte innehåll, så
  // vi läser bara id och status i stället för hela intresseraden med meddelande.
  const { data, error } = await supabase
    .from('candidate_interests')
    .select('id, status')
    .eq('candidate_user_id', userId);

  if (error) {
    console.error('Bli upptäckt: kunde inte läsa intressen', error);
    return empty;
  }

  const rows = (data ?? []) as Array<{ id: string; status: string }>;
  if (rows.length === 0) return empty;

  const acceptedIds = rows.filter((r) => r.status === 'accepted').map((r) => r.id);

  let unread = 0;
  if (acceptedIds.length > 0) {
    try {
      const { unreadByInterest } = await import('@/lib/interests/threadUnread');
      const stats = await unreadByInterest(
        getSupabaseAdmin(),
        acceptedIds,
        userId,
        'candidate'
      );
      for (const value of stats.values()) unread += value.unread;
    } catch (error) {
      console.error('Bli upptäckt: kunde inte räkna olästa', error);
    }
  }

  return {
    pending: rows.filter((r) => r.status === 'pending').length,
    unread,
    total: rows.length,
  };
}

/* -------------------------------------------------------------------------- */

/**
 * Allt sidan behöver, i en parallell omgång.
 *
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId.
 */
export async function getBliUpptacktData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<BliUpptacktData> {
  // Första omgången: allt som inte beror på något annat.
  const [profileRes, candidateRes, cvRes, prefRes, interests] = await Promise.all([
    supabase.from('profiles').select('full_name, subscription_tier, premium_until').eq('id', userId).maybeSingle(),
    supabase.from('candidate_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('cv_texts')
      .select('id, file_name, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_ui_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', PREF_KEY)
      .maybeSingle(),
    getInterestCounts(supabase, userId),
  ]);

  const profileRow = profileRes.data as
    | { full_name?: string | null; subscription_tier?: string | null; premium_until?: string | null }
    | null;

  const row = candidateRes.data as Record<string, unknown> | null;
  let profile: CandidateProfileState = EMPTY_PROFILE;
  if (row) {
    profile = {
      cv_id: (row.cv_id as string | null) ?? null,
      visibility: (row.visibility as CandidateProfileState['visibility']) ?? 'off',
      show_personality: Boolean(row.show_personality),
      show_full_workstyle: Boolean(row.show_full_workstyle),
      context_tags: (row.context_tags as string[] | null) ?? [],
      availability: (row.availability as CandidateProfileState['availability']) ?? null,
      workplace: (row.workplace as string[] | null) ?? [],
      extent: (row.extent as string[] | null) ?? [],
      employment_types: (row.employment_types as string[] | null) ?? [],
      regions: (row.regions as string[] | null) ?? [],
      drivers_license: Boolean(row.drivers_license),
      salary_min: (row.salary_min as number | null) ?? null,
      salary_max: (row.salary_max as number | null) ?? null,
      pitch: (row.pitch as string | null) ?? null,
      consent_given_at: (row.consent_given_at as string | null) ?? null,
    };
  }

  // CV-låsen: samma regel som useCvQuota körde på klienten, bara flyttad hit.
  // Free har två aktiva CV, premium femtio. Ingen kvot ändras av flytten.
  const cvRows = (cvRes.data ?? []) as Array<{
    id: string;
    file_name: string;
    created_at: string | null;
    updated_at: string | null;
  }>;
  const untilOk =
    !profileRow?.premium_until || new Date(profileRow.premium_until).getTime() > Date.now();
  const isPremium = profileRow?.subscription_tier === 'premium' && untilOk;
  const activeIds = getActiveCvIds(
    cvRows.map((cv) => ({ id: cv.id, created_at: cv.created_at ?? '' })),
    isPremium ? 50 : 2
  );
  const cvs: CvOption[] = cvRows.map((cv) => ({
    id: cv.id,
    file_name: cv.file_name,
    created_at: cv.created_at ?? '',
    updated_at: cv.updated_at,
    isLocked: !activeIds.has(cv.id),
  }));

  const prefValue = prefRes.data?.value as { sections?: unknown } | null | undefined;
  const collapsedSections = prefRes.data
    ? Array.isArray(prefValue?.sections)
      ? (prefValue.sections as unknown[]).filter((s): s is string => typeof s === 'string')
      : []
    : null;

  // Andra omgången: underlaget beror på vilket CV profilen pekar ut, och
  // visningarna hämtas bara när profilen faktiskt är synlig. Att visa
  // "0 visningar" för någon som inte slagit på synligheten vore att rapportera
  // utfallet av något hon inte gjort.
  const [summary, views] = await Promise.all([
    getCandidateSummary(supabase, userId, profile.cv_id).catch((error) => {
      console.error('Bli upptäckt: kunde inte hämta kandidatunderlaget', error);
      return null;
    }),
    profile.visibility !== 'off'
      ? getProfileViewStats(supabase, userId).catch((error) => {
          console.error('Bli upptäckt: kunde inte läsa profilvisningar', error);
          return null;
        })
      : Promise.resolve(null),
  ]);

  return {
    fullName: profileRow?.full_name ?? null,
    profile,
    cvs,
    summary,
    interests,
    views: views as ViewStats | null,
    collapsedSections,
  };
}
