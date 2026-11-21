import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { poangsattAnalys } from '@/lib/cv/poang';
import { hamtaCvRad } from '@/lib/cv/poang/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { originalAnalysisId, improvedResult, displayName, cvId, satt } = await request.json();

    if (!originalAnalysisId || !improvedResult || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Poängen räknas på det sparade CV:t, aldrig på talet klienten skickar
    // (docs/poangmodell-cv-analys.md). Förr skrevs potentialen in här som
    // poäng; nu poängsätts det nya CV:t på riktigt och raden versionsmärks.
    //
    // Raden byggs ur den ursprungliga analysens hela resultat (läst här, bara
    // användarens egen rad), inte ur det klienten skickar: gratisnivån har
    // bara sett en filtrerad del, och de låsta fynden ska finnas kvar för det
    // sparade CV:t. Förslag som redan står i CV:t tas bort när raden läses
    // (poangsattAnalys), så de visas aldrig som kvar att göra.
    //
    // forbattradSparad märker att ett förbättrat CV sparats, som nytt eller
    // på plats ("ersatt"): Ditt CV:s dokumentväg läser det som åtgärdat.
    const { data: original } = await supabase
      .from('cv_analysis_jobs')
      .select('result')
      .eq('id', originalAnalysisId)
      .eq('user_id', user.id)
      .maybeSingle();
    const grund =
      original && (original as { result?: unknown }).result && typeof (original as { result?: unknown }).result === 'object'
        ? ((original as { result: Record<string, unknown> }).result)
        : improvedResult && typeof improvedResult === 'object'
          ? (improvedResult as Record<string, unknown>)
          : null;
    if (!grund) {
      return NextResponse.json({ error: 'Missing analysis' }, { status: 400 });
    }
    const { selectedImprovements: _valt, gated: _g, ...utanVal } = grund as Record<string, unknown>;
    const cvRad = await hamtaCvRad(supabase, typeof cvId === 'string' ? cvId : null);
    const resultat = poangsattAnalys(
      { ...utanVal, forbattradSparad: { at: new Date().toISOString(), satt: satt === 'ersatt' ? 'ersatt' : 'nytt' } },
      cvRad
    );

    // Create new analysis job with improved data
    const { data: newAnalysis, error: insertError } = await supabase
      .from('cv_analysis_jobs')
      .insert({
        user_id: user.id,
        cv_id: cvId,
        status: 'completed',
        result: resultat,
        display_name: displayName,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting improved analysis:', insertError);
      return NextResponse.json(
        { error: 'Failed to save improved analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisId: newAnalysis.id,
      message: 'Improved analysis saved successfully'
    });
  } catch (error) {
    console.error('Error in save-improved-analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
