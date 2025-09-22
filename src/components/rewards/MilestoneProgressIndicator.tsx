'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Trophy,
  Star,
  Zap,
  Gift,
  Users,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Gem
} from 'lucide-react';

interface MilestoneLevel {
  level: number;
  title: string;
  description: string;
  rewards: {
    type: 'trial' | 'discount' | 'premium_time' | 'guest_invitations' | 'status' | 'special';
    value: string;
    description: string;
  }[];
  isSpecial?: boolean;
  theme: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface MilestoneProgressIndicatorProps {
  currentLevel: number;
  currentXp: number;
  milestones?: MilestoneLevel[];
}

const defaultMilestones: MilestoneLevel[] = [
  {
    level: 5,
    title: 'Karriärutforskare',
    description: 'Du har tagit dina första steg in i AI-driven karriärutveckling',
    theme: 'bronze',
    rewards: [
      { type: 'trial', value: '3 dagar', description: 'Gratis premium-tid' },
      { type: 'guest_invitations', value: '+1', description: 'Extra gästinbjudan per månad' }
    ]
  },
  {
    level: 10,
    title: 'Professionell Navigatör',
    description: 'Du behärskar grunderna i våra AI-verktyg',
    theme: 'bronze',
    rewards: [
      { type: 'discount', value: '10%', description: 'Rabatt på premium-prenumeration' },
      { type: 'guest_invitations', value: '+2', description: 'Extra gästinbjudningar per månad' }
    ]
  },
  {
    level: 15,
    title: 'Karriärstrateg',
    description: 'Dina färdigheter inom karriärplanering växer starkt',
    theme: 'silver',
    rewards: [
      { type: 'premium_time', value: '7 dagar', description: 'Gratis premium-tid' },
      { type: 'special', value: 'Exklusiv badge', description: 'Särskild karriärstrateg-status' }
    ]
  },
  {
    level: 20,
    title: 'AI-Expert',
    description: 'Du har mäktigt djup förståelse för AI-driven karriärutveckling',
    theme: 'silver',
    isSpecial: true,
    rewards: [
      { type: 'discount', value: '20%', description: 'Stor rabatt på premium' },
      { type: 'guest_invitations', value: '+5', description: 'Månadsbonus för inbjudningar' },
      { type: 'status', value: 'AI-Expert', description: 'Exklusiv expertsstatus' }
    ]
  },
  {
    level: 30,
    title: 'Karriärmästare',
    description: 'Du har utvecklat avancerad kompetens inom alla våra verktyg',
    theme: 'gold',
    isSpecial: true,
    rewards: [
      { type: 'premium_time', value: '30 dagar', description: 'En månads gratis premium' },
      { type: 'guest_invitations', value: '+10', description: 'Premium inbjudningspaket' },
      { type: 'special', value: 'Guldstatus', description: 'Karriärmästare-erkännande' }
    ]
  },
  {
    level: 40,
    title: 'Branschledare',
    description: 'Du är nu en erkänd expert inom karriärutveckling och AI',
    theme: 'platinum',
    isSpecial: true,
    rewards: [
      { type: 'discount', value: '50%', description: 'Livstidsrabatt på premium' },
      { type: 'guest_invitations', value: 'Obegränsat', description: 'Obegränsade inbjudningar' },
      { type: 'status', value: 'Branschledare', description: 'Platinum-status' }
    ]
  },
  {
    level: 50,
    title: 'Jobbcoach Mästare',
    description: 'Du har nått den ultimata nivån - en legend inom karriärutveckling',
    theme: 'diamond',
    isSpecial: true,
    rewards: [
      { type: 'special', value: 'Livstidspremium', description: 'Gratis premium för livet' },
      { type: 'status', value: 'Mästare', description: 'Diamantstatus med alla privilegier' },
      { type: 'special', value: 'Exklusiv mentor', description: 'Bli officiell Jobbcoach-ambassador' }
    ]
  }
];

const MilestoneProgressIndicator: React.FC<MilestoneProgressIndicatorProps> = ({
  currentLevel,
  currentXp,
  milestones = defaultMilestones
}) => {
  const getThemeColors = (theme: string) => {
    const themes = {
      bronze: {
        gradient: 'from-orange-600 via-amber-600 to-yellow-600',
        border: 'border-orange-500/50',
        bg: 'bg-orange-900/20',
        text: 'text-orange-300',
        icon: 'text-orange-400'
      },
      silver: {
        gradient: 'from-gray-400 via-slate-300 to-gray-400',
        border: 'border-gray-400/50',
        bg: 'bg-gray-800/30',
        text: 'text-gray-200',
        icon: 'text-gray-300'
      },
      gold: {
        gradient: 'from-yellow-500 via-yellow-400 to-orange-400',
        border: 'border-yellow-400/50',
        bg: 'bg-yellow-900/20',
        text: 'text-yellow-200',
        icon: 'text-yellow-300'
      },
      platinum: {
        gradient: 'from-indigo-400 via-purple-400 to-pink-400',
        border: 'border-purple-400/50',
        bg: 'bg-purple-900/20',
        text: 'text-purple-200',
        icon: 'text-purple-300'
      },
      diamond: {
        gradient: 'from-cyan-400 via-blue-500 to-purple-600',
        border: 'border-cyan-400/50',
        bg: 'bg-cyan-900/20',
        text: 'text-cyan-200',
        icon: 'text-cyan-300'
      }
    };
    return themes[theme as keyof typeof themes] || themes.bronze;
  };

  const getThemeIcon = (theme: string, isSpecial?: boolean) => {
    if (isSpecial) {
      return <Crown className="w-6 h-6" />;
    }

    const icons = {
      bronze: <Award className="w-5 h-5" />,
      silver: <Trophy className="w-5 h-5" />,
      gold: <Star className="w-5 h-5" />,
      platinum: <Sparkles className="w-5 h-5" />,
      diamond: <Gem className="w-5 h-5" />
    };
    return icons[theme as keyof typeof icons] || icons.bronze;
  };

  const getRewardIcon = (type: string) => {
    const icons = {
      trial: <Zap className="w-4 h-4" />,
      discount: <Gift className="w-4 h-4" />,
      premium_time: <Crown className="w-4 h-4" />,
      guest_invitations: <Users className="w-4 h-4" />,
      status: <Trophy className="w-4 h-4" />,
      special: <Sparkles className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || icons.special;
  };

  const getMilestoneStatus = (milestone: MilestoneLevel) => {
    if (currentLevel >= milestone.level) return 'achieved';
    if (currentLevel >= milestone.level - 5) return 'upcoming';
    return 'future';
  };

  const getProgressToMilestone = (milestone: MilestoneLevel) => {
    if (currentLevel >= milestone.level) return 100;
    const prevMilestone = milestones.find(m => m.level < milestone.level) || { level: 0 };
    const range = milestone.level - prevMilestone.level;
    const progress = currentLevel - prevMilestone.level;
    return Math.max(0, Math.min(100, (progress / range) * 100));
  };

  return (
    <Card className="bg-navy-800 border-navy-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-pink-500" />
              <span>Milstolpe-progression</span>
            </h3>
            <p className="text-sm text-gray-400">
              Upptäck vad som väntar på din karriärresa
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{currentLevel}</div>
            <div className="text-xs text-gray-400">Nuvarande level</div>
          </div>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            const progress = getProgressToMilestone(milestone);
            const theme = getThemeColors(milestone.theme);

            return (
              <div
                key={milestone.level}
                className={`
                  relative overflow-hidden rounded-xl border transition-all duration-300
                  ${status === 'achieved'
                    ? `${theme.border} ${theme.bg} opacity-90`
                    : status === 'upcoming'
                    ? `${theme.border} ${theme.bg} hover:scale-[1.02]`
                    : 'border-navy-600 bg-navy-900/30 opacity-60'
                  }
                  ${milestone.isSpecial ? 'ring-2 ring-yellow-400/30' : ''}
                `}
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-5`} />

                <div className="relative p-4">
                  <div className="flex items-start space-x-4">
                    {/* Milestone Icon */}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border-2
                        ${status === 'achieved'
                          ? `bg-gradient-to-br ${theme.gradient} border-white/20`
                          : status === 'upcoming'
                          ? `bg-gradient-to-br ${theme.gradient} border-white/10 opacity-80`
                          : 'bg-navy-700 border-gray-600'
                        }
                      `}
                    >
                      <div className={status === 'achieved' ? 'text-white' : theme.icon}>
                        {getThemeIcon(milestone.theme, milestone.isSpecial)}
                      </div>
                    </div>

                    {/* Milestone Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-semibold ${status === 'achieved' ? 'text-white' : theme.text}`}>
                            {milestone.title}
                          </h4>
                          <Badge
                            variant={status === 'achieved' ? 'success' : status === 'upcoming' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            Level {milestone.level}
                          </Badge>
                          {milestone.isSpecial && (
                            <Badge variant="outline" className="text-xs border-yellow-400/50 text-yellow-400">
                              Speciell
                            </Badge>
                          )}
                        </div>

                        {status === 'upcoming' && (
                          <div className="text-xs text-blue-400 font-medium">
                            {milestone.level - currentLevel} nivåer kvar
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 mb-3">
                        {milestone.description}
                      </p>

                      {/* Progress bar for upcoming milestones */}
                      {status === 'upcoming' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Framsteg till denna milstolpe</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-700 ease-out`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="flex flex-wrap gap-2">
                        {milestone.rewards.map((reward, rewardIndex) => (
                          <div
                            key={rewardIndex}
                            className={`
                              flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-xs
                              ${status === 'achieved'
                                ? 'bg-green-900/30 border-green-500/30 text-green-300'
                                : status === 'upcoming'
                                ? `${theme.bg} ${theme.border} ${theme.text}`
                                : 'bg-gray-800/30 border-gray-600/30 text-gray-500'
                              }
                            `}
                          >
                            <div className={status === 'achieved' ? 'text-green-400' : theme.icon}>
                              {getRewardIcon(reward.type)}
                            </div>
                            <span className="font-medium">{reward.value}</span>
                            <span className="opacity-80">{reward.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex flex-col items-center">
                      {status === 'achieved' && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {status === 'upcoming' && (
                        <div className={`w-6 h-6 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center animate-pulse`}>
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special milestone shine effect */}
                {milestone.isSpecial && status === 'upcoming' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transform -skew-x-12 animate-shimmer" />
                )}
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-6 border-t border-navy-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-green-400">
                {milestones.filter(m => currentLevel >= m.level).length}
              </div>
              <div className="text-xs text-gray-400">Uppnådda</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">
                {milestones.filter(m => currentLevel < m.level && currentLevel >= m.level - 5).length}
              </div>
              <div className="text-xs text-gray-400">Inom räckhåll</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">
                {milestones.filter(m => currentLevel < m.level).length}
              </div>
              <div className="text-xs text-gray-400">Framtida mål</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneProgressIndicator;