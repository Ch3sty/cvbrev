import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
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

    // test_type skiljer grund (null) från expert ('matrislogik-expert').
    let testType: string | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.test_type === 'string') testType = body.test_type;
    } catch {
      /* ingen body = grund */
    }

    // Create new session
    const { data: session, error: createError } = await supabase
      .from('logic_test_v4_sessions')
      .insert({
        user_id: user.id,
        answers: [],
        ...(testType ? { test_type: testType } : {}),
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

// GET: Fetch user's sessions (filtrera på test_type: ?test_type=matrislogik-expert
// ger expert-sessioner; utan param eller test_type=grund ger grund-sessioner (null)).
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

    const url = new URL(request.url);
    const testType = url.searchParams.get('test_type');

    let query = supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (testType && testType !== 'grund') {
      query = query.eq('test_type', testType);
    } else {
      // Grund: sessioner utan test_type (null). Exkludera expert/andra typer.
      query = query.is('test_type', null);
    }

    const { data: sessions, error: fetchError } = await query.order('created_at', {
      ascending: false,
    });

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
