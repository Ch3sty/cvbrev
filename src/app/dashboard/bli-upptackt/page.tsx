/**
 * Bli upptäckt är en server component, enligt samma mönster som
 * dashboard/sokta-tjanster och dashboard/skapa-brev.
 *
 * Förut var hela sidan 'use client'. Efter hydrering gjorde den ett
 * auth.getUser(), sedan tre frågor, sedan ett fetch mot
 * /api/candidate/summary som gjorde ett eget auth.getUser() först. Parallellt
 * körde useCvQuota tre seriella steg, useCollapsedSections två,
 * PendingInterestAlert och MessagesShortcut hämtade samma
 * /api/candidate/interests var för sig och ProfileStrengthCard ett
 * /api/candidate/views. Mätningen landade på 24 rundturer och 5056 ms LCP på
 * Pixel 7 över LTE.
 *
 * Nu läses sessionen här och allt hämtas i en parallell omgång på servern.
 * Första HTML innehåller den färdiga sidan.
 *
 * Projektets regler för sidan ligger fast och ändras inte av flytten:
 * profilen är anonym tills kandidaten själv väljer annat, styrkor visas som
 * etiketter och aldrig som råpoäng, och lönespannet stannar i kandidatens
 * egen vy. Kvoterna för CV är oförändrade, låsmarkeringen räknas med samma
 * getActiveCvIds som useCvQuota använde.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getBliUpptacktData } from './getPageData';
import BliUpptacktClient from './BliUpptacktClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

export default async function BliUpptacktPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  const data = await getBliUpptacktData(supabase, user.id);

  return <BliUpptacktClient initialData={data} userId={user.id} />;
}
