'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Trophy } from 'lucide-react';

interface Milestone {
  level: number;
  isClaimed: boolean;
  isUnlocked: boolean;
}

interface MilestoneTimelineProps {
  currentLevel: number;
  milestones: Milestone[];
}

export default function MilestoneTimeline({
  currentLevel,
  milestones
}: MilestoneTimelineProps) {
  // Sortera milestones efter level
  const sortedMilestones = [...milestones].sort((a, b) => a.level - b.level);

  // Beräkna total progress (0-100)
  const maxLevel = sortedMilestones[sortedMilestones.length - 1]?.level || 50;
  const progressPercentage = Math.min((currentLevel / maxLevel) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
            <Trophy className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Din belöningsresa</h3>
            <p className="text-sm text-slate-500">Level {currentLevel} av {maxLevel}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {Math.round(progressPercentage)}%
          </span>
          <p className="text-xs text-slate-500">genomfört</p>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-100 rounded-full -translate-y-1/2" />

        {/* Progress track */}
        <motion.div
          className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Milestone markers */}
        <div className="relative flex justify-between items-center py-4">
          {sortedMilestones.map((milestone, index) => {
            const isClaimed = milestone.isClaimed;
            const isUnlocked = milestone.isUnlocked && !isClaimed;
            const isLocked = !milestone.isUnlocked && !isClaimed;
            const isCurrent = milestone.level === currentLevel ||
              (currentLevel >= milestone.level &&
               (index === sortedMilestones.length - 1 || currentLevel < sortedMilestones[index + 1]?.level));

            return (
              <div
                key={milestone.level}
                className="relative flex flex-col items-center"
              >
                {/* Level label */}
                <span className={`
                  text-xs font-medium mb-2
                  ${isClaimed ? 'text-emerald-600' : ''}
                  ${isUnlocked ? 'text-pink-600' : ''}
                  ${isLocked ? 'text-slate-400' : ''}
                  ${isCurrent && !isClaimed && !isUnlocked ? 'text-purple-600' : ''}
                `}>
                  {milestone.level}
                </span>

                {/* Marker */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className={`
                    relative w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isClaimed
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                      : isUnlocked
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-200'
                        : 'bg-slate-200'
                    }
                  `}
                >
                  {isClaimed ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isUnlocked ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}

                  {/* Current indicator */}
                  {isCurrent && !isClaimed && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-1 rounded-full border-2 border-purple-400"
                    />
                  )}
                </motion.div>

                {/* Status label below */}
                <span className={`
                  text-[10px] mt-1.5 font-medium
                  ${isClaimed ? 'text-emerald-600' : ''}
                  ${isUnlocked ? 'text-pink-600' : ''}
                  ${isLocked ? 'text-slate-300' : ''}
                `}>
                  {isClaimed ? '✓' : isUnlocked ? 'Ny!' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600">Aktiverad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
          <span className="text-xs text-slate-600">Tillgänglig</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200" />
          <span className="text-xs text-slate-600">Låst</span>
        </div>
      </div>
    </motion.div>
  );
}
