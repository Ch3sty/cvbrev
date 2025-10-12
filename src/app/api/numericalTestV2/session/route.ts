import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create new test session
    const { data: session, error: createError } = await supabase
      .from('logic_test_v4_sessions')
      .insert({
        user_id: user.id,
        test_type: 'numerical-reasoning-v2',
        answers: [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating session:', createError);
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all numerical test v2 sessions for user
    const { data: sessions, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', 'numerical-reasoning-v2')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching sessions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
