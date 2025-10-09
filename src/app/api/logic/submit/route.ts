import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getQuestionById } from '@/lib/logic/questionBank.server';
import { grade, getInterpretation } from '@/lib/logic/scoring';
import type { UserAnswer, QuestionBreakdown } from '@/lib/logic/types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface SubmitRequest {
  sessionToken: string;
  answers: UserAnswer[];
  timeSpentSeconds: number;
}

/**
 * POST /api/logic/submit
 * Submit test answers and calculate results (grundnivå)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SubmitRequest = await request.json();
    const { sessionToken, answers, timeSpentSeconds } = body;

    // Verify JWT
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
    const sessionId: string = decoded.sessionId;

    // Validate answers belong to session questions
    const validQuestionIds = new Set(questionIds);
    const invalidAnswers = answers.filter((a) => !validQuestionIds.has(a.questionId));

    if (invalidAnswers.length > 0) {
      console.error('Invalid question IDs:', invalidAnswers.map((a) => a.questionId));
      return NextResponse.json(
        { error: 'Svar innehåller ogiltiga fråge-ID' },
        { status: 400 }
      );
    }

    // Handle duplicates - keep latest answer per question
    const uniqueAnswers = Array.from(
      answers.reduce((map, ans) => {
        map.set(ans.questionId, ans);
        return map;
      }, new Map<string, UserAnswer>()).values()
    );

    // Create answer lookup
    const answersById = new Map(
      uniqueAnswers.map((a) => [a.questionId, a.userAnswer])
    );

    // Create correct answer lookup
    const correctById = new Map(
      questionIds.map((qid) => {
        const q = getQuestionById(qid);
        return [qid, q?.correctAnswer ?? -1];
      })
    );

    // Grade the test
    const { correct, scoreRaw, rating } = grade(
      questionIds,
      answersById,
      correctById
    );

    // Build detailed breakdown
    const breakdown: QuestionBreakdown[] = [];
    for (const qid of questionIds) {
      const question = getQuestionById(qid);
      if (!question) continue;

      const answerData = uniqueAnswers.find((a) => a.questionId === qid);
      const userAnswer = answerData ? answerData.userAnswer : -1;
      const isCorrect = userAnswer === question.correctAnswer;

      breakdown.push({
        questionId: question.id,
        isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.rule,
        timeSpent: answerData?.timeSpent || 0,
        title: question.title,
        grid: question.grid,
        options: question.options,
      });
    }

    // Save answers to database
    const answerInserts = uniqueAnswers.map((ans) => {
      const isCorrect = ans.userAnswer === correctById.get(ans.questionId);
      return {
        session_id: sessionId,
        user_id: user.id,
        question_id: ans.questionId,
        answer_index: ans.userAnswer,
        is_correct: isCorrect,
        time_spent_seconds: ans.timeSpent || 0,
        test_type: 'matrislogik-minimal',
      };
    });

    const { error: answersError } = await supabase
      .from('logic_answers')
      .insert(answerInserts);

    if (answersError) {
      console.error('Error saving answers:', answersError);
      // Don't fail - continue with result
    }

    // Save result to database
    const { data: result, error: resultError } = await supabase
      .from('logic_results')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        test_type: 'matrislogik-minimal',
        completed_at: new Date().toISOString(),
        score_raw: scoreRaw,
        rating: rating,
        correct_answers: correct,
        total_questions: questionIds.length,
        time_spent_seconds: timeSpentSeconds || 0,
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error saving result:', resultError);
      return NextResponse.json(
        { error: 'Failed to save result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attemptId: result.id,
      scoreRaw,
      rating,
      correctAnswers: correct,
      totalQuestions: questionIds.length,
      timeSpentSeconds: timeSpentSeconds || 0,
      breakdown,
      interpretation: getInterpretation(rating),
      completedAt: result.completed_at,
    });
  } catch (error) {
    console.error('Error submitting logic test V3:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
