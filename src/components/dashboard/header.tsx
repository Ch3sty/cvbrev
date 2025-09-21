'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, Settings, User, Trophy, Zap, TrendingUp } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

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
  };
  achievements: any[];
  recentXP: any[];
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);

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
              {/* Level Badge */}
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {gamificationStats.stats.current_level}
                  </span>
                </div>
                {/* Progress Ring */}
                <svg className="absolute -inset-1 w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${getXPProgress() * 1.76} 176`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

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

              {/* Streak */}
              {gamificationStats.stats.daily_streak > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30">
                  <span className="text-orange-400">🔥</span>
                  <span className="text-orange-400 font-semibold text-sm">
                    {gamificationStats.stats.daily_streak} dagar
                  </span>
                </div>
              )}
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

          {/* Achievements/Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-navy-800 transition-colors group">
            <Trophy className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            {gamificationStats && gamificationStats.achievements.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {gamificationStats.achievements.length}
              </span>
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
                Level {gamificationStats?.stats.current_level || 1} • Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Animation */}
      {showXPAnimation && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl">
            <span className="text-white font-bold text-lg">
              +{xpGainAmount} XP! ✨
            </span>
          </div>
        </div>
      )}
    </header>
  );
}