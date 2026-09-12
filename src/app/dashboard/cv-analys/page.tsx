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
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getCvAnalysData, emptyCvAnalysData } from './getCvAnalysData';
import CvAnalysClient from './CvAnalysClient';

export default async function CVAnalysisPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return <CvAnalysClient data={data ?? emptyCvAnalysData(user.id)} />;
}
