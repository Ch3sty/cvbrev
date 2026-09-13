'use client';

interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

interface EducationTimelineProps {
  educations: Education[];
}

/**
 * Utbildningarna ur CV:t som en lista, senaste först. Året står i ink-3
 * till vänster, examen och lärosäte till höger. Ingen tidslinje i orange,
 * inga prickar, ingen rörelse.
 */
export default function EducationTimeline({ educations }: EducationTimelineProps) {
  if (educations.length === 0) return null;

  // Sortera fallande på år (senaste först), behåll ursprunglig ordning om år saknas.
  const sorted = [...educations].sort((a, b) => {
    const ya = parseInt(a.year, 10);
    const yb = parseInt(b.year, 10);
    if (Number.isNaN(ya) || Number.isNaN(yb)) return 0;
    return yb - ya;
  });

  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <span className="text-sm font-medium text-ink-3">Utbildningar</span>
        <span className="text-meta tabular-nums text-ink-3">{educations.length}</span>
      </header>

      <ul className="divide-y divide-kant">
        {sorted.map((edu, i) => (
          <li key={`${edu.year}-${edu.institution}-${i}`} className="flex items-start gap-3 py-3">
            <span className="w-12 shrink-0 pt-0.5 text-meta tabular-nums text-ink-3">
              {edu.year || '-'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium text-ink-1">
                {edu.degree}
                {edu.field && <span className="font-normal text-ink-2">, {edu.field}</span>}
              </p>
              <p className="mt-0.5 break-words text-meta text-ink-3">{edu.institution}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
