'use client';

import { Matrix3x3 } from '@/lib/tester/patternTypes';
import { MatrixCellSVG } from './MatrixCellSVG';

interface MatrixGridProps {
  matrix: Matrix3x3;
  className?: string;
}

export function MatrixGrid({ matrix, className = '' }: MatrixGridProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {matrix.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <div
            key={`${rowIdx}-${colIdx}`}
            className="aspect-square border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center p-2"
          >
            {cell.shapes.length === 0 ? (
              // Missing cell indicator
              <div className="text-6xl font-bold text-gray-400">?</div>
            ) : (
              <MatrixCellSVG cell={cell} />
            )}
          </div>
        ))
      )}
    </div>
  );
}
