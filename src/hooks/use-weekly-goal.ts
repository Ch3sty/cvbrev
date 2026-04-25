'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface WeeklyGoalState {
  weekly_xp: number;
  weekly_goal_xp: number;
  progress: number;
  daysUntilReset: number;
  loading: boolean;
}

function daysUntilStockholmMonday(): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    weekday: 'short',
  });
  const wd = fmt.formatToParts(new Date()).find(p => p.type === 'weekday')?.value ?? 'Mon';
  const map: Record<string, number> = {
    Mon: 7, Tue: 6, Wed: 5, Thu: 4, Fri: 3, Sat: 2, Sun: 1,
  };
  return map[wd] ?? 7;
}

export function useWeeklyGoal() {
  const [state, setState] = useState<WeeklyGoalState>({
    weekly_xp: 0,
    weekly_goal_xp: 150,
    progress: 0,
    daysUntilReset: 7,
    loading: true,
  });
  const supabase = getSupabaseClient();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/gamification/stats');
      if (!res.ok) {
        setState(s => ({ ...s, loading: false }));
        return;
      }
      const json = await res.json();
      const weekly_xp = json.stats?.weekly_xp ?? 0;
      const weekly_goal_xp = json.stats?.weekly_goal_xp ?? 150;
      setState({
        weekly_xp,
        weekly_goal_xp,
        progress: weekly_goal_xp > 0 ? Math.min(1, weekly_xp / weekly_goal_xp) : 0,
        daysUntilReset: daysUntilStockholmMonday(),
        loading: false,
      });
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      channel = supabase
        .channel(`xp-history-self-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'xp_history',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchStats()
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchStats]);

  const setGoal = useCallback(
    async (goal: number) => {
      const { error } = await supabase.rpc('set_weekly_goal_xp', { p_goal: goal });
      if (!error) {
        setState(s => ({
          ...s,
          weekly_goal_xp: goal,
          progress: goal > 0 ? Math.min(1, s.weekly_xp / goal) : 0,
        }));
      }
      return { error };
    },
    [supabase]
  );

  return { ...state, setGoal, refresh: fetchStats };
}
