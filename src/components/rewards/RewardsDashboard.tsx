'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Trophy,
  Gift,
  Zap,
  Clock,
  CheckCircle,
  Star,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react';

// Types for the rewards dashboard
interface UserLevel {
  current_level: number;
  current_xp: number;
  title: string;
  xp_to_next_level: number;
  total_xp_for_current_level: number;
  total_xp_for_next_level: number;
}

interface RewardClaim {
  id: string;
  reward_id: string;
  status: 'claimed' | 'activated' | 'expired';
  claimed_at: string;
  expires_at?: string;
  activation_data?: any;
  reward: {
    name: string;
    description: string;
    reward_type: 'trial' | 'discount' | 'premium_time' | 'guest_invitations' | 'status';
    reward_data: any;
    icon?: string;
  };
}

interface AvailableReward {
  id: string;
  name: string;
  description: string;
  reward_type: 'trial' | 'discount' | 'premium_time' | 'guest_invitations' | 'status';
  reward_data: any;
  trigger_value: number;
  icon?: string;
}

interface RewardsDashboardProps {
  userLevel: UserLevel;
  availableRewards: AvailableReward[];
  claimedRewards: RewardClaim[];
  onClaimReward: (rewardId: string) => void;
  onActivateReward: (claimId: string) => void;
}

const RewardsDashboard: React.FC<RewardsDashboardProps> = ({
  userLevel,
  availableRewards,
  claimedRewards,
  onClaimReward,
  onActivateReward
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'claimed'>('available');

  // Calculate progress percentage
  const progressPercentage = userLevel.total_xp_for_next_level > 0
    ? ((userLevel.current_xp - userLevel.total_xp_for_current_level) /
       (userLevel.total_xp_for_next_level - userLevel.total_xp_for_current_level)) * 100
    : 0;

  const getRewardIcon = (type: string, customIcon?: string) => {
    if (customIcon) return customIcon;

    const iconMap = {
      trial: <Zap className="w-5 h-5" />,
      discount: <Gift className="w-5 h-5" />,
      premium_time: <Crown className="w-5 h-5" />,
      guest_invitations: <Star className="w-5 h-5" />,
      status: <Trophy className="w-5 h-5" />
    };

    return iconMap[type as keyof typeof iconMap] || <Gift className="w-5 h-5" />;
  };

  const getRewardValue = (reward: AvailableReward | RewardClaim['reward']) => {
    const data = reward.reward_data;

    switch (reward.reward_type) {
      case 'trial':
        return `${data.duration_days} dagar premium`;
      case 'discount':
        return `${data.percentage}% rabatt`;
      case 'premium_time':
        return `${data.duration_days} dagars premium`;
      case 'guest_invitations':
        return `+${data.bonus_invitations_per_month} inbjudningar`;
      case 'status':
        return data.status || 'Speciell status';
      default:
        return 'Premium belöning';
    }
  };

  const getRewardGradient = (type: string) => {
    const gradients = {
      trial: 'from-blue-500 to-cyan-500',
      discount: 'from-green-500 to-emerald-500',
      premium_time: 'from-purple-500 to-pink-500',
      guest_invitations: 'from-yellow-400 to-orange-500',
      status: 'from-pink-500 to-purple-600'
    };

    return gradients[type as keyof typeof gradients] || 'from-purple-500 to-pink-500';
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Utgången';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} dagar kvar`;
    return `${hours} timmar kvar`;
  };

  return (
    <div className="space-y-6">
      {/* Level Status Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-800 border-navy-700">
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-20" />

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-navy-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {userLevel.current_level}
                </div>
              </div>

              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {userLevel.title}
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">
                  Level {userLevel.current_level} • {userLevel.current_xp.toLocaleString()} XP
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-sm">Nästa level</p>
              <p className="text-white font-semibold">
                {userLevel.xp_to_next_level.toLocaleString()} XP kvar
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Framsteg till nästa level</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>

            <div className="relative h-3 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-xl font-bold text-white">{claimedRewards.length}</p>
              <p className="text-xs text-gray-400">Belöningar</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-xl font-bold text-white">{availableRewards.length}</p>
              <p className="text-xs text-gray-400">Tillgängliga</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-xl font-bold text-white">{userLevel.current_level}</p>
              <p className="text-xs text-gray-400">Nivå</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <Card className="bg-navy-800 border-navy-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span>Belöningar</span>
            </CardTitle>

            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'available' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('available')}
                className={activeTab === 'available' ? '' : 'text-gray-400 hover:text-white'}
              >
                Tillgängliga ({availableRewards.length})
              </Button>
              <Button
                variant={activeTab === 'claimed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('claimed')}
                className={activeTab === 'claimed' ? '' : 'text-gray-400 hover:text-white'}
              >
                Mina belöningar ({claimedRewards.length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'available' ? (
            <div className="space-y-4">
              {availableRewards.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Inga nya belöningar just nu</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Fortsätt samla XP för att låsa upp fler belöningar!
                  </p>
                </div>
              ) : (
                availableRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="relative group p-4 bg-navy-700/50 border border-navy-600 rounded-xl hover:border-pink-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRewardGradient(reward.reward_type)} flex items-center justify-center text-white shadow-lg`}>
                          {getRewardIcon(reward.reward_type, reward.icon)}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{reward.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{reward.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {getRewardValue(reward)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Level {reward.trigger_value}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => onClaimReward(reward.id)}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Hämta belöning
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {claimedRewards.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Inga belöningar ännu</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hämta din första belöning för att komma igång!
                  </p>
                </div>
              ) : (
                claimedRewards.map((claim) => (
                  <div
                    key={claim.id}
                    className="relative p-4 bg-navy-700/50 border border-navy-600 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRewardGradient(claim.reward.reward_type)} flex items-center justify-center text-white shadow-lg`}>
                          {getRewardIcon(claim.reward.reward_type, claim.reward.icon)}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{claim.reward.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{claim.reward.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {getRewardValue(claim.reward)}
                            </Badge>
                            {claim.status === 'claimed' && (
                              <Badge variant="warning" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Väntar på aktivering
                              </Badge>
                            )}
                            {claim.status === 'activated' && (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aktiverad
                              </Badge>
                            )}
                            {claim.status === 'expired' && (
                              <Badge variant="outline" className="text-xs opacity-50">
                                Utgången
                              </Badge>
                            )}
                          </div>
                          {claim.expires_at && claim.status !== 'expired' && (
                            <p className="text-xs text-orange-400 mt-1">
                              {formatTimeRemaining(claim.expires_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      {claim.status === 'claimed' && (
                        <Button
                          onClick={() => onActivateReward(claim.id)}
                          variant="secondary"
                          size="sm"
                          className="hover:bg-pink-600 hover:text-white transition-colors"
                        >
                          Aktivera
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsDashboard;