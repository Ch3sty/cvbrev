import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { verifyTestSession } from '@/lib/tester/sessionManager';
import { getQuestionById } from '@/lib/tester/questionBank.server';
import { QuestionBreakdown, UserAnswer } from '@/lib/tester/patternTypes';
import { calculatePracticeRating, getInterpretation } from '@/lib/tester/scoringEngine';
import { submitPayloadSchema } from '@/lib/tester/validation';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // P0: Zod-validering av inkommande payload
    const body = await request.json();
    const validationResult = submitPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('[API /tester/submit] Validation error:', validationResult.error.format());
      return NextResponse.json(
        {
          error: 'Ogiltig inlämning',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { sessionToken, answers, timeSpent } = validationResult.data;

    // Verifiera session
    const session = await verifyTestSession(sessionToken);

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
    }

    // P0: Validera att alla svar hör till sessionens frågor
    const validQuestionIds = new Set(session.questionIds);
    const invalidAnswers = answers.filter(a => !validQuestionIds.has(a.questionId));

    if (invalidAnswers.length > 0) {
      console.error('[API /tester/submit] Invalid question IDs:', invalidAnswers.map(a => a.questionId));
      return NextResponse.json(
        { error: 'Svar innehåller ogiltiga fråge-ID som inte ingick i din testsession' },
        { status: 400 }
      );
    }

    // P0: Hantera duplikat - ta senaste svaret per fråga
    const uniqueAnswers = Array.from(
      answers.reduce((map, ans) => {
        map.set(ans.questionId, ans); // Senare svar skriver över tidigare
        return map;
      }, new Map<string, UserAnswer>()).values()
    );

    // P0: Skapa svar-mapping för snabb lookup
    const answersById = new Map(uniqueAnswers.map(a => [a.questionId, a]));

    // P0: Rätta ALLA förväntade frågor (även obesvarade)
    const expectedQuestionIds = session.questionIds; // Från JWT, t.ex. 15 frågor
    const breakdown: QuestionBreakdown[] = [];
    let correctCount = 0;
    let graded = 0;

    for (const qid of expectedQuestionIds) {
      const question = getQuestionById(qid);

      if (!question) {
        // Detta borde aldrig hända om sessionen är giltig
        console.error(`[API /tester/submit] Question ${qid} not found in question bank`);
        continue;
      }

      graded++; // Räkna alla frågor som skulle besvaras

      // Hämta användarens svar, eller -1 om obesvarad
      const answerData = answersById.get(qid);
      const userAnswer = answerData ? answerData.userAnswer : -1;
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      breakdown.push({
        questionId: question.id,
        isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        timeSpent: answerData?.timeSpent || 0,
        difficulty: question.difficulty,
        patternTypes: question.patternTypes,
        matrix: question.matrix,
        options: question.options
      });
    }

    // P0: Beräkna poäng mot faktiskt antal frågor (inte answers.length)
    const scoreRaw = graded > 0 ? (correctCount / graded) * 100 : 0;
    const scorePracticeRating = calculatePracticeRating(scoreRaw);
    const interpretation = getInterpretation(scorePracticeRating);

    // Spara i Supabase
    const { data: attempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_type: 'matrislogik-classic',
        test_mode: 'practice',
        score_raw: scoreRaw,
        score_practice_rating: scorePracticeRating,
        correct_answers: correctCount,
        total_questions: graded, // P0: Använd faktiskt antal rättade frågor
        time_spent_seconds: timeSpent || 0,
        answers: uniqueAnswers // Spara endast unika svar
      })
      .select()
      .single();

    if (insertError) {
      console.error('[API /tester/submit] Insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      attemptId: attempt.id,
      scoreRaw,
      scorePracticeRating,
      correctAnswers: correctCount,
      totalQuestions: graded, // P0: Använd faktiskt antal rättade frågor
      timeSpentSeconds: timeSpent || 0,
      breakdown,
      interpretation,
      completedAt: attempt.completed_at
    });

  } catch (error) {
    console.error('[API /tester/submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
