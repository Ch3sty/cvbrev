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
    const baseStyles = "relative w-16 h-16 rounded-xl flex items-center justify-center shadow-lg border-2 transition-all duration-300 group-hover:scale-105";

    switch (status) {
      case 'claimed':
        return `${baseStyles} bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 shadow-green-500/25`;
      case 'unlocked':
        return `${baseStyles} bg-gradient-to-br ${getRewardGradient(reward.reward_type, reward.is_special)} border-yellow-400 shadow-yellow-400/25 animate-pulse`;
      case 'upcoming':
        return `${baseStyles} bg-gradient-to-br from-blue-600/70 to-cyan-600/70 border-blue-400/80 shadow-blue-400/25`;
      default:
        return `${baseStyles} bg-navy-700 border-gray-600 opacity-60`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Progress Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-800 border-navy-700">
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-20" />

        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-xl">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-navy-900 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {userLevel.current_level}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {userLevel.title}
                </h2>
                <p className="text-gray-400 text-lg">
                  {userLevel.current_xp.toLocaleString()} XP • Level {userLevel.current_level}
                </p>
              </div>
            </div>

            {nextMilestone && (
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Nästa belöning:</div>
                <div className="text-2xl font-bold text-white mb-1">{nextMilestone.icon}</div>
                <div className="text-lg font-semibold text-purple-400">
                  {levelsToNext} {levelsToNext === 1 ? 'nivå' : 'nivåer'} kvar!
                </div>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Framsteg till nästa level</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>

            <div className="relative h-4 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
              {/* Removed shimmer animation that was causing constant loading appearance */}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{userLevel.total_xp_for_current_level.toLocaleString()} XP</span>
              <span>{userLevel.total_xp_for_next_level.toLocaleString()} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamified Milestone Path */}
      <Card className="bg-navy-800 border-navy-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Belöningsvägen
              </h3>
              <p className="text-gray-400 mt-1">
                Samla XP och lås upp exklusiva belöningar på din karriärresa
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Framsteg</div>
              <div className="text-lg font-semibold text-purple-400">
                {milestoneRewards.filter(r => r.is_unlocked).length} / {milestoneRewards.length}
              </div>
            </div>
          </div>

          {/* Milestone Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                  {/* Connection Path */}
                  {index < milestoneRewards.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-20 w-20 h-0.5 bg-gradient-to-r from-navy-600 to-navy-700 z-0" />
                  )}

                  {/* Achievement Badge */}
                  <div className="relative z-10 flex flex-col items-center space-y-3">
                    <div className={getStatusStyles(status, reward)}>
                      {/* Special Milestone Glow */}
                      {reward.is_special && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl blur opacity-30 animate-pulse" />
                      )}

                      {/* Reward Icon */}
                      <div className="text-2xl">
                        {status === 'claimed' ? (
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        ) : status === 'locked' ? (
                          <Lock className="w-6 h-6 text-gray-400" />
                        ) : (
                          reward.icon || getRewardIcon(reward.reward_type, undefined, reward.is_special)
                        )}
                      </div>

                      {/* Level Badge */}
                      <div className="absolute -top-2 -right-2 bg-navy-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border border-navy-600">
                        {reward.level}
                      </div>

                      {/* Status Indicator */}
                      {status === 'unlocked' && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <Sparkles className="w-3 h-3 text-navy-900" />
                        </div>
                      )}

                      {status === 'upcoming' && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Reward Info */}
                    <div className="text-center">
                      <h4 className="font-bold text-white text-sm mb-1">{reward.name}</h4>

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
                            ? 'bg-blue-600/20 text-blue-400 border-blue-400/50'
                            : ''
                        }`}
                      >
                        {getRewardValue(reward)}
                      </Badge>

                      {/* Motivational text */}
                      {status === 'upcoming' && (
                        <p className="text-xs text-blue-400 font-medium mt-1">
                          {reward.level - userLevel.current_level} {reward.level - userLevel.current_level === 1 ? 'nivå' : 'nivåer'} kvar!
                        </p>
                      )}
                    </div>

                    {/* Claim Button */}
                    {status === 'unlocked' && (
                      <Button
                        size="sm"
                        onClick={() => onClaimReward(reward.id)}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        Hämta
                      </Button>
                    )}
                  </div>

                  {/* Hover Details Card - Improved positioning to prevent clipping */}
                  {isHovered && (
                    <div
                      className={`absolute mb-4 z-50 animate-fadeIn ${
                        index >= milestoneRewards.length - 2
                          ? 'bottom-full right-0' // Position on right for last items
                          : index === 0
                          ? 'bottom-full left-0' // Position on left for first item
                          : 'bottom-full left-1/2 transform -translate-x-1/2' // Center for middle items
                      }`}
                    >
                      <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 shadow-2xl min-w-64 max-w-xs backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRewardGradient(reward.reward_type, reward.is_special)} flex items-center justify-center text-white`}>
                            <span className="text-lg">{reward.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{reward.name}</h4>
                            <p className="text-xs text-gray-400">Level {reward.level} Belöning</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-300 mb-3">{reward.description}</p>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {getRewardValue(reward)}
                          </Badge>

                          {status === 'upcoming' && (
                            <div className="text-xs text-blue-400 font-medium">
                              <ChevronRight className="w-3 h-3 inline mr-1" />
                              {reward.level - userLevel.current_level} nivåer kvar
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator pointing to the reward */}
                        <div className={`absolute top-full ${
                          index >= milestoneRewards.length - 2
                            ? 'right-4'
                            : index === 0
                            ? 'left-4'
                            : 'left-1/2 transform -translate-x-1/2'
                        } w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-navy-700`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Journey Progress */}
          <div className="mt-8 p-4 bg-navy-900/50 border border-navy-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-300">Din belöningsresa</span>
              <span className="text-sm text-purple-400">
                {Math.floor((userLevel.current_level / 50) * 100)}% genomförd
              </span>
            </div>
            <div className="relative h-2 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(userLevel.current_level / 50) * 100}%` }}
              />
              {/* Removed shimmer animation for cleaner appearance */}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
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