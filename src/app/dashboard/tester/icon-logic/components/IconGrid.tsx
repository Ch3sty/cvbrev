'use client';

import { IconLogicMatrix3x3 } from '@/lib/tester/iconLogicTypes';
import { IconCellSVG } from './IconCellSVG';

interface IconGridProps {
  matrix: IconLogicMatrix3x3;
  className?: string;
}

export function IconGrid({ matrix, className = '' }: IconGridProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {matrix.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <div
            key={`${rowIdx}-${colIdx}`}
            className="aspect-square border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center p-4"
          >
            <IconCellSVG cell={cell} />
          </div>
        ))
      )}
    </div>
  );
}
