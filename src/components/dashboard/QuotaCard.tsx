'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface QuotaCardProps {
  title: string;
  icon: React.ReactNode;
  used: number;
  limit: number;
  remaining: number;
  resetDate?: Date;
  resetType?: 'daily' | 'weekly' | 'permanent';
  href?: string;
  isPremium?: boolean;
  premiumText?: string;
}

export default function QuotaCard({
  title,
  icon,
  used,
  limit,
  remaining,
  resetDate,
  resetType,
  href,
  isPremium = false,
  premiumText
}: QuotaCardProps) {
  // Calculate color based on remaining quota
  const getColor = () => {
    if (isPremium) return 'premium';
    const percentage = (remaining / limit) * 100;
    if (percentage > 50) return 'green';
    if (percentage > 25) return 'yellow';
    if (percentage >= 0) return 'red';
    return 'gray';
  };

  const color = getColor();

  // Premium glassmorfism color classes
  const colorClasses = {
    green: {
      text: 'text-emerald-700',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-green-100',
      iconText: 'text-emerald-600',
      cardGlow: 'shadow-emerald-500/10',
      hoverGlow: 'hover:shadow-emerald-500/20',
      dot: 'text-emerald-600',
      border: 'border-emerald-200/60'
    },
    yellow: {
      text: 'text-amber-700',
      iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
      iconText: 'text-amber-600',
      cardGlow: 'shadow-amber-500/10',
      hoverGlow: 'hover:shadow-amber-500/20',
      dot: 'text-amber-600',
      border: 'border-amber-200/60'
    },
    red: {
      text: 'text-rose-700',
      iconBg: 'bg-gradient-to-br from-rose-100 to-red-100',
      iconText: 'text-rose-600',
      cardGlow: 'shadow-rose-500/10',
      hoverGlow: 'hover:shadow-rose-500/20',
      dot: 'text-rose-600',
      border: 'border-rose-200/60'
    },
    gray: {
      text: 'text-slate-600',
      iconBg: 'bg-gradient-to-br from-slate-100 to-gray-100',
      iconText: 'text-slate-500',
      cardGlow: 'shadow-slate-500/10',
      hoverGlow: 'hover:shadow-slate-500/20',
      dot: 'text-slate-400',
      border: 'border-slate-200/60'
    },
    premium: {
      text: 'text-blue-700',
      iconBg: 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100',
      iconText: 'text-blue-600',
      cardGlow: 'shadow-blue-500/20',
      hoverGlow: 'hover:shadow-blue-500/30',
      dot: 'text-blue-600',
      border: 'border-blue-200/60'
    }
  };

  // Generate visual dots with premium style
  const renderDots = () => {
    if (isPremium) return null;

    return (
      <div className="flex items-center gap-1 sm:gap-1.5">
        {Array.from({ length: limit }, (_, i) => (
          <motion.span
            key={i}
            className={`text-lg sm:text-xl md:text-2xl transition-all duration-300 ${
              i < used ? colorClasses[color].dot : 'text-gray-300'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          >
            ●
          </motion.span>
        ))}
      </div>
    );
  };

  // Live countdown timer - updates every minute
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!resetDate || isPremium || resetType === 'permanent') {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = resetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Återställer...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown(); // Initial update
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [resetDate, isPremium, resetType]);

  const cardContent = (
    <motion.div
      whileHover={href ? { y: -4, scale: 1.01 } : {}}
      whileTap={href ? { scale: 0.99 } : {}}
      className={`
        relative overflow-hidden
        bg-white/80 backdrop-blur-xl rounded-2xl border
        shadow-lg ${colorClasses[color].cardGlow} ${colorClasses[color].hoverGlow}
        transition-all duration-500 ease-out
        ${href ? 'cursor-pointer touch-manipulation' : ''}
        ${colorClasses[color].border}
        group
      `}
    >
      {/* Animated gradient background orb */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
        style={{
          background: isPremium
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
            : color === 'green'
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'
            : color === 'yellow'
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)'
            : color === 'red'
            ? 'radial-gradient(circle, rgba(244, 63, 94, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(100, 116, 139, 0.4) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />

      {/* Content wrapper with padding */}
      <div className="relative p-3 sm:p-4 md:p-6">
        {/* Header with icon and title */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
          <motion.div
            className={`${colorClasses[color].iconBg} rounded-lg sm:rounded-xl p-2 sm:p-2.5 shadow-sm`}
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClasses[color].iconText}`}>
              {icon}
            </div>
          </motion.div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight flex-1">
            {title}
          </h3>
        </div>

        {/* Main content area */}
        {isPremium ? (
          // Premium card content with animated glow
          <div className="space-y-4">
            {/* Animated premium glow effect */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-lg"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative">
              {/* Large premium text or number */}
              <motion.div
                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2"
                style={{
                  textShadow: '0 2px 10px rgba(59, 130, 246, 0.1)'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {used > 0 ? used : premiumText}
              </motion.div>

              {/* Premium badge with shimmer */}
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50 shadow-sm">
                <motion.div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-[10px] sm:text-xs font-bold text-blue-700">
                  Premium
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Quota card content with enhanced visuals
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {/* Visual dots */}
            <div className="mb-2 sm:mb-3">
              {renderDots()}
            </div>

            {/* Usage display with large numbers */}
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <motion.span
                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {used}
              </motion.span>
              <span className="text-xl sm:text-2xl font-semibold text-slate-400">/</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-600">{limit}</span>
            </div>

            {/* Remaining count with premium styling */}
            <div className={`text-xs sm:text-sm font-bold ${colorClasses[color].text}`}>
              {remaining} {remaining === 1 ? 'kvar' : 'kvar'}
            </div>

            {/* Countdown timer with pulse animation */}
            {countdown && (
              <motion.div
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50/80 rounded-lg border border-slate-200/60"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                </motion.div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600">
                  {countdown}
                </span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Subtle hover shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          transform: 'translateX(-100%)'
        }}
        animate={{
          transform: href ? ['translateX(-100%)', 'translateX(100%)'] : 'translateX(-100%)'
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );

  // Wrap in Link if href provided
  if (href) {
    return (
      <Link href={href} className="block touch-manipulation">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
