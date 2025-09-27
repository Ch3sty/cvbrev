'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Trophy,
  Gift,
  Zap,
  Star,
  Target,
  Lock,
  CheckCircle2,
  Sparkles,
  Users,
  Calendar,
  Percent,
  Clock,
  ChevronRight,
  Award,
  Gem
} from 'lucide-react';

interface UserLevel {
  current_level: number;
  current_xp: number;
  title: string;
  xp_to_next_level: number;
  total_xp_for_current_level: number;
  total_xp_for_next_level: number;
}

interface GameifiedReward {
  id: string;
  level: number;
  name: string;
  description: string;
  reward_type: 'trial' | 'discount' | 'premium_time' | 'status';
  reward_data: any;
  icon?: string;
  is_unlocked: boolean;
  is_claimed: boolean;
  is_special?: boolean;
}

interface GameifiedRewardsViewProps {
  userLevel: UserLevel;
  onClaimReward: (rewardId: string) => void;
}

const GameifiedRewardsView: React.FC<GameifiedRewardsViewProps> = ({
  userLevel,
  onClaimReward
}) => {
  const [hoveredReward, setHoveredReward] = useState<number | null>(null);

  // Define the actual reward structure based on requirements
  const milestoneRewards: GameifiedReward[] = [
    {
      id: 'level-5',
      level: 5,
      name: 'Första Smaken',
      description: '2 dagars Premium för att testa alla funktioner',
      reward_type: 'trial',
      reward_data: { duration_days: 2 },
      icon: '🎯',
      is_unlocked: userLevel.current_level >= 5,
      is_claimed: false
    },
    {
      id: 'level-10',
      level: 10,
      name: 'Dedikerad Användare',
      description: '5 dagars Premium för kontinuerlig användning',
      reward_type: 'trial',
      reward_data: { duration_days: 5 },
      icon: '🚀',
      is_unlocked: userLevel.current_level >= 10,
      is_claimed: false
    },
    {
      id: 'level-15',
      level: 15,
      name: 'Smart Sparare',
      description: '15% rabatt på nästa Premium-period',
      reward_type: 'discount',
      reward_data: { percentage: 15 },
      icon: '💰',
      is_unlocked: userLevel.current_level >= 15,
      is_claimed: false
    },
    {
      id: 'level-20',
      level: 20,
      name: 'Erfaren Expert',
      description: '7 dagars Premium för din expertis',
      reward_type: 'premium_time',
      reward_data: { duration_days: 7 },
      icon: '🎓',
      is_unlocked: userLevel.current_level >= 20,
      is_claimed: false
    },
    {
      id: 'level-25',
      level: 25,
      name: 'Premium Vän',
      description: '25% rabatt för lojalitet',
      reward_type: 'discount',
      reward_data: { percentage: 25 },
      icon: '🏆',
      is_unlocked: userLevel.current_level >= 25,
      is_claimed: false
    },
    {
      id: 'level-30',
      level: 30,
      name: 'Karriärmästare',
      description: '14 dagars Premium för din framgång',
      reward_type: 'premium_time',
      reward_data: { duration_days: 14 },
      icon: '⭐',
      is_unlocked: userLevel.current_level >= 30,
      is_claimed: false
    },
    {
      id: 'level-35',
      level: 35,
      name: 'Storsparare',
      description: '35% rabatt för avancerade användare',
      reward_type: 'discount',
      reward_data: { percentage: 35 },
      icon: '💎',
      is_unlocked: userLevel.current_level >= 35,
      is_claimed: false
    },
    {
      id: 'level-40',
      level: 40,
      name: 'Elite Medlem',
      description: 'Hela 30 dagars Premium åtkomst',
      reward_type: 'premium_time',
      reward_data: { duration_days: 30 },
      icon: '👑',
      is_unlocked: userLevel.current_level >= 40,
      is_claimed: false
    },
    {
      id: 'level-45',
      level: 45,
      name: 'Mästarrabatt',
      description: 'Exklusiv 45% rabatt för mästare',
      reward_type: 'discount',
      reward_data: { percentage: 45 },
      icon: '🌟',
      is_unlocked: userLevel.current_level >= 45,
      is_claimed: false
    },
    {
      id: 'level-50',
      level: 50,
      name: 'Genesis Status',
      description: 'Exklusiv Genesis Status + 90 dagars Premium',
      reward_type: 'status',
      reward_data: { status: 'Genesis', duration_days: 90 },
      icon: '🔥',
      is_unlocked: userLevel.current_level >= 50,
      is_claimed: false,
      is_special: true
    }
  ];

  // Calculate progress percentage for current level
  const progressPercentage = userLevel.total_xp_for_next_level > 0
    ? ((userLevel.current_xp - userLevel.total_xp_for_current_level) /
       (userLevel.total_xp_for_next_level - userLevel.total_xp_for_current_level)) * 100
    : 0;

  // Find next achievable milestone
  const nextMilestone = milestoneRewards.find(reward => reward.level > userLevel.current_level);
  const levelsToNext = nextMilestone ? nextMilestone.level - userLevel.current_level : 0;

  const getRewardIcon = (type: string, customIcon?: string, isSpecial?: boolean) => {
    if (customIcon) return customIcon;

    if (isSpecial) {
      return <Crown className="w-6 h-6" />;
    }

    const iconMap = {
      trial: <Zap className="w-5 h-5" />,
      discount: <Percent className="w-5 h-5" />,
      premium_time: <Clock className="w-5 h-5" />,
      status: <Trophy className="w-5 h-5" />
    };

    return iconMap[type as keyof typeof iconMap] || <Gift className="w-5 h-5" />;
  };

  const getRewardGradient = (type: string, isSpecial?: boolean) => {
    if (isSpecial) {
      return 'from-yellow-400 via-orange-500 to-red-500';
    }

    const gradients = {
      trial: 'from-blue-500 to-cyan-500',
      discount: 'from-green-500 to-emerald-500',
      premium_time: 'from-purple-500 to-pink-500',
      status: 'from-pink-500 to-purple-600'
    };

    return gradients[type as keyof typeof gradients] || 'from-purple-500 to-pink-500';
  };

  const getRewardValue = (reward: GameifiedReward) => {
    const data = reward.reward_data;

    switch (reward.reward_type) {
      case 'trial':
        return `${data.duration_days} dagar`;
      case 'discount':
        return `${data.percentage}% rabatt`;
      case 'premium_time':
        return `${data.duration_days} dagar`;
      case 'status':
        return `${data.status} + ${data.duration_days} dagar`;
      default:
        return 'Belöning';
    }
  };

  const getRewardStatus = (reward: GameifiedReward) => {
    if (reward.is_claimed) return 'claimed';
    if (reward.is_unlocked) return 'unlocked';

    const levelDiff = reward.level - userLevel.current_level;
    if (levelDiff <= 3) return 'upcoming';
    return 'locked';
  };

  const getStatusStyles = (status: string, reward: GameifiedReward) => {
    const baseStyles = "relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3";

    switch (status) {
      case 'claimed':
        return `${baseStyles} bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 shadow-green-500/30`;
      case 'unlocked':
        return `${baseStyles} bg-gradient-to-br ${getRewardGradient(reward.reward_type, reward.is_special)} border-yellow-400 shadow-yellow-400/40 animate-pulse`;
      case 'upcoming':
        return `${baseStyles} bg-gradient-to-br from-blue-500/80 to-cyan-500/80 border-blue-400 shadow-blue-400/30`;
      default:
        return `${baseStyles} bg-gradient-to-br ${getRewardGradient(reward.reward_type, reward.is_special)} border-gray-300 shadow-gray-200/30 opacity-50 grayscale`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Progress Card - Light Theme */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-xl">
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-10" />

        <CardContent className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  {userLevel.current_level}
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {userLevel.title}
                </h2>
                <p className="text-gray-600 text-xl">
                  {userLevel.current_xp.toLocaleString()} XP • Level {userLevel.current_level}
                </p>
              </div>
            </div>

            {nextMilestone && (
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Nästa belöning:</div>
                <div className="text-3xl font-bold mb-1">{nextMilestone.icon}</div>
                <div className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {levelsToNext} {levelsToNext === 1 ? 'nivå' : 'nivåer'} kvar!
                </div>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-medium">Framsteg till nästa level</span>
              <span className="font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
            </div>

            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>{userLevel.total_xp_for_current_level.toLocaleString()} XP</span>
              <span>{userLevel.total_xp_for_next_level.toLocaleString()} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Milestone Path */}
      <Card className="bg-white/90 backdrop-blur-lg border border-gray-200/50 shadow-xl overflow-visible">
        <CardContent className="p-8 overflow-visible">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Belöningsvägen
              </h3>
              <p className="text-gray-600 mt-2 text-lg">
                Samla XP och lås upp exklusiva belöningar på din karriärresa
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 font-medium">Framsteg</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {milestoneRewards.filter(r => r.is_unlocked).length} / {milestoneRewards.length}
              </div>
            </div>
          </div>

          {/* Premium Milestone Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-20 overflow-visible">
            {milestoneRewards.map((reward, index) => {
              const status = getRewardStatus(reward);
              const isHovered = hoveredReward === reward.level;

              return (
                <div
                  key={reward.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredReward(reward.level)}
                  onMouseLeave={() => setHoveredReward(null)}
                >
                  {/* Connection Path - Removed for cleaner design */}

                  {/* Achievement Badge */}
                  <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className={getStatusStyles(status, reward)}>
                      {/* Special Milestone Glow */}
                      {reward.is_special && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur opacity-30 animate-pulse" />
                      )}

                      {/* Reward Icon */}
                      <div className={`text-3xl ${status === 'locked' ? 'opacity-40 grayscale' : ''}`}>
                        {status === 'claimed' ? (
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        ) : (
                          reward.icon || getRewardIcon(reward.reward_type, undefined, reward.is_special)
                        )}
                      </div>

                      {/* Level Badge */}
                      <div className="absolute -top-2 -right-2 bg-white text-gray-900 text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-gray-200 shadow-lg">
                        {reward.level}
                      </div>

                      {/* Status Indicator */}
                      {status === 'unlocked' && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {status === 'upcoming' && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Reward Info */}
                    <div className="text-center">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{reward.name}</h4>

                      {/* Enhanced Value Badge */}
                      <Badge
                        variant={
                          status === 'claimed' ? 'success'
                          : status === 'unlocked' ? 'default'
                          : status === 'upcoming' ? 'secondary'
                          : 'outline'
                        }
                        className={`text-xs font-semibold ${
                          status === 'unlocked'
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0 animate-pulse'
                            : status === 'upcoming'
                            ? 'bg-blue-600/20 text-blue-600 border-blue-400/50'
                            : ''
                        }`}
                      >
                        {getRewardValue(reward)}
                      </Badge>

                      {/* Motivational text */}
                      {status === 'upcoming' && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {reward.level - userLevel.current_level} {reward.level - userLevel.current_level === 1 ? 'nivå' : 'nivåer'} kvar!
                        </p>
                      )}
                    </div>

                    {/* Claim Button */}
                    {status === 'unlocked' && (
                      <Button
                        size="sm"
                        onClick={() => onClaimReward(reward.id)}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:scale-105"
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        Hämta
                      </Button>
                    )}
                  </div>

                  {/* Hover Details Card - Premium styling */}
                  {isHovered && (
                    <div
                      className={`absolute mt-4 z-[100] animate-fadeIn ${
                        index >= milestoneRewards.length - 2
                          ? 'top-full right-0'
                          : index === 0
                          ? 'top-full left-0'
                          : 'top-full left-1/2 transform -translate-x-1/2'
                      }`}
                    >
                      <div className="bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-xl p-6 shadow-2xl min-w-72 max-w-sm">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRewardGradient(reward.reward_type, reward.is_special)} flex items-center justify-center text-white shadow-lg`}>
                            <span className="text-xl">{reward.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{reward.name}</h4>
                            <p className="text-xs text-gray-500">Level {reward.level} Belöning</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">{reward.description}</p>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
                            {getRewardValue(reward)}
                          </Badge>

                          {status === 'upcoming' && (
                            <div className="text-xs text-blue-600 font-medium flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1" />
                              {reward.level - userLevel.current_level} nivåer kvar
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator pointing to the reward */}
                        <div className={`absolute top-full ${
                          index >= milestoneRewards.length - 2
                            ? 'right-6'
                            : index === 0
                            ? 'left-6'
                            : 'left-1/2 transform -translate-x-1/2'
                        } w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-200`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Premium Journey Progress */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50 rounded-2xl shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Din belöningsresa</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.floor((userLevel.current_level / 50) * 100)}% genomförd
              </span>
            </div>
            <div className="relative h-4 bg-white rounded-full overflow-hidden shadow-inner border border-gray-200">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${(userLevel.current_level / 50) * 100}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-3 font-medium">
              <span>Nybörjare</span>
              <span>Genesis Mästare</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameifiedRewardsView;