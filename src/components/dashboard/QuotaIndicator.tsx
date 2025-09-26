'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Infinity } from 'lucide-react';

interface QuotaIndicatorProps {
  type: 'monthly' | 'weekly';
  used: number;
  limit: number;
  isPremium: boolean;
  resetDate?: Date;
  label: string;
  description: string;
  color?: 'pink' | 'blue' | 'green' | 'purple';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
}

export default function QuotaIndicator({
  type,
  used,
  limit,
  isPremium,
  resetDate,
  label,
  description,
  color = 'blue',
  className = ''
}: QuotaIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);

  // Beräkna nästa återställningsdatum om det inte finns
  const getNextResetDate = (): Date => {
    if (resetDate) return resetDate;

    const now = new Date();
    if (type === 'monthly') {
      // Första dagen nästa månad
      return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else {
      // Nästa söndag
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(0, 0, 0, 0);
      return nextSunday;
    }
  };

  const nextReset = getNextResetDate();

  useEffect(() => {
    setMounted(true);

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = nextReset.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes });
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Uppdatera varje minut

    return () => clearInterval(interval);
  }, [nextReset]);

  if (!mounted) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-xl h-32 ${className}`} />
    );
  }

  const percentage = isPremium ? 100 : Math.min((used / limit) * 100, 100);
  const remaining = isPremium ? Infinity : Math.max(0, limit - used);

  // Färgscheman
  const colorSchemes = {
    pink: {
      primary: 'text-pink-600',
      secondary: 'text-pink-500',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      gradient: 'from-pink-600 to-purple-600',
      ring: 'ring-pink-500/20'
    },
    blue: {
      primary: 'text-blue-600',
      secondary: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-600 to-indigo-600',
      ring: 'ring-blue-500/20'
    },
    green: {
      primary: 'text-green-600',
      secondary: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200',
      gradient: 'from-green-600 to-emerald-600',
      ring: 'ring-green-500/20'
    },
    purple: {
      primary: 'text-purple-600',
      secondary: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      gradient: 'from-purple-600 to-indigo-600',
      ring: 'ring-purple-500/20'
    }
  };

  const colors = colorSchemes[color];

  // Bestäm status och färger baserat på användning
  const getStatusConfig = () => {
    if (isPremium) {
      return {
        status: 'premium',
        statusColor: 'text-green-600',
        progressColor: 'stroke-green-500',
        bgColor: 'stroke-green-100',
        warningLevel: 'none' as const
      };
    }

    const usagePercentage = (used / limit) * 100;

    if (usagePercentage >= 100) {
      return {
        status: 'exhausted',
        statusColor: 'text-red-600',
        progressColor: 'stroke-red-500',
        bgColor: 'stroke-red-100',
        warningLevel: 'high' as const
      };
    } else if (usagePercentage >= 80) {
      return {
        status: 'warning',
        statusColor: 'text-orange-600',
        progressColor: 'stroke-orange-500',
        bgColor: 'stroke-orange-100',
        warningLevel: 'medium' as const
      };
    } else {
      return {
        status: 'good',
        statusColor: colors.primary,
        progressColor: `stroke-${color}-500`,
        bgColor: `stroke-${color}-100`,
        warningLevel: 'none' as const
      };
    }
  };

  const statusConfig = getStatusConfig();

  const formatTimeRemaining = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else {
      return `${timeRemaining.minutes}m`;
    }
  };

  const formatResetDate = () => {
    return nextReset.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      className={`
        relative bg-white/90 backdrop-blur-xl rounded-xl border ${colors.border}
        shadow-lg hover:shadow-xl transition-all duration-300 p-6 overflow-hidden
        ${className}
      `}
    >
      {/* Bakgrundsgradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-[0.02] rounded-xl`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          </div>

          {/* Status ikon */}
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            {isPremium ? (
              <Infinity className={`w-4 h-4 ${colors.primary}`} />
            ) : statusConfig.warningLevel === 'high' ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : statusConfig.warningLevel === 'medium' ? (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            ) : (
              <CheckCircle className={`w-4 h-4 ${colors.primary}`} />
            )}
          </div>
        </div>

        {/* Progress Ring och Stats */}
        <div className="flex items-center gap-6">
          {/* Cirkulär Progress Ring */}
          <div className="relative">
            <svg width="80" height="80" className="transform -rotate-90">
              {/* Bakgrundscirkel */}
              <circle
                cx="40"
                cy="40"
                r="32"
                strokeWidth="6"
                fill="transparent"
                className={statusConfig.bgColor}
              />
              {/* Progress cirkel */}
              <motion.circle
                cx="40"
                cy="40"
                r="32"
                strokeWidth="6"
                fill="transparent"
                strokeLinecap="round"
                className={statusConfig.progressColor}
                initial={{ strokeDasharray: "0 201" }}
                animate={{
                  strokeDasharray: `${(percentage / 100) * 201} 201`
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>

            {/* Centrerat innehåll */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {isPremium ? (
                  <div className="text-green-600">
                    <Infinity className="w-6 h-6 mx-auto" />
                    <span className="text-xs font-semibold block mt-1">∞</span>
                  </div>
                ) : (
                  <div>
                    <span className={`text-lg font-bold ${statusConfig.statusColor}`}>
                      {Math.round(percentage)}%
                    </span>
                    <span className="text-xs text-gray-500 block -mt-1">använt</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats och Countdown */}
          <div className="flex-1 space-y-3">
            {/* Användningsstatistik */}
            <div>
              {isPremium ? (
                <div className="text-lg font-bold text-green-600">
                  Obegränsad tillgång ✨
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{used}</span>
                  <span className="text-gray-500">av</span>
                  <span className="text-lg font-semibold text-gray-700">{limit}</span>
                  <span className="text-sm text-gray-500">använda</span>
                </div>
              )}

              {!isPremium && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className={`font-medium ${remaining === 0 ? 'text-red-600' : colors.primary}`}>
                    {remaining === 0 ? 'Kvot slut' : `${remaining} kvar`}
                  </span>
                </div>
              )}
            </div>

            {/* Countdown Timer */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`flex items-center gap-2 p-3 rounded-lg ${colors.bg}`}
              >
                <Clock className={`w-4 h-4 ${colors.secondary}`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Återställs om {formatTimeRemaining()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatResetDate()}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Varningsmeddelande */}
        {!isPremium && statusConfig.warningLevel !== 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.5 }}
            className={`
              mt-4 p-3 rounded-lg border-l-4
              ${statusConfig.warningLevel === 'high'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-orange-50 border-orange-500 text-orange-700'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">
                {statusConfig.warningLevel === 'high'
                  ? 'Kvot slut! Uppgradera eller vänta på återställning.'
                  : 'Kvot nästan slut! Överväg att uppgradera till Premium.'
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Premium CTA */}
        {!isPremium && statusConfig.warningLevel === 'high' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <button
              onClick={() => window.location.href = '/priser'}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Uppgradera till Premium för 149 SEK/månad
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}