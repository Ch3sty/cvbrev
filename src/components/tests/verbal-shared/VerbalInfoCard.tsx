'use client';

/**
 * Vad det verbala testet är, innan man startar. En panel med löptext, en lista
 * med det som gäller, och en lista som förklarar de tre svarsalternativen.
 * Inga färgade pillrar, ingen ikon per rad.
 */

interface VerbalInfoCardProps {
  variant: 'v1' | 'v2';
}

const ANSWERS = [
  { label: 'Sant', text: 'Påståendet följer logiskt av texten.' },
  { label: 'Falskt', text: 'Påståendet motsäger texten.' },
  { label: 'Kan ej avgöras', text: 'Texten ger inte tillräckligt underlag.' },
];

export default function VerbalInfoCard({ variant }: VerbalInfoCardProps) {
  const isV2 = variant === 'v2';

  const facts = [
    { title: '12 passager', sub: 'fyra påståenden var' },
    { title: '48 påståenden', sub: 'tre svarsalternativ' },
    { title: 'Cirka 25 minuter', sub: 'tidsgräns' },
    {
      title: isV2 ? 'Avancerad' : 'Grundnivå',
      sub: isV2 ? 'Mensa-nivå' : 'rekryteringsnivå',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <p className="mb-1.5 text-steg uppercase text-ink-3">Om testet</p>
        <h2 className="text-fraga text-ink-1">
          {isV2 ? 'Avancerad textanalys' : 'Klassiskt rekryteringsformat'}
        </h2>
        <p className="mt-2 text-sm leading-[22px] text-ink-2">
          {isV2
            ? 'Texterna är längre, påståendena mer subtila och slutsatserna kräver att du läser noggrant. Inom samhälle, vetenskap och kultur, tänkt för chefspositioner och kvalificerade roller.'
            : 'Du läser en passage, sedan avgör du om fyra påståenden är sanna, falska eller om det inte går att avgöra utifrån texten. Samma format som SHL och Saville använder.'}
        </p>
      </div>

      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        {facts.map((fact) => (
          <li
            key={fact.title}
            className="flex min-h-11 items-center justify-between gap-3 px-4 py-2"
          >
            <span className="text-sm text-ink-1">{fact.title}</span>
            <span className="text-meta text-ink-3">{fact.sub}</span>
          </li>
        ))}
      </ul>

      <section aria-label="Tre svarsalternativ">
        <h3 className="mb-2 text-sm font-medium text-ink-3">Tre svarsalternativ</h3>
        <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
          {ANSWERS.map((answer) => (
            <li key={answer.label} className="px-4 py-3">
              <p className="text-sm font-medium text-ink-1">{answer.label}</p>
              <p className="mt-0.5 text-meta text-ink-3">{answer.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
