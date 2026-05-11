import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
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

    const answers: PersonalityAnswer[] = Array.isArray(session.answers)
      ? [...session.answers]
      : [];
    const existingIdx = answers.findIndex((a) => a.questionId === questionId);
    const next: PersonalityAnswer = { questionId, value };

    if (existingIdx >= 0) {
      answers[existingIdx] = next;
    } else {
      answers.push(next);
    }

    const { error: updateError } = await supabase
      .from('personality_test_sessions')
      .update({ answers })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error saving answer:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, answeredCount: answers.length });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
