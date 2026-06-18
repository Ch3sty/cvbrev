'use client';

import { motion } from 'framer-motion';
import type { V7Cell } from '@/lib/logicTestV7/types.v7';
import { SvgCellV7 } from '@/lib/logicTestV7/renderers.v7';

interface QuestionGridProps {
  grid: (V7Cell | null)[][];
}

export function QuestionGrid({ grid }: QuestionGridProps) {
  return (
    <div
      className="bg-white rounded-3xl border border-orange-200/60 p-3 sm:p-5 max-w-md mx-auto"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {grid.flat().map((cell, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="relative"
          >
            {cell ? (
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-white to-orange-50/40 border border-orange-100 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full p-1.5 sm:p-2"
                  shapeRendering="geometricPrecision"
                >
                  <SvgCellV7 cell={cell} />
                </svg>
              </div>
            ) : (
              <EmptyCell />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EmptyCell() {
  return (
    <div
      className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(220, 38, 38, 0.08))',
        border: '2px dashed rgba(249, 115, 22, 0.45)',
      }}
    >
      {/* Samma höjd-mekanism som de fyllda cellerna (w-full/h-full svg) så att
          ?-rutan inte kollapsar till halv höjd. */}
      <svg viewBox="0 0 100 100" className="w-full h-full p-1.5 sm:p-2">
        <motion.text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="52"
          fontWeight="800"
          fill="#F97316"
          style={{ userSelect: 'none' }}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ?
        </motion.text>
      </svg>
    </div>
  );
}
