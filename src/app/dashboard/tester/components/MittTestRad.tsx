/**
 * Raden "Mitt test" överst i Alla tester (skiss-tester-steg2, fliken Alla
 * tester): valets namn, dagarna kvar och Ändra till ingången. Ett tal, i
 * raden under namnet, aldrig mer.
 */
import Link from 'next/link';
import { LANK } from '@/components/shell/knappar';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { MITT_TEST_COPY } from '@/lib/traning/mittTest';
import { iprovSumma } from '@/lib/tester/steg2/iprov';

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

/** Övningsprovet för I-prov 2025 som en rad i Ingår i ditt test (skissen, Alla tester). */
export function IprovRad() {
  return (
    <Link href="/dashboard/tester/iprov" className="flex items-center gap-3 rounded-2xl border border-kant bg-papper px-4 py-3" data-iprov-rad>
      <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true" className="shrink-0 text-ton-ink">
        <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="22" r="12" />
          <path d="M20 15v7l4.5 3M16 5h8" />
        </g>
      </svg>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-[19px] text-ink-1">Övningsprovet, I-prov 2025</span>
        <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-3">{`Sex deltester i provets ordning. Halva provet ${iprovSumma(true).antal} på ${iprovSumma(true).minuter} minuter, hela ${iprovSumma(false).antal} på ${iprovSumma(false).minuter}.`}</span>
      </span>
      <span aria-hidden="true" className="text-ink-3">›</span>
    </Link>
  );
}
