import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { ITEMS_GRUND } from '@/lib/personalityTest/itemsGrund';
import { ITEMS_AVANCERAD } from '@/lib/personalityTest/itemsAvancerad';
import type { PersonalityAnswer, LikertValue } from '@/lib/personalityTest/types';

function isValidValue(v: unknown): v is LikertValue {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5;
}

export async function POST(request: Request) {
  try {
    const { sessionId, questionId, value } = await request.json();

    if (!sessionId || typeof questionId !== 'string' || !isValidValue(value)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session, error: fetchError } = await supabase
      .from('personality_test_sessions')
      .select('id, test_type, answers, completed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.completed_at) {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    // Verifiera att questionId hör till rätt frågebatteri
    const itemBank = session.test_type === 'personlighet-grund'
      ? ITEMS_GRUND
      : ITEMS_AVANCERAD;
    const validIds = new Set(itemBank.map((i) => i.id));
    if (!validIds.has(questionId)) {
      return NextResponse.json({ error: 'Invalid questionId' }, { status: 400 });
    }

    const next: PersonalityAnswer = { questionId, value };

    // Ett svar per påstående, atomärt i databasen (src/lib/tests/sparaSvar.ts).
    let answeredCount: number | null;
    try {
      answeredCount = await sparaTestsvar(supabase, {
        tabell: 'personality_test_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.personlighet,
        svar: next as unknown as Record<string, unknown>,
      });
    } catch (updateError) {
      console.error('Error saving answer:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }
    if (answeredCount === null) {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, answeredCount });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Sparade svar för en pågående session, så att provet kan fortsätta där det
 * slutade efter en omladdning (TestSessionView hämtar dem vid mount).
 */
export async function GET(request: Request) {
  try {
    const sessionId = new URL(request.url).searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session, error: fetchError } = await supabase
      .from('personality_test_sessions')
      .select('answers, completed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const answers: PersonalityAnswer[] = Array.isArray(session.answers) ? session.answers : [];
    return NextResponse.json({ answers, completed: Boolean(session.completed_at) });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
