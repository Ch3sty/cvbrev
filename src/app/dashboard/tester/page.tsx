/**
 * Testhubben är en server component, enligt samma mönster som
 * dashboard/sokta-tjanster och dashboard/skapa-brev.
 *
 * Förut var hela sidan 'use client' och gjorde hela sitt arbete efter
 * hydrering. useAllTestStats fetchade nio session-endpoints, ett per kognitivt
 * test. Varje ProvCard fetchade sin egen, tre till. usePersonalityTestStats en
 * till. Och varje sådan route gjorde ett auth.getUser() innan den ens fick
 * fråga efter raderna. Tretton anrop, tjugosex rundturer, allt seriellt efter
 * att JS laddat. Mätningen landade på 28 rundturer och 5424 ms LCP.
 *
 * Nu läses sessionen här och all statistik hämtas i en parallell omgång med
 * två frågor (de tolv kognitiva anropen läser samma tabell och skiljer sig
 * bara på test_type). Första HTML innehåller korten färdiga.
 *
 * Premiumgraden läses bara för att avgöra om gratisraden ska visas och vilka
 * kort som markeras låsta. Kvoter och betalväggar ligger kvar där de låg: i
 * quotaService och serverside bakom att starta ett test.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getTesterHubData, emptyHubData, type TesterHubData } from './getHubData';
import TesterHubClient from './TesterHubClient';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature } from '@/lib/access/features';

export default async function TesterHubPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let data: TesterHubData;

  try {
    // Scopet påverkar bara presentationen, inte vilka rader vi läser, så det
    // hämtas i samma omgång som statistiken i stället för före. Historiken
    // trimmas dock i hämtningen, alltså läses scopet först och skickas in.
    //
    // Efter paketomgången är frågan inte längre "är hon premium" utan vilket
    // spår hon köpt: en CV-veckan-kund har inte testhistoriken, och en
    // Testveckan-kund har den (docs/plan-paket-och-onboarding.md, avsnitt 4
    // och 5).
    const scope = await getUserScope(supabase, user.id);
    const hasHistory = scopeHasFeature(scope, 'test_history');

    data = await getTesterHubData(supabase, user.id, scope !== null, hasHistory, scope);
  } catch (error) {
    // Går läsningen fel ska hubben ändå gå att öppna och starta test ifrån.
    // Korten visar då noll försök, precis som för en ny användare.
    console.error('Testhubben: kunde inte hämta statistiken', error);
    data = emptyHubData(false, false);
  }

  return <TesterHubClient data={data} />;
}
