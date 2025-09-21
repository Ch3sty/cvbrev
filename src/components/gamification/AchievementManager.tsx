// src/components/gamification/AchievementManager.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import AchievementUnlocked from './AchievementUnlocked';

interface Achievement {
  achievement_id: string;
  unlocked_at: string;
  global_achievements: {
    key: string;
    name: string;
    description: string;
    category: string;
    xp_reward: number;
    badge_color: string;
    icon?: string;
  };
}

interface AchievementManagerProps {
  userId: string;
}

const AchievementManager: React.FC<AchievementManagerProps> = ({ userId }) => {
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();

    // Check for new achievements on mount
    checkNewAchievements();

    // Set up real-time subscription for new achievements
    const subscription = supabase
      .channel('achievement-unlocks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_global_achievements',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Fetch the full achievement data
          const { data: achievement } = await supabase
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
            .eq('achievement_id', (payload.new as any).achievement_id)
            .eq('user_id', userId)
            .single();

          if (achievement) {
            setAchievementQueue(prev => [...prev, achievement]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const checkNewAchievements = async () => {
    try {
      const supabase = getSupabaseClient();

      // Get achievements unlocked in the last minute
      const oneMinuteAgo = new Date(Date.now() - 60000);

      const { data: recentAchievements } = await supabase
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
        .eq('user_id', userId)
        .gte('unlocked_at', oneMinuteAgo.toISOString())
        .order('unlocked_at', { ascending: true });

      if (recentAchievements && recentAchievements.length > 0) {
        setAchievementQueue(recentAchievements);
      }
    } catch (error) {
      console.error('Error checking new achievements:', error);
    }
  };

  // Process achievement queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setCurrentAchievement(next);
      setAchievementQueue(rest);
    }
  }, [currentAchievement, achievementQueue]);

  const handleAchievementClose = () => {
    setCurrentAchievement(null);
  };

  if (!currentAchievement) return null;

  return (
    <AchievementUnlocked
      achievement={currentAchievement.global_achievements}
      onClose={handleAchievementClose}
    />
  );
};

export default AchievementManager;