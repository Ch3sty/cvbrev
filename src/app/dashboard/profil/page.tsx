/**
 * Profilsidan är en server component, enligt samma mönster som
 * dashboard/tester och dashboard/sokta-tjanster.
 *
 * Förut var hela sidan 'use client' och visade ett helsidesskelett tills
 * useProfile hunnit läsa summaryn genom en effekt. Ovanpå det hämtade
 * sektionerna sitt eget efter hydrering: två mailinställningar, var och en med
 * ett auth.getUser() före sin kolumnfråga, plus getSession och två anrop till
 * i useCandidateInterests. Mätningen landade på 5 rundturer och 1680 ms LCP på
 * Pixel 7 över LTE.
 *
 * Nu läses sessionen här och det enda som saknas hämtas på servern.
 * Profilraden kostar ingenting extra: dashboard-layouten har redan hämtat den
 * och skickar den vidare genom DashboardDataProvider, och de två
 * mailinställningarna är kolumner på samma rad. Kvar blir en fråga, den om
 * kandidatprofilens synlighet.
 *
 * PII-maskeringen är orörd. Inga personuppgifter går någonstans annat än till
 * användarens egen vy, och ingen text härifrån når någon AI. Sparvägen är
 * också oförändrad: autospara per fält genom updateProfile, och de två
 * mailväxlarna postar till sina egna routes.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getProfilData, EMPTY_PROFIL_DATA } from './getProfilData';
import ProfilClient from './ProfilClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  // Går läsningen fel ska profilen ändå gå att öppna och redigera. Raden om
  // Bli upptäckt visar då "inte sökbar", vilket är läget för alla som inte
  // slagit på synligheten.
  const pageData = await getProfilData(supabase, user.id).catch((error) => {
    console.error('Profilsidan: kunde inte hämta sidans data', error);
    return EMPTY_PROFIL_DATA;
  });

  return <ProfilClient pageData={pageData} />;
}
