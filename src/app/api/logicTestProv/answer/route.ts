import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import questionBankV5 from '@/lib/logicTestV5/questionBank.v5.json';
import questionBankGrund from '@/lib/logicTestV7/questionBankGrund.v7.json';
import questionBankAvancerad from '@/lib/logicTestV7/questionBank.v7.json';
import questionBankExpert from '@/lib/logicTestV7/questionBankExpert.v7.json';

// Prov-svar måste hitta facit oavsett vilken nivå frågan kom från. Slå ihop ALLA
// fyra logik-banker (V5 legacy + V7 grund/avancerad/expert). Fråge-id är unika
// tvärs poolerna, så uppslag per id är entydigt.
const allQuestions = [
  ...questionBankV5,
  ...questionBankGrund,
  ...questionBankAvancerad,
  ...questionBankExpert,
] as Array<{ id: string; correctAnswer: number }>;

export async function POST(request: Request) {
  try {
    const { sessionId, questionId, selectedIndex, timeSpent } = await request.json();

    if (!sessionId || !questionId || selectedIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.completed_at) {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    const question = allQuestions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedIndex === question.correctAnswer;

    const answers = Array.isArray(session.answers) ? [...session.answers] : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingIndex = answers.findIndex((a: any) => a.q_id === questionId);
    const answerData = {
      q_id: questionId,
      selected: selectedIndex,
      correct: isCorrect,
      time_spent: timeSpent || 0,
    };
    if (existingIndex >= 0) answers[existingIndex] = answerData;
    else answers.push(answerData);

    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({ answers })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating prov answers:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ success: true, correct: isCorrect, answeredCount: answers.length });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
