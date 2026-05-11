import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

type TestType = 'personlighet-grund' | 'personlighet-avancerad';

function isValidTestType(value: unknown): value is TestType {
  return value === 'personlighet-grund' || value === 'personlighet-avancerad';
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const testType = body?.testType;

    if (!isValidTestType(testType)) {
      return NextResponse.json({ error: 'Invalid testType' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (testType === 'personlighet-avancerad') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      if (profile?.subscription_tier !== 'premium') {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
    }

    const { data: session, error: createError } = await supabase
      .from('personality_test_sessions')
      .insert({
        user_id: user.id,
        test_type: testType,
        answers: [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating personality session:', createError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const testType = url.searchParams.get('testType');

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('personality_test_sessions')
      .select('id, test_type, scores, time_spent, completed_at, started_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (isValidTestType(testType)) {
      query = query.eq('test_type', testType);
    }

    const { data: sessions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching personality sessions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: sessions ?? [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
