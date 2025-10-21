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
      text: 'text-blue-700',
      bg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
      border: 'border-blue-200',
      dot: 'text-blue-600'
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
          {/* Subtle blue glow background */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl blur-xl"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="relative">
            {/* Clean text with subtle shadow */}
            <div className="text-4xl font-bold text-slate-900 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              {used > 0 ? used : premiumText}
            </div>

            {/* Discrete premium badge */}
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 bg-blue-50 rounded-full border border-blue-200/40">
                <span className="text-xs font-semibold text-blue-700">
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
