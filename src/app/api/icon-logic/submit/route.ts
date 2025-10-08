import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { ICON_LOGIC_QUESTION_BANK } from '@/lib/tester/iconLogicQuestionBank.server';
import { IconLogicUserAnswer, IconLogicTestResult, IconLogicQuestionBreakdown } from '@/lib/tester/iconLogicTypes';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface SubmitRequest {
  sessionToken: string;
  answers: IconLogicUserAnswer[];
  timeSpentSeconds: number;
}

/**
 * POST /api/icon-logic/submit
 * Submit Icon Logic test answers and calculate results
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SubmitRequest = await request.json();
    const { sessionToken, answers, timeSpentSeconds } = body;

    // Verify session token
    let decoded: any;
    try {
      decoded = jwt.verify(sessionToken, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    if (decoded.userId !== user.id) {
      return NextResponse.json(
        { error: 'Session token does not match user' },
        { status: 403 }
      );
    }

    const questionIds: string[] = decoded.questionIds;

    // Calculate results
    const breakdown: IconLogicQuestionBreakdown[] = [];
    let correctCount = 0;

    for (let i = 0; i < questionIds.length; i++) {
      const questionId = questionIds[i];
      const serverQuestion = ICON_LOGIC_QUESTION_BANK.find(q => q.id === questionId);

      if (!serverQuestion) {
        console.error(`Question ${questionId} not found`);
        continue;
      }

      const userAnswer = answers.find(a => a.questionId === questionId);
      const userAnswerIndex = userAnswer?.userAnswer ?? -1;
      const isCorrect = userAnswerIndex === serverQuestion.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      breakdown.push({
        questionId: serverQuestion.id,
        isCorrect,
        userAnswer: userAnswerIndex,
        correctAnswer: serverQuestion.correctAnswer,
        explanation: serverQuestion.explanation,
        timeSpent: userAnswer?.timeSpent ?? 0,
        difficulty: serverQuestion.difficulty,
        patternTypes: serverQuestion.patternTypes,
        matrix: serverQuestion.matrix,
        options: serverQuestion.options
      });
    }

    const totalQuestions = questionIds.length;
    const scoreRaw = Math.round((correctCount / totalQuestions) * 100);
    const scorePracticeRating = Math.min(10, Math.max(1, Math.round((scoreRaw / 100) * 10)));

    // Generate interpretation
    let interpretation = '';
    if (scoreRaw >= 90) {
      interpretation = 'Utmärkt! Du har exceptionell logisk förmåga och mönsterigenkänning.';
    } else if (scoreRaw >= 70) {
      interpretation = 'Mycket bra! Du har stark logisk förmåga.';
    } else if (scoreRaw >= 50) {
      interpretation = 'Bra! Du har god logisk förmåga.';
    } else if (scoreRaw >= 30) {
      interpretation = 'Okej resultat. Fortsätt öva för att förbättra din logiska förmåga.';
    } else {
      interpretation = 'Utmanande test. Fortsätt öva - logisk förmåga kan tränas!';
    }

    const attemptId = uuidv4();

    const result: IconLogicTestResult = {
      attemptId,
      scoreRaw,
      scorePracticeRating,
      correctAnswers: correctCount,
      totalQuestions,
      timeSpentSeconds,
      breakdown,
      interpretation,
      completedAt: new Date().toISOString()
    };

    // Save to database
    const { error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        id: attemptId,
        user_id: user.id,
        test_type: 'icon-logic',
        test_mode: 'practice',
        score_raw: scoreRaw,
        score_practice_rating: scorePracticeRating,
        correct_answers: correctCount,
        total_questions: totalQuestions,
        time_spent_seconds: timeSpentSeconds,
        completed_at: new Date().toISOString(),
        answers: answers,
        breakdown: breakdown,
        interpretation: interpretation
      });

    if (insertError) {
      console.error('Error saving test attempt:', insertError);
      // Don't fail the request - still return results
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting Icon Logic test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
