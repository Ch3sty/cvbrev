/**
 * CV-analysen är en server component, enligt samma mönster som
 * dashboard/tester och dashboard/sokta-tjanster.
 *
 * Förut var hela sidan 'use client' och visade en spinner tills tre kedjor
 * gått i mål efter hydrering: useCvQuota (auth.getUser över nätet, sedan
 * profiles, sedan cv_texts), cv-store fetchCVs (getSession, sedan cv_texts en
 * gång till) och en refreshProfile vid mount som hämtade om hela
 * dashboard-summaryn. CVSelectionStep körde dessutom ett eget useCvQuota när
 * wizarden öppnades. Mätningen landade på 8 rundturer och 2588 ms LCP på Pixel
 * 7 över LTE.
 *
 * Nu läses sessionen här och allt hämtas i en parallell omgång vid
 * request-tid. Omhämtningen vid mount behövs inte längre, serverns siffror är
 * färska per definition.
 *
 * KVOTEN ÄR ORÖRD, och det är den viktiga raden i den här filen. Spärren
 * ligger kvar i POST /api/cv/analyze, som svarar 429 med limitReached och
 * exakt återkomsttid oavsett vad klienten tror sig veta. Det vi läser här är
 * samma kolumner som useProfile redan läste, bara tidigare. De tre gratisfynd
 * analysen visar ligger kvar i wizarden och i analyssvaret och rörs inte.
 *
 * Den hårda grinden är också oförändrad: utan CV går det inte att analysera,
 * och användaren skickas till CV-uppladdningen. Skillnaden är att det nu sker
 * innan sidan målats i stället för genom en router.push efter hydrering.
 *
 * Återupptagning (art-director 21.2 fråga 2): ?job=<id> öppnar en sparad
 * analys (cv_analysis_jobs.result) i granskningssteget. Raden läses bara om
 * den är användarens egen och klar; inget AI-anrop, ingen kvot, ingen ny rad.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getCvAnalysData, emptyCvAnalysData } from './getCvAnalysData';
import CvAnalysClient from './CvAnalysClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import type { AterupptagenAnalys } from './aterupptagning';

export default async function CVAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  let data: Awaited<ReturnType<typeof getCvAnalysData>> | null = null;
  try {
    data = await getCvAnalysData(supabase, user.id);
  } catch (error) {
    console.error('CV-analys: kunde inte hämta sidans data', error);
  }

  // Hård grind: utan CV finns ingenting att analysera. Samma destination och
  // samma reason-parameter som router.push gjorde förut. Grinden gäller bara
  // när vi faktiskt läst listan: ett läsfel betyder inte att användaren saknar
  // CV, och ska inte skicka iväg henne till uppladdningen.
  if (data && data.cvCount === 0) {
    redirect('/dashboard/profil/cv?reason=cv-required');
  }

  // Den sparade analysen, om adressen pekar på en. Bara läsning.
  const sok = await searchParams;
  const jobb = typeof sok.job === 'string' && /^[0-9a-f-]{36}$/i.test(sok.job) ? sok.job : null;
  let aterupptagen: AterupptagenAnalys | null = null;
  if (jobb) {
    const { data: rad, error } = await supabase
      .from('cv_analysis_jobs')
      .select('id, cv_id, display_name, status, result')
      .eq('id', jobb)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) console.error('CV-analys: kunde inte läsa den sparade analysen', error);
    if (rad && rad.status === 'completed' && rad.result && typeof rad.result === 'object') {
      aterupptagen = {
        id: rad.id as string,
        cvId: (rad.cv_id as string | null) ?? null,
        displayName: (rad.display_name as string | null) ?? null,
        result: rad.result as Record<string, unknown>,
      };
    }
  }

  return <CvAnalysClient data={data ?? emptyCvAnalysData(user.id)} aterupptagen={aterupptagen} />;
}
