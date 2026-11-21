// src/app/api/cv/quick-score/route.ts
// Snabb CV-poäng direkt efter uppladdning (aha-moment i onboarding).
// Synkront svar - INTE bakgrundsjobb. Poängen räknas med läsbarhetsmodellen
// (src/lib/cv/poang), samma som CV-analysen; texterna kommer från
// analyzeCvBasic (Gemini fast-modell). Den fullständiga analysen ligger kvar
// på /api/cv/analyze.
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { analyzeCvBasic } from '@/lib/openai/cv-analysis';
import { trackAIUsage, AI_FEATURES } from '@/lib/ai-cost-tracker';
import { markFirstMilestone } from '@/lib/activation-tracking';
import { poangForRad } from '@/lib/cv/poang';
import { hamtaKontaktKalla, sakerstallStruktur } from '@/lib/cv/poang/server';

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

    // Profilens namn gör maskeringen exakt i stället för enbart heuristisk.
    const { data: nameRow } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Snabb basanalys (synkron, Gemini fast) för texterna: sammanfattning,
    // styrkor och vad att fixa. Personuppgifter maskas inuti analyzeCvBasic.
    // Poängen kommer INTE därifrån: den räknas med samma funktion som
    // CV-analysen, ur CV:ts sparade struktur (docs/poangmodell-cv-analys.md),
    // så att snabbpoängen och analysen aldrig säger emot varandra.
    const [analysis, cvRad, kontakt] = await Promise.all([
      analyzeCvBasic(cv.cv_text, { fullName: nameRow?.full_name ?? null }),
      sakerstallStruktur(supabase, cvId),
      hamtaKontaktKalla(supabase, user.id, user),
    ]);
    // Kontaktuppgifterna som arket visar dem (poängmodellen version 2).
    const score = poangForRad(cvRad ? { ...cvRad, kontakt } : null);

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

    // Utan struktur finns inget att räkna på. Hellre ingen poäng än en gissad:
    // klienten visar då "Ditt CV är inläst" utan siffra.
    if (score === null) {
      return NextResponse.json({ error: 'Kunde inte läsa CV:ts struktur.' }, { status: 422 });
    }

    // B7: första analysen. Först vinner, så en senare fullanalys skriver inte över.
    await markFirstMilestone(user.id, 'first_cv_analyzed_at');

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
