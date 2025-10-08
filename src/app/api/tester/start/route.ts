import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTestSession } from '@/lib/tester/sessionManager';
import { getQuestionsForTest } from '@/lib/tester/questionBank.server';
import { ClientQuestion } from '@/lib/tester/patternTypes';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Hämta 15 frågor från server-side bank
    const serverQuestions = getQuestionsForTest(15);

    // Konvertera till client-safe format (utan svar)
    const clientQuestions: ClientQuestion[] = serverQuestions.map(q => ({
      id: q.id,
      difficulty: q.difficulty,
      matrix: q.matrix,
      options: q.options
      // correctAnswer INTE här!
    }));

    // Skapa session token
    const sessionToken = await createTestSession(
      user.id,
      'matrislogik-classic',
      serverQuestions.map(q => q.id)
    );

    return NextResponse.json({
      sessionToken,
      questions: clientQuestions,
      testType: 'matrislogik-classic',
      duration: 20 * 60, // 20 min
      totalQuestions: 15
    });

  } catch (error) {
    console.error('[API /tester/start] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start test' },
      { status: 500 }
    );
  }
}
