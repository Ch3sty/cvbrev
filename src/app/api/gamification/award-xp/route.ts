// src/app/api/gamification/award-xp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface XPAwardRequest {
  amount: number;
  source: string;
  sourceId?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const body: XPAwardRequest = await request.json();

    const { amount, source, sourceId, description } = body;

    // Validate input
    if (!amount || !source) {
      return NextResponse.json(
        { error: 'Amount and source are required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is premium for multiplier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const multiplier = profile?.subscription_tier === 'premium' ? 1.5 : 1.0;
    const finalAmount = Math.round(amount * multiplier);

    // Start transaction
    const { data: stats, error: statsError } = await supabase
      .from('global_user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) {
      // Create stats if they don't exist
      const { error: createError } = await supabase
        .from('global_user_stats')
        .insert({
          user_id: user.id,
          total_xp: finalAmount,
          current_level: 1
        });

      if (createError) {
        console.error('Error creating stats:', createError);
        return NextResponse.json({ error: 'Failed to create stats' }, { status: 500 });
      }
    } else {
      // Update existing stats
      const newTotalXP = stats.total_xp + finalAmount;
      const newWeeklyXP = stats.weekly_xp + finalAmount;
      const newMonthlyXP = stats.monthly_xp + finalAmount;

      // Calculate new level based on total XP
      const { data: newLevelData, error: levelError } = await supabase
        .rpc('calculate_level_from_xp', { xp: newTotalXP });

      if (levelError) {
        console.error('Error calculating level:', levelError);
      }

      const newLevel = newLevelData || stats.current_level;

      // Update activity counts based on source
      const updates: any = {
        total_xp: newTotalXP,
        current_level: newLevel,
        weekly_xp: newWeeklyXP,
        monthly_xp: newMonthlyXP,
        last_activity_at: new Date().toISOString()
      };

      if (source === 'letter_created') updates.letters_created = stats.letters_created + 1;
      if (source === 'cv_analyzed') updates.cv_analyses_completed = stats.cv_analyses_completed + 1;
      if (source === 'cv_template_used') updates.cv_templates_used = stats.cv_templates_used + 1;
      if (source === 'profile_updated') updates.profile_updates = stats.profile_updates + 1;
      if (source === 'course_completed') updates.courses_completed = stats.courses_completed + 1;

      // Check and update streak
      const lastStreakDate = stats.last_streak_date
        ? new Date(stats.last_streak_date)
        : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastStreakDate) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastStreakDate.getTime() === yesterday.getTime()) {
          // Continue streak
          updates.daily_streak = stats.daily_streak + 1;
          updates.last_streak_date = today.toISOString().split('T')[0];
          if (updates.daily_streak > stats.longest_streak) {
            updates.longest_streak = updates.daily_streak;
          }
        } else if (lastStreakDate.getTime() !== today.getTime()) {
          // Streak broken
          updates.daily_streak = 1;
          updates.last_streak_date = today.toISOString().split('T')[0];
        }
      } else {
        // Start new streak
        updates.daily_streak = 1;
        updates.last_streak_date = today.toISOString().split('T')[0];
        updates.longest_streak = Math.max(1, stats.longest_streak || 0);
      }

      const { error: updateError } = await supabase
        .from('global_user_stats')
        .update(updates)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating stats:', updateError);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
      }

      // Record XP history
      const { error: historyError } = await supabase
        .from('xp_history')
        .insert({
          user_id: user.id,
          amount: finalAmount,
          source,
          source_id: sourceId,
          description: description || `+${finalAmount} XP`,
          multiplier
        });

      if (historyError) {
        console.error('Error recording XP history:', historyError);
      }

      // Check for achievements
      await checkAndAwardAchievements(supabase, user.id, updates, source);

      // Check for level milestone rewards if level increased
      if (newLevel > stats.current_level) {
        await checkAndCreateMilestoneRewards(supabase, user.id, stats.current_level, newLevel);
      }

      // Get updated stats
      const { data: updatedStats } = await supabase
        .from('global_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return NextResponse.json({
        success: true,
        xpAwarded: finalAmount,
        multiplier,
        newTotalXP: updatedStats?.total_xp || newTotalXP,
        newLevel: updatedStats?.current_level || stats.current_level,
        streak: updatedStats?.daily_streak || 1,
        leveledUp: newLevel > stats.current_level
      });
    }

  } catch (error) {
    console.error('Error awarding XP:', error);

    // Log more detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to award XP',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

async function checkAndCreateMilestoneRewards(
  supabase: any,
  userId: string,
  oldLevel: number,
  newLevel: number
) {
  try {
    const MILESTONE_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const rewardsToCreate = [];

    // Check which milestones were reached
    for (const milestone of MILESTONE_LEVELS) {
      if (oldLevel < milestone && newLevel >= milestone) {
        // User just reached this milestone
        let reward = null;

        switch (milestone) {
          case 5:
            reward = {
              user_id: userId,
              milestone_level: 5,
              reward_type: 'trial',
              reward_value: { days: 2 },
              name: '2 dagars Premium Trial',
              description: 'Grattis till level 5! Prova Premium i 2 dagar.',
              status: 'available'
            };
            break;
          case 10:
            reward = {
              user_id: userId,
              milestone_level: 10,
              reward_type: 'trial',
              reward_value: { days: 5 },
              name: '5 dagars Premium Trial',
              description: 'Fantastiskt, level 10! Upplev Premium i 5 dagar.',
              status: 'available'
            };
            break;
          case 15:
            reward = {
              user_id: userId,
              milestone_level: 15,
              reward_type: 'discount',
              reward_value: { discount_percent: 15, duration_months: 1 },
              name: '15% rabatt (1 månad)',
              description: 'Level 15 uppnådd! Få 15% rabatt på din första månad.',
              status: 'available'
            };
            break;
          case 20:
            reward = {
              user_id: userId,
              milestone_level: 20,
              reward_type: 'full_premium',
              reward_value: { days: 7 },
              name: '1 vecka gratis Premium',
              description: 'Otroligt, level 20! En hel vecka Premium väntar.',
              status: 'available'
            };
            break;
          case 25:
            reward = {
              user_id: userId,
              milestone_level: 25,
              reward_type: 'discount',
              reward_value: { discount_percent: 25, duration_months: 3 },
              name: '25% rabatt (3 månader)',
              description: 'Level 25! Spara 25% på 3 månaders Premium.',
              status: 'available'
            };
            break;
          case 30:
            reward = {
              user_id: userId,
              milestone_level: 30,
              reward_type: 'full_premium',
              reward_value: { days: 14 },
              name: '2 veckors gratis Premium',
              description: 'Imponerande! Level 30 ger dig 2 veckors Premium.',
              status: 'available'
            };
            break;
          case 35:
            reward = {
              user_id: userId,
              milestone_level: 35,
              reward_type: 'discount',
              reward_value: { discount_percent: 35, duration_months: 6 },
              name: '35% rabatt (6 månader)',
              description: 'Level 35! Stor rabatt på halvårsprenumeration.',
              status: 'available'
            };
            break;
          case 40:
            reward = {
              user_id: userId,
              milestone_level: 40,
              reward_type: 'full_premium',
              reward_value: { days: 30 },
              name: '1 månad gratis Premium',
              description: 'Enastående! Level 40 belönas med en hel månad Premium.',
              status: 'available'
            };
            break;
          case 45:
            reward = {
              user_id: userId,
              milestone_level: 45,
              reward_type: 'discount',
              reward_value: { discount_percent: 45, duration_months: 12 },
              name: '45% rabatt (12 månader)',
              description: 'Level 45! Nästan halva priset på årsprenumeration.',
              status: 'available'
            };
            break;
          case 50:
            reward = {
              user_id: userId,
              milestone_level: 50,
              reward_type: 'genesis',
              reward_value: { days: 90, genesis_status: true },
              name: '3 månaders Premium + Genesis Status',
              description: 'Legendarisk prestation! Level 50 ger dig Genesis-status.',
              status: 'available'
            };
            break;
        }

        if (reward) {
          rewardsToCreate.push(reward);
        }
      }
    }

    // Create rewards if any
    if (rewardsToCreate.length > 0) {
      const { error } = await supabase
        .from('premium_rewards')
        .insert(rewardsToCreate);

      if (error) {
        console.error('Error creating milestone rewards:', error);
      } else {
        console.log(`Created ${rewardsToCreate.length} milestone rewards for user ${userId}`);
      }
    }

    return rewardsToCreate.length;
  } catch (error) {
    console.error('Error checking milestone rewards:', error);
    return 0;
  }
}

async function checkAndAwardAchievements(
  supabase: any,
  userId: string,
  stats: any,
  source: string
) {
  try {
    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('global_achievements')
      .select('*');

    // Get user's existing achievements
    const { data: userAchievements } = await supabase
      .from('user_global_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(userAchievements?.map((a: any) => a.achievement_id) || []);
    const achievementsToUnlock = [];

    for (const achievement of allAchievements || []) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      // Check requirements
      switch (achievement.requirement_type) {
        case 'count':
          if (achievement.key === 'first_letter' && stats.letters_created >= 1) shouldUnlock = true;
          if (achievement.key === 'letter_master' && stats.letters_created >= 10) shouldUnlock = true;
          if (achievement.key === 'letter_legend' && stats.letters_created >= 50) shouldUnlock = true;
          if (achievement.key === 'first_cv_analysis' && stats.cv_analyses_completed >= 1) shouldUnlock = true;
          if (achievement.key === 'cv_optimizer' && stats.cv_analyses_completed >= 5) shouldUnlock = true;
          if (achievement.key === 'template_explorer' && stats.cv_templates_used >= 3) shouldUnlock = true;
          if (achievement.key === 'knowledge_seeker' && stats.courses_completed >= 1) shouldUnlock = true;
          if (achievement.key === 'skill_builder' && stats.courses_completed >= 5) shouldUnlock = true;
          if (achievement.key === 'learning_champion' && stats.courses_completed >= 20) shouldUnlock = true;
          break;

        case 'streak':
          if (achievement.key === 'week_warrior' && stats.daily_streak >= 7) shouldUnlock = true;
          if (achievement.key === 'month_master' && stats.daily_streak >= 30) shouldUnlock = true;
          if (achievement.key === 'dedication_legend' && stats.daily_streak >= 100) shouldUnlock = true;
          break;

        case 'level':
          if (achievement.key === 'rising_star' && stats.current_level >= 5) shouldUnlock = true;
          if (achievement.key === 'experienced_user' && stats.current_level >= 10) shouldUnlock = true;
          if (achievement.key === 'platform_expert' && stats.current_level >= 25) shouldUnlock = true;
          if (achievement.key === 'jobbcoach_legend' && stats.current_level >= 50) shouldUnlock = true;
          break;
      }

      if (shouldUnlock) {
        achievementsToUnlock.push({
          user_id: userId,
          achievement_id: achievement.id
        });

        // Award achievement XP
        await supabase
          .from('global_user_stats')
          .update({
            total_xp: stats.total_xp + achievement.xp_reward
          })
          .eq('user_id', userId);

        // Record achievement XP in history
        await supabase
          .from('xp_history')
          .insert({
            user_id: userId,
            amount: achievement.xp_reward,
            source: 'achievement',
            source_id: achievement.key,
            description: `Achievement unlocked: ${achievement.name}`
          });
      }
    }

    // Unlock new achievements
    if (achievementsToUnlock.length > 0) {
      await supabase
        .from('user_global_achievements')
        .insert(achievementsToUnlock);
    }

    return achievementsToUnlock.length;

  } catch (error) {
    console.error('Error checking achievements:', error);
    return 0;
  }
}