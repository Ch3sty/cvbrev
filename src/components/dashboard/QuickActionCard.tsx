'use client';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PremiumCard as EnhancedCard } from './PremiumInteractions';
import SparkleEffect, { useSparkleOnHover } from './SparkleEffect';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  premium?: boolean;
  isPremiumUser?: boolean;
  progress?: number; // 0-100
  badge?: string;
  onClick?: () => void;
}

const colorVariants = {
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    lightBg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-600',
    glow: 'shadow-pink-500/25'
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    glow: 'shadow-blue-500/25'
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    lightBg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    glow: 'shadow-green-500/25'
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-500',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    glow: 'shadow-purple-500/25'
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    glow: 'shadow-orange-500/25'
  }
};

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  premium = false,
  isPremiumUser = false,
  progress,
  badge,
  onClick
}: QuickActionCardProps) {
  const colors = colorVariants[color];
  const isLocked = premium && !isPremiumUser;
  const sparkleHover = useSparkleOnHover();
  const isPremiumFeature = premium && isPremiumUser;

  const cardContent = (
    <div className="relative">
      {isPremiumFeature && (
        <SparkleEffect
          trigger={sparkleHover.isTriggered}
          density="medium"
          colors={['#EC4899', '#8B5CF6', '#3B82F6']}
        />
      )}

      <EnhancedCard
        className={`p-4 sm:p-6 group relative overflow-hidden ${
          isLocked ? 'opacity-75' : ''
        }`}
        clickable={!isLocked}
        glowing={isPremiumFeature}
        floating={isPremiumFeature}
        {...(isPremiumFeature ? sparkleHover : {})}
      >
      {/* Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold"
        >
          {badge}
        </motion.div>
      )}

      {/* Premium Lock Badge */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="absolute top-4 right-4 bg-slate-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
        >
          <Lock className="w-3 h-3" />
          Premium
        </motion.div>
      )}

      {/* Icon Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200 }}
        className={`
          bg-gradient-to-r ${colors.gradient}
          rounded-xl p-4 mb-6 w-fit
          shadow-lg ${colors.glow}
          group-hover:scale-110 transition-transform duration-300
        `}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>

      {/* Content */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base sm:text-lg font-semibold text-slate-900"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-slate-600 text-sm"
        >
          {description}
        </motion.p>

        {/* Progress Bar */}
        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                className={`bg-gradient-to-r ${colors.gradient} h-full rounded-full`}
              />
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`
            flex items-center justify-between
            pt-3 mt-4 border-t border-slate-200
          `}
        >
          <span className={`text-sm font-medium ${colors.text}`}>
            {isLocked ? 'Uppgradera för att använda' : 'Använd verktyg'}
          </span>
          <ArrowRight className={`w-4 h-4 ${colors.text} group-hover:translate-x-1 transition-transform`} />
        </motion.div>
      </div>

        {/* Enhanced Hover Gradient Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: isPremiumFeature ? 0.08 : 0.05 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} pointer-events-none rounded-xl`}
        />

        {/* Premium ambient glow */}
        {isPremiumFeature && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5 rounded-xl pointer-events-none`}
            animate={{
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </EnhancedCard>
    </div>
  );

  if (isLocked || onClick) {
    return (
      <div onClick={onClick} className={isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  );
}