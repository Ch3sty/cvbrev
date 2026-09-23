/**
 * Ansökans detaljvy är en server component.
 *
 * Förut hämtade klienten ansökan via GET /api/applications/[id] efter
 * hydrering, och routen körde auth.getUser() över nätet före sina frågor.
 * Tidslinjen är sidans LCP-element, så hela kedjan låg på den kritiska
 * vägen: tretton rundturer före första innehåll.
 *
 * Nu läses sessionen, ansökan, händelserna och det kopplade brevet här.
 * Frågorna är identiska med routens, filtret på user_id ligger kvar.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { JobApplicationEvent } from '@/lib/applications/status';
import ApplicationDetailClient, { type ApplicationDetail } from './ApplicationDetailClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) redirect('/login');

  let initialDetail: ApplicationDetail | null = null;

  try {
    const { data: application } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (application) {
      // Händelserna och det kopplade brevet hämtas parallellt, inte i tur
      // och ordning som routen gjorde.
      const [eventsRes, letterRes] = await Promise.all([
        supabase
          .from('job_application_events')
          .select('*')
          .eq('application_id', id)
          .order('occurred_at', { ascending: true })
          .order('created_at', { ascending: true }),
        application.letter_id
          ? supabase
              .from('letters')
              .select('id, title')
              .eq('id', application.letter_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      initialDetail = {
        ...application,
        events: (eventsRes.data ?? []) as JobApplicationEvent[],
        letter: (letterRes.data as { id: string; title: string | null } | null) ?? null,
      } as ApplicationDetail;
    }
  } catch (error) {
    // Går hämtningen fel ska sidan ändå gå att öppna; klienten hämtar om.
    console.error('Fel vid server-hämtning av ansökan:', error);
  }

  return <ApplicationDetailClient applicationId={id} initialDetail={initialDetail} />;
}
