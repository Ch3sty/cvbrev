'use client';

import { useEffect, useState } from 'react';
import { Ear } from 'lucide-react';
import type { InterviewQuestion } from '@/lib/recruiter/workStyle';

interface InterviewPracticeProps {
  questions: InterviewQuestion[];
}

/**
 * Intervjuträning: exakt de frågor rekryteraren får, som övningskort med
 * STAR-mall (Situation/Uppgift/Handling/Resultat). Svaren sparas endast i
 * localStorage — de lämnar aldrig webbläsaren och delas aldrig.
 */

const STORAGE_KEY = 'arbetsstil-star-v1';

type StarAnswer = { s: string; t: string; a: string; r: string };
type StarStore = Record<string, StarAnswer>;

const EMPTY_ANSWER: StarAnswer = { s: '', t: '', a: '', r: '' };

const STAR_FIELDS: Array<{ key: keyof StarAnswer; label: string; hint: string }> = [
  { key: 's', label: 'Situation', hint: 'Var var du, vad hände?' },
  { key: 't', label: 'Uppgift', hint: 'Vad var ditt ansvar?' },
  { key: 'a', label: 'Handling', hint: 'Vad gjorde just du, konkret?' },
  { key: 'r', label: 'Resultat', hint: 'Hur slutade det, vad lärde du dig?' },
];

function loadStore(): StarStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StarStore) : {};
  } catch {
    return {};
  }
}

export default function InterviewPractice({ questions }: InterviewPracticeProps) {
  const [store, setStore] = useState<StarStore>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setHydrated(true);
  }, []);

  const update = (question: string, field: keyof StarAnswer, value: string) => {
    setStore((prev) => {
      const next: StarStore = {
        ...prev,
        [question]: { ...EMPTY_ANSWER, ...prev[question], [field]: value },
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Fullt/blockat lagringsutrymme: övningen funkar ändå, bara utan spar.
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {questions.map((q, index) => {
        const answer = store[q.question] ?? EMPTY_ANSWER;
        return (
          <div
            key={q.question}
            className="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5"
          >
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-indigo-500 mb-1">
              Fråga {index + 1} · {q.basedOn}
            </p>
            <p className="text-[14px] font-bold text-slate-900 leading-relaxed">
              {q.question}
            </p>

            {/* Det rekryteraren lyssnar efter — träna mot facit */}
            <div className="mt-3 rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-700 mb-1.5">
                <Ear className="w-3.5 h-3.5" strokeWidth={2.5} />
                Det här lyssnar rekryteraren efter
              </p>
              <ul className="space-y-1">
                {q.listenFor.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[12.5px] text-indigo-900/80 leading-relaxed"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-[7px]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* STAR-mallen som skrivfält */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STAR_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">
                    {field.label}
                  </span>
                  <textarea
                    value={hydrated ? answer[field.key] : ''}
                    onChange={(e) => update(q.question, field.key, e.target.value)}
                    placeholder={field.hint}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 leading-relaxed placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-y"
                  />
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-[12px] text-slate-400 leading-relaxed">
        Dina svar sparas bara i din webbläsare. De skickas aldrig till oss och
        delas aldrig med rekryterare.
      </p>
    </div>
  );
}
