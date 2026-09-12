/**
 * Skapa brev är en server component.
 *
 * Förut var hela sidan 'use client'. Innan steg 1 kunde visa något riktigt
 * behövde webbläsaren först hydrera, sedan fråga Supabase vem användaren var,
 * sedan hämta CV-listan, och parallellt med det körde CvPickerGrid en egen
 * useCvQuota som gjorde getUser, profilfråga och ännu en CV-fråga i tur och
 * ordning. Tre separata kedjor, alla seriella, alla efter att JS laddat.
 *
 * Nu läses sessionen och CV-listan här på servern, i samma omgång som
 * layouten redan gör sitt arbete. Första HTML som når mobilen innehåller
 * därför riktiga CV-kort i stället för en snurra.
 *
 * Premiumgraden hämtas också här, men enbart för att räkna ut vilka CV som är
 * låsta (samma getActiveCvIds som useCvQuota använde). Kvoter, brevgränser och
 * betalväggar ligger kvar där de låg: i useProfile och på servern bakom
 * generering och nedladdning. Ingen affärslogik har flyttat hit.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import CreateLetterClient, { type InitialCv } from './CreateLetterClient';

export default async function CreateLetterPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Två parallella frågor. CV-listan är det steg 1 faktiskt renderar,
  // prenumerationsgraden behövs bara för låsmarkeringen på korten.
  let cvRows: InitialCv[] = [];
  let tier: 'free' | 'premium' = 'free';

  try {
    const [cvRes, profileRes] = await Promise.all([
      supabase
        .from('cv_texts')
        // Inte select('*'): cv_text är hela CV:ts brödtext och skickades förut
        // med i svaret trots att väljaren bara visar filnamn och datum.
        .select('id, file_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('subscription_tier, premium_until')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    cvRows = (cvRes.data ?? []) as InitialCv[];

    const profile = profileRes.data as
      | { subscription_tier?: string | null; premium_until?: string | null }
      | null;
    // Samma validering som useCvQuota: 'premium' i tabellen räknas som premium.
    // premium_until läses bara som säkerhetsnät mot en utgången rad.
    const untilOk =
      !profile?.premium_until || new Date(profile.premium_until).getTime() > Date.now();
    tier = profile?.subscription_tier === 'premium' && untilOk ? 'premium' : 'free';
  } catch (error) {
    // Går hämtningen fel ska flödet ändå gå att öppna. Klienten hämtar om.
    console.error('Fel vid server-hämtning av CV-listan:', error);
  }

  // Free: de två senaste CV:na är aktiva, resten låsta. Identisk regel som
  // useCvQuota körde på klienten, bara flyttad hit.
  const maxCvs = tier === 'premium' ? 50 : 2;
  const activeIds = getActiveCvIds(cvRows, maxCvs);
  const lockedCvIds = cvRows.filter((cv) => !activeIds.has(cv.id)).map((cv) => cv.id);

  return (
    <CreateLetterClient
      initialCvs={cvRows}
      initialLockedCvIds={lockedCvIds}
      initialIsPremium={tier === 'premium'}
    />
  );
}
