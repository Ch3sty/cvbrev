import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const body = await request.json()
    const { claimId, activationCode } = body

    if (!claimId || !activationCode) {
      return NextResponse.json({
        error: 'Claim ID and activation code are required'
      }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the claim
    const { data: claim, error: claimError } = await supabase
      .from('user_reward_claims')
      .select(`
        *,
        premium_rewards (
          reward_type,
          reward_value,
          name,
          description
        )
      `)
      .eq('id', claimId)
      .eq('user_id', user.id)
      .eq('activation_code', activationCode)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Invalid claim or activation code' }, { status: 404 })
    }

    if (claim.claim_status === 'activated') {
      return NextResponse.json({ error: 'Reward already activated' }, { status: 400 })
    }

    if (claim.claim_status !== 'ready') {
      return NextResponse.json({ error: 'Reward not ready for activation' }, { status: 400 })
    }

    const reward = claim.premium_rewards
    const rewardValue = reward.reward_value

    // Handle different reward types
    let updateData: any = {}
    let message = ''

    if (reward.reward_type === 'trial' || reward.reward_type === 'full_premium') {
      // Calculate new premium end date
      const days = rewardValue.days || 0
      const currentPremiumUntil = await getCurrentPremiumUntil(supabase, user.id)

      const startDate = currentPremiumUntil && currentPremiumUntil > new Date()
        ? currentPremiumUntil
        : new Date()

      const newPremiumUntil = new Date(startDate)
      newPremiumUntil.setDate(newPremiumUntil.getDate() + days)

      // Update user's premium status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          premium_until: newPremiumUntil.toISOString(),
          premium_source: 'reward_activation'
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating premium status:', profileError)
        return NextResponse.json({ error: 'Failed to activate premium' }, { status: 500 })
      }

      updateData = {
        premium_until: newPremiumUntil.toISOString(),
        days_added: days
      }

      message = `Premium aktiverat! Du har nu Premium till ${newPremiumUntil.toLocaleDateString('sv-SE')}.`

    } else if (reward.reward_type === 'guest_invitation') {
      // Add extra guest invitations
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
      const extraInvites = rewardValue.extra_invitations || 0

      const { data: allowance } = await supabase
        .from('monthly_guest_allowances')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()

      if (allowance) {
        await supabase
          .from('monthly_guest_allowances')
          .update({
            bonus_allowance: allowance.bonus_allowance + extraInvites
          })
          .eq('user_id', user.id)
          .eq('month', currentMonth)
      } else {
        await supabase
          .from('monthly_guest_allowances')
          .insert({
            user_id: user.id,
            month: currentMonth,
            base_allowance: 0, // User might not be premium
            bonus_allowance: extraInvites,
            used_invitations: 0
          })
      }

      updateData = {
        extra_invitations: extraInvites
      }

      message = `Du har fått ${extraInvites} extra gästinbjudningar denna månad!`
    }

    // Update claim status
    const { error: updateError } = await supabase
      .from('user_reward_claims')
      .update({
        claim_status: 'activated',
        activated_at: new Date().toISOString(),
        activation_metadata: updateData
      })
      .eq('id', claimId)

    if (updateError) {
      console.error('Error updating claim status:', updateError)
      return NextResponse.json({ error: 'Failed to update claim status' }, { status: 500 })
    }

    // Award XP for activation
    await supabase.rpc('add_xp_with_cap_check', {
      user_id_param: user.id,
      xp_amount: 25,
      source_param: 'reward_activation',
      description_param: `Aktiverade: ${reward.name}`
    })

    return NextResponse.json({
      success: true,
      data: {
        message,
        rewardType: reward.reward_type,
        updateData
      }
    })

  } catch (error) {
    console.error('Unexpected error activating reward:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getCurrentPremiumUntil(supabase: any, userId: string): Promise<Date | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('premium_until')
    .eq('id', userId)
    .single()

  if (profile?.premium_until) {
    return new Date(profile.premium_until)
  }

  return null
}