import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current stats
    const { data: userStats, error: statsError } = await supabase
      .from('global_user_stats')
      .select('current_level, total_xp')
      .eq('user_id', user.id)
      .single()

    if (statsError) {
      console.error('Error fetching user stats:', statsError)
      return NextResponse.json({
        error: 'Failed to fetch user stats',
        details: statsError.message
      }, { status: 500 })
    }

    const currentLevel = userStats?.current_level || 1
    const totalXp = userStats?.total_xp || 0

    // Get level title
    const { data: levelTitle, error: titleError } = await supabase
      .from('level_titles')
      .select('title, description, xp_required')
      .eq('level', currentLevel)
      .single()

    if (titleError) {
      console.error('Error fetching level title:', titleError)
    }

    // Get next level info
    const { data: nextLevel } = await supabase
      .from('level_titles')
      .select('level, title, xp_required')
      .eq('level', currentLevel + 1)
      .single()

    // Get available rewards based on level
    const { data: availableRewards, error: availableError } = await supabase
      .from('premium_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'available')
      .order('milestone_level', { ascending: false })

    if (availableError) {
      console.error('Error fetching available rewards:', availableError)
    }

    // Get claimed rewards
    const { data: claimedRewards, error: claimedError } = await supabase
      .from('user_reward_claims')
      .select(`
        *,
        premium_rewards (
          reward_type,
          reward_value,
          milestone_level,
          description,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('claimed_at', { ascending: false })
      .limit(10)

    if (claimedError) {
      console.error('Error fetching claimed rewards:', claimedError)
    }

    // Get ALL milestones to show full progression path
    const allMilestoneLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

    // Fetch all milestone rewards to show complete progression
    const { data: allMilestoneRewards } = await supabase
      .from('premium_rewards')
      .select('*')
      .in('milestone_level', allMilestoneLevels)
      .order('milestone_level', { ascending: true })

    // Process milestones to add status
    const processedMilestones = allMilestoneRewards?.map(reward => {
      const levelDiff = reward.milestone_level - currentLevel
      let status = 'locked'

      if (claimedRewards?.some((c: any) => c.premium_rewards?.milestone_level === reward.milestone_level)) {
        status = 'claimed'
      } else if (currentLevel >= reward.milestone_level) {
        status = 'available'
      } else if (levelDiff <= 3) {
        status = 'upcoming'
      } else if (levelDiff <= 10) {
        status = 'near_future'
      }

      return {
        ...reward,
        status,
        is_unlocked: currentLevel >= reward.milestone_level,
        is_claimed: status === 'claimed',
        levels_until_unlock: Math.max(0, reward.milestone_level - currentLevel)
      }
    }) || []

    // Check premium status
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_until, subscription_tier')
      .eq('id', user.id)
      .single()

    // Check both manual premium (premium_until) and Stripe subscription (subscription_tier)
    const hasPremiumUntil = profile?.premium_until && new Date(profile.premium_until) > new Date()
    const hasPremiumTier = profile?.subscription_tier === 'premium'
    const isPremium = hasPremiumUntil || hasPremiumTier

    // Get guest invitation allowance if premium
    let guestInvitations = null
    if (isPremium) {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'

      const { data: allowance } = await supabase
        .from('monthly_guest_allowances')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()

      if (allowance) {
        guestInvitations = {
          total: allowance.base_allowance + allowance.bonus_allowance,
          used: allowance.used_invitations,
          remaining: allowance.base_allowance + allowance.bonus_allowance - allowance.used_invitations
        }
      } else {
        // Calculate bonus based on level
        let bonus = 0
        if (currentLevel >= 50) bonus = 999 // Unlimited
        else if (currentLevel >= 40) bonus = 4
        else if (currentLevel >= 30) bonus = 3
        else if (currentLevel >= 20) bonus = 2
        else if (currentLevel >= 10) bonus = 1

        guestInvitations = {
          total: 1 + bonus,
          used: 0,
          remaining: 1 + bonus
        }
      }

      // Get pending invitations
      const { data: pendingInvites, count } = await supabase
        .from('guest_invitations')
        .select('*', { count: 'exact' })
        .eq('inviter_id', user.id)
        .eq('status', 'pending')

      const pendingCount = count || 0
      guestInvitations = {
        ...guestInvitations,
        pendingCount
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentLevel,
        totalXp,
        levelTitle: levelTitle?.title || 'Novis',
        levelDescription: levelTitle?.description || '',
        nextLevel: nextLevel ? {
          level: nextLevel.level,
          title: nextLevel.title,
          xpRequired: nextLevel.xp_required,
          xpProgress: totalXp,
          xpRemaining: nextLevel.xp_required - totalXp
        } : null,
        isPremium,
        availableRewards: availableRewards || [],
        claimedRewards: claimedRewards || [],
        upcomingRewards: processedMilestones || [],
        allMilestones: processedMilestones || [],
        guestInvitations
      }
    })

  } catch (error) {
    console.error('Unexpected error in rewards status:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}