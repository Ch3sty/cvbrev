'use client';

// INTERN FÖRHANDSGRANSKNING — ej för publik. Renderar matrislogik-frågor precis
// som i det skarpa testet, med facit utpekat, för okulär granskning.
// Ligger bakom inloggning. Ta bort efter granskning.

import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7';
import type { LayeredCell, LayeredQuestion } from '@/lib/logicTestV7/layered.v7';
import grundQuestions from '@/lib/logicTestV7/questionBankGrund.v7.json';

const GRUND = grundQuestions as unknown as LayeredQuestion[];

function CellSvg({ cell, highlight }: { cell: LayeredCell | null; highlight?: 'correct' }) {
  return (
    <div
      className={`aspect-square rounded-xl bg-white flex items-center justify-center border-2 ${
        highlight === 'correct' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
      }`}
    >
      {cell ? (
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
          <SvgLayeredCell cell={cell} />
        </svg>
      ) : (
        <span className="text-3xl font-black text-slate-300">?</span>
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Matrislogik V7 grund — okulär granskning
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Förslag på ny grundnivå byggd på den snygga V7-grafiken (ersätter orange V5).
          Det gröna alternativet är facit. Kontrollera att mönstret leder dit, och att
          figurerna ser rena och vuxna ut.
        </p>
      </div>

      <div className="space-y-10">
        {GRUND.map((q, qi) => (
          <div key={q.id} className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-white">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h2 className="text-base font-bold text-slate-900">
                {qi + 1}. {q.title}
              </h2>
              <span className="text-[11px] font-mono text-slate-400">{q.id}</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Nivå {q.difficulty}
              </span>
            </div>
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
              <span className="font-semibold">Regel: </span>{q.rule}
            </p>

            {/* 3x3 grid */}
            <div className="max-w-xs mx-auto">
              <div className="grid grid-cols-3 gap-2">
                {q.grid.flat().map((cell, i) => (
                  <CellSvg key={i} cell={cell} />
                ))}
              </div>
            </div>

            {/* alternativ */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Svarsalternativ (grönt = facit)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {q.options.map((opt, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -top-1.5 left-1 text-[10px] font-bold text-slate-400 z-10">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {i === q.correctAnswer && (
                      <span className="absolute -top-1.5 right-1 text-[9px] font-bold text-emerald-600 z-10">
                        RÄTT
                      </span>
                    )}
                    <CellSvg cell={opt} highlight={i === q.correctAnswer ? 'correct' : undefined} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
