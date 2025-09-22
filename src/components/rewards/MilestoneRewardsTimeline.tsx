'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock
} from 'lucide-react';

// Types for milestone rewards
interface MilestoneReward {
  id: string;
  level: number;
  name: string;
  description: string;
  reward_type: 'trial' | 'discount' | 'premium_time' | 'guest_invitations' | 'status';
  reward_data: any;
  icon?: string;
  is_unlocked: boolean;
  is_claimed: boolean;
  is_special?: boolean; // For major milestones like level 50
}

interface MilestoneRewardsTimelineProps {
  currentLevel: number;
  currentXp: number;
  milestones: MilestoneReward[];
  onClaimReward: (rewardId: string) => void;
  onShowRewardDetails: (milestone: MilestoneReward) => void;
}

const MilestoneRewardsTimeline: React.FC<MilestoneRewardsTimelineProps> = ({
  currentLevel,
  currentXp,
  milestones,
  onClaimReward,
  onShowRewardDetails
}) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentLevelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (currentLevelRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = currentLevelRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      container.scrollTo({
        left: element.offsetLeft - containerRect.width / 2 + elementRect.width / 2,
        behavior: 'smooth'
      });
    }
  }, [currentLevel]);

  const getRewardIcon = (type: string, customIcon?: string, isSpecial?: boolean) => {
    if (customIcon) return customIcon;

    if (isSpecial) {
      return <Crown className="w-6 h-6" />;
    }

    const iconMap = {
      trial: <Zap className="w-5 h-5" />,
      discount: <Percent className="w-5 h-5" />,
      premium_time: <Clock className="w-5 h-5" />,
      guest_invitations: <Users className="w-5 h-5" />,
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
      guest_invitations: 'from-yellow-400 to-orange-500',
      status: 'from-pink-500 to-purple-600'
    };

    return gradients[type as keyof typeof gradients] || 'from-purple-500 to-pink-500';
  };

  const getRewardValue = (milestone: MilestoneReward) => {
    const data = milestone.reward_data;

    switch (milestone.reward_type) {
      case 'trial':
        return `${data.duration_days} dagar`;
      case 'discount':
        return `${data.percentage}% rabatt`;
      case 'premium_time':
        return `${data.duration_days} dagar`;
      case 'guest_invitations':
        return `+${data.bonus_invitations_per_month}`;
      case 'status':
        return data.status || 'Status';
      default:
        return 'Belöning';
    }
  };

  const getMilestoneStatus = (milestone: MilestoneReward) => {
    if (milestone.is_claimed) return 'claimed';
    if (milestone.is_unlocked) return 'unlocked';
    if (milestone.level <= currentLevel) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      claimed: 'text-green-400',
      unlocked: 'text-yellow-400',
      available: 'text-purple-400',
      locked: 'text-gray-500'
    };
    return colors[status as keyof typeof colors] || 'text-gray-500';
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.level - b.level);

  const TimelineView = () => (
    <div className="relative">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Belönings-tidslinje</h3>
          <p className="text-sm text-gray-400">
            Din resa genom alla 50 nivåer och belöningar
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Hämtad</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span>Tillgänglig</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span>Nåbar</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <span>Låst</span>
          </div>
        </div>
      </div>

      {/* Timeline Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="relative overflow-x-auto overflow-y-hidden pb-4 elegant-scrollbar"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="flex space-x-6" style={{ minWidth: 'max-content' }}>
          {/* Current Level Indicator */}
          <div className="flex flex-col items-center space-y-4 min-w-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-navy-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {currentLevel}
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-30 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-bold text-white">DU ÄR HÄR</p>
              <p className="text-xs text-gray-400">Level {currentLevel}</p>
              <p className="text-xs text-purple-400">{currentXp.toLocaleString()} XP</p>
            </div>
          </div>

          {/* Milestone Rewards */}
          {sortedMilestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            const isCurrentLevel = milestone.level === currentLevel;

            return (
              <div
                key={milestone.id}
                ref={isCurrentLevel ? currentLevelRef : null}
                className="flex flex-col items-center space-y-4 min-w-0 group"
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                {/* Connection Line */}
                {index > 0 && (
                  <div className="absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-navy-600 to-navy-700 -z-10" />
                )}

                {/* Milestone Icon */}
                <div className="relative">
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300
                      ${status === 'claimed'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400'
                        : status === 'unlocked'
                        ? `bg-gradient-to-br ${getRewardGradient(milestone.reward_type, milestone.is_special)} border-yellow-400`
                        : status === 'available'
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400'
                        : 'bg-navy-700 border-gray-600'
                      }
                      ${hoveredMilestone === milestone.id ? 'scale-110 shadow-2xl' : ''}
                      ${milestone.is_special ? 'ring-4 ring-yellow-400/30' : ''}
                    `}
                  >
                    {status === 'claimed' ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : status === 'locked' ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <div className={getStatusColor(status)}>
                        {getRewardIcon(milestone.reward_type, milestone.icon, milestone.is_special)}
                      </div>
                    )}
                  </div>

                  {/* Level Badge */}
                  <div className="absolute -top-1 -right-1 bg-navy-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border border-navy-600">
                    {milestone.level}
                  </div>

                  {/* Special Milestone Glow */}
                  {milestone.is_special && (
                    <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur opacity-20 animate-pulse" />
                  )}
                </div>

                {/* Milestone Info */}
                <div className="text-center max-w-24">
                  <p className="font-semibold text-white text-sm truncate">{milestone.name}</p>
                  <p className="text-xs text-gray-400">Level {milestone.level}</p>
                  <Badge
                    variant={status === 'claimed' ? 'success' : status === 'unlocked' ? 'warning' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {getRewardValue(milestone)}
                  </Badge>
                </div>

                {/* Action Button */}
                {status === 'unlocked' && (
                  <Button
                    size="sm"
                    onClick={() => onClaimReward(milestone.id)}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Hämta
                  </Button>
                )}

                {/* Hover Details Card */}
                {hoveredMilestone === milestone.id && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 shadow-2xl min-w-64 animate-fadeIn">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRewardGradient(milestone.reward_type, milestone.is_special)} flex items-center justify-center text-white`}>
                          {getRewardIcon(milestone.reward_type, milestone.icon, milestone.is_special)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{milestone.name}</h4>
                          <p className="text-xs text-gray-400">Level {milestone.level}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{milestone.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {getRewardValue(milestone)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onShowRewardDetails(milestone)}
                          className="text-xs"
                        >
                          Detaljer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedMilestones.map((milestone) => {
        const status = getMilestoneStatus(milestone);

        return (
          <Card
            key={milestone.id}
            className={`
              relative overflow-hidden transition-all duration-300 cursor-pointer
              ${status === 'locked' ? 'opacity-50' : 'hover:scale-105'}
              ${milestone.is_special ? 'ring-2 ring-yellow-400/50' : ''}
              bg-navy-800 border-navy-700 hover:border-pink-500/50
            `}
            onClick={() => onShowRewardDetails(milestone)}
          >
            {/* Special Milestone Background */}
            {milestone.is_special && (
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl blur opacity-20" />
            )}

            <CardContent className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRewardGradient(milestone.reward_type, milestone.is_special)} flex items-center justify-center text-white shadow-lg`}>
                  {status === 'claimed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : status === 'locked' ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    getRewardIcon(milestone.reward_type, milestone.icon, milestone.is_special)
                  )}
                </div>

                <Badge variant="outline" className="text-xs">
                  Level {milestone.level}
                </Badge>
              </div>

              <h4 className="font-semibold text-white text-sm mb-2">{milestone.name}</h4>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{milestone.description}</p>

              <div className="flex items-center justify-between">
                <Badge
                  variant={status === 'claimed' ? 'success' : status === 'unlocked' ? 'warning' : 'secondary'}
                  className="text-xs"
                >
                  {getRewardValue(milestone)}
                </Badge>

                {status === 'unlocked' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaimReward(milestone.id);
                    }}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-xs"
                  >
                    Hämta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Card className="bg-navy-800 border-navy-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-pink-500" />
            <span>Belönings-milstolpar</span>
          </CardTitle>

          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className={viewMode === 'timeline' ? '' : 'text-gray-400 hover:text-white'}
            >
              Tidslinje
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? '' : 'text-gray-400 hover:text-white'}
            >
              Rutnät
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'timeline' ? <TimelineView /> : <GridView />}
      </CardContent>
    </Card>
  );
};

export default MilestoneRewardsTimeline;