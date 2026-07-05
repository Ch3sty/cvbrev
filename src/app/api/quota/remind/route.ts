import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// POST /api/quota/remind
// "Påminn mig när kvoten är tillbaka." Body: { feature, remindAfter (ISO) }.
// Raderna plockas upp av morgon-cronen som skickar mailet. RLS begränsar
// insert till egna rader; unique-constraint gör anropet idempotent.
export async function POST(request: Request) {
  try {
    const { feature, remindAfter } = await request.json();

    if (!feature || typeof feature !== 'string' || !remindAfter) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const remindDate = new Date(remindAfter);
    const maxAhead = Date.now() + 8 * 24 * 60 * 60 * 1000;
    if (isNaN(remindDate.getTime()) || remindDate.getTime() > maxAhead) {
      return NextResponse.json({ error: 'Invalid remindAfter' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: insertError } = await supabase.from('quota_reminders').insert({
      user_id: user.id,
      feature: feature.slice(0, 64),
      remind_after: remindDate.toISOString(),
    });

    // 23505 = unique violation → påminnelsen finns redan, det är OK.
    if (insertError && insertError.code !== '23505') {
      console.error('quota/remind insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save reminder' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('quota/remind unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
