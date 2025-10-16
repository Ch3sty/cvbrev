'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface QuotaCardProps {
  title: string;
  icon: React.ReactNode;
  used: number;
  limit: number;
  remaining: number;
  resetDate?: Date;
  resetType?: 'daily' | 'weekly';
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

  // Color classes
  const colorClasses = {
    green: {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      dot: 'text-green-600'
    },
    yellow: {
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      dot: 'text-yellow-600'
    },
    red: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      dot: 'text-red-600'
    },
    gray: {
      text: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      dot: 'text-slate-600'
    },
    premium: {
      text: 'text-purple-600',
      bg: 'bg-gradient-to-br from-pink-50 to-purple-50',
      border: 'border-purple-200',
      dot: 'text-purple-600'
    }
  };

  // Generate visual dots
  const renderDots = () => {
    if (isPremium) return null;

    return (
      <div className="flex items-center gap-1 text-xl">
        {Array.from({ length: limit }, (_, i) => (
          <span
            key={i}
            className={i < used ? colorClasses[color].dot : 'text-gray-300'}
          >
            ●
          </span>
        ))}
      </div>
    );
  };

  // Calculate countdown
  const getCountdown = () => {
    if (!resetDate || isPremium) return null;

    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Återställs om ${days} dag${days > 1 ? 'ar' : ''}`;
    }
    if (hours > 0) {
      return `Återställs om ${hours}h`;
    }
    return 'Återställs snart';
  };

  const countdown = getCountdown();

  const cardContent = (
    <motion.div
      whileHover={href ? { scale: 1.02, y: -2 } : {}}
      whileTap={href ? { scale: 0.98 } : {}}
      className={`
        bg-white/90 backdrop-blur-xl rounded-xl border shadow-sm p-5
        transition-all duration-300
        ${href ? 'cursor-pointer hover:shadow-lg hover:border-slate-300' : ''}
        ${colorClasses[color].border}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`${colorClasses[color].bg} rounded-lg p-2`}>
          <div className={`w-5 h-5 ${colorClasses[color].text}`}>
            {icon}
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
      </div>

      {/* Content */}
      {isPremium ? (
        // Premium card content
        <div className="relative space-y-3">
          {/* Gradient background orb */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="relative">
            {/* Dynamic number with gradient */}
            <div className="text-4xl font-black bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {used > 0 ? used : premiumText}
            </div>

            {/* Premium badge */}
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-300/30">
                <span className="text-xs font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Premium
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Quota card content
        <div className="space-y-3">
          {/* Visual dots */}
          {renderDots()}

          {/* Usage text */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {used}/{limit}
            </span>
          </div>

          {/* Remaining */}
          <div className={`text-sm font-medium ${colorClasses[color].text}`}>
            {remaining} kvar
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {countdown}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  // Wrap in Link if href provided
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
