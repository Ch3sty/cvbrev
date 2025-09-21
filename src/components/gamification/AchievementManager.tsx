// src/components/gamification/AchievementManager.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  } | null;
}

interface AchievementManagerProps {
  userId: string;
}

const AchievementManager: React.FC<AchievementManagerProps> = ({ userId }) => {
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());

  const checkNewAchievements = useCallback(async () => {
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
        // Filter out achievements where global_achievements is null
        const validAchievements = recentAchievements.filter(
          (achievement: any) => achievement.global_achievements !== null
        ) as unknown as Achievement[];
        setAchievementQueue(validAchievements);
      }
    } catch (error) {
      console.error('Error checking new achievements:', error);
    }
  }, [userId]);

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

          if (achievement && achievement.global_achievements) {
            setAchievementQueue(prev => [...prev, achievement as unknown as Achievement]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, checkNewAchievements]);

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

  if (!currentAchievement || !currentAchievement.global_achievements) return null;

  return (
    <AchievementUnlocked
      achievement={currentAchievement.global_achievements}
      onClose={handleAchievementClose}
    />
  );
};

export default AchievementManager;