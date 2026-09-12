/**
 * Meddelanden är en server component.
 *
 * Förut var sidan 'use client' och kedjan såg ut så här: hydrera, fråga
 * Supabase Auth vem användaren var över nätet, måla ett skelett, montera
 * MessageHub, fetcha /api/candidate/interests, och där inne körde routen
 * auth.getUser() och sedan intressena, rekryterarprofilerna och
 * trådstatistiken. Fjorton rundturer innan första meddelandet syntes, nästan
 * alla seriella.
 *
 * Nu läses sessionen och hela intresselistan här på servern via den delade
 * getCandidateInterests, inte genom att fetcha vår egen HTTP-route. Första
 * HTML innehåller listan.
 *
 * ?interest= läses också här i stället för med useSearchParams på klienten,
 * så sidan inte behöver någon Suspense-gräns.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getCandidateInterests } from '@/lib/interests/getCandidateInterests';
import type { CandidateInterest } from '@/components/interests/hubTypes';
import MessageHub from '@/components/interests/MessageHub';

export default async function MeddelandenPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params?.interest;
  const deepLinkId = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);

  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let initialInterests: CandidateInterest[] = [];
  let loadFailed = false;

  try {
    initialInterests = await getCandidateInterests(supabase, user.id);
  } catch (error) {
    console.error('Fel vid server-hämtning av intresseanmälningar:', error);
    loadFailed = true;
  }

  return (
    <MessageHub
      userId={user.id}
      deepLinkId={deepLinkId}
      initialInterests={initialInterests}
      initialLoadFailed={loadFailed}
    />
  );
}
