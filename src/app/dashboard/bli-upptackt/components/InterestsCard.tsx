'use client';

import Link from 'next/link';
import SectionCard from './SectionCard';

/**
 * Intresseanmälningar: tom-state tills rekryterarsidan finns.
 */
export default function InterestsCard() {
  return (
    <SectionCard
      title="Intresseanmälningar"
      sub="När en rekryterare vill komma i kontakt hamnar det här, och du får ett mail."
      delay={0.35}
    >
      <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-4">
        <span
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm"
          aria-hidden="true"
        >
          0
        </span>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Inga intressen ännu. Profiler med verifierade testresultat får i snitt
          fler visningar,{' '}
          <Link
            href="/dashboard/tester"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            gör dagens test
          </Link>{' '}
          för att stärka din.
        </p>
      </div>
    </SectionCard>
  );
}
