'use client';

import { motion } from 'framer-motion';
import type { Cell } from '@/lib/logicTestV4/types.v4';
import { SvgCellV4 } from '@/lib/logicTestV4/renderers.v4';

interface QuestionGridProps {
  grid: (Cell | null)[][];
  showGrid?: boolean;
}

// Grid reference component
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

export function QuestionGrid({ grid, showGrid = false }: QuestionGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200">
      {grid.flat().map((cell, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="aspect-square bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 flex items-center justify-center overflow-hidden hover:border-indigo-300 transition-colors"
        >
          {cell ? (
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-2"
              shapeRendering="geometricPrecision"
            >
              {showGrid && <Grid />}
              <SvgCellV4 cell={cell} />
            </svg>
          ) : (
            <div className="text-5xl font-bold text-slate-300 select-none">?</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
