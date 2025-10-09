import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create new session
    const { data: session, error: createError } = await supabase
      .from('logic_test_v4_sessions')
      .insert({
        user_id: user.id,
        answers: []
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating session:', createError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Fetch user's sessions
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all sessions for user, ordered by most recent
    const { data: sessions, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching sessions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
