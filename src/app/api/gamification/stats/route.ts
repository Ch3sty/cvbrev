// src/app/api/gamification/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user stats
    const { data: statsData, error: statsError } = await supabase
      .from('global_user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let stats = statsData;

    // If no stats exist, create them
    if (!stats) {
      const { data: newStats, error: createError } = await supabase
        .from('global_user_stats')
        .insert({
          user_id: user.id,
          total_xp: 0,
          current_level: 1
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating stats:', createError);
        return NextResponse.json({ error: 'Failed to create stats' }, { status: 500 });
      }

      stats = newStats;
    }

    // Calculate XP for next level
    const { data: nextLevelData, error: funcError } = await supabase
      .rpc('xp_for_next_level', { current_xp: stats.total_xp });

    if (funcError) {
      console.error('Error calling xp_for_next_level function:', funcError);
      // Use fallback calculation instead of failing
    }

    const xpForNextLevel = nextLevelData || ((stats.current_level + 1) * 100);
    const xpForCurrentLevel = stats.current_level > 1
      ? ((stats.current_level - 1) * 50 + (stats.current_level - 1) * (stats.current_level) * 25)
      : 0;

    // Get user achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_global_achievements')
      .select(`
        achievement_id,
        unlocked_at,
        global_achievements (
          key,
          name,
          description,
          category,
          xp_reward,
          badge_color,
          icon
        )
      `)
      .eq('user_id', user.id);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      // Continue with empty array instead of failing
    }

    // Get recent XP history
    const { data: recentXP, error: historyError } = await supabase
      .from('xp_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching XP history:', historyError);
      // Continue with empty array instead of failing
    }

    // Calculate current week start and end
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    // Get weekly XP progress
    const { data: weeklyXP, error: weeklyXPError } = await supabase
      .from('xp_history')
      .select('amount')
      .eq('user_id', user.id)
      .gte('created_at', startOfWeek.toISOString())
      .lte('created_at', endOfWeek.toISOString());

    if (weeklyXPError) {
      console.error('Error fetching weekly XP:', weeklyXPError);
      // Continue with 0 instead of failing
    }

    const weekly_xp = weeklyXP?.reduce((sum, xp) => sum + xp.amount, 0) || 0;

    // Get weekly activity counts from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('weekly_letter_count, weekly_analysis_count, weekly_competence_analysis_count')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError);
      // Continue with default values instead of failing
    }

    // Get completed courses this week from completed_courses table
    const { data: weeklyCoursesData, error: weeklyCoursesError } = await supabase
      .from('completed_courses')
      .select('id')
      .eq('user_id', user.id)
      .gte('completion_date', startOfWeek.toISOString().split('T')[0])
      .lte('completion_date', endOfWeek.toISOString().split('T')[0]);

    if (weeklyCoursesError) {
      console.error('Error fetching weekly courses data:', weeklyCoursesError);
      // Continue with 0 instead of failing
    }

    const weekly_courses_completed = weeklyCoursesData?.length || 0;

    // Weekly goals (these could be user-configurable in the future)
    const weeklyGoals = {
      weekly_goal: 600, // XP goal for the week
      weekly_letters_goal: 5, // Letter creation goal
      weekly_analyses_goal: 3, // CV analysis goal
      weekly_courses_goal: 2 // Course completion goal
    };

    return NextResponse.json({
      stats: {
        ...stats,
        xpForNextLevel,
        xpForCurrentLevel,
        xpProgress: stats.total_xp - xpForCurrentLevel,
        xpNeeded: xpForNextLevel - xpForCurrentLevel,
        weekly_xp,
        letters_created: profileData?.weekly_letter_count || 0,
        cv_analyses_completed: (profileData?.weekly_analysis_count || 0) + (profileData?.weekly_competence_analysis_count || 0),
        courses_completed: weekly_courses_completed,
        ...weeklyGoals
      },
      achievements: achievements || [],
      recentXP: recentXP || []
    });

  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}