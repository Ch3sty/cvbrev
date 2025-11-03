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

    // Hybrid validation: Check both onboarding_steps_completed array AND actual feature table records
    // This matches the UI validation logic (same as kom-igang page and OnboardingContext)
    const [
      { count: cvCount },
      { count: letterCount },
      { count: analysisCount },
      { count: linkedinCount },
      { count: templateDownloadCount },
      { count: jobMatchCount }
    ] = await Promise.all([
      supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('linkedin_optimizations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('formatted_cv_downloads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('job_matchings_cache').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    const completedStepsArray = profile.onboarding_steps_completed || [];
    const validatedSteps: string[] = [];

    // Step 1: Upload CV
    if (completedStepsArray.includes('upload_cv') || (cvCount || 0) > 0) {
      validatedSteps.push('upload_cv');
    }

    // Step 2: Create letter
    if (completedStepsArray.includes('create_letter') || (letterCount || 0) > 0) {
      validatedSteps.push('create_letter');
    }

    // Step 3: Analyze CV
    if (completedStepsArray.includes('analyze_cv') || (analysisCount || 0) > 0) {
      validatedSteps.push('analyze_cv');
    }

    // Step 4: Optimize LinkedIn
    if (completedStepsArray.includes('optimize_linkedin') || (linkedinCount || 0) > 0) {
      validatedSteps.push('optimize_linkedin');
    }

    // Step 5: Download CV template
    if (completedStepsArray.includes('download_cv_template') || (templateDownloadCount || 0) > 0) {
      validatedSteps.push('download_cv_template');
    }

    // Step 6: Match jobs
    if (completedStepsArray.includes('match_jobs') || (jobMatchCount || 0) > 0) {
      validatedSteps.push('match_jobs');
    }

    console.log('[claim-reward] Validated steps:', validatedSteps);
    console.log('[claim-reward] Completed count:', validatedSteps.length, '/ 6');

    // Validate all 6 steps are actually completed (using hybrid validation)
    if (validatedSteps.length < 6) {
      return NextResponse.json(
        { error: `Not all onboarding steps completed (${validatedSteps.length}/6)` },
        { status: 400 }
      );
    }

    // Sync onboarding_steps_completed array if needed
    // This ensures the database stays consistent with actual completion status
    if (validatedSteps.length === 6 && completedStepsArray.length < 6) {
      console.log('[claim-reward] Syncing onboarding_steps_completed array with', validatedSteps);

      // Call update_onboarding_progress for each missing step to sync the array
      for (const step of validatedSteps) {
        if (!completedStepsArray.includes(step)) {
          try {
            await supabase.rpc('update_onboarding_progress', {
              user_id: user.id,
              step_name: step
            });
          } catch (syncError) {
            console.warn(`[claim-reward] Failed to sync step ${step}:`, syncError);
            // Non-blocking, continue with claim
          }
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
