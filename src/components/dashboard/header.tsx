'use client';
import { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Target, Star, Crown, CheckCircle2, Sparkles, ChevronRight, Menu } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';

interface DashboardHeaderProps {
  user: any;
  onMenuClick?: () => void;
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

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free');

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

        // Check subscription tier
        const supabase = getSupabaseClient();
        try {
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

          if (authError) {
            console.error('Auth error in header:', authError);
            return;
          }

          if (authUser && authUser.id) {
            // Ensure authUser.id is a string, not an array or undefined
            const userId = typeof authUser.id === 'string' ? authUser.id : null;

            if (!userId) {
              console.error('Invalid user ID format in header');
              return;
            }

            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('premium_until')
              .eq('id', userId)
              .single();

            if (profileError) {
              console.error('Profile query error in header:', profileError);
              // Set to free if there's an error
              setSubscriptionTier('free');
              return;
            }

            const isPremium = profile?.premium_until && new Date(profile.premium_until) > new Date();
            setSubscriptionTier(isPremium ? 'premium' : 'free');
          }
        } catch (error) {
          console.error('Error checking subscription in header:', error);
          setSubscriptionTier('free');
        }
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
    <header className="bg-white border-b border-slate-300 px-3 sm:px-4 md:px-6 py-3 md:py-4 shadow-lg relative z-10">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors lg:hidden touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Öppna meny"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Vänster sida - Välkomstmeddelande */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-1 min-w-0">
          {/* Mobile: Compact welcome */}
          <div className="flex flex-col lg:hidden min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Hej, {getUserName().split(' ')[0]}!
            </h1>
            <p className="text-xs text-slate-700 font-medium">
              {formatTime(currentTime)}
            </p>
          </div>

          {/* Desktop: Full welcome */}
          <div className="hidden lg:flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900">
              Välkommen tillbaka, {getUserName()}!
            </h1>
            <p className="text-sm text-slate-700 font-medium">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>

          {/* Mobile: Mini Gamification Badge */}
          {gamificationStats && (
            <Link href="/dashboard/rewards" className="lg:hidden touch-manipulation min-h-[44px] flex items-center">
              <div className="flex items-center gap-2 px-2 py-2 sm:py-1.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-300 hover:border-pink-400 transition-all shadow-sm min-h-[44px]">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-yellow-500 text-navy-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {gamificationStats.stats.current_level}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Lvl {gamificationStats.stats.current_level}</span>
                  <div className="flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-yellow-500" />
                    <span className="text-[10px] text-slate-700 font-medium">{gamificationStats.stats.total_xp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Desktop: Full Gamification Stats */}
          {gamificationStats && (
            <div className="hidden lg:flex items-center space-x-4 pl-6 border-l border-slate-300">
              {/* Compact Gamified Level Badge */}
              <Link href="/dashboard/rewards" className="relative group">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-300 hover:border-pink-400 hover:shadow-xl transition-all duration-300 shadow-lg">
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
                      <span className="text-sm font-bold text-slate-900">Level {gamificationStats.stats.current_level}</span>
                      <span className="text-xs text-purple-700 font-semibold">• {getXPProgress()}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-slate-700 font-medium">{gamificationStats.stats.total_xp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${getXPProgress()}%` }}
                      />
                    </div>
                    {/* Weekly Activity moved here */}
                    <div className="text-[10px] text-purple-700 text-center font-bold">
                      +{gamificationStats.stats.weekly_xp} XP denna vecka
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <ChevronRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Compact Next Milestone Preview */}
              <div className="px-3 py-2 bg-slate-100 rounded-xl border border-slate-300 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-700 font-medium">Nästa milstolpe</p>
                    <p className="text-sm font-bold text-slate-900">Level {Math.ceil(gamificationStats.stats.current_level / 5) * 5 + 5}</p>
                  </div>
                </div>
              </div>

              {/* Compact Streak Display */}
              {gamificationStats.stats.daily_streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-300 shadow-sm">
                  <span className="text-lg">
                    {getStreakDisplay(gamificationStats.stats.daily_streak).emoji}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-700">
                      {gamificationStats.stats.daily_streak}
                    </span>
                    <span className="text-xs text-orange-700 font-medium">dagars streak</span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Höger sida - Användarinfo och snabblänkar */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile: Compact User Avatar Only */}
          <Link href="/dashboard/profil" className="lg:hidden touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center">
            <div className="relative">
              <div className="w-10 h-10 sm:w-9 sm:h-9 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          </Link>

          {/* Desktop: Enhanced User Info */}
          <Link href="/dashboard/profil" className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-300 group shadow-sm hover:shadow-md">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{getUserName()}</p>
              <p className="text-xs text-slate-700 font-medium">Klicka för att visa profil</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-auto" />
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