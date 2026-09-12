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
    // Premiumgraden påverkar bara presentationen, inte vilka rader vi läser,
    // så profilen hämtas i samma omgång som statistiken i stället för före.
    const [profileRes, hubData] = await Promise.all([
      supabase
        .from('profiles')
        .select('subscription_tier, premium_until')
        .eq('id', user.id)
        .maybeSingle(),
      getTesterHubData(supabase, user.id, false),
    ]);

    // Samma validering som useProfile: 'premium' i tabellen räknas som
    // premium, premium_until läses bara som säkerhetsnät mot en utgången rad.
    const row = profileRes.data as
      | { subscription_tier?: string | null; premium_until?: string | null }
      | null;
    const untilOk = !row?.premium_until || new Date(row.premium_until).getTime() > Date.now();

    data = { ...hubData, isPremium: row?.subscription_tier === 'premium' && untilOk };
  } catch (error) {
    // Går läsningen fel ska hubben ändå gå att öppna och starta test ifrån.
    // Korten visar då noll försök, precis som för en ny användare.
    console.error('Testhubben: kunde inte hämta statistiken', error);
    data = emptyHubData(false);
  }

  return <TesterHubClient data={data} />;
}
