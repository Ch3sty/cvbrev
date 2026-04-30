'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface PotentialBarProps {
  currentAtsScore: number;
  dynamicPotentialScore: number;
  totalSelected: number;
  totalAvailable: number;
}

/**
 * Visar nuvarande ATS-poäng → potentiell efter vald.
 * Desktop: in-flow card. Mobil: fixed bottom ovanför nav.
 */
export default function PotentialBar({
  currentAtsScore,
  dynamicPotentialScore,
  totalSelected,
  totalAvailable,
}: PotentialBarProps) {
  const atsIncrease = Math.round(dynamicPotentialScore - currentAtsScore);

  return (
    <>
      {/* Desktop / tablet: in-flow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden sm:block"
      >
        <Bar
          currentAtsScore={currentAtsScore}
          dynamicPotentialScore={dynamicPotentialScore}
          totalSelected={totalSelected}
          totalAvailable={totalAvailable}
          atsIncrease={atsIncrease}
        />
      </motion.div>

      {/* Mobil: fixed bottom ovanför mobile-progress (som ligger på 64px + safe-area) */}
      <div
        className="sm:hidden fixed left-0 right-0 z-20 px-3"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 138px)',
        }}
      >
        <Bar
          currentAtsScore={currentAtsScore}
          dynamicPotentialScore={dynamicPotentialScore}
          totalSelected={totalSelected}
          totalAvailable={totalAvailable}
          atsIncrease={atsIncrease}
          compact
        />
      </div>
    </>
  );
}

function Bar({
  currentAtsScore,
  dynamicPotentialScore,
  totalSelected,
  totalAvailable,
  atsIncrease,
  compact = false,
}: {
  currentAtsScore: number;
  dynamicPotentialScore: number;
  totalSelected: number;
  totalAvailable: number;
  atsIncrease: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl text-white ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 12px 28px -12px rgba(220, 38, 38, 0.55)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex-shrink-0 rounded-xl bg-white/20 flex items-center justify-center ${
              compact ? 'w-9 h-9' : 'w-10 h-10'
            }`}
          >
            <TrendingUp className={compact ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
              Potential med dina val
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              {totalSelected} av {totalAvailable} valda
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`font-bold tabular-nums ${
                compact ? 'text-lg' : 'text-xl sm:text-2xl'
              }`}
            >
              {currentAtsScore}
            </span>
            <span className="opacity-70">→</span>
            <span
              className={`font-bold tabular-nums ${
                compact ? 'text-lg' : 'text-xl sm:text-2xl'
              }`}
            >
              {Math.round(dynamicPotentialScore)}
            </span>
          </div>
          <div className="text-[11px] mt-0.5">
            {atsIncrease > 0 ? (
              <span className="font-semibold text-emerald-200">
                +{atsIncrease} poäng
              </span>
            ) : (
              <span className="opacity-80">Välj förbättringar</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
