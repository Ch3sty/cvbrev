'use client';

import { IconLogicCell } from '@/lib/tester/iconLogicTypes';

interface IconCellSVGProps {
  cell: IconLogicCell;
  className?: string;
}

/**
 * Icon Logic Cell Renderer
 * Renders raw SVG markup directly (different from Matrislogik which uses Shape objects)
 */
export function IconCellSVG({ cell, className = '' }: IconCellSVGProps) {
  // If empty cell, show question mark
  if (!cell.svg || cell.svg.trim() === '') {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-6xl font-bold text-gray-400">?</div>
      </div>
    );
  }

  // Render raw SVG using dangerouslySetInnerHTML
  // This is safe because the SVG comes from our server-side question bank
  return (
    <div
      className={`w-full h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: cell.svg }}
    />
  );
}
