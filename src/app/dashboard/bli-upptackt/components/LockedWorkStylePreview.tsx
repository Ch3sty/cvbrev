'use client';

import Link from 'next/link';

/**
 * Låst förhandsvisning av arbetsstilsrapporten för grundtestare
 * (hasAdvancedTest=false): skarpa sektionsrubriker med blurrat
 * skelett-innehåll och CTA till det fördjupade testet. Konverteringsytan
 * ska visa VAD som väntar, aldrig påhittat innehåll.
 */

const LOCKED_SECTIONS: Array<{ title: string; lines: number[] }> = [
  { title: 'Så arbetar du', lines: [92, 78, 60] },
  { title: 'Så samarbetar du', lines: [85, 70] },
  { title: 'Så drivs du', lines: [88, 64, 52] },
  { title: 'Du kommer till din rätt när', lines: [80, 74] },
  { title: 'Din energibudget', lines: [90, 66] },
  { title: 'Intervjuträning', lines: [84, 76, 58] },
];

export default function LockedWorkStylePreview() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {LOCKED_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="relative overflow-hidden rounded-lg border border-kant bg-insunken p-3.5 shadow-insunken"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-ink-1">{section.title}</h4>
              <span className="shrink-0 text-meta text-ink-3">Låst</span>
            </div>
            <div className="select-none space-y-1.5 blur-[3px]" aria-hidden="true">
              {section.lines.map((width, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-kant"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-xl border border-kant bg-panel px-4 py-3.5">
        <p className="min-w-0 flex-1 basis-64 text-sm leading-[22px] text-ink-2">
          Det fördjupade testet ger dig hela din arbetsstilsrapport: hur du
          arbetar, samarbetar och drivs, din privata energibudget och
          intervjuträning på riktiga frågor.
        </p>
        <Link
          href="/dashboard/tester/personlighet-avancerad"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
        >
          Gör det fördjupade testet, 120 frågor
        </Link>
      </div>
    </div>
  );
}
