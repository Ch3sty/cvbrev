/**
 * Ditt CV (CV-rummet omgång 1, byggspecen avsnitt 4) är en server component.
 *
 * Allt läses här i en parallell omgång: CV-listan, behörigheten, profilens
 * analyskvot och foto, poängen per CV, senaste analysen och senaste
 * nedladdningen. Det CV som visas är ?cv=<id> om det finns och inte är låst,
 * annars det senaste aktiva. Är senaste analysen inte av det CV:t läses dess
 * egen analys i en andra fråga (bara då).
 *
 * Kvoten är oförändrad: gränsen på två CV för gratis (getActiveCvIds), en
 * analys per konto (profilens räknare, som /api/cv/analyze) och spärrarna
 * ligger kvar på servern. Inget skrivs här.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import { getUserScope, CV_GRANS_BETALT, CV_GRANS_GRATIS } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature, type Scope } from '@/lib/access/features';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { losMallId } from '@/lib/cv/mallval/katalog';
import { CV_ANALYSIS_LIMIT } from '@/lib/quota/quotaService';
import type { AnalysUnderlag } from '@/lib/rum/cvRum';
import DittCvClient, { type DittCvData, type InitialCv } from './DittCvClient';

/** Gratisnivåns analyskvot, samma tal som /api/cv/analyze spärrar på. */
const GRATIS_ANALYSER = CV_ANALYSIS_LIMIT;

const ANALYS_FALT =
  'id, cv_id, completed_at, display_name, poang:result->atsFriendliness->score, profil:result->profileSummary, roller:result->roleBasedImprovements, kompetenser:result->skillSuggestions, allmant:result->generalImprovements';

function underlagUr(rad: Record<string, unknown>, namn: string | null): AnalysUnderlag {
  return {
    jobbId: (rad.id as string) ?? null,
    cvId: (rad.cv_id as string) ?? null,
    klar: (rad.completed_at as string) ?? null,
    namn: (rad.display_name as string) || namn,
    poang: rad.poang === null || rad.poang === undefined ? null : Number(rad.poang),
    profil: (rad.profil as AnalysUnderlag['profil']) ?? null,
    roller: Array.isArray(rad.roller) ? (rad.roller as AnalysUnderlag['roller']) : null,
    kompetenser: Array.isArray(rad.kompetenser) ? (rad.kompetenser as AnalysUnderlag['kompetenser']) : null,
    allmant: Array.isArray(rad.allmant) ? (rad.allmant as AnalysUnderlag['allmant']) : null,
  };
}

type Sok = { cv?: string | string[]; reason?: string | string[] };

export default async function DittCvPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const sok = await searchParams;
  const cvParam = typeof sok.cv === 'string' && /^[0-9a-f-]{36}$/i.test(sok.cv) ? sok.cv : null;

  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');

  let cvRows: InitialCv[] = [];
  let scope: Scope | null = null;
  let analysKvar: number | null = GRATIS_ANALYSER;
  let track: Scope | null = null;
  let fotoUrl: string | null = null;
  let poangPerCv: Record<string, number> = {};
  let jobbPerCv: Record<string, string> = {};
  let senaste: Record<string, unknown> | null = null;
  let nedladdning = null as { downloaded_at?: string | null; template_id?: string | null } | null;

  try {
    const [cvRes, scopeRes, profilRes, poangRes, senasteRes, nedladdRes, kvotRes] = await Promise.all([
      supabase.from('cv_texts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      // Behörigheten via premiumAccess: engångsköp i premium_grants och admin räknas.
      getUserScope(supabase, user.id),
      supabase
        .from('profiles')
        .select('onboarding_track, profile_photo_url')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('cv_analysis_jobs')
        .select('id, cv_id, completed_at, poang:result->atsFriendliness->score')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(100),
      supabase
        .from('cv_analysis_jobs')
        .select(ANALYS_FALT)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('formatted_cv_downloads')
        .select('downloaded_at, template_id')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Analyskvoten räknas som /api/cv/analyze räknar den (checkCvAnalysisQuota).
      supabase
        .from('cv_analysis_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('usage_counted', true),
    ]);
    if (cvRes.error) console.error('Fel vid server-hämtning av CV-listan:', cvRes.error);
    cvRows = (cvRes.data ?? []) as InitialCv[];
    scope = scopeRes;
    const profil = profilRes.data as { onboarding_track?: string | null; profile_photo_url?: string | null } | null;
    const t = profil?.onboarding_track;
    track = t === 'cv' || t === 'tester' || t === 'allt' ? t : null;
    fotoUrl = profil?.profile_photo_url ?? null;
    analysKvar = scopeHasFeature(scope, 'cv_analysis_full') ? null : Math.max(0, GRATIS_ANALYSER - (kvotRes.count ?? 0));

    // Poängen och analysen per CV: den senaste av varje (listan är sorterad).
    for (const rad of (poangRes.data ?? []) as Array<{ id: string; cv_id: string | null; poang: unknown }>) {
      if (!rad.cv_id || rad.cv_id in jobbPerCv) continue;
      jobbPerCv[rad.cv_id] = rad.id;
      const p = Number(rad.poang);
      if (Number.isFinite(p)) poangPerCv[rad.cv_id] = Math.max(0, Math.min(100, Math.round(p)));
    }
    senaste = (senasteRes.data as Record<string, unknown> | null) ?? null;
    nedladdning = (nedladdRes.data as typeof nedladdning) ?? null;
  } catch (error) {
    // Går hämtningen fel ska sidan ändå gå att öppna.
    console.error('Fel vid server-hämtning av Ditt CV:', error);
    poangPerCv = {};
    jobbPerCv = {};
  }

  const harBetalt = Boolean(scope);
  const maxCvs = harBetalt ? CV_GRANS_BETALT : CV_GRANS_GRATIS;
  const aktiva = getActiveCvIds(cvRows, maxCvs);
  const lastaIds = cvRows.filter((cv) => !aktiva.has(cv.id)).map((cv) => cv.id);

  // CV:t som visas: ?cv= om det finns och inte är låst, annars senaste aktiva.
  const aktivt =
    (cvParam ? cvRows.find((c) => c.id === cvParam && aktiva.has(c.id)) : null) ?? cvRows.find((c) => aktiva.has(c.id)) ?? null;

  // Analysen av det CV:t. Det förbättrade CV:t (sparat av analysen som
  // "-improved") räknas med originalets analys.
  let underlag: AnalysUnderlag | null = null;
  let atgardadAt: string | null = null;
  if (aktivt) {
    const original = aktivt.original_file_path?.endsWith('-improved')
      ? cvRows.find((c) => c.original_file_path === aktivt.original_file_path.replace(/-improved$/, '')) ?? null
      : null;
    const analyseratId = jobbPerCv[aktivt.id] ? aktivt.id : original && jobbPerCv[original.id] ? original.id : null;
    atgardadAt = original
      ? aktivt.created_at
      : cvRows.find((c) => c.original_file_path === `${aktivt.original_file_path}-improved`)?.created_at ?? null;
    if (analyseratId) {
      const jobbId = jobbPerCv[analyseratId];
      let rad = senaste && senaste.id === jobbId ? senaste : null;
      if (!rad) {
        const { data } = await supabase.from('cv_analysis_jobs').select(ANALYS_FALT).eq('id', jobbId).eq('user_id', user.id).maybeSingle();
        rad = (data as Record<string, unknown> | null) ?? null;
      }
      if (rad) underlag = underlagUr(rad, aktivt.file_name);
    }
  }

  const bygge = (aktivt?.structured_data as { bygge?: { mall?: string } } | null)?.bygge;
  // Mallen: senast nedladdade, annars mallen sparad på CV:t, annars katalogens första.
  const mallId = losMallId(nedladdning?.template_id ?? null) ?? losMallId(bygge?.mall ?? null) ?? null;

  const data: DittCvData = {
    cvs: cvRows,
    lastaIds,
    aktivtId: aktivt?.id ?? null,
    underlag,
    atgardadAt,
    poangPerCv,
    nedladdatAt: nedladdning?.downloaded_at ?? null,
    mallId,
    harBetalt,
    analysFull: scopeHasFeature(scope, 'cv_analysis_full'),
    analysKvar,
    maxCvs,
    scope,
    track,
    harFoto: Boolean(fotoUrl),
  };

  return <DittCvClient data={data} />;
}
