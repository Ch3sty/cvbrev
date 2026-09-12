'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

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
            className="relative rounded-xl border border-indigo-100 bg-indigo-50/30 p-3.5 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h4 className="text-[13px] font-bold text-indigo-950">{section.title}</h4>
              <Lock className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0" strokeWidth={2.5} />
            </div>
            <div className="space-y-1.5 blur-[3px] select-none" aria-hidden="true">
              {section.lines.map((width, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-indigo-200/70"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3.5">
        <p className="text-[13px] text-indigo-950/80 leading-relaxed min-w-0 flex-1 basis-64">
          Det fördjupade testet låser upp hela din arbetsstilsrapport: hur du
          arbetar, samarbetar och drivs, din privata energibudget och
          intervjuträning på riktiga frågor.
        </p>
        <Link
          href="/dashboard/tester/personlighet-avancerad"
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-[13px] font-bold text-white bg-orange-600 hover:bg-orange-700 flex-shrink-0 transition-colors touch-manipulation"
        >
          Gör det fördjupade testet (120 frågor)
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
