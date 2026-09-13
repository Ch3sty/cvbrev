'use client';

import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7';
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7';

interface Props {
  grid: (LayeredCell | null)[][];
}

/**
 * Matrisen i logiktestet: en panel med nio celler. Den tomma cellen är
 * insunken med streckad kant och ett frågetecken i ink-3, ingen orange yta.
 */
export function QuestionGridV7({ grid }: Props) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-kant bg-panel p-3 sm:p-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {grid.flat().map((cell, i) => (
          <div key={i}>
            {/* Fylld och tom cell delar samma wrapper-struktur så de får
                alltid identisk höjd. */}
            {cell ? (
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-kant bg-panel">
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full p-1.5 sm:p-2"
                  shapeRendering="geometricPrecision"
                >
                  <SvgLayeredCell cell={cell} />
                </svg>
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-kant-stark bg-insunken">
                {/* Samma höjd-mekanism som de fyllda cellerna: en w-full/h-full svg. */}
                <svg viewBox="0 0 100 100" className="h-full w-full p-1.5 sm:p-2" aria-hidden="true">
                  <text
                    x="50"
                    y="52"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="52"
                    fontWeight="500"
                    fill="var(--ink-3)"
                    style={{ userSelect: 'none' }}
                  >
                    ?
                  </text>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
