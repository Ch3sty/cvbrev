'use client';
import { motion } from 'framer-motion';
import { LucideIcon, Clock, AlertTriangle, CheckCircle, Infinity } from 'lucide-react';
import { PremiumCard } from './PremiumInteractions';
import { useEffect, useState } from 'react';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  isPremium?: boolean;
  liveUpdate?: boolean;
  pulseOnUpdate?: boolean;
  // Nya kvot-specifika props
  quotaInfo?: {
    used: number;
    limit: number;
    resetDate?: Date;
    resetType?: 'daily' | 'weekly' | 'monthly';
    showProgress?: boolean;
    showCountdown?: boolean;
  };
}

const colorVariants = {
  pink: {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
    gradient: 'from-pink-600 to-purple-600',
    border: 'border-pink-200'
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    gradient: 'from-green-600 to-emerald-600',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    gradient: 'from-purple-600 to-indigo-600',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    gradient: 'from-orange-600 to-red-600',
    border: 'border-orange-200'
  }
};

export default function StatsWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick,
  isPremium = false,
  liveUpdate = false,
  pulseOnUpdate = false,
  quotaInfo
}: StatsWidgetProps) {
  const colors = colorVariants[color];
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  // Beräkna nästa återställningsdatum
  const getNextResetDate = (): Date | null => {
    if (quotaInfo?.resetDate) return quotaInfo.resetDate;
    if (!quotaInfo?.resetType) return null;

    const now = new Date();
    if (quotaInfo.resetType === 'daily') {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    } else if (quotaInfo.resetType === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else {
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(0, 0, 0, 0);
      return nextSunday;
    }
  };

  useEffect(() => {
    if (liveUpdate && pulseOnUpdate) {
      const interval = setInterval(() => {
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 600);
      }, Math.random() * 10000 + 15000); // Random interval between 15-25 seconds

      return () => clearInterval(interval);
    }
  }, [liveUpdate, pulseOnUpdate]);

  // Countdown timer för kvot-återställning
  useEffect(() => {
    if (!quotaInfo?.showCountdown || isPremium) return;

    const nextReset = getNextResetDate();
    if (!nextReset) return;

    const updateTimer = () => {
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

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Uppdatera varje minut

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotaInfo, isPremium]);

  // Hjälpfunktioner för kvot-hantering
  const getQuotaPercentage = () => {
    if (!quotaInfo || isPremium) return 0;
    return Math.min((quotaInfo.used / quotaInfo.limit) * 100, 100);
  };

  const getQuotaStatus = () => {
    if (isPremium) return 'premium';
    if (!quotaInfo) return 'normal';

    const percentage = getQuotaPercentage();
    if (percentage >= 100) return 'exhausted';
    if (percentage >= 80) return 'warning';
    return 'normal';
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else {
      return `${timeRemaining.minutes}m`;
    }
  };

  const quotaStatus = getQuotaStatus();
  const quotaPercentage = getQuotaPercentage();

  return (
    <div className="relative">
      <PremiumCard
        onClick={onClick}
        clickable={!!onClick}
        glowing={isPremium && liveUpdate}
        className="p-4 sm:p-6 overflow-hidden"
      >
        <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-slate-600 text-sm font-medium mb-2"
          >
            {title}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1"
          >
            {value}
          </motion.div>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`text-xs ${
                quotaStatus === 'exhausted' ? 'text-red-600 font-medium' :
                quotaStatus === 'warning' ? 'text-orange-600 font-medium' :
                'text-slate-500'
              }`}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Progress bar för kvot-visning */}
          {quotaInfo?.showProgress && !isPremium && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-3"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">
                  {quotaInfo.used}/{quotaInfo.limit} använda
                </span>
                <span className={`font-medium ${
                  quotaStatus === 'exhausted' ? 'text-red-600' :
                  quotaStatus === 'warning' ? 'text-orange-600' :
                  colors.icon
                }`}>
                  {Math.round(quotaPercentage)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${quotaPercentage}%` }}
                  transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full transition-colors duration-300 ${
                    quotaStatus === 'exhausted' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    quotaStatus === 'warning' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    `bg-gradient-to-r ${colors.gradient}`
                  }`}
                />
              </div>
            </motion.div>
          )}

          {/* Countdown timer */}
          {quotaInfo?.showCountdown && !isPremium && (timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-3 flex items-center gap-2 text-xs"
            >
              <Clock className="w-3 h-3 text-slate-500" />
              <span className="text-slate-600">
                Återställs om {formatTimeRemaining()}
              </span>
            </motion.div>
          )}

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-500">från förra veckan</span>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.3, type: "spring", stiffness: 400 }
          }}
          className={`
            ${colors.bg} p-3 rounded-xl border ${colors.border}
            shadow-lg hover:shadow-xl transition-all duration-300
            relative overflow-hidden group
            ${quotaStatus === 'warning' ? 'ring-2 ring-orange-200' : ''}
            ${quotaStatus === 'exhausted' ? 'ring-2 ring-red-200' : ''}
          `}
        >
          <Icon className={`w-6 h-6 ${
            quotaStatus === 'exhausted' ? 'text-red-600' :
            quotaStatus === 'warning' ? 'text-orange-600' :
            colors.icon
          } relative z-10 transition-transform duration-300 group-hover:scale-110`} />

          {/* Kvot-status indikator */}
          {quotaInfo && !isPremium && quotaStatus !== 'normal' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                quotaStatus === 'exhausted' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
              }`}
            >
              {quotaStatus === 'exhausted' ? (
                <AlertTriangle className="w-2.5 h-2.5" />
              ) : (
                <AlertTriangle className="w-2.5 h-2.5" />
              )}
            </motion.div>
          )}

          {/* Premium indikator */}
          {isPremium && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-2.5 h-2.5" />
            </motion.div>
          )}

          {/* Glow effect on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-xl`}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
            animate={{ x: ['0%', '200%'] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 5,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>

        {/* Enhanced animated background gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: isPremium ? [0.05, 0.1, 0.05] : 0.05
          }}
          transition={{
            delay: 0.5,
            duration: isPremium ? 4 : 1,
            repeat: isPremium ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-xl pointer-events-none`}
        />

        {/* Update pulse effect */}
        {isUpdating && pulseOnUpdate && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 bg-blue-400/20 rounded-xl pointer-events-none"
          />
        )}
      </PremiumCard>
    </div>
  );
}