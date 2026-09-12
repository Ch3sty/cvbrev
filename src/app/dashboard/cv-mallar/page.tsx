/**
 * CV-mallar är en server component.
 *
 * Förut var hela sidan 'use client' och returnerade null tills useProfile
 * hade laddat. Först efter hydrering kördes fetchCVs, som i sin tur läste
 * sessionen och sedan frågade cv_texts. Under tiden visade CompactCvPicker
 * en spinnarruta som sedan byttes mot ett högre kort, vilket var hela
 * layoutförskjutningen på 0,006.
 *
 * Nu läses sessionen, CV-listan och prenumerationsgraden här på servern i en
 * parallell omgång och skickas som props. Första HTML innehåller det valda
 * CV:t och rätt mallvy, så väljaren har sin slutliga höjd direkt.
 *
 * Ingen affärslogik har flyttat hit. Premiumgraden används bara för att
 * markera låsta mallar, precis som förut. Spärren mot att faktiskt generera
 * en premiummall ligger kvar i klienten och på servern bakom
 * /api/cv/generate-formatted.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import CvMallarClient, { type InitialCv } from './CvMallarClient';

export default async function CVMallarPage({
  searchParams,
}: {
  searchParams: Promise<{ cv?: string | string[] }>;
}) {
  // ?cv= läses här i stället för med useSearchParams på klienten. Då behövs
  // ingen Suspense-gräns, och det valda CV:t är redan valt i första HTML.
  const params = await searchParams;
  const cvParam = params?.cv;
  const cvIdFromUrl = Array.isArray(cvParam) ? (cvParam[0] ?? null) : (cvParam ?? null);

  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        .select('subscription_tier, premium_until')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    if (cvRes.error) {
      console.error('Fel vid server-hämtning av CV-listan:', cvRes.error);
    }

    cvRows = (cvRes.data ?? []) as InitialCv[];

    const profile = profileRes.data as
      | { subscription_tier?: string | null; premium_until?: string | null }
      | null;
    // Samma validering som skapa-brev: 'premium' i tabellen räknas som
    // premium, premium_until läses som säkerhetsnät mot en utgången rad.
    const untilOk =
      !profile?.premium_until || new Date(profile.premium_until).getTime() > Date.now();
    isPremium = profile?.subscription_tier === 'premium' && untilOk;
  } catch (error) {
    // Går hämtningen fel ska sidan ändå gå att öppna. Klienten hämtar om.
    console.error('Fel vid server-hämtning av CV-mallar:', error);
  }

  // Samma val som effekten gjorde på klienten: CV:t från URL:en om det finns,
  // annars det senaste.
  const initialSelectedCvId =
    (cvIdFromUrl && cvRows.some((cv) => cv.id === cvIdFromUrl) ? cvIdFromUrl : null) ??
    cvRows[0]?.id ??
    null;

  return (
    <CvMallarClient
      initialCvs={cvRows}
      initialIsPremium={isPremium}
      initialSelectedCvId={initialSelectedCvId}
    />
  );
}
