interface PassageDisplayProps {
  title: string;
  text: string;
  passageNumber: number;
  totalPassages: number;
  difficulty: 1 | 2 | 3;
  topic: string;
}

const DIFFICULTY_LABELS = {
  1: 'Lätt',
  2: 'Medel',
  3: 'Svår',
};

/**
 * Textpassagen (V1): en panel med metarad, rubrik i text-kort och texten i
 * läsvänlig storlek. Nivån är text, inte piller.
 */
export function PassageDisplay({
  title,
  text,
  passageNumber,
  totalPassages,
  difficulty,
  topic
}: PassageDisplayProps) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <p className="text-meta tabular-nums text-ink-3">
        Passage {passageNumber} av {totalPassages}
        <span aria-hidden="true"> · </span>
        {topic}
        <span aria-hidden="true"> · </span>
        {DIFFICULTY_LABELS[difficulty]}
      </p>

      <h2 className="mt-1 text-kort text-ink-1">{title}</h2>

      <div className="mt-4 flex-1 overflow-y-auto border-t border-kant pt-4">
        <p className="whitespace-pre-wrap text-base leading-[26px] text-ink-1">{text}</p>
      </div>
    </section>
  );
}
