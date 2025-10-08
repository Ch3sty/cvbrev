'use client';

import { Matrix3x3 } from '@/lib/tester/patternTypes';
import { ShapeSVG } from './ShapeSVG';

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
            className="aspect-square border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center relative overflow-hidden"
          >
            {cell.shapes.length === 0 ? (
              // Missing cell indicator
              <div className="text-6xl font-bold text-gray-400">?</div>
            ) : (
              // Render shapes (may overlap)
              <div className="relative w-full h-full p-2">
                {cell.shapes.map((shape, shapeIdx) => (
                  <ShapeSVG
                    key={shapeIdx}
                    shape={shape}
                    className={cell.shapes.length > 1 ? 'absolute inset-2' : ''}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
