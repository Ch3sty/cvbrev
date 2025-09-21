// src/app/api/gamification/award-xp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface XPAwardRequest {
  amount: number;
  source: string;
  sourceId?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
      .from('user_profiles')
      .select('subscription_tier')
      .eq('user_id', user.id)
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

      // Update activity counts based on source
      const updates: any = {
        total_xp: newTotalXP,
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
        streak: updatedStats?.daily_streak || 1
      });
    }

  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
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