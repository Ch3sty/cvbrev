// src/components/gamification/AchievementUnlocked.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(autoCloseTimer);
  }, [handleClose]);

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
        fixed top-24 right-8 z-50 transform transition-all duration-700 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
      style={{
        animation: isVisible && !isLeaving ? 'achievementSlideIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : undefined
      }}
    >
      <div className="relative bg-navy-900 rounded-xl shadow-2xl border border-navy-700 overflow-hidden max-w-md backdrop-blur-sm">
        {/* Glow Effect */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${getBadgeGradient(achievement.badge_color)} rounded-xl blur opacity-20 animate-pulse`}
        />

        {/* Achievement Header with Animation */}
        <div className={`relative bg-gradient-to-r ${getBadgeGradient(achievement.badge_color)} p-1`}>
          <div className="bg-navy-900 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`
                    relative w-14 h-14 rounded-full bg-gradient-to-br ${getBadgeGradient(achievement.badge_color)}
                    flex items-center justify-center shadow-xl border-2 border-white/20
                  `}
                  style={{
                    animation: 'achievementGlow 2s ease-in-out infinite alternate'
                  }}
                >
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" />

                  {achievement.icon ? (
                    <span className="relative text-2xl z-10">{achievement.icon}</span>
                  ) : (
                    <Trophy className="relative w-7 h-7 text-white z-10" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-yellow-400 uppercase tracking-wider font-semibold animate-pulse">
                    Achievement Unlocked!
                  </p>
                  <h3 className="text-lg font-bold text-white tracking-wide">{achievement.name}</h3>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-navy-800 transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
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
            className={`h-full bg-gradient-to-r ${getBadgeGradient(achievement.badge_color)}`}
            style={{
              animation: 'shrink 5s linear forwards',
              width: '100%'
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

        @keyframes achievementSlideIn {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateX(-10px) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes achievementGlow {
          0% {
            box-shadow: 0 0 20px rgba(232, 121, 249, 0.4);
          }
          100% {
            box-shadow: 0 0 30px rgba(232, 121, 249, 0.6), 0 0 40px rgba(168, 85, 247, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementUnlocked;