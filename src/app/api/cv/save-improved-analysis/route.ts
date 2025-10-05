import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { originalAnalysisId, improvedResult, displayName, cvId } = await request.json();

    if (!originalAnalysisId || !improvedResult || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new analysis job with improved data
    const { data: newAnalysis, error: insertError } = await supabase
      .from('cv_analysis_jobs')
      .insert({
        user_id: session.user.id,
        cv_id: cvId,
        status: 'completed',
        result: improvedResult,
        display_name: displayName,
        completed_at: new Date().toISOString(),
        // Optional: track parent analysis for history
        metadata: {
          parent_analysis_id: originalAnalysisId,
          is_improved: true
        }
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
