import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user profile to validate onboarding completion
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_reward_claimed, onboarding_steps_completed, premium_until')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Check if reward already claimed
    if (profile.onboarding_reward_claimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Hybrid validation: Check the 3 required steps via both DB array AND actual feature tables
    const REQUIRED_STEPS = ['upload_cv', 'create_letter', 'analyze_cv'];

    const [
      { count: cvCount },
      { count: letterCount },
      { count: analysisCount }
    ] = await Promise.all([
      supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed')
    ]);

    const completedStepsArray = profile.onboarding_steps_completed || [];
    const validatedRequiredSteps: string[] = [];

    if (completedStepsArray.includes('upload_cv') || (cvCount || 0) > 0) {
      validatedRequiredSteps.push('upload_cv');
    }
    if (completedStepsArray.includes('create_letter') || (letterCount || 0) > 0) {
      validatedRequiredSteps.push('create_letter');
    }
    if (completedStepsArray.includes('analyze_cv') || (analysisCount || 0) > 0) {
      validatedRequiredSteps.push('analyze_cv');
    }

    console.log('[claim-reward] Validated required steps:', validatedRequiredSteps);
    console.log('[claim-reward] Completed:', validatedRequiredSteps.length, '/ 3');

    // Validate all 3 required steps are completed
    if (validatedRequiredSteps.length < 3) {
      return NextResponse.json(
        { error: `Alla 3 kärnsteg måste vara slutförda (${validatedRequiredSteps.length}/3)` },
        { status: 400 }
      );
    }

    // Sync onboarding_steps_completed array if needed
    for (const step of validatedRequiredSteps) {
      if (!completedStepsArray.includes(step)) {
        const { error: syncError } = await supabase.rpc('update_onboarding_progress', {
          user_id: user.id,
          step_name: step
        });
        if (syncError) {
          console.warn(`[claim-reward] Failed to sync step ${step}:`, syncError.message);
        }
      }
    }

    // Calculate premium end date (1 day from now or extend existing premium)
    const currentPremiumUntil = profile.premium_until ? new Date(profile.premium_until) : null;
    const startDate = currentPremiumUntil && currentPremiumUntil > new Date()
      ? currentPremiumUntil // Stack on existing premium
      : new Date(); // Start from now

    const premiumEndDate = new Date(startDate);
    premiumEndDate.setDate(premiumEndDate.getDate() + 1); // Add 1 day

    // Grant premium and mark reward as claimed
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        premium_until: premiumEndDate.toISOString(),
        premium_source: 'onboarding_completion',
        subscription_tier: 'premium',
        onboarding_reward_claimed: true
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error granting premium:', updateError);
      return NextResponse.json(
        { error: 'Failed to grant premium reward' },
        { status: 500 }
      );
    }

    // Award XP (non-blocking, don't fail if this errors)
    try {
      await supabase.rpc('add_xp_with_cap_check', {
        user_id_param: user.id,
        xp_amount: 100,
        source_param: 'onboarding_completion',
        description_param: 'Slutförde alla onboarding-steg och hämtade belöning'
      });
    } catch (xpError) {
      console.warn('XP award failed (non-critical):', xpError);
    }

    return NextResponse.json({
      success: true,
      data: {
        premiumUntil: premiumEndDate.toISOString(),
        message: `1 dag Premium aktiverat! Giltig till ${premiumEndDate.toLocaleDateString('sv-SE')}.`
      }
    });

  } catch (error) {
    console.error('Unexpected error in claim-reward:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
