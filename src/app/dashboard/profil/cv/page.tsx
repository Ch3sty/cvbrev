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
import { ANALYS_FALT, analysPerCv, atgardadAtFor, underlagForCv } from '@/lib/cv/analys/cvAnalys';
import { poangForRad, PROFIL_KONTAKT_FALT, type CvRad, type KontaktKalla } from '@/lib/cv/poang';
import DittCvClient, { type DittCvData, type InitialCv } from './DittCvClient';

/** Gratisnivåns analyskvot, samma tal som /api/cv/analyze spärrar på. */
const GRATIS_ANALYSER = CV_ANALYSIS_LIMIT;

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
  let analysRader: Array<{ id: string; cv_id: string | null; completed_at: string | null; forbattrad?: unknown; valda?: unknown }> = [];
  let nedladdning = null as { downloaded_at?: string | null; template_id?: string | null } | null;
  let kontakt: KontaktKalla | null = null;

  try {
    const [cvRes, scopeRes, profilRes, poangRes, senasteRes, nedladdRes, kvotRes] = await Promise.all([
      supabase.from('cv_texts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      // Behörigheten via premiumAccess: engångsköp i premium_grants och admin räknas.
      getUserScope(supabase, user.id),
      supabase
        .from('profiles')
        .select(`onboarding_track, profile_photo_url, ${PROFIL_KONTAKT_FALT}`)
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('cv_analysis_jobs')
        .select('id, cv_id, completed_at, forbattrad:result->forbattradSparad, valda:result->selectedImprovements')
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
    const profil = profilRes.data as ({ onboarding_track?: string | null; profile_photo_url?: string | null } & NonNullable<KontaktKalla['profil']>) | null;
    // Kontaktuppgifterna som arket visar dem (poängmodellen version 2).
    kontakt = { profil, anvandare: user };
    const t = profil?.onboarding_track;
    track = t === 'cv' || t === 'tester' || t === 'allt' ? t : null;
    fotoUrl = profil?.profile_photo_url ?? null;
    analysKvar = scopeHasFeature(scope, 'cv_analysis_full') ? null : Math.max(0, GRATIS_ANALYSER - (kvotRes.count ?? 0));

    // Analysen per CV: den senaste av varje (listan är sorterad), och när ett
    // förbättrat CV sparades. Poängen räknas ur CV-raden med poängmodellen.
    analysRader = (poangRes.data ?? []) as typeof analysRader;
    jobbPerCv = analysPerCv(analysRader);
    for (const cv of cvRows) {
      if (!jobbPerCv[cv.id]) continue;
      const p = poangForRad({ ...(cv as CvRad), kontakt });
      if (p !== null) poangPerCv[cv.id] = p;
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

  // Analysen av det CV:t, poängsatt med poängmodellen på det CV som visas.
  // Det förbättrade CV:t (sparat som nytt, "-improved") räknas med
  // originalets analys; ett CV som ersatts på plats har en egen analysrad.
  let underlag: AnalysUnderlag | null = null;
  let atgardadAt: string | null = null;
  if (aktivt) {
    atgardadAt = atgardadAtFor(aktivt, cvRows, analysRader);
    underlag = await underlagForCv(supabase, user.id, { ...aktivt, kontakt }, cvRows, jobbPerCv, senaste, {
      harFull: scopeHasFeature(scope, 'cv_analysis_full'),
    });
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
