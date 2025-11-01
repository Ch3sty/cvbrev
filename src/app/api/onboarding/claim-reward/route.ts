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

    // Validate onboarding is completed
    if (!profile?.onboarding_completed) {
      return NextResponse.json(
        { error: 'Onboarding not completed' },
        { status: 400 }
      );
    }

    // Check if reward already claimed
    if (profile.onboarding_reward_claimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Validate all 6 steps are actually completed
    const stepsCount = Array.isArray(profile.onboarding_steps_completed)
      ? profile.onboarding_steps_completed.length
      : 0;

    if (stepsCount < 6) {
      return NextResponse.json(
        { error: 'Not all onboarding steps completed' },
        { status: 400 }
      );
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
