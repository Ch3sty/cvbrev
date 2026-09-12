/**
 * Din arbetsstil är en server component, enligt samma mönster som
 * dashboard/tester och dashboard/bli-upptackt.
 *
 * Förut var hela sidan 'use client' och visade ett skelett tills ett fetch mot
 * /api/candidate/summary svarat. Den routen gjorde ett eget auth.getUser() och
 * byggde sedan hela kandidatunderlaget: testsessioner, personlighetsprofil,
 * CV-extraktion, structured_data och två admin-räkningar per testfamilj för
 * percentilerna. Sidan läste en enda gren av det svaret. Mätningen landade på
 * 15 rundturer och 3268 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses sessionen här och bara det sidan faktiskt visar hämtas, nämligen
 * personlighetsprofilen. En fråga i stället för tolv, och första HTML
 * innehåller den färdiga rapporten.
 *
 * Reglerna för sidan ligger fast: energibudgeten och intervjuträningen är
 * privata och delas aldrig, rapporten är alltid i ord och aldrig i siffror,
 * och vad rekryterare får se styrs fortfarande bara från Bli upptäckt.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getArbetsstilData, EMPTY_ARBETSSTIL } from './getArbetsstilData';
import ArbetsstilClient from './ArbetsstilClient';

export default async function ArbetsstilPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Går läsningen fel ska sidan ändå gå att öppna. Den visar då samma vy som
  // för den som ännu inte gjort personlighetstestet, alltså uppmaningen att
  // börja med det.
  const data = await getArbetsstilData(supabase, user.id).catch((error) => {
    console.error('Arbetsstil: kunde inte hämta rapporten', error);
    return EMPTY_ARBETSSTIL;
  });

  return <ArbetsstilClient data={data} />;
}
