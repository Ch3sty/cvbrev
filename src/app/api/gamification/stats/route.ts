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

    // Get recent XP history
    const { data: recentXP, error: historyError } = await supabase
      .from('xp_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        ...stats,
        xpForNextLevel,
        xpForCurrentLevel,
        xpProgress: stats.total_xp - xpForCurrentLevel,
        xpNeeded: xpForNextLevel - xpForCurrentLevel
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