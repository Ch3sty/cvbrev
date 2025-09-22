'use client';
import { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Target, Star, Crown, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';

interface DashboardHeaderProps {
  user: any;
}

interface GamificationStats {
  stats: {
    total_xp: number;
    current_level: number;
    xpProgress: number;
    xpNeeded: number;
    daily_streak: number;
    weekly_xp: number;
    weekly_goal: number;
    letters_created: number;
    cv_analyses_completed: number;
    courses_completed: number;
    weekly_letters_goal: number;
    weekly_analyses_goal: number;
    weekly_courses_goal: number;
  };
  achievements: any[];
  recentXP: any[];
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch gamification stats
  useEffect(() => {
    fetchGamificationStats();

    // Set up real-time subscription for XP updates
    const supabase = getSupabaseClient();

    const subscription = supabase
      .channel('xp-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_user_stats',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.new && payload.old) {
            const newXP = (payload.new as any).total_xp;
            const oldXP = (payload.old as any).total_xp;
            if (newXP > oldXP) {
              setXpGainAmount(newXP - oldXP);
              setShowXPAnimation(true);
              setTimeout(() => setShowXPAnimation(false), 3000);
            }
          }
          fetchGamificationStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const fetchGamificationStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      if (response.ok) {
        const data = await response.json();
        setGamificationStats(data);
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Hämta användarnamn från user objekt
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Användare';
  };

  // Calculate XP progress percentage
  const getXPProgress = () => {
    if (!gamificationStats?.stats) return 0;
    const { xpProgress, xpNeeded } = gamificationStats.stats;
    return Math.round((xpProgress / xpNeeded) * 100);
  };

  // Calculate weekly goals progress
  const getWeeklyProgress = () => {
    if (!gamificationStats?.stats) return { xp: 0, letters: 0, analyses: 0, courses: 0 };
    const { weekly_xp, weekly_goal, letters_created, cv_analyses_completed, courses_completed, weekly_letters_goal, weekly_analyses_goal, weekly_courses_goal } = gamificationStats.stats;
    return {
      xp: Math.round((weekly_xp / weekly_goal) * 100),
      letters: Math.round((letters_created / weekly_letters_goal) * 100),
      analyses: Math.round((cv_analyses_completed / weekly_analyses_goal) * 100),
      courses: Math.round((courses_completed / weekly_courses_goal) * 100)
    };
  };

  // Get streak emoji and color
  const getStreakDisplay = (streak: number) => {
    if (streak >= 30) return { emoji: '🏆', color: 'from-yellow-400 via-orange-500 to-red-500', message: 'Streak-mästare! 🎉' };
    if (streak >= 14) return { emoji: '⭐', color: 'from-purple-400 via-pink-500 to-red-400', message: 'Otrolig dedication!' };
    if (streak >= 7) return { emoji: '🔥', color: 'from-orange-400 via-red-500 to-pink-500', message: 'Fantastisk streak!' };
    if (streak >= 3) return { emoji: '✨', color: 'from-blue-400 via-purple-500 to-pink-400', message: 'Fortsätt så!' };
    return { emoji: '💪', color: 'from-blue-400 via-purple-500 to-pink-400', message: streak === 1 ? 'Första dagen!' : 'Bra start!' };
  };

  // Get level badge styling based on progress
  const getLevelBadgeGlow = (progress: number) => {
    if (progress > 80) return 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse';
    if (progress > 50) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    return 'bg-gradient-to-r from-blue-500 to-purple-500';
  };

  return (
    <header className="bg-navy-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Vänster sida - Välkomstmeddelande */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-white">
              Välkommen tillbaka, {getUserName()}!
            </h1>
            <p className="text-sm text-gray-400">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>

          {/* Gamification Stats */}
          {gamificationStats && (
            <div className="flex items-center space-x-4 pl-6 border-l border-gray-700">
              {/* Compact Gamified Level Badge */}
              <Link href="/dashboard/rewards" className="relative group">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300">
                  {/* Level Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-navy-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {gamificationStats.stats.current_level}
                    </div>
                  </div>

                  {/* XP Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Level {gamificationStats.stats.current_level}</span>
                      <span className="text-xs text-purple-400">• {getXPProgress()}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-gray-400">{gamificationStats.stats.total_xp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24 h-1.5 bg-navy-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${getXPProgress()}%` }}
                    />
                  </div>

                  {/* Hover Arrow */}
                  <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              {/* Compact Next Milestone Preview */}
              <div className="px-3 py-2 bg-navy-800/50 rounded-lg border border-navy-700/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-400">Nästa milstolpe</p>
                    <p className="text-sm font-semibold text-white">Level {Math.ceil(gamificationStats.stats.current_level / 5) * 5 + 5}</p>
                  </div>
                </div>
              </div>

              {/* Compact Streak Display */}
              {gamificationStats.stats.daily_streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg border border-orange-600/30">
                  <span className="text-lg">
                    {getStreakDisplay(gamificationStats.stats.daily_streak).emoji}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-400">
                      {gamificationStats.stats.daily_streak}
                    </span>
                    <span className="text-xs text-orange-400/70">dagars streak</span>
                  </div>
                </div>
              )}

              {/* Gamified Weekly Goals */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-navy-800/50 to-navy-900/50 rounded-xl border border-navy-700/50">
                <Target className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-cyan-400">Veckans framsteg</span>
                    <span className="text-xs text-gray-400">{gamificationStats.stats.weekly_xp}/{gamificationStats.stats.weekly_goal} XP</span>
                  </div>

                  {/* Compact Progress Indicators */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="relative w-8 h-8 rounded-full bg-navy-700/50">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-t from-blue-500 to-cyan-500 transition-all duration-500"
                            style={{ height: `${Math.min(getWeeklyProgress().letters, 100)}%` }}
                          />
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {gamificationStats.stats.letters_created}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Brev</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="relative w-8 h-8 rounded-full bg-navy-700/50">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-t from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ height: `${Math.min(getWeeklyProgress().analyses, 100)}%` }}
                          />
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {gamificationStats.stats.cv_analyses_completed}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Analys</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="relative w-8 h-8 rounded-full bg-navy-700/50">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-t from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ height: `${Math.min(getWeeklyProgress().courses, 100)}%` }}
                          />
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {gamificationStats.stats.courses_completed}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Kurser</span>
                    </div>
                  </div>
                </div>

                {/* Quick Status */}
                <div className="ml-auto">
                  {getWeeklyProgress().xp >= 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 animate-pulse" />
                  ) : getWeeklyProgress().xp >= 70 ? (
                    <Star className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Höger sida - Användarinfo och snabblänkar */}
        <div className="flex items-center space-x-4">


          {/* Enhanced User Info */}
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-navy-800/50 transition-all duration-300 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-navy-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{getUserName()}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-purple-400 font-medium">
                    +{gamificationStats?.stats.weekly_xp || 0} XP denna vecka
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </Link>
        </div>
      </div>

      {/* Enhanced XP Animation */}
      {showXPAnimation && (
        <div
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
          style={{
            animation: 'xpFloatUp 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-green-400 to-emerald-400 rounded-full blur-xl opacity-40 scale-110"></div>

            {/* Main XP badge */}
            <div className="relative px-8 py-4 bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-500 rounded-full shadow-2xl border-2 border-white/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-white animate-pulse" />
                <span className="text-white font-bold text-xl tracking-wide">
                  +{xpGainAmount} XP
                </span>
                <span className="text-2xl animate-bounce">✨</span>
              </div>
            </div>

            {/* Particle effects */}
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    animation: `xpParticle 2s ease-out ${i * 0.2}s forwards`,
                    transform: `rotate(${i * 60}deg) translateX(20px)`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes xpFloatUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px) scale(1.1);
          }
          80% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px) scale(0.9);
          }
        }

        @keyframes xpParticle {
          0% {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) translateX(20px) scale(1);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateX(40px) scale(0);
          }
        }

        @keyframes fireFlicker {
          0% {
            transform: scale(1) rotate(-1deg);
          }
          50% {
            transform: scale(1.1) rotate(1deg);
          }
          100% {
            transform: scale(1.05) rotate(-0.5deg);
          }
        }
      `}</style>
    </header>
  );
}