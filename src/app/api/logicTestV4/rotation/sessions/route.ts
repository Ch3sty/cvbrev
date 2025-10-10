import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// GET: Fetch user's rotation test sessions
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch rotation test sessions only
    const { data: sessions, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', 'rotation')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching rotation sessions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
