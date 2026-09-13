'use client';

const SUGGESTIONS = [
  'Hur skriver jag ett bra CV?',
  'Vad är marknadslön i mitt yrke?',
  'Tips inför intervjun',
];

interface MiniSuggestionChipsProps {
  onPick: (text: string) => void;
}

export default function MiniSuggestionChips({ onPick }: MiniSuggestionChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 self-center text-sm font-medium text-ink-3">Förslag</span>
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="inline-flex min-h-11 items-center rounded-lg border border-kant bg-panel px-3 text-sm text-ink-1 transition-colors hover:border-kant-stark"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
