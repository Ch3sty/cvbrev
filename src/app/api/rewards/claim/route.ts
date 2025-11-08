import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const body = await request.json()
    const { rewardId } = body

    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the reward (rewards are global, not per-user)
    const { data: reward, error: rewardError } = await supabase
      .from('premium_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Check if user has already claimed this reward
    const { data: existingClaim } = await supabase
      .from('user_reward_claims')
      .select('id')
      .eq('user_id', user.id)
      .eq('reward_id', rewardId)
      .single()

    if (existingClaim) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    // Verify user has reached the required level
    const { data: userStats } = await supabase
      .from('global_user_stats')
      .select('current_level')
      .eq('user_id', user.id)
      .single()

    const currentLevel = userStats?.current_level || 1

    if (currentLevel < reward.trigger_value) {
      return NextResponse.json({
        error: 'You have not reached the required level for this reward',
        required_level: reward.trigger_value,
        current_level: currentLevel
      }, { status: 403 })
    }

    // Generate activation code
    const activationCode = `ACT${Date.now().toString(36).toUpperCase()}`;

    // Create claim record
    const { data: claim, error: claimError } = await supabase
      .from('user_reward_claims')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        activation_data: {
          activation_code: activationCode
        }
      })
      .select()
      .single()

    if (claimError) {
      console.error('Error creating claim record:', claimError)
      return NextResponse.json({ error: 'Failed to create claim record' }, { status: 500 })
    }

    // Generate discount code if needed (for UI display)
    let discountCode = null
    if (reward.reward_type === 'discount') {
      discountCode = `REWARD${reward.trigger_value || 0}-${Date.now().toString(36).toUpperCase()}`
    }

    // Award XP for claiming reward
    await supabase.rpc('add_xp_with_cap_check', {
      user_id_param: user.id,
      xp_amount: 50,
      source_param: 'reward_claim',
      description_param: `Hämtade belöning: ${reward.name}`
    })

    return NextResponse.json({
      success: true,
      data: {
        claimId: claim.id,
        rewardType: reward.reward_type,
        rewardValue: reward.reward_value,
        activationCode,
        discountCode,
        message: getClaimMessage(reward)
      }
    })

  } catch (error) {
    console.error('Unexpected error claiming reward:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getClaimMessage(reward: any): string {
  const value = reward.reward_value

  switch (reward.reward_type) {
    case 'trial':
      return `Grattis! Du har låst upp ${value.days} dagars gratis Premium. Använd aktiveringskoden för att starta din provperiod.`

    case 'discount':
      return `Fantastiskt! Du har fått ${value.discount_percent}% rabatt på ${value.duration_months} månaders Premium.`

    case 'full_premium':
      return `Otroligt! Du har låst upp ${value.days} dagars helt gratis Premium. Njut av alla fördelar!`

    case 'guest_invitation':
      return `Du har fått ${value.extra_invitations} extra gästinbjudningar denna månad!`

    default:
      return 'Din belöning har hämtats!'
  }
}