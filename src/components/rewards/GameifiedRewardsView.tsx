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
  Gem,
  Tag,
  ChevronDown,
  ChevronUp
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
  reward_type: 'trial' | 'discount' | 'premium_time' | 'status' | 'guest_invitations';
  reward_data: any;
  is_unlocked: boolean;
  is_claimed: boolean;
  is_special?: boolean;
}

interface GameifiedRewardsViewProps {
  userLevel: UserLevel;
  rewards: any[];
  onClaimReward: (rewardId: string) => void;
}

const GameifiedRewardsView: React.FC<GameifiedRewardsViewProps> = ({
  userLevel,
  rewards,
  onClaimReward
}) => {
  const [expandedReward, setExpandedReward] = useState<string | null>(null);

  // Map database rewards to component format
  const milestoneRewards: GameifiedReward[] = rewards.map(reward => ({
    id: reward.id,
    level: reward.trigger_value || reward.milestone_level,
    name: reward.name,
    description: reward.description,
    reward_type: reward.reward_type,
    reward_data: reward.reward_data,
    is_unlocked: reward.is_unlocked,
    is_claimed: reward.is_claimed,
    is_special: (reward.trigger_value || reward.milestone_level) >= 40
  }));

  // Calculate progress percentage for current level
  const progressPercentage = userLevel.total_xp_for_next_level > 0
    ? ((userLevel.current_xp - userLevel.total_xp_for_current_level) /
       (userLevel.total_xp_for_next_level - userLevel.total_xp_for_current_level)) * 100
    : 0;

  // Find next achievable milestone
  const nextMilestone = milestoneRewards.find(reward => reward.level > userLevel.current_level);
  const levelsToNext = nextMilestone ? nextMilestone.level - userLevel.current_level : 0;

  // Get icon with improved type differentiation
  const getRewardIcon = (type: string, isSpecial?: boolean) => {
    if (isSpecial) {
      return <Sparkles className="w-6 h-6 md:w-7 md:h-7" />;
    }

    const iconMap = {
      trial: <Zap className="w-6 h-6 md:w-7 md:h-7" />,
      discount: <Tag className="w-6 h-6 md:w-7 md:h-7" />,
      premium_time: <Crown className="w-6 h-6 md:w-7 md:h-7" />,
      status: <Star className="w-6 h-6 md:w-7 md:h-7" />,
      guest_invitations: <Users className="w-6 h-6 md:w-7 md:h-7" />
    };

    return iconMap[type as keyof typeof iconMap] || <Gift className="w-6 h-6 md:w-7 md:h-7" />;
  };

  // Get color scheme per reward type
  const getRewardColors = (type: string, isSpecial?: boolean) => {
    if (isSpecial) {
      return {
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-700',
        glow: 'shadow-orange-500/30'
      };
    }

    const colorMap = {
      trial: {
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        glow: 'shadow-blue-500/30'
      },
      discount: {
        gradient: 'from-green-500 to-emerald-500',
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-300',
        text: 'text-green-700',
        glow: 'shadow-green-500/30'
      },
      premium_time: {
        gradient: 'from-purple-500 to-pink-500',
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
        border: 'border-purple-300',
        text: 'text-purple-700',
        glow: 'shadow-purple-500/30'
      },
      status: {
        gradient: 'from-pink-500 to-purple-600',
        bg: 'bg-gradient-to-br from-pink-50 to-purple-50',
        border: 'border-pink-300',
        text: 'text-pink-700',
        glow: 'shadow-pink-500/30'
      },
      guest_invitations: {
        gradient: 'from-indigo-500 to-blue-500',
        bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
        border: 'border-indigo-300',
        text: 'text-indigo-700',
        glow: 'shadow-indigo-500/30'
      }
    };

    return colorMap[type as keyof typeof colorMap] || colorMap.premium_time;
  };

  // Get contextual reward value with better formatting
  const getRewardDisplayValue = (reward: GameifiedReward) => {
    const data = reward.reward_data;

    switch (reward.reward_type) {
      case 'trial':
        return {
          value: `${data.duration_days} dagars`,
          label: 'provperiod',
          context: 'Testa alla Premium-funktioner gratis'
        };
      case 'discount':
        return {
          value: `${data.percentage}%`,
          label: 'rabatt',
          context: 'På din nästa Premium-period'
        };
      case 'premium_time':
        return {
          value: `${data.duration_days} dagars`,
          label: 'Premium-tid',
          context: 'Extra Premium-tid läggs till direkt'
        };
      case 'status':
        return {
          value: data.status || 'Genesis',
          label: 'status',
          context: `Exklusiv ${data.status || 'Genesis'} status i ${data.duration_days || 0} dagar`
        };
      case 'guest_invitations':
        return {
          value: `${data.invitations || 3}`,
          label: 'inbjudningar',
          context: 'Bjud in vänner till Premium'
        };
      default:
        return {
          value: 'Belöning',
          label: '',
          context: reward.description
        };
    }
  };

  // Get reward type label in Swedish
  const getRewardTypeLabel = (type: string) => {
    const labelMap = {
      trial: 'Provperiod',
      discount: 'Rabatt',
      premium_time: 'Premium-tid',
      status: 'Status',
      guest_invitations: 'Inbjudningar'
    };

    return labelMap[type as keyof typeof labelMap] || 'Belöning';
  };

  // Determine reward status
  const getRewardStatus = (reward: GameifiedReward) => {
    if (reward.is_claimed) return 'claimed';
    if (reward.is_unlocked) return 'unlocked';

    const levelDiff = reward.level - userLevel.current_level;
    if (levelDiff <= 3) return 'upcoming';
    return 'locked';
  };

  // Toggle card expansion (for mobile)
  const toggleExpanded = (rewardId: string) => {
    setExpandedReward(expandedReward === rewardId ? null : rewardId);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Progress Card - Mobile Optimized */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-10" />

        <CardContent className="relative p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Crown className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs md:text-sm font-bold rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg">
                  {userLevel.current_level}
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                  {userLevel.title}
                </h2>
                <p className="text-gray-600 text-sm md:text-xl">
                  {userLevel.current_xp.toLocaleString()} XP • Level {userLevel.current_level}
                </p>
              </div>
            </div>

            {nextMilestone && (
              <div className="flex items-center justify-between md:flex-col md:text-right bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 md:p-0 md:bg-transparent border border-purple-200 md:border-0">
                <div className="flex items-center gap-2 md:flex-col md:gap-1">
                  <span className="text-xs md:text-sm text-gray-500 font-medium">Nästa belöning:</span>
                  <div className="flex items-center gap-2">
                    <div className="text-xl md:text-3xl text-purple-600">
                      {getRewardIcon(nextMilestone.reward_type, nextMilestone.is_special)}
                    </div>
                    <div className="text-sm md:text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent md:hidden">
                      {levelsToNext} {levelsToNext === 1 ? 'nivå' : 'nivåer'}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {levelsToNext} {levelsToNext === 1 ? 'nivå' : 'nivåer'} kvar!
                </div>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between text-xs md:text-sm text-gray-600">
              <span className="font-medium">Framsteg till nästa level</span>
              <span className="font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
            </div>

            <div className="relative h-4 md:h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            <div className="flex justify-between text-xs md:text-sm text-gray-500">
              <span>{userLevel.total_xp_for_current_level.toLocaleString()} XP</span>
              <span>{userLevel.total_xp_for_next_level.toLocaleString()} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid - Mobile First */}
      <Card className="bg-white/90 backdrop-blur-lg border border-gray-200/50 shadow-xl">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-6 md:mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Belöningsvägen
              </h3>
              <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">
                Samla XP och lås upp exklusiva belöningar
              </p>
            </div>
            <div className="flex items-center justify-between md:flex-col md:text-right bg-gray-50 rounded-lg p-2 md:p-0 md:bg-transparent">
              <span className="text-xs md:text-sm text-gray-500 font-medium">Framsteg</span>
              <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {milestoneRewards.filter(r => r.is_unlocked).length} / {milestoneRewards.length}
              </div>
            </div>
          </div>

          {/* Mobile-First Reward Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {milestoneRewards.map((reward) => {
              const status = getRewardStatus(reward);
              const isExpanded = expandedReward === reward.id;
              const colors = getRewardColors(reward.reward_type, reward.is_special);
              const displayValue = getRewardDisplayValue(reward);
              const typeLabel = getRewardTypeLabel(reward.reward_type);

              return (
                <div
                  key={reward.id}
                  className={`
                    relative group
                    bg-white rounded-2xl border-2 overflow-hidden
                    transition-all duration-300
                    ${status === 'unlocked' ? `${colors.border} shadow-lg ${colors.glow} animate-pulse` : ''}
                    ${status === 'claimed' ? 'border-green-300 shadow-md' : ''}
                    ${status === 'upcoming' ? 'border-blue-300 shadow-md' : ''}
                    ${status === 'locked' ? 'border-gray-200 opacity-60' : ''}
                    hover:shadow-xl
                    ${status !== 'locked' ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => status !== 'locked' && toggleExpanded(reward.id)}
                >
                  {/* Special Reward Glow Effect */}
                  {reward.is_special && status !== 'locked' && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur opacity-20 animate-pulse" />
                  )}

                  {/* Card Content */}
                  <div className="relative p-4 md:p-5">
                    {/* Header: Icon + Level Badge */}
                    <div className="flex items-start justify-between mb-3">
                      {/* Icon with colored background */}
                      <div className={`
                        w-14 h-14 md:w-16 md:h-16 rounded-xl
                        flex items-center justify-center
                        shadow-lg transition-transform duration-300
                        ${status === 'claimed' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : `bg-gradient-to-br ${colors.gradient}`}
                        ${status === 'locked' ? 'grayscale opacity-40' : ''}
                        ${status === 'unlocked' ? 'group-hover:scale-110 group-hover:rotate-3' : ''}
                      `}>
                        {status === 'claimed' ? (
                          <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-white" />
                        ) : (
                          <div className="text-white">
                            {getRewardIcon(reward.reward_type, reward.is_special)}
                          </div>
                        )}
                      </div>

                      {/* Level Badge */}
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="secondary"
                          className="bg-gray-900 text-white text-xs font-bold px-2 py-1"
                        >
                          Level {reward.level}
                        </Badge>

                        {/* Status Indicators */}
                        {status === 'unlocked' && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            <span>Ny!</span>
                          </div>
                        )}

                        {status === 'upcoming' && (
                          <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                            <Target className="w-3 h-3" />
                            <span>{reward.level - userLevel.current_level} nivåer</span>
                          </div>
                        )}

                        {status === 'claimed' && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktiverad</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reward Type Label */}
                    <div className="mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${status !== 'locked' ? colors.text : 'text-gray-400'} border-current`}
                      >
                        {typeLabel}
                      </Badge>
                    </div>

                    {/* Reward Title */}
                    <h4 className={`
                      font-bold text-base md:text-lg mb-2 line-clamp-2
                      ${status === 'locked' ? 'text-gray-400' : 'text-gray-900'}
                    `}>
                      {reward.name}
                    </h4>

                    {/* Reward Value - Large and Prominent */}
                    <div className="mb-3">
                      <div className={`
                        text-2xl md:text-3xl font-black mb-1
                        ${status === 'locked' ? 'text-gray-300' : colors.text}
                      `}>
                        {displayValue.value}
                      </div>
                      <div className={`
                        text-sm font-semibold
                        ${status === 'locked' ? 'text-gray-400' : colors.text}
                      `}>
                        {displayValue.label}
                      </div>
                    </div>

                    {/* Context - Always Visible */}
                    <p className={`
                      text-xs md:text-sm mb-3
                      ${status === 'locked' ? 'text-gray-400' : 'text-gray-600'}
                      ${isExpanded ? '' : 'line-clamp-2'}
                    `}>
                      {displayValue.context}
                    </p>

                    {/* Description - Expandable on mobile, always visible on desktop */}
                    <div className={`
                      text-xs text-gray-500 mb-3
                      ${isExpanded ? 'block' : 'hidden md:block'}
                    `}>
                      {reward.description}
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-100">
                      {status === 'unlocked' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClaimReward(reward.id);
                          }}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Hämta nu!
                        </Button>
                      )}

                      {status === 'upcoming' && (
                        <div className="w-full text-center py-2 bg-blue-50 rounded-lg">
                          <span className="text-xs font-semibold text-blue-700">
                            {reward.level - userLevel.current_level} {reward.level - userLevel.current_level === 1 ? 'nivå' : 'nivåer'} kvar
                          </span>
                        </div>
                      )}

                      {status === 'claimed' && (
                        <div className="w-full text-center py-2 bg-green-50 rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-700">
                            Belöning aktiverad
                          </span>
                        </div>
                      )}

                      {status === 'locked' && (
                        <div className="w-full text-center py-2 bg-gray-50 rounded-lg flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">
                            Låst
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse Indicator (Mobile Only) */}
                    {status !== 'locked' && (
                      <div className="md:hidden flex justify-center mt-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Locked Overlay */}
                  {status === 'locked' && (
                    <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] rounded-2xl pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Journey Progress */}
          <div className="mt-8 md:mt-10 p-4 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50 rounded-2xl shadow-inner">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-sm md:text-lg font-semibold text-gray-800">Din belöningsresa</span>
              <span className="text-sm md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.floor((userLevel.current_level / 50) * 100)}% genomförd
              </span>
            </div>
            <div className="relative h-3 md:h-4 bg-white rounded-full overflow-hidden shadow-inner border border-gray-200">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${(userLevel.current_level / 50) * 100}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            <div className="flex justify-between text-xs md:text-sm text-gray-600 mt-2 md:mt-3 font-medium">
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
