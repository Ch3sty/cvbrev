/**
 * Raden "Mitt test" överst i Alla tester (skiss-tester-steg2, fliken Alla
 * tester): valets namn, dagarna kvar och Ändra till ingången. Ett tal, i
 * raden under namnet, aldrig mer.
 */
import Link from 'next/link';
import { LANK } from '@/components/shell/knappar';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { MITT_TEST_COPY } from '@/lib/traning/mittTest';

export default function MittTestRad({ namn, dagarKvar }: { namn: string; dagarKvar: number | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-kant bg-papper px-4 py-3" data-mitt-test-rad>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="shrink-0 text-ton-ink">
        <g fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
        </g>
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-[19px] text-ink-1">{namn}</span>
        <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-3">{MITT_TEST_COPY.allaRad.meta(dagarKvar)}</span>
      </span>
      <Link href={TRANING_RUTT.installningarSteg(2)} className={`${LANK} inline-flex min-h-11 items-center text-sm`}>
        {MITT_TEST_COPY.allaRad.andra}
      </Link>
    </div>
  );
}
