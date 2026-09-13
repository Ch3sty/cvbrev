'use client';

interface StepHeaderProps {
  number: 1 | 2 | 3;
  total?: number;
  title: string;
  description?: string;
}

/**
 * Steg-rubrik på /dashboard/cv-mallar.
 *
 * Bort: orange streck, den fyllda sifferbubblan och rubriken i 24 px.
 * Kvar: stegetiketten i versaler och frågan i 22 px, samma form som i
 * flödesstegen.
 */
export default function StepHeader({
  number,
  total = 3,
  title,
  description,
}: StepHeaderProps) {
  return (
    <header className="mb-3">
      <p className="text-steg uppercase text-ink-3">
        Steg {number} av {total}
      </p>
      <h2 className="mt-1.5 text-fraga text-ink-1">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm leading-[22px] text-ink-2">{description}</p>
      )}
    </header>
  );
}
