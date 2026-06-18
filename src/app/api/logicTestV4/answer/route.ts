import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import questionBank from '@/lib/logicTestV5/questionBank.v5.json';
import questionBankV7Grund from '@/lib/logicTestV7/questionBankGrund.v7.json';

// Slå ihop bankerna så svar-API:t hittar både gamla V5-frågor (pågående sessioner)
// och nya V7-grundfrågor. Endast id + correctAnswer behövs här.
const allQuestions = [...questionBank, ...questionBankV7Grund] as Array<{
  id: string;
  correctAnswer: number;
}>;

export async function POST(request: Request) {
  try {
    const { sessionId, questionId, selectedIndex, timeSpent } = await request.json();

    if (!sessionId || !questionId || selectedIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verify user owns this session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch session
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

    // Don't allow updates to completed sessions
    if (session.completed_at) {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    // Find question in combined bank (V5 + V7-grund)
    const question = allQuestions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = selectedIndex === question.correctAnswer;

    // Update answers array
    const answers = Array.isArray(session.answers) ? [...session.answers] : [];
    const existingIndex = answers.findIndex((a: any) => a.q_id === questionId);

    const answerData = {
      q_id: questionId,
      selected: selectedIndex,
      correct: isCorrect,
      time_spent: timeSpent || 0
    };

    if (existingIndex >= 0) {
      answers[existingIndex] = answerData;
    } else {
      answers.push(answerData);
    }

    // Save updated answers
    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({ answers })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating answers:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      answeredCount: answers.length
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
