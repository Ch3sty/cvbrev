import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { classifyUser } from '@/lib/rewards/user-classifier';
import { activateReward } from '@/lib/rewards/activators';
import { PremiumReward } from '@/lib/rewards/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const body = await request.json();
    const { claimId, activationCode } = body;

    if (!claimId || !activationCode) {
      return NextResponse.json({
        error: 'Claim ID and activation code are required'
      }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the claim with reward details
    const { data: claim, error: claimError } = await supabase
      .from('user_reward_claims')
      .select(`
        *,
        premium_rewards (*)
      `)
      .eq('id', claimId)
      .eq('user_id', user.id)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({
        error: 'Invalid claim or activation code'
      }, { status: 404 });
    }

    // Verify activation code from activation_data
    const storedCode = claim.activation_data?.activation_code || claim.metadata?.activation_code;
    if (storedCode !== activationCode) {
      return NextResponse.json({
        error: 'Invalid activation code'
      }, { status: 403 });
    }

    if (claim.status === 'activated' || claim.status === 'used') {
      return NextResponse.json({
        error: 'Reward already activated'
      }, { status: 400 });
    }

    if (claim.status !== 'claimed') {
      return NextResponse.json({
        error: 'Reward not ready for activation'
      }, { status: 400 });
    }

    // Cast reward to our type
    const reward = claim.premium_rewards as unknown as PremiumReward;

    if (!reward) {
      return NextResponse.json({
        error: 'Reward details not found'
      }, { status: 404 });
    }

    // Classify user to determine activation strategy
    const userClass = await classifyUser(supabase, user.id);

    console.log('[rewards/activate] User classification:', {
      userId: user.id,
      type: userClass.type,
      rewardType: reward.reward_type
    });

    // Activate reward using appropriate strategy
    const result = await activateReward(
      supabase,
      user.id,
      userClass,
      reward,
      claimId
    );

    // Update claim status
    const { error: updateError } = await supabase
      .from('user_reward_claims')
      .update({
        status: 'activated',
        activated_at: new Date().toISOString(),
        activation_data: {
          ...claim.activation_data,
          ...result.data,
          activated: true
        }
      })
      .eq('id', claimId);

    if (updateError) {
      console.error('[rewards/activate] Error updating claim status:', updateError);
      // Don't fail the request - reward is already activated
    }

    // Award XP for activation
    try {
      await supabase.rpc('add_xp_with_cap_check', {
        user_id_param: user.id,
        xp_amount: 25,
        source_param: 'reward_activation',
        description_param: `Aktiverade: ${reward.name}`
      });
    } catch (xpError) {
      console.warn('[rewards/activate] XP award failed (non-critical):', xpError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        rewardName: reward.name,
        rewardType: reward.reward_type
      }
    });

  } catch (error) {
    console.error('[rewards/activate] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
