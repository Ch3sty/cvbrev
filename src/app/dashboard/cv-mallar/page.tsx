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
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature, type Scope } from '@/lib/access/features';
import { harPaket } from '@/lib/plans/harPaket';
import type { PlanKey } from '@/lib/plans/plans';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

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

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  let cvRows: InitialCv[] = [];
  let isPremium = false;
  let scope: Scope | null = null;
  let track: Scope | null = null;
  let planKey: PlanKey | null = null;

  try {
    const [cvRes, profileRes, scopeRes] = await Promise.all([
      supabase
        .from('cv_texts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('premium_until, onboarding_track')
        .eq('id', user.id)
        .maybeSingle(),
      getUserScope(supabase, user.id),
    ]);

    if (cvRes.error) {
      console.error('Fel vid server-hämtning av CV-listan:', cvRes.error);
    }

    cvRows = (cvRes.data ?? []) as InitialCv[];

    // Efter paketomgången är frågan vilket spår hon köpt: alla mallar
    // ingår i CV-paketet och Hela paketet (cv_templates_all), aldrig i Träningspaketet.
    const profile = profileRes.data as { premium_until?: string | null; onboarding_track?: string | null } | null;
    scope = scopeRes;
    isPremium = scopeHasFeature(scope, 'cv_templates_all');
    const t = profile?.onboarding_track;
    track = t === 'cv' || t === 'tester' || t === 'allt' ? t : null;
    planKey = harPaket(scope, profile?.premium_until ? new Date(profile.premium_until) : null);
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
      scope={scope}
      track={track}
      planKey={planKey}
    />
  );
}
