'use client';

import { useState } from 'react';
import Sheet from '@/components/shell/Sheet';

const STEG = [
  'Välj ett CV',
  'Vi matchar det mot tusentals jobb',
  'Du söker till dem som passar',
];

const FAKTORER = [
  {
    title: 'Hierarkisk matchning',
    body: 'Vi matchar exakt titel, yrkesgrupp och yrkesområde, så både specifika och bredare roller dyker upp.',
  },
  {
    title: 'Kompetensbaserad analys',
    body: 'Vi läser dina överförbara färdigheter och jämför dem med kravprofilen i annonsen.',
  },
  {
    title: 'Geografisk vikt',
    body: 'Jobb nära dig prioriteras, och distansjobb känns igen automatiskt.',
  },
];

/**
 * De tre stegen ovanför CV-listan, plus ett ark med hur matchningen räknas.
 * Panel, numrerade rader i meta, ingen orange och inga cirklar.
 */
export default function MatchingHowItWorks() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <section className="rounded-xl border border-kant bg-panel px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <ol className="min-w-0 flex-1 text-meta text-ink-3">
            {STEG.map((label, i) => (
              <li key={label} className="inline">
                {i > 0 && <span aria-hidden="true"> · </span>}
                <span className="tabular-nums">{i + 1}.</span>{' '}
                <span className="text-ink-2">{label}</span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="shrink-0 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
          >
            Hur räknas det?
          </button>
        </div>
      </section>

      <Sheet
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title="Så fungerar matchningen"
        description="Vi läser hela ditt CV, inte bara den senaste titeln, och letar också efter närliggande roller och branschövergångar."
      >
        <ul className="divide-y divide-kant">
          {FAKTORER.map((f) => (
            <li key={f.title} className="py-3 first:pt-0 last:pb-0">
              <p className="text-kort text-ink-1">{f.title}</p>
              <p className="mt-0.5 text-meta text-ink-3">{f.body}</p>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
