import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { validateAnswer } from '@/lib/numericalTestExpert/validator';
import type { TestAnswer } from '@/lib/numericalTest/types';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, passageId, questionId, selectedAnswerId, timeSpent } = await request.json();
    const isCorrect = validateAnswer(passageId, questionId, selectedAnswerId);

    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('answers')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching expert session:', fetchError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const newAnswer: TestAnswer = {
      passageId,
      questionId,
      selectedAnswerId,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString(),
    };

    // Ett svar per fråga, atomärt i databasen (src/lib/tests/sparaSvar.ts).
    // Ett omval ersätter det tidigare svaret, och överlappande anrop kan inte
    // skriva över varandras svar.
    try {
      const sparade = await sparaTestsvar(testSkrivKlient(), {
        userId: user.id,
        reserv: supabase,
        tabell: 'logic_test_v4_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.passageFraga,
        svar: newAnswer as unknown as Record<string, unknown>,
        kravOavslutad: false,
      });
      if (sparade === null) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    } catch (updateError) {
      console.error('Error saving answer:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ isCorrect });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
