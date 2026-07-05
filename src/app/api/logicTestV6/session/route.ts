import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Avancerad är premium-låst (se testCatalog). Gaten måste sitta serverside —
    // hubbens kort stoppar bara klick, inte direktnavigering till startsidan.
    const hasPremium = await userHasPremiumAccess(supabase, user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium membership required', code: 'premium_required' },
        { status: 403 }
      );
    }

    // Create new session with test_type
    const { data: session, error: createError } = await supabase
      .from('logic_test_v4_sessions')
      .insert({
        user_id: user.id,
        test_type: 'matrislogik-avancerad',
        answers: []
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating v6 session:', createError);
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

// GET: Fetch user's v6 sessions (?id=<uuid> hämtar en enskild session).
export async function GET(request: Request) {
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

    const sessionId = new URL(request.url).searchParams.get('id');
    if (sessionId) {
      const { data: session, error: fetchError } = await supabase
        .from('logic_test_v4_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ session });
    }

    // Fetch all v6 sessions for user, ordered by most recent
    const { data: sessions, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', 'matrislogik-avancerad')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching v6 sessions:', fetchError);
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
