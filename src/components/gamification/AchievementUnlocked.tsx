// src/components/gamification/AchievementUnlocked.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, X, Zap } from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  xp_reward: number;
  badge_color: string;
  icon?: string;
}

interface AchievementUnlockedProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementUnlocked: React.FC<AchievementUnlockedProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(autoCloseTimer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 300);
  };

  const getBadgeGradient = (color: string) => {
    const gradients: Record<string, string> = {
      green: 'from-green-500 to-emerald-500',
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      gold: 'from-yellow-400 to-orange-500',
      red: 'from-red-500 to-pink-500',
      cyan: 'from-cyan-500 to-blue-500',
      orange: 'from-orange-500 to-red-500',
      yellow: 'from-yellow-400 to-amber-500'
    };
    return gradients[color] || gradients.blue;
  };

  return (
    <div
      className={`
        fixed top-24 right-8 z-50 transform transition-all duration-500
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="bg-navy-900 rounded-xl shadow-2xl border border-navy-700 overflow-hidden max-w-md">
        {/* Achievement Header with Animation */}
        <div className={`bg-gradient-to-r ${getBadgeGradient(achievement.badge_color)} p-1`}>
          <div className="bg-navy-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-12 h-12 rounded-full bg-gradient-to-br ${getBadgeGradient(achievement.badge_color)}
                  flex items-center justify-center shadow-lg animate-pulse
                `}>
                  {achievement.icon ? (
                    <span className="text-2xl">{achievement.icon}</span>
                  ) : (
                    <Trophy className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Achievement Unlocked!</p>
                  <h3 className="text-lg font-bold text-white">{achievement.name}</h3>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-navy-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Achievement Details */}
        <div className="px-6 py-4">
          <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>

          {/* XP Reward */}
          <div className="flex items-center justify-between pt-3 border-t border-navy-700">
            <span className="text-gray-400 text-sm">Belöning:</span>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold">+{achievement.xp_reward} XP</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Animation */}
        <div className="h-1 bg-navy-800">
          <div
            className={`h-full bg-gradient-to-r ${getBadgeGradient(achievement.badge_color)} animate-shrink`}
            style={{
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementUnlocked;