// src/app/api/applications/report/route.ts
// Sökta tjänster: månadsrapport strukturerad som Arbetsförmedlingens
// aktivitetsrapport (blankett Af 00331):
//   1. Sökta annonserade jobb   2. Spontanansökningar/intresseanmälningar
//   3. Intervjuer               (per kalendermånad)

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const url = new URL(request.url);
    const monthParam = url.searchParams.get('month'); // YYYY-MM
    const now = new Date();
    const [year, month] = /^\d{4}-\d{2}$/.test(monthParam ?? '')
      ? (monthParam as string).split('-').map(Number)
      : [now.getFullYear(), now.getMonth() + 1];

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Sektion 1 + 2: ansökningar i månaden, uppdelade per kanal.
    const { data: applications, error: appsError } = await supabase
      .from('job_applications')
      .select('id, job_title, company, location, application_channel, applied_at, current_status')
      .eq('user_id', user.id)
      .gte('applied_at', start)
      .lte('applied_at', end)
      .order('applied_at', { ascending: true });

    if (appsError) {
      console.error('Rapport: kunde inte hämta ansökningar', appsError);
      return NextResponse.json({ error: 'Kunde inte hämta rapporten' }, { status: 500 });
    }

    const list = applications ?? [];
    const advertised = list.filter((a) => a.application_channel === 'ad');
    const unsolicited = list.filter((a) => a.application_channel !== 'ad');

    // Sektion 3: genomförda intervjuer och provjobb i månaden (händelser,
    // oavsett när ansökan skickades).
    const { data: interviewEvents, error: eventsError } = await supabase
      .from('job_application_events')
      .select('id, event_type, interview_round, occurred_at, job_applications!inner(job_title, company, location, user_id)')
      .eq('job_applications.user_id', user.id)
      .in('event_type', ['interview_completed', 'trial_work_completed'])
      .gte('occurred_at', start)
      .lte('occurred_at', end)
      .order('occurred_at', { ascending: true });

    if (eventsError) {
      console.error('Rapport: kunde inte hämta intervjuer', eventsError);
    }

    const interviews = (interviewEvents ?? []).map((event) => {
      const app = event.job_applications as unknown as {
        job_title: string;
        company: string;
        location: string | null;
      };
      return {
        occurred_at: event.occurred_at,
        event_type: event.event_type,
        interview_round: event.interview_round,
        job_title: app?.job_title ?? '',
        company: app?.company ?? '',
        location: app?.location ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        month: `${year}-${String(month).padStart(2, '0')}`,
        advertised,
        unsolicited,
        interviews,
        totals: {
          applications: list.length,
          advertised: advertised.length,
          unsolicited: unsolicited.length,
          interviews: interviews.length,
        },
      },
    });
  } catch (error) {
    console.error('Rapporthämtning error:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av rapport' }, { status: 500 });
  }
}
