import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Define all milestone rewards
const MILESTONE_REWARDS = [
  {
    level: 5,
    type: 'trial',
    name: '2 dagars Premium Trial',
    description: 'Prova Premium i 2 dagar',
    value: { days: 2 },
    icon: '🎁'
  },
  {
    level: 10,
    type: 'trial',
    name: '5 dagars Premium Trial',
    description: 'Upplev Premium i 5 dagar',
    value: { days: 5 },
    icon: '🎉'
  },
  {
    level: 15,
    type: 'discount',
    name: '15% rabatt (1 månad)',
    description: 'Få 15% rabatt på din första månad',
    value: { discount_percent: 15, duration_months: 1 },
    icon: '💰'
  },
  {
    level: 20,
    type: 'full_premium',
    name: '1 vecka gratis Premium',
    description: '7 dagar full tillgång till Premium',
    value: { days: 7 },
    icon: '⭐'
  },
  {
    level: 25,
    type: 'discount',
    name: '25% rabatt (3 månader)',
    description: 'Spara 25% på 3 månaders Premium',
    value: { discount_percent: 25, duration_months: 3 },
    icon: '💎'
  },
  {
    level: 30,
    type: 'full_premium',
    name: '2 veckors gratis Premium',
    description: '14 dagar med alla Premium-fördelar',
    value: { days: 14 },
    icon: '🏆'
  },
  {
    level: 35,
    type: 'discount',
    name: '35% rabatt (6 månader)',
    description: 'Stor rabatt på halvårsprenumeration',
    value: { discount_percent: 35, duration_months: 6 },
    icon: '🎯'
  },
  {
    level: 40,
    type: 'full_premium',
    name: '1 månad gratis Premium',
    description: 'Hela månaden med Premium helt gratis',
    value: { days: 30 },
    icon: '🚀'
  },
  {
    level: 45,
    type: 'discount',
    name: '45% rabatt (12 månader)',
    description: 'Nästan halva priset på årsprenumeration',
    value: { discount_percent: 45, duration_months: 12 },
    icon: '✨'
  },
  {
    level: 50,
    type: 'genesis',
    name: '3 månaders Premium + Genesis Status',
    description: 'VIP-behandling och 3 månaders gratis Premium',
    value: { days: 90, genesis_status: true },
    icon: '👑'
  }
]

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current level
    const { data: userStats } = await supabase
      .from('global_user_stats')
      .select('current_level, total_xp')
      .eq('user_id', user.id)
      .single()

    const currentLevel = userStats?.current_level || 1

    // Get all claimed rewards
    const { data: claimedRewards } = await supabase
      .from('user_reward_claims')
      .select('reward_id, premium_rewards!inner(milestone_level)')
      .eq('user_id', user.id)

    const claimedLevels = new Set(
      claimedRewards?.map((r: any) => r.premium_rewards?.milestone_level).filter(Boolean) || []
    )

    // Process milestones
    const milestones = await Promise.all(MILESTONE_REWARDS.map(async milestone => {
      const isUnlocked = currentLevel >= milestone.level
      const isClaimed = claimedLevels.has(milestone.level)

      let status: 'locked' | 'available' | 'claimed'
      if (isClaimed) {
        status = 'claimed'
      } else if (isUnlocked) {
        status = 'available'
      } else {
        status = 'locked'
      }

      // Calculate XP needed if locked
      let xpNeeded = 0
      if (!isUnlocked) {
        const { data: targetLevel } = await supabase
          .from('level_titles')
          .select('xp_required')
          .eq('level', milestone.level)
          .single()

        if (targetLevel) {
          xpNeeded = targetLevel.xp_required - (userStats?.total_xp || 0)
        }
      }

      return {
        ...milestone,
        status,
        xpNeeded,
        progress: isUnlocked ? 100 : Math.min(99, ((userStats?.total_xp || 0) / (xpNeeded + (userStats?.total_xp || 0))) * 100)
      }
    }))

    // Get next milestone
    const nextMilestone = milestones.find(m => m.status === 'locked')

    // Count statistics
    const stats = {
      totalMilestones: milestones.length,
      unlockedMilestones: milestones.filter(m => m.status !== 'locked').length,
      claimedMilestones: milestones.filter(m => m.status === 'claimed').length,
      availableMilestones: milestones.filter(m => m.status === 'available').length
    }

    return NextResponse.json({
      success: true,
      data: {
        milestones,
        nextMilestone,
        currentLevel,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}