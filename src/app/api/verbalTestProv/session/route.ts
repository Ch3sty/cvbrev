import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { checkProvAllowance, PROV_TEST_TYPES } from '@/lib/prov/allowance';

const TEST_TYPE = PROV_TEST_TYPES.verbal;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowance = await checkProvAllowance(supabase, user.id, TEST_TYPE);
    if (!allowance.allowed) {
      return NextResponse.json(
        { error: 'prov_rate_limited', nextAvailableAt: allowance.nextAvailableAt },
        { status: 429 }
      );
    }

    const { data: session, error: createError } = await supabase
      .from('logic_test_v4_sessions')
      .insert({ user_id: user.id, test_type: TEST_TYPE, answers: [] })
      .select()
      .single();

    if (createError) {
      console.error('Error creating verbal prov session:', createError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sessions, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', TEST_TYPE)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching verbal prov sessions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
