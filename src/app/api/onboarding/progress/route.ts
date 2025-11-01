import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/onboarding/progress
 * Update onboarding progress for a specific step
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get authenticated user
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { step_name } = body;

    if (!step_name) {
      return NextResponse.json(
        { success: false, error: 'step_name is required' },
        { status: 400 }
      );
    }

    // Valid step names
    const validSteps = ['upload_cv', 'create_letter', 'analyze_cv', 'optimize_linkedin'];
    if (!validSteps.includes(step_name)) {
      return NextResponse.json(
        { success: false, error: 'Invalid step_name' },
        { status: 400 }
      );
    }

    // Call the database function to update progress
    const { error: updateError } = await supabase.rpc('update_onboarding_progress', {
      user_id: session.user.id,
      step_name
    });

    if (updateError) {
      console.error('Error updating onboarding progress:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // Fetch updated profile to return current state
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_step, onboarding_steps_completed, onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching updated profile:', profileError);
    }

    return NextResponse.json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    console.error('Unexpected error in /api/onboarding/progress:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/progress
 * Get current onboarding progress for the authenticated user
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get authenticated user
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch onboarding progress
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        onboarding_completed,
        onboarding_step,
        onboarding_steps_completed,
        first_cv_uploaded_at,
        first_letter_created_at,
        first_cv_analyzed_at,
        first_linkedin_optimized_at,
        onboarding_skipped,
        onboarding_started_at,
        onboarding_completed_at
      `)
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching onboarding progress:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Unexpected error in /api/onboarding/progress GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
