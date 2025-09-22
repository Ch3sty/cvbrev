'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, Settings, User, Trophy, Zap, TrendingUp, Calendar, Target, BookOpen, Clock, Award, Star, Flame, Gift } from 'lucide-react';
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
              {/* Level Badge - Now clickable! */}
              <Link href="/dashboard/rewards" className="relative group cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20 backdrop-blur-sm hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-xl tracking-wide">
                    {gamificationStats.stats.current_level}
                  </span>
                </div>

                {/* Enhanced Progress Ring */}
                <svg className="absolute -inset-2 w-20 h-20 transform -rotate-90">
                  {/* Background Ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                    fill="none"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="url(#levelGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${getXPProgress() * 2.26} 226`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out drop-shadow-sm"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(232, 121, 249, 0.4))'
                    }}
                  />
                  <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Hover Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-navy-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-navy-700 shadow-xl">
                  Level {gamificationStats.stats.current_level} • {getXPProgress()}% till nästa • Klicka för belöningar!
                </div>
              </Link>

              {/* XP Stats */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-semibold">
                    {gamificationStats.stats.total_xp.toLocaleString()} XP
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{gamificationStats.stats.xpProgress}/{gamificationStats.stats.xpNeeded} till nästa level</span>
                </div>
              </div>

              {/* Enhanced Streak Display */}
              {gamificationStats.stats.daily_streak > 0 && (
                <div className="relative group">
                  <div className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${getStreakDisplay(gamificationStats.stats.daily_streak).color.replace('from-', 'from-').replace('via-', '/20 via-').replace('to-', '/20 to-') + '/20'} rounded-full border ${gamificationStats.stats.daily_streak >= 7 ? 'border-orange-500/60 animate-pulse' : 'border-orange-500/40'} backdrop-blur-sm shadow-lg`}>
                    <span
                      className="text-xl"
                      style={{
                        animation: gamificationStats.stats.daily_streak >= 7 ? 'fireFlicker 1.5s ease-in-out infinite alternate' : undefined
                      }}
                    >
                      {getStreakDisplay(gamificationStats.stats.daily_streak).emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-orange-400 font-bold text-sm tracking-wide">
                        {gamificationStats.stats.daily_streak} dagar
                      </span>
                      <span className="text-orange-300/70 text-xs">
                        {getStreakDisplay(gamificationStats.stats.daily_streak).message}
                      </span>
                    </div>
                  </div>

                  {/* Streak tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-navy-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-navy-700 shadow-xl">
                    {getStreakDisplay(gamificationStats.stats.daily_streak).message}
                  </div>
                </div>
              )}

              {/* Weekly Goals Widget - More Playful */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-navy-800 to-navy-900 p-3 rounded-xl border border-navy-700 shadow-lg hover:shadow-2xl transition-all duration-300 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-cyan-400">VECKANS MÅL</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {gamificationStats.stats.weekly_xp}/{gamificationStats.stats.weekly_goal} XP
                    </span>
                  </div>

                  {/* Main XP Progress */}
                  <div className="mb-3">
                    <div className="w-full bg-navy-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 relative ${
                          getWeeklyProgress().xp >= 100
                            ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 animate-pulse'
                            : getWeeklyProgress().xp >= 70
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                            : 'bg-gradient-to-r from-blue-400 to-purple-400'
                        }`}
                        style={{ width: `${Math.min(getWeeklyProgress().xp, 100)}%` }}
                      >
                        {getWeeklyProgress().xp >= 100 && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-center mt-1 font-semibold">
                      {getWeeklyProgress().xp >= 100 ? (
                        <span className="text-green-400">Mål uppnått! 🎯</span>
                      ) : getWeeklyProgress().xp >= 70 ? (
                        <span className="text-yellow-400">Nästan i mål! 💪</span>
                      ) : (
                        <span className="text-gray-400">Fortsätt kämpa! 🚀</span>
                      )}
                    </p>
                  </div>

                  {/* Mini Goals Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Brev</div>
                      <div className="relative h-1 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getWeeklyProgress().letters >= 100 ? 'bg-green-400' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min(getWeeklyProgress().letters, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {gamificationStats.stats.letters_created}/{gamificationStats.stats.weekly_letters_goal}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Analys</div>
                      <div className="relative h-1 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getWeeklyProgress().analyses >= 100 ? 'bg-green-400' : 'bg-purple-400'}`}
                          style={{ width: `${Math.min(getWeeklyProgress().analyses, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {gamificationStats.stats.cv_analyses_completed}/{gamificationStats.stats.weekly_analyses_goal}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Kurser</div>
                      <div className="relative h-1 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getWeeklyProgress().courses >= 100 ? 'bg-green-400' : 'bg-pink-400'}`}
                          style={{ width: `${Math.min(getWeeklyProgress().courses, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {gamificationStats.stats.courses_completed}/{gamificationStats.stats.weekly_courses_goal}
                      </div>
                    </div>
                  </div>

                  {/* Hover tooltip with details */}
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-navy-800 text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-navy-700 shadow-xl z-50">
                    <div className="space-y-1">
                      <div>📝 Skapa {gamificationStats.stats.weekly_letters_goal} brev = 125 XP</div>
                      <div>🔍 Gör {gamificationStats.stats.weekly_analyses_goal} analyser = 120 XP</div>
                      <div>📚 Slutför {gamificationStats.stats.weekly_courses_goal} kurser = 100 XP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Höger sida - Användarinfo och snabblänkar */}
        <div className="flex items-center space-x-4">
          {/* Sökfunktion */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sök i dina brev..."
              className="bg-navy-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-pink-500 w-64"
            />
          </div>

          {/* Enhanced Achievements/Notifications */}
          <button className="relative p-3 rounded-xl hover:bg-navy-800/60 transition-all duration-300 group hover:scale-105">
            <Trophy
              className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-all duration-300"
              style={{
                filter: gamificationStats && gamificationStats.achievements.length > 0
                  ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
                  : 'none'
              }}
            />
            {gamificationStats && gamificationStats.achievements.length > 0 && (
              <div className="absolute -top-2 -right-2">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur animate-pulse scale-125" />
                {/* Badge */}
                <span className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-xl animate-bounce">
                  {gamificationStats.achievements.length}
                </span>
              </div>
            )}
          </button>

          {/* Användarinfo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {getUserName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{getUserName()}</span>
              <span className="text-xs text-gray-400">
                Level {gamificationStats?.stats.current_level || 1} • {gamificationStats?.stats.weekly_xp || 0} XP denna vecka
              </span>
            </div>
          </div>
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