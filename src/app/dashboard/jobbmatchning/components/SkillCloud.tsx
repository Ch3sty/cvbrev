'use client';

import { useState } from 'react';

interface SkillCloudProps {
  skills: string[];
  /** Antal kompetenser som visas innan "Visa alla" trycks. */
  initialCount?: number;
}

/**
 * Kompetenserna ur CV:t som text i kant-ramade rutor. De första N visas
 * direkt, resten efter "Visa alla". Ingen orange, inga piller, ingen rörelse.
 */
export default function SkillCloud({ skills, initialCount = 8 }: SkillCloudProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, initialCount);
  const hasMore = skills.length > initialCount;

  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <span className="text-sm font-medium text-ink-3">Kompetenser</span>
        <span className="text-meta tabular-nums text-ink-3">{skills.length}</span>
      </header>

      <ul className="flex flex-wrap gap-2">
        {visible.map((skill, i) => (
          <li
            key={`${skill}-${i}`}
            className="rounded-lg border border-kant px-3 py-1.5 text-sm text-ink-1"
          >
            {skill}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
        >
          {showAll ? 'Visa färre' : `Visa alla ${skills.length}`}
        </button>
      )}
    </section>
  );
}
