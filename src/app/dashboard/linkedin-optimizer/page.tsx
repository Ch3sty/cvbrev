/**
 * Förbättra LinkedIn-profil är en server component, enligt samma mönster som
 * dashboard/tester och dashboard/skapa-brev.
 *
 * Förut låg hela wizarden bakom ett Suspense-skelett som 'use client'. Efter
 * hydrering hämtade den CV-listan genom cv-store (getSession följt av frågan
 * mot cv_texts) och gjorde dessutom ett auth.getUser() över nätet bara för att
 * få namnet till LinkedIn-mockupen. Mätningen landade på 3 rundturer och 2288
 * ms LCP på Pixel 7 över LTE.
 *
 * Nu läses sessionen här och båda hämtas i en parallell omgång på servern.
 * Första HTML innehåller steg 1 med CV-listan färdig.
 *
 * Kvoten är orörd: den avgörs fortfarande av edge-funktionen
 * optimize-linkedin när användaren startar en optimering, aldrig av något
 * sidan läser.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getLinkedInData, EMPTY_LINKEDIN_DATA } from './getLinkedInData';
import LinkedInOptimizerClient from './LinkedInOptimizerClient';

export default async function LinkedInOptimizerPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const metadataFullName =
    (user.user_metadata?.full_name as string | undefined) ?? null;

  // Går läsningen fel ska wizarden ändå gå att använda. Utan CV-lista öppnar
  // den i manuellt läge, vilket är exakt läget för den som inte laddat upp
  // något CV.
  const data = await getLinkedInData(supabase, user.id, metadataFullName).catch(
    (error) => {
      console.error('LinkedIn: kunde inte hämta sidans data', error);
      return { ...EMPTY_LINKEDIN_DATA, fullName: metadataFullName };
    }
  );

  return <LinkedInOptimizerClient initialData={data} />;
}
