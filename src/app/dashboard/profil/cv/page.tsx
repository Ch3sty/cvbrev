/**
 * Mina CV är en server component.
 *
 * Förut var hela sidan 'use client' och visade ett skelett tills två separata
 * kedjor hade kört efter hydrering: fetchCVs (session, sedan cv_texts) och
 * useCvQuota (auth.getUser över nätet, sedan profiles, sedan cv_texts en gång
 * till). Nio rundturer innan listan fanns, och samma CV-tabell frågades två
 * gånger.
 *
 * Nu läses sessionen, CV-listan och prenumerationsgraden här på servern i en
 * parallell omgång. Låsmarkeringen räknas fram med samma getActiveCvIds som
 * useCvQuota använde, bara flyttad hit. Kvoten i sig är oförändrad: gränsen
 * på två CV för gratis, spärren mot uppladdning och den fria CV-exporten
 * ligger kvar exakt där de låg.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import { getCvGrans } from '@/lib/supabase/premiumAccess';
import MinaCvClient, { type InitialCv, type CvRumData } from './MinaCvClient';
import { poangForRad, analysForKlient, poangMedVal, type CvRad, type PoangSammanfattning } from '@/lib/cv/poang';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

const FREE_MAX_CVS = 2;
const PREMIUM_MAX_CVS = 50;

export default async function MinaCVPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  let cvRows: InitialCv[] = [];
  let isPremium = false;
  // CV-rummet (våg 4, C1): senaste analysen, poängen per CV och senaste
  // nedladdningen, i samma parallella omgång som listan.
  const cvRum: CvRumData = { underlag: null, poangPerCv: {}, nedladdatAt: null };

  try {
    const [cvRes, grans, poangRes, senasteRes, nedladdRes, harFullAnalys] = await Promise.all([
      supabase
        .from('cv_texts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      // Behörigheten via premiumAccess: engångsköp i premium_grants och admin
      // räknas, inte bara profiles.subscription_tier.
      getCvGrans(supabase, user.id),
      supabase
        .from('cv_analysis_jobs')
        .select('cv_id, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(100),
      supabase
        .from('cv_analysis_jobs')
        .select(
          'id, cv_id, completed_at, display_name, struktur:result->structuredCV, profil:result->profileSummary, roller:result->roleBasedImprovements, kompetenser:result->skillSuggestions, allmant:result->generalImprovements'
        )
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('formatted_cv_downloads')
        .select('downloaded_at')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Gratisnivån får samma filtrerade analys som i analysflödet.
      userHasAccess(supabase, user.id, 'cv_analysis_full').catch(() => false),
    ]);

    if (cvRes.error) {
      console.error('Fel vid server-hämtning av CV-listan:', cvRes.error);
    }

    cvRows = (cvRes.data ?? []) as InitialCv[];
    isPremium = grans.harBetalt;

    // Poängen per analyserat CV räknas ur CV-raden med poängmodellen
    // (docs/poangmodell-cv-analys.md), aldrig ur talet analysen sparade.
    const senaste = senasteRes.data as Record<string, unknown> | null;
    const analyserade = new Set(
      ((poangRes.data ?? []) as Array<{ cv_id: string | null }>).map((r) => r.cv_id).filter(Boolean) as string[]
    );
    for (const cv of cvRows) {
      if (!analyserade.has(cv.id)) continue;
      const reserv = senaste && senaste.cv_id === cv.id ? senaste.struktur : undefined;
      const p = poangForRad(cv as CvRad, reserv);
      if (p !== null) cvRum.poangPerCv[cv.id] = p;
    }
    // Bara analyser av ett CV som fortfarande finns räknas.
    if (senaste && cvRows.some((cv) => cv.id === senaste.cv_id)) {
      const cv = cvRows.find((c) => c.id === senaste.cv_id);
      // Förslagens plus räknas med samma funktion som analysflödet.
      const analys = analysForKlient(
        {
          structuredCV: senaste.struktur,
          profileSummary: senaste.profil,
          roleBasedImprovements: senaste.roller,
          skillSuggestions: senaste.kompetenser,
          generalImprovements: senaste.allmant,
        },
        cv as CvRad,
        harFullAnalys
      );
      const sammanfattning = analys.poang as PoangSammanfattning | null;
      const kompetenser = Array.isArray(analys.skillSuggestions) ? analys.skillSuggestions : null;
      // Kompetenserna tillsammans, bara de förvalda (de som inte sänker poängen).
      const forvaldaKompetenser = kompetenser
        ? kompetenser.flatMap((k, i) => ((k as { forvald?: unknown })?.forvald === true ? [i] : []))
        : [];
      const medKompetenser =
        sammanfattning && forvaldaKompetenser.length > 0
          ? poangMedVal(analys, { profil: false, roller: [], kompetenser: forvaldaKompetenser })
          : null;
      cvRum.underlag = {
        jobbId: (senaste.id as string) ?? null,
        cvId: (senaste.cv_id as string) ?? null,
        klar: (senaste.completed_at as string) ?? null,
        namn: (senaste.display_name as string) || cv?.file_name || null,
        poang: sammanfattning ? sammanfattning.idag : null,
        // Bara det CV-rummet visar följer med till klienten: rubrik och plus,
        // aldrig förslagstexterna (de visas i analysflödet).
        profil: analys.profileSummary ? { atsImpact: (analys.profileSummary as { atsImpact?: unknown }).atsImpact } : null,
        roller: Array.isArray(analys.roleBasedImprovements)
          ? (analys.roleBasedImprovements as Array<Record<string, unknown>>).map((r) => ({ roleTitle: r.roleTitle, company: r.company, atsImpact: r.atsImpact }))
          : null,
        kompetenser: kompetenser
          ? (kompetenser as Array<Record<string, unknown>>).map((k) => ({ skill: k.skill, atsImpact: k.atsImpact }))
          : null,
        allmant: Array.isArray(analys.generalImprovements)
          ? (analys.generalImprovements as Array<Record<string, unknown>>).map((g) => ({ title: g.title, description: g.description, atsImpact: g.atsImpact }))
          : null,
        kompetenserPlus: sammanfattning && medKompetenser ? medKompetenser.total - sammanfattning.idag : null,
      };
    }
    cvRum.nedladdatAt = ((nedladdRes.data as { downloaded_at?: string } | null)?.downloaded_at as string) ?? null;
  } catch (error) {
    // Går hämtningen fel ska sidan ändå gå att öppna. Klienten hämtar om.
    console.error('Fel vid server-hämtning av Mina CV:', error);
  }

  // Låsta CV: de som inte ryms bland de senaste. Samma getActiveCvIds som
  // useCvQuota körde på klienten.
  const maxCvs = isPremium ? PREMIUM_MAX_CVS : FREE_MAX_CVS;
  const activeIds = getActiveCvIds(cvRows, maxCvs);
  const initialLockedCvIds = cvRows
    .filter((cv) => !activeIds.has(cv.id))
    .map((cv) => cv.id);

  return (
    <MinaCvClient
      initialCvs={cvRows}
      initialIsPremium={isPremium}
      initialLockedCvIds={initialLockedCvIds}
      cvRum={cvRum}
    />
  );
}
