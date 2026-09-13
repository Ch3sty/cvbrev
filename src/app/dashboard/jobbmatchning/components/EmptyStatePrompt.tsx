'use client';

const STEG = [
  {
    title: 'Vi läser dina roller och kompetenser',
    body: 'Algoritmen går igenom CV:t och plockar ut vad du faktiskt kan.',
  },
  {
    title: 'Vi matchar mot tusentals jobb',
    body: 'Inte bara senaste titeln, också närliggande roller och branschövergångar.',
  },
  {
    title: 'Du ser hur väl varje jobb passar',
    body: 'Matchningen i procent, och ett anpassat brev en knapp bort.',
  },
];

/**
 * Vad som händer när man aktiverar ett CV. Panel med tre numrerade rader,
 * ingen ikonhjälte och ingen rörelse. Själva CV-listan ligger direkt under.
 */
export default function EmptyStatePrompt() {
  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <h2 className="text-kort text-ink-1">Aktivera ett CV för att matcha jobb</h2>
      <p className="mt-1 text-sm text-ink-2">
        Välj vilket av dina CV vi ska utgå från när vi söker jobb åt dig.
      </p>

      <ol className="mt-3 divide-y divide-kant border-t border-kant">
        {STEG.map((s, i) => (
          <li key={s.title} className="flex items-start gap-3 py-3">
            <span className="w-5 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}.</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink-1">{s.title}</span>
              <span className="block text-meta text-ink-3">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-meta text-ink-3">Välj ett CV nedan för att börja.</p>
    </section>
  );
}
