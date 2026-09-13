'use client';

type AnswerValue = 'true' | 'false' | 'cannot_say';

interface Statement {
  text: string;
}

interface StatementListProps {
  statements: Statement[];
  answers: (AnswerValue | null)[];
  onAnswer: (statementIndex: number, value: AnswerValue) => void;
  disabled?: boolean;
}

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 'true', label: 'Sant' },
  { value: 'false', label: 'Falskt' },
  { value: 'cannot_say', label: 'Kan ej avgöras' },
];

/**
 * Påståendena till en passage. Varje påstående är en panel med tre lika
 * breda svarsknappar (Segment-mönstret): valt = kant i ink och vikt 500.
 * Rätt och fel visas aldrig här, bara vad som är valt.
 */
export default function StatementList({
  statements,
  answers,
  onAnswer,
  disabled = false,
}: StatementListProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-ink-3">Bedöm påståendena</p>
        <p className="text-meta text-ink-3">Endast utifrån texten ovan, inte din egen kunskap.</p>
      </div>

      {statements.map((statement, i) => (
        <StatementCard
          key={i}
          index={i}
          text={statement.text}
          answer={answers[i]}
          onAnswer={(v) => onAnswer(i, v)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function StatementCard({
  index,
  text,
  answer,
  onAnswer,
  disabled,
}: {
  index: number;
  text: string;
  answer: AnswerValue | null;
  onAnswer: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="w-5 flex-shrink-0 pt-0.5 text-meta tabular-nums text-ink-3" aria-hidden="true">
          {index + 1}.
        </span>
        <p className="flex-1 text-sm leading-[22px] text-ink-1 sm:text-base">{text}</p>
      </div>

      <div role="radiogroup" aria-label={`Påstående ${index + 1}`} className="flex gap-2">
        {OPTIONS.map((option) => {
          const selected = answer === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onAnswer(option.value)}
              className={`h-11 flex-1 touch-manipulation rounded-lg border bg-panel px-2 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${
                selected ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
