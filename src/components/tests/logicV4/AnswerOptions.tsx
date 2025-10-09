'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Cell } from '@/lib/logicTestV4/types.v4';
import { SvgCellV4 } from '@/lib/logicTestV4/renderers.v4';

interface AnswerOptionsProps {
  options: Cell[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showGrid?: boolean;
  disabled?: boolean;
}

// Grid reference component
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

export function AnswerOptions({
  options,
  selectedIndex,
  onSelect,
  showGrid = false,
  disabled = false
}: AnswerOptionsProps) {
  return (
    <div className="w-full">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-slate-600 mb-4 font-medium"
      >
        Välj rätt svar:
      </motion.p>

      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {options.map((option, i) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = selectedIndex === i;

          return (
            <motion.button
              key={i}
              onClick={() => !disabled && onSelect(i)}
              disabled={disabled}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
              whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              className={cn(
                "relative aspect-square rounded-xl border-3 transition-all",
                "bg-white shadow-md",
                !disabled && "hover:shadow-xl cursor-pointer",
                disabled && "cursor-not-allowed opacity-60",
                isSelected && "border-indigo-500 ring-4 ring-indigo-200 shadow-lg shadow-indigo-500/25",
                !isSelected && "border-slate-200 hover:border-indigo-300"
              )}
            >
              {/* Letter badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05, type: "spring", stiffness: 200 }}
                className={cn(
                  "absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10",
                  isSelected
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                    : "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700"
                )}
              >
                {letter}
              </motion.div>

              {/* SVG content */}
              <div className="w-full h-full p-3 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  shapeRendering="geometricPrecision"
                >
                  {showGrid && <Grid />}
                  <SvgCellV4 cell={option} />
                </svg>
              </div>

              {/* Selected indicator glow */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl pointer-events-none"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
