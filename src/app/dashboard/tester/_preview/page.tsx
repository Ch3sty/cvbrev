'use client';

// INTERN FÖRHANDSGRANSKNING — ej för publik. Renderar alla matrislogik-frågor
// (befintliga + nya) precis som i det skarpa testet, med facit utpekat, så att
// frågorna kan granskas okulärt. Ligger bakom inloggning. Ta bort efter granskning.

import { useState } from 'react';
import { QuestionGrid } from '@/components/tests/logicV4/QuestionGrid';
import { SvgCellV5 } from '@/lib/logicTestV5/renderers.v5';
import existing from '@/lib/logicTestV5/questionBank.v5.json';
import added from '@/lib/logicTestV5/_previewNewQuestions.json';
import type { Question } from '@/lib/logicTestV5/types.v5';

const EXISTING = existing as Question[];
const ADDED = added as Question[];

export default function PreviewPage() {
  const [tab, setTab] = useState<'new' | 'all'>('new');
  const list = tab === 'new' ? ADDED : [...EXISTING, ...ADDED];

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Matrislogik – okulär granskning
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Varje fråga renderas som i det riktiga testet. Det gröna alternativet är
          facit. Kontrollera att mönstret i rutnätet faktiskt leder till det gröna svaret.
        </p>
        <div className="mt-4 inline-flex rounded-xl border border-orange-200 overflow-hidden">
          <button
            onClick={() => setTab('new')}
            className={`px-4 py-2 text-sm font-semibold ${tab === 'new' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700'}`}
          >
            Nya ({ADDED.length})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 text-sm font-semibold ${tab === 'all' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700'}`}
          >
            Alla ({EXISTING.length + ADDED.length})
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {list.map((q, qi) => (
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

            <QuestionGrid grid={q.grid} />

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Svarsalternativ (grönt = facit)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correctAnswer;
                  return (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-xl flex items-center justify-center border-2 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="absolute top-1 left-1.5 text-[10px] font-bold text-slate-400">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {isCorrect && (
                        <span className="absolute top-1 right-1.5 text-[9px] font-bold text-emerald-600">
                          RÄTT
                        </span>
                      )}
                      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                        <SvgCellV5 cell={opt} />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
