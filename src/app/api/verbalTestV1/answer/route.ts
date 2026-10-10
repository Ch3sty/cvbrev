import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { sessionId, passageId, statementIndex, answer, timeSpent } = body;

    // Validate input
    if (!sessionId || !passageId || statementIndex === undefined || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newAnswer = {
      passageId,
      statementIndex,
      answer,
      timeSpent: timeSpent || 0
    };

    // Ett svar per påstående, atomärt i databasen (src/lib/tests/sparaSvar.ts).
    // Överlappande anrop kan inte längre skriva över varandras svar.
    let sparade: number | null;
    try {
      sparade = await sparaTestsvar(testSkrivKlient(), {
        userId: user.id,
        reserv: supabase,
        tabell: 'logic_test_v4_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.verbalPastaende,
        svar: newAnswer,
        kravOavslutad: false,
      });
    } catch (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }
    if (sparade === null) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
