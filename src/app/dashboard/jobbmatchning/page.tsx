/**
 * Jobbmatchning är en server component, enligt samma mönster som
 * dashboard/tester och dashboard/sokta-tjanster.
 *
 * Förut var hela sidan 'use client' och visade en spinner tills tre kedjor
 * gått i mål efter hydrering: useCvQuota (auth.getUser över nätet, sedan
 * profiles, sedan cv_texts), fetchCVs (getSession, sedan cv_texts en gång
 * till) och fetchActiveCV (getSession, sedan active_cv_for_matching).
 * Mätningen landade på 8 rundturer och 2024 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses sessionen här och allt hämtas i en parallell omgång. Första HTML
 * innehåller CV-korten färdiga.
 *
 * Matchningen är oförändrad. Jobben hämtas fortfarande av edge-funktionen
 * match-jobs när användaren söker, och vad gratisnivån får se avgörs
 * fortfarande av POST /api/jobs/redact på servern. Sidan hämtar inga jobb.
 *
 * Grinden är också oförändrad och medvetet mjuk: utan CV visas
 * JobMatchingOnboarding i stället för en omdirigering, så användaren förstår
 * vad funktionen är innan vi skickar henne till CV-uppladdningen.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import {
  getJobbmatchningData,
  EMPTY_JOBBMATCHNING_DATA,
} from './getJobbmatchningData';
import JobbmatchningClient from './JobbmatchningClient';

export default async function JobbmatchningPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Går läsningen fel ska sidan ändå gå att öppna. Den visar då samma vy som
  // för den som inte laddat upp något CV, alltså introduktionen.
  const data = await getJobbmatchningData(supabase, user.id).catch((error) => {
    console.error('Jobbmatchning: kunde inte hämta sidans data', error);
    return EMPTY_JOBBMATCHNING_DATA;
  });

  return <JobbmatchningClient initialData={data} />;
}
