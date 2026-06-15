// src/app/api/cv/quick-score/route.ts
// Snabb CV-poäng direkt efter uppladdning (aha-moment i onboarding).
// Synkront svar via analyzeCvBasic (Gemini fast-modell) - INTE bakgrundsjobb.
// Detta är en lättviktig försmak; den fullständiga analysen ligger kvar på /api/cv/analyze.
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { analyzeCvBasic } from '@/lib/openai/cv-analysis';
import { trackAIUsage, AI_FEATURES } from '@/lib/ai-cost-tracker';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Autentisering krävs.' }, { status: 401 });
    }

    const { cvId } = await request.json();
    if (!cvId || typeof cvId !== 'string') {
      return NextResponse.json({ error: 'cvId krävs.' }, { status: 400 });
    }

    // Hämta CV-texten (RLS säkerställer att den tillhör användaren)
    const { data: cv, error: cvError } = await supabase
      .from('cv_texts')
      .select('cv_text')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single();

    if (cvError || !cv?.cv_text) {
      return NextResponse.json(
        { error: 'Kunde inte hitta CV:t eller så tillhör det inte dig.' },
        { status: 404 }
      );
    }

    // Snabb basanalys (synkron, Gemini fast)
    const analysis = await analyzeCvBasic(cv.cv_text);

    // Härled en 0-100-poäng från de två 1-5-betygen.
    const clarity = analysis.scores?.clarityAndStructure?.rating ?? 0;
    const verbs = analysis.scores?.strongVerbs?.rating ?? 0;
    const avgRating = (clarity + verbs) / 2; // 0-5
    const score = Math.round((avgRating / 5) * 100);

    // Spåra kostnad (icke-blockerande)
    if (analysis.tokens) {
      try {
        await trackAIUsage({
          supabase,
          userId: user.id,
          featureName: AI_FEATURES.CV_ANALYSIS,
          endpoint: '/api/cv/quick-score',
          model: analysis.model || 'gemini',
          promptTokens: analysis.tokens.prompt,
          completionTokens: analysis.tokens.completion,
          costUsd: analysis.cost ?? 0,
          generationTimeMs: Date.now() - startTime,
          metadata: { quick_score: true, cv_id: cvId },
        });
      } catch (trackErr) {
        console.error('[quick-score] Kostnadsspårning misslyckades:', trackErr);
      }
    }

    return NextResponse.json({
      success: true,
      score,
      summary: analysis.summary,
      strengths: (analysis.identifiedStrengths || []).slice(0, 3),
      improvements: (analysis.improvementAreas || []).slice(0, 3),
      keywords: (analysis.keywords || []).slice(0, 6),
    });
  } catch (error: any) {
    console.error('[quick-score] Fel:', error);
    return NextResponse.json(
      { error: 'Kunde inte beräkna snabb-poäng', details: error.message },
      { status: 500 }
    );
  }
}
