'use client';

import Link from 'next/link';
import EmptyState from '@/components/shell/EmptyState';
import { IlluTomSokning } from '@/components/illustrations/TradenScener';

const STEG = [
  {
    title: 'Vi läser ditt CV',
    body: 'Yrkesroller, kompetenser och utbildningar plockas ut automatiskt.',
  },
  {
    title: 'Vi matchar mot tusentals jobb',
    body: 'Inte bara senaste titeln, också närliggande roller och branschövergångar.',
  },
  {
    title: 'Du ser hur väl du passar',
    body: 'Matchningen i procent på varje jobb, och ett anpassat brev en knapp bort.',
  },
];

const EXEMPEL = [
  { relevance: 94, role: 'Senior Projektledare', employer: 'Ett techbolag', location: 'Stockholm' },
  { relevance: 87, role: 'IT-projektledare', employer: 'En bank', location: 'Stockholm' },
  { relevance: 78, role: 'Driftledare, IT', employer: 'En industrikoncern', location: 'Göteborg' },
  { relevance: 71, role: 'Programledare', employer: 'En telekomjätte', location: 'Stockholm' },
];

/**
 * Jobbmatchning utan CV. I stället för att skicka bort användaren visar vi
 * vad funktionen gör: tomt tillstånd med vägen in, de tre stegen och en
 * dämpad bild av hur träffarna kommer att se ut.
 */
export default function JobMatchingOnboarding() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <EmptyState
        illustration={IlluTomSokning}
        title="Hitta jobb som matchar ditt CV"
        description="Vi läser CV:t, hittar dina roller och kompetenser och visar hur väl varje jobb passar."
        action={
          <Link
            href="/dashboard/profil/cv"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
          >
            Ladda upp ditt första CV
          </Link>
        }
      />

      <section className="rounded-xl border border-kant bg-panel p-4">
        <h2 className="text-sm font-medium text-ink-3">Så fungerar det</h2>
        <ol className="mt-2 divide-y divide-kant border-t border-kant">
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
      </section>

      <section className="rounded-xl border border-kant bg-panel p-4">
        <h2 className="text-sm font-medium text-ink-3">Så kommer dina träffar att se ut</h2>
        <ul className="mt-2 divide-y divide-kant border-t border-kant" aria-hidden="true">
          {EXEMPEL.map((e) => (
            <li key={e.role} className="flex items-start justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block text-kort text-ink-3">{e.role}</span>
                <span className="block text-meta text-ink-3">
                  {e.employer} · {e.location}
                </span>
              </span>
              <span className="shrink-0 text-meta tabular-nums text-ink-3">
                {e.relevance} %
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-meta text-ink-3">
          Exempel. Dina egna träffar kommer efter att du laddat upp ett CV.
        </p>
      </section>

      <p className="text-center text-meta text-ink-3">
        Tar en halv minut · gratis · inget bindande
      </p>
    </div>
  );
}
