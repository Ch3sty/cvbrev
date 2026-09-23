/**
 * Ansökningar: en server component enligt samma mönster som dashboard-layouten.
 *
 * Förut var hela sidan 'use client'. Den monterade, körde useApplications som
 * fetchade /api/applications, som i sin tur gjorde auth.getUser() innan den
 * ens fick fråga efter raderna. Ovanpå det låg BackfillBanner-sonden mot
 * /api/applications/backfill med sin egen auth.getUser() och två queries.
 * Före första riktiga innehållet blev det nio rundturer och 2,24 sekunder på
 * Pixel 7 över LTE, varav det mesta seriellt: HTML, hydrering, fetch, auth,
 * query.
 *
 * Nu läses sessionen och ansökningslistan här på servern, i samma omgång som
 * backfill-kandidaterna, och skickas ner som props. Första HTML innehåller
 * hela listan. Klienten behöver inte fetcha någonting för att måla sidan.
 *
 * Aggregaten (väntar svar, intervju, svar) räknas fram ur samma lista på
 * klienten, precis som förut. Att i stället läsa summary.applications hade
 * blivit fel: summaryn räknar över alla ansökningar medan statusraden ska
 * spegla listan sidan faktiskt visar, och listan behövs ändå i sin helhet för
 * grupperna, statistiken och rapporten.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { JobApplication } from '@/lib/applications/status';
import SoktaTjansterClient, {
  type BackfillCandidate,
} from './SoktaTjansterClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

export default async function SoktaTjansterPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  // Två parallella frågor, inte tre seriella HTTP-anrop. Backfill-kandidaterna
  // kräver både breven och de redan kopplade ansökningarna, men vi har redan
  // hela ansökningslistan nedan och kan filtrera på den i stället för att
  // fråga en gång till.
  const [applicationsRes, lettersRes] = await Promise.all([
    supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('letters')
      .select('id, title, company, job_title, created_at')
      .eq('user_id', user.id)
      .eq('is_saved', true)
      .order('created_at', { ascending: false }),
  ]);

  if (applicationsRes.error) {
    console.error('Fel vid server-hämtning av ansökningar:', applicationsRes.error);
  }
  if (lettersRes.error) {
    console.error('Fel vid server-hämtning av brev för backfill:', lettersRes.error);
  }

  const initialApplications = (applicationsRes.data ?? []) as JobApplication[];

  // Samma filtrering som GET /api/applications/backfill: sparade brev som
  // ännu inte är kopplade till en ansökan.
  const linkedLetterIds = new Set(
    initialApplications.map((application) => application.letter_id).filter(Boolean)
  );
  const initialBackfillCandidates = ((lettersRes.data ?? []) as BackfillCandidate[]).filter(
    (letter) => !linkedLetterIds.has(letter.id)
  );

  return (
    <SoktaTjansterClient
      initialApplications={initialApplications}
      initialBackfillCandidates={initialBackfillCandidates}
    />
  );
}
