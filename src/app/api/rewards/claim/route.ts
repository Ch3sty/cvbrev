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

    // Get the reward
    const { data: reward, error: rewardError } = await supabase
      .from('premium_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('user_id', user.id)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    if (reward.status !== 'available') {
      return NextResponse.json({ error: 'Reward is not available' }, { status: 400 })
    }

    // Start transaction
    const { error: updateError } = await supabase
      .from('premium_rewards')
      .update({ status: 'claimed' })
      .eq('id', rewardId)
      .eq('user_id', user.id)
      .eq('status', 'available')

    if (updateError) {
      console.error('Error updating reward status:', updateError)
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
    }

    // Create claim record
    const { data: claim, error: claimError } = await supabase
      .from('user_reward_claims')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        claim_status: 'pending',
        claimed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (claimError) {
      console.error('Error creating claim record:', claimError)

      // Rollback reward status
      await supabase
        .from('premium_rewards')
        .update({ status: 'available' })
        .eq('id', rewardId)

      return NextResponse.json({ error: 'Failed to create claim record' }, { status: 500 })
    }

    // Generate activation code based on reward type
    let activationCode = null
    let discountCode = null

    if (reward.reward_type === 'discount') {
      // Generate discount code
      discountCode = `JC${reward.milestone_level}${Date.now().toString(36).toUpperCase()}`

      await supabase
        .from('user_reward_claims')
        .update({
          stripe_discount_code: discountCode,
          claim_status: 'active'
        })
        .eq('id', claim.id)
    } else if (reward.reward_type === 'trial' || reward.reward_type === 'full_premium') {
      // Generate activation code for trials/full premium
      activationCode = `PREMIUM${Date.now().toString(36).toUpperCase()}`

      await supabase
        .from('user_reward_claims')
        .update({
          activation_code: activationCode,
          claim_status: 'ready'
        })
        .eq('id', claim.id)
    }

    // Award XP for claiming reward
    await supabase.rpc('add_xp_with_cap_check', {
      p_user_id: user.id,
      p_amount: 50,
      p_source: 'reward_claim',
      p_description: `Hämtade belöning: ${reward.name}`
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