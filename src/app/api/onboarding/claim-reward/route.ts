import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { REQUIRED_STEPS } from '@/lib/onboarding/steps';


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

    // Ett enda obligatoriskt steg sedan B5: CV uppladdat. Hybridvalidering mot
    // både steg-arrayen och den faktiska tabellen.
    const { count: cvCount } = await supabase
      .from('cv_texts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const completedStepsArray = profile.onboarding_steps_completed || [];
    const validatedRequiredSteps = REQUIRED_STEPS.filter((step) => {
      if (completedStepsArray.includes(step)) return true;
      if (step === 'upload_cv') return (cvCount || 0) > 0;
      return false;
    });

    if (validatedRequiredSteps.length < REQUIRED_STEPS.length) {
      return NextResponse.json(
        { error: 'Ladda upp ditt CV först, sedan låser vi upp belöningen.' },
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

    // Flaggan är hela belöningen sedan omdesignen
    // (docs/plan-inloggat-omdesign.md, våg 2 punkt 21). XP och nivåer är
    // borttagna, och reverse trial ger redan alla nya konton fem dagar
    // Premium, så vi rör aldrig premium-fälten här heller. Det som återstår
    // är att markera steget klart så gränssnittet kan bekräfta det.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_reward_claimed: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error marking onboarding as complete:', updateError);
      return NextResponse.json(
        { error: 'Kunde inte spara att steget är klart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Ditt CV är på plats'
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
