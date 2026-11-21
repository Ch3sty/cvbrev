/**
 * Analys (CV-rummet steg 4, byggspecen avsnitt 8, skissen Analys) är en
 * server component. Allt läses här i en parallell omgång vid request-tid.
 *
 * Lägen för CV:t som visas (?cv=, samma regel som Ditt CV, aldrig ett låst):
 *   resultat        en analys finns: väggen med de två talen, arket med
 *                   markeringarna, fynden och "Så räknas poängen"
 *   utan-struktur   en analys finns men CV:t går inte att läsa i avsnitt
 *   intro           ingen analys än: dagens texter och kvotrad, knappen
 *                   startar dagens flöde med CV:t redan valt
 *   sparr           gratisanalysen är använd och CV:t saknar analys: dagens
 *                   spärr för omkörning
 *
 * ?job=<id> öppnar den sparade analysen i dagens steg (välj förbättringar,
 * granska, spara), med &steg=4|5 och &valj=<fynd> från sidans knappar.
 * Inget AI-anrop, ingen kvot, ingen ny rad.
 *
 * KVOTEN ÄR ORÖRD. Spärren ligger i POST /api/cv/analyze (checkCvAnalysisQuota).
 * Sidan räknar kvarvarande analyser med samma funktion, så Ditt CV och
 * Analys alltid säger samma sak. Poäng och plus räknas med poängmodellen
 * (src/lib/cv/poang). Gratisnivån filtreras på servern (analysForKlient).
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getCvAnalysData, emptyCvAnalysData, lockedCvIds } from './getCvAnalysData';
import CvFlikRemsa from '@/components/cv/rum3/CvFlikRemsa';
import { CV_GRANS_GRATIS, userHasAccess, getUserScope } from '@/lib/supabase/premiumAccess';
import { cvListaUr, valtCvId } from '@/components/cv/rum3/cvLista';
import CvRad from '@/components/cv/rum3/CvRad';
import CvAnalysClient from './CvAnalysClient';
import AnalysVy, { type AnalysSidaData } from './AnalysVy';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import type { AterupptagenAnalys, Oppna } from './aterupptagning';
import { analysForKlient, poangForRad, PROFIL_KONTAKT_FALT, type CvRad as CvRadData, type KontaktKalla } from '@/lib/cv/poang';
import { analysIdFor, analysPerCv, type AnalysRad } from '@/lib/cv/analys/cvAnalys';
import { byggAnalysVy } from './analysData';
import { losMallId } from '@/lib/cv/mallval/katalog';
import type { Scope } from '@/lib/access/features';

type Sok = Record<string, string | string[] | undefined>;

const UUID = /^[0-9a-f-]{36}$/i;

/** ?steg= och ?valj= från sidans knappar. */
function oppnaUr(sok: Sok): Oppna | undefined {
  const steg = sok.steg === '4' ? 4 : sok.steg === '5' ? 5 : null;
  const v = typeof sok.valj === 'string' ? sok.valj : null;
  const valj = v && /^(profil|kompetenser|forvalda|roll-\d{1,2})$/.test(v) ? v : null;
  return steg || valj ? { steg, valj } : undefined;
}

export default async function CVAnalysisPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');

  const sok = await searchParams;
  const jobbParam = typeof sok.job === 'string' && UUID.test(sok.job) ? sok.job : null;
  const cvParam = typeof sok.cv === 'string' && UUID.test(sok.cv) ? sok.cv : null;

  let data: Awaited<ReturnType<typeof getCvAnalysData>> | null = null;
  let rader: AnalysRad[] = [];
  let harFull = false;
  let scope: Scope | null = null;
  let track: Scope | null = null;
  let nedladdadMall: string | null = null;
  let kontakt: KontaktKalla | null = null;
  try {
    const [d, analysRes, full, sc, profilRes, nedRes] = await Promise.all([
      getCvAnalysData(supabase, user.id),
      supabase
        .from('cv_analysis_jobs')
        .select('id, cv_id, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(100),
      userHasAccess(supabase, user.id, 'cv_analysis_full').catch(() => false),
      getUserScope(supabase, user.id).catch(() => null),
      supabase.from('profiles').select(`onboarding_track, ${PROFIL_KONTAKT_FALT}`).eq('id', user.id).maybeSingle(),
      supabase
        .from('formatted_cv_downloads')
        .select('template_id')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    data = d;
    rader = (analysRes.data ?? []) as AnalysRad[];
    harFull = full;
    scope = sc;
    const t = (profilRes.data as { onboarding_track?: string | null } | null)?.onboarding_track;
    track = t === 'cv' || t === 'tester' || t === 'allt' ? t : null;
    nedladdadMall = (nedRes.data as { template_id?: string | null } | null)?.template_id ?? null;
    // Kontaktuppgifterna som arket visar dem (poängmodellen version 2).
    kontakt = { profil: (profilRes.data as KontaktKalla['profil']) ?? null, anvandare: user };
  } catch (error) {
    console.error('CV-analys: kunde inte hämta sidans data', error);
  }

  // Hård grind: utan CV finns ingenting att analysera (som förut).
  if (data && data.cvCount === 0) redirect('/dashboard/profil/cv?reason=cv-required');

  const sidansData = data ?? emptyCvAnalysData(user.id);
  const lasta = lockedCvIds(sidansData.cvs, sidansData.isPremium);
  const jobbPerCv = analysPerCv(rader);
  const fullt = !sidansData.isPremium && sidansData.cvs.length - lasta.size >= CV_GRANS_GRATIS;

  // Den sparade analysen, om adressen pekar på en: dagens steg.
  let aterupptagen: AterupptagenAnalys | null = null;
  let valt = valtCvId(sidansData.cvs, lasta, cvParam);
  if (jobbParam) {
    const { data: rad, error } = await supabase
      .from('cv_analysis_jobs')
      .select('id, cv_id, display_name, status, result')
      .eq('id', jobbParam)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) console.error('CV-analys: kunde inte läsa den sparade analysen', error);
    if (rad && rad.status === 'completed' && rad.result && typeof rad.result === 'object') {
      // CV:t analysen gäller: det som visas (?cv=) om analysen hör till det,
      // till exempel ett förbättrat CV med originalets analys, annars
      // analysens eget. Poängen räknas på det CV:t, gratisnivån filtreras.
      const viktat = cvParam ? sidansData.cvs.find((c) => c.id === cvParam && !lasta.has(c.id)) : null;
      const cvRad =
        viktat && analysIdFor(viktat, sidansData.cvs, jobbPerCv) === rad.id
          ? viktat
          : sidansData.cvs.find((cv) => cv.id === rad.cv_id) ?? null;
      aterupptagen = {
        id: rad.id as string,
        cvId: cvRad?.id ?? (rad.cv_id as string | null) ?? null,
        displayName: (rad.display_name as string | null) ?? null,
        result: analysForKlient(rad.result as Record<string, unknown>, cvRad ? { ...cvRad, kontakt } : { kontakt }, harFull),
        oppna: oppnaUr(sok),
      };
      if (aterupptagen.cvId && sidansData.cvs.some((c) => c.id === aterupptagen!.cvId)) valt = aterupptagen.cvId;
    }
  }

  const poangPerCv: Record<string, number> = {};
  for (const cv of sidansData.cvs) {
    if (!jobbPerCv[cv.id]) continue;
    const p = poangForRad({ ...(cv as CvRadData), kontakt });
    if (p !== null) poangPerCv[cv.id] = p;
  }
  // Nyckeln: elementet skapas här på servern och ritas som syskon i väggens
  // topprad (CvVagg, CvFlikRemsa); utan nyckel varnar React för listnycklar.
  const cvRadEl = <CvRad key="cv-rad" cvs={cvListaUr(sidansData.cvs, lasta, poangPerCv)} aktivtId={valt} sida="analys" fullt={fullt} />;

  if (aterupptagen) {
    return (
      <>
        <CvFlikRemsa aktiv="analys" cvId={valt} cvRad={cvRadEl} />
        <CvAnalysClient data={sidansData} aterupptagen={aterupptagen} />
      </>
    );
  }

  // Läget för CV:t som visas.
  const aktivt = sidansData.cvs.find((c) => c.id === valt) ?? null;
  const jobbId = aktivt ? analysIdFor(aktivt, sidansData.cvs, jobbPerCv) : null;
  let sida: AnalysSidaData['lage'] = 'intro';
  let vy: AnalysSidaData['vy'] = null;
  if (aktivt && jobbId) {
    const { data: rad } = await supabase
      .from('cv_analysis_jobs')
      .select('id, completed_at, result')
      .eq('id', jobbId)
      .eq('user_id', user.id)
      .maybeSingle();
    const r = rad as { id: string; completed_at: string | null; result: unknown } | null;
    if (r && r.result && typeof r.result === 'object') {
      vy = byggAnalysVy({ id: r.id, completed_at: r.completed_at, result: r.result as Record<string, unknown> }, { ...aktivt, kontakt }, harFull);
      sida = vy ? 'resultat' : 'utan-struktur';
    }
  }
  if (sida === 'intro' && !sidansData.isPremium && sidansData.remainingAnalyses !== null && sidansData.remainingAnalyses <= 0) {
    sida = 'sparr';
  }

  const bygge = (aktivt?.structured_data as { bygge?: { mall?: string } } | null)?.bygge;
  const sidaData: AnalysSidaData = {
    lage: sida,
    vy,
    cvId: aktivt?.id ?? null,
    cvNamn: aktivt?.file_name ?? null,
    egetCv: aktivt
      ? {
          cvId: aktivt.id,
          structuredData: aktivt.structured_data,
          cvText: aktivt.cv_text,
          val: { rubriker: { ...((aktivt as { section_titles?: Record<string, string> | null }).section_titles ?? {}) } },
        }
      : null,
    mallId: losMallId(nedladdadMall) ?? losMallId(bygge?.mall ?? null) ?? null,
    remainingAnalyses: sidansData.remainingAnalyses,
    isPremium: sidansData.isPremium,
    scope,
    track,
  };

  // Nyckeln byts när en ny analys landar (eller CV:t byts): vyn monteras om
  // i läget resultat i stället för att stå kvar i flödet.
  return (
    <AnalysVy key={`${aktivt?.id ?? 'inget'}:${vy?.jobbId ?? sida}`} data={sidaData} cvRad={cvRadEl}>
      <CvAnalysClient data={sidansData} startCvId={aktivt?.id ?? null} />
    </AnalysVy>
  );
}
