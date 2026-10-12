'use client';

import { FigurV7, LuckaV7 } from '@/lib/logicTestV7/layered.v7';
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7';

interface Props {
  grid: (LayeredCell | null)[][];
}

/**
 * Matrisen i logikens klassiska test och övningsprov, i passets struktur
 * (grafik v3, spec avsnitt 1): ett papperskort med hårlinjer mellan rutorna,
 * figuren i 80 procent av rutan, samma skala som alternativen. Luckan är en
 * insjunken ruta med streckad ram och ritat frågetecken i ram-grått, ingen
 * text och ingen koppar. Fylld ruta och lucka har samma svg-i-full-storlek,
 * så höjden blir alltid densamma.
 */
export function QuestionGridV7({ grid }: Props) {
  const kolumner = grid[0]?.length ?? 3;
  return (
    <div className="matrisyta mx-auto w-full max-w-[420px] rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft" data-matris>
      <div
        role="img"
        aria-label="Matris med åtta figurer och en tom ruta nere till höger"
        className="grid gap-px overflow-hidden bg-kant"
        style={{ gridTemplateColumns: `repeat(${kolumner}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center ${cell ? 'bg-papper' : 'bg-papper-2'}`}
            data-lucka={cell ? undefined : 'tom'}
          >
            {cell ? <FigurV7 cell={cell} /> : <LuckaV7 />}
          </div>
        ))}
      </div>
    </div>
  );
}
