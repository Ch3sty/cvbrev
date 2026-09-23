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
import MinaCvClient, { type InitialCv } from './MinaCvClient';
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

  try {
    const [cvRes, profileRes] = await Promise.all([
      supabase
        .from('cv_texts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    if (cvRes.error) {
      console.error('Fel vid server-hämtning av CV-listan:', cvRes.error);
    }

    cvRows = (cvRes.data ?? []) as InitialCv[];
    const profile = profileRes.data as { subscription_tier?: string | null } | null;
    // Identisk regel som useCvQuota: 'premium' i tabellen räknas som premium.
    isPremium = profile?.subscription_tier === 'premium';
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
    />
  );
}
