'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Tag,
  Crown,
  Star,
  Users,
  Gift,
  Lock,
  CheckCircle2,
  Sparkles,
  Target
} from 'lucide-react';

type RewardType = 'trial' | 'discount' | 'premium_time' | 'status' | 'guest_invitations';
type RewardStatus = 'claimed' | 'unlocked' | 'upcoming' | 'locked';

interface RewardData {
  duration_days?: number;
  percentage?: number;
  status?: string;
  invitations?: number;
}

interface RewardMilestoneCardProps {
  id: string;
  level: number;
  name: string;
  description: string;
  rewardType: RewardType;
  rewardData: RewardData;
  status: RewardStatus;
  levelsRemaining?: number;
  onClaim?: (id: string) => void;
  index?: number;
}

// Färgschema per reward-typ
const colorSchemes: Record<RewardType, {
  gradient: string;
  bgGradient: string;
  border: string;
  text: string;
  iconBg: string;
}> = {
  trial: {
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconBg: 'from-blue-500 to-cyan-500'
  },
  discount: {
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'from-emerald-500 to-teal-600'
  },
  premium_time: {
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'from-purple-500 to-pink-600'
  },
  status: {
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    iconBg: 'from-pink-500 to-rose-600'
  },
  guest_invitations: {
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    iconBg: 'from-amber-500 to-orange-600'
  }
};

// Ikon per reward-typ
const getRewardIcon = (type: RewardType) => {
  const iconClass = "w-5 h-5 text-white";
  switch (type) {
    case 'trial': return <Zap className={iconClass} />;
    case 'discount': return <Tag className={iconClass} />;
    case 'premium_time': return <Crown className={iconClass} />;
    case 'status': return <Star className={iconClass} />;
    case 'guest_invitations': return <Users className={iconClass} />;
    default: return <Gift className={iconClass} />;
  }
};

// Formatera reward-värde
const getRewardValue = (type: RewardType, data: RewardData) => {
  switch (type) {
    case 'trial':
      return { value: `${data.duration_days} dagars`, label: 'provperiod' };
    case 'discount':
      return { value: `${data.percentage}%`, label: 'rabatt' };
    case 'premium_time':
      return { value: `${data.duration_days} dagars`, label: 'Premium' };
    case 'status':
      return { value: data.status || 'Genesis', label: 'status' };
    case 'guest_invitations':
      return { value: `${data.invitations || 3}`, label: 'inbjudningar' };
    default:
      return { value: 'Belöning', label: '' };
  }
};

export default function RewardMilestoneCard({
  id,
  level,
  name,
  description,
  rewardType,
  rewardData,
  status,
  levelsRemaining = 0,
  onClaim,
  index = 0
}: RewardMilestoneCardProps) {
  const colors = colorSchemes[rewardType] || colorSchemes.premium_time;
  const rewardValue = getRewardValue(rewardType, rewardData);
  const isLocked = status === 'locked';
  const isClaimed = status === 'claimed';
  const isUnlocked = status === 'unlocked';
  const isUpcoming = status === 'upcoming';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={`
        relative rounded-xl sm:rounded-2xl overflow-hidden transition-all h-full
        ${isLocked ? 'opacity-50' : ''}
        ${isUnlocked ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
        bg-gradient-to-br ${colors.bgGradient} ${colors.border} border
        shadow-lg hover:shadow-xl
      `}
    >
      {/* Unlocked glow effect */}
      {isUnlocked && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-pink-200/40 to-purple-200/40 pointer-events-none"
        />
      )}

      {/* Bakgrundsdekor */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full -translate-y-8 translate-x-8" />

      <div className="relative z-10 p-4 sm:p-5">
        {/* Header: Ikon + Level Badge */}
        <div className="flex items-start justify-between mb-3">
          {/* Ikon */}
          <div className={`
            p-2.5 rounded-xl shadow-md
            bg-gradient-to-br ${colors.iconBg}
            ${isLocked ? 'grayscale' : ''}
            ${isClaimed ? 'bg-gradient-to-br from-emerald-500 to-green-600' : ''}
          `}>
            {isClaimed ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : isLocked ? (
              <Lock className="w-5 h-5 text-white/70" />
            ) : (
              getRewardIcon(rewardType)
            )}
          </div>

          {/* Level Badge med status */}
          <div className="flex flex-col items-end gap-1">
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-bold
              ${isLocked ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white'}
            `}>
              Level {level}
            </span>

            {/* Status indicator */}
            {isUnlocked && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1 text-xs font-semibold text-pink-600"
              >
                <Sparkles className="w-3 h-3" />
                <span>Ny!</span>
              </motion.div>
            )}

            {isUpcoming && (
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <Target className="w-3 h-3" />
                <span>{levelsRemaining} {levelsRemaining === 1 ? 'nivå' : 'nivåer'}</span>
              </div>
            )}

            {isClaimed && (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Aktiverad</span>
              </div>
            )}
          </div>
        </div>

        {/* Reward Value - Stort och tydligt */}
        <div className="mb-2">
          <div className={`text-2xl sm:text-3xl font-bold ${isLocked ? 'text-slate-400' : colors.text}`}>
            {rewardValue.value}
          </div>
          <div className={`text-sm font-medium ${isLocked ? 'text-slate-400' : colors.text}`}>
            {rewardValue.label}
          </div>
        </div>

        {/* Beskrivning */}
        <p className={`text-sm mb-4 line-clamp-2 ${isLocked ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </p>

        {/* Action Area */}
        <div className="mt-auto">
          {isUnlocked && onClaim && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClaim(id)}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
            >
              <Gift className="w-4 h-4" />
              Hämta nu!
            </motion.button>
          )}

          {isUpcoming && (
            <div className="w-full py-2.5 px-4 bg-blue-100 text-blue-700 font-medium rounded-xl text-center text-sm">
              {levelsRemaining} {levelsRemaining === 1 ? 'nivå kvar' : 'nivåer kvar'}
            </div>
          )}

          {isClaimed && (
            <div className="w-full py-2.5 px-4 bg-emerald-100 text-emerald-700 font-medium rounded-xl text-center text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Belöning aktiverad
            </div>
          )}

          {isLocked && (
            <div className="w-full py-2.5 px-4 bg-slate-100 text-slate-500 font-medium rounded-xl text-center text-sm flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Låst
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
