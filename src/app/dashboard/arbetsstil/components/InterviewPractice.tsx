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
 * localStorage, de lämnar aldrig webbläsaren och delas aldrig.
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
            className="rounded-xl border border-kant bg-panel p-4 sm:p-5"
          >
            <p className="mb-1 text-steg uppercase text-ink-3">
              Fråga {index + 1} · {q.basedOn}
            </p>
            <p className="text-kort text-ink-1">{q.question}</p>

            {/* Det rekryteraren lyssnar efter, träna mot facit */}
            <div className="mt-3 rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
              <p className="mb-1.5 text-steg uppercase text-ink-3">
                Det här lyssnar rekryteraren efter
              </p>
              <ul className="space-y-1">
                {q.listenFor.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-meta leading-snug text-ink-2"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-3"
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
                  <span className="mb-1 block text-sm font-medium text-ink-2">{field.label}</span>
                  <textarea
                    value={hydrated ? answer[field.key] : ''}
                    onChange={(e) => update(q.question, field.key, e.target.value)}
                    placeholder={field.hint}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-kant bg-insunken px-3 py-2.5 text-base leading-[22px] text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
                  />
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-meta text-ink-3">
        Dina svar sparas bara i din webbläsare. De skickas aldrig till oss och
        delas aldrig med rekryterare.
      </p>
    </div>
  );
}
