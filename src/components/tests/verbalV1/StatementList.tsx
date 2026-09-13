import type { Statement, UserAnswer } from '@/lib/verbalTestV1/types.v1';

interface StatementListProps {
  statements: Statement[];
  userAnswers: UserAnswer[];
  onSelectAnswer: (statementIndex: number, answer: 'true' | 'false' | 'cannot_say') => void;
  isSaving: boolean;
}

const answerOptions: { value: 'true' | 'false' | 'cannot_say'; label: string }[] = [
  { value: 'true', label: 'Sant' },
  { value: 'false', label: 'Falskt' },
  { value: 'cannot_say', label: 'Kan ej avgöras' },
];

/**
 * Påståendena till en passage. Varje påstående är en panel med tre lika breda
 * svarsknappar: valt får kant i ink och vikt 500. Rätt och fel visas aldrig
 * här, bara vad som är valt.
 */
export function StatementList({
  statements,
  userAnswers,
  onSelectAnswer,
  isSaving,
}: StatementListProps) {
  return (
    <div className="space-y-3">
      {statements.map((statement, index) => {
        const userAnswer = userAnswers[index];

        return (
          <div key={index} className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
            <div className="mb-3 flex items-start gap-3">
              <span
                className="w-5 flex-shrink-0 pt-0.5 text-meta tabular-nums text-ink-3"
                aria-hidden="true"
              >
                {index + 1}.
              </span>
              <p className="flex-1 text-sm leading-[22px] text-ink-1 sm:text-base">
                {statement.text}
              </p>
            </div>

            <div role="radiogroup" aria-label={`Påstående ${index + 1}`} className="flex gap-2">
              {answerOptions.map((option) => {
                const isSelected = userAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectAnswer(index, option.value)}
                    disabled={isSaving}
                    className={`h-11 flex-1 touch-manipulation rounded-lg border bg-panel px-2 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
