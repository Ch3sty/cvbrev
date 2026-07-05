import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET /api/logicTestV4/percentile?sessionId=<uuid>
// Svarar med hur stor andel av alla slutförda sessioner (samma test_type)
// som har lägre poäng än den angivna sessionen. RLS begränsar användare till
// egna rader, därför räknas jämförelsen med admin-klienten — endast aggregat
// (antal) lämnar servern, aldrig andra användares data.
export async function GET(request: Request) {
  try {
    const sessionId = new URL(request.url).searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ägarkontroll + hämta poäng och test_type via användarens egen klient.
    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('score, test_type, completed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session || !session.completed_at || session.score === null) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const admin = getSupabaseAdmin();
    const testType = session.test_type ?? 'matrislogik';

    const [{ count: total }, { count: below }] = await Promise.all([
      admin
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('test_type', testType)
        .not('completed_at', 'is', null)
        .not('score', 'is', null),
      admin
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('test_type', testType)
        .not('completed_at', 'is', null)
        .lt('score', session.score),
    ]);

    if (!total || total < 1) {
      return NextResponse.json({ percentile: null, sampleSize: 0 });
    }

    return NextResponse.json({
      percentile: Math.round((100 * (below ?? 0)) / total),
      sampleSize: total,
    });
  } catch (error) {
    console.error('Percentile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
