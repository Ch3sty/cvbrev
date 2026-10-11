'use client';

/**
 * Provraden sist i gruppens panel. "Träna ovan, pröva här."
 *
 * Provet är en egen upplevelse och får därför sin egen ikon och sin egen
 * formulering, men samma radform som testen. Ingen fylld yta: raden skiljs
 * från träningstesten med en starkare hårlinje ovanför.
 *
 * Provläget ingår i Premium. På gratisnivån är raden grå med lås
 * (copy-premium-2026-10-11 avsnitt 5): "Provläge mot klockan" och "Samma
 * format som Matrigma. 35 uppgifter, 40 minuter. Ingår i Premium.", talen ur
 * provets konfiguration. Öppen rad: samma rad 2 utan sista meningen.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IlluProv } from '@/components/illustrations/TestIllustrations';
import { PROVRAD } from '../prov/prov-copy';
import { HUB_ROW, HUB_ROW_LOCKED, LasIkon } from './TestCard';

interface Props {
  /** Startsidan för provet, till exempel /dashboard/tester/matrislogik-prov. */
  href: string;
  totalQuestions: number;
  minutes: number;
  /** Leverantörens namn när provet har dess format ("Matrigma"), annars null. */
  formatNamn?: string | null;
  /** Bästa provresultat i procent, eller null när provet aldrig gjorts. */
  bestPercent: number | null;
  /** Sann när provläget inte ingår: raden är grå och öppnar betalväggen. */
  locked?: boolean;
  onLocked?: () => void;
}

export default function ProvCard({ href, totalQuestions, minutes, formatNamn = null, bestPercent, locked, onLocked }: Props) {
  const pct = bestPercent;

  if (locked) {
    return (
      <li className="border-t border-kant-stark">
        <button
          type="button"
          onClick={onLocked}
          aria-label={PROVRAD.aria(formatNamn, totalQuestions, minutes)}
          className={HUB_ROW_LOCKED}
        >
          <span aria-hidden="true" className="shrink-0 text-kant-stark">
            <IlluProv size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-3">{PROVRAD.titelLast}</span>
            <span className="mt-0.5 block text-meta text-ink-3">{PROVRAD.rad2(formatNamn, totalQuestions, minutes, true)}</span>
          </span>
          <LasIkon />
        </button>
      </li>
    );
  }

  return (
    <li className="border-t border-kant-stark">
      <Link href={href} className={HUB_ROW}>
        <span aria-hidden="true" className="shrink-0 text-ink-2">
          <IlluProv size={24} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1">{PROVRAD.titelOppen}</span>
          <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
            {PROVRAD.rad2(formatNamn, totalQuestions, minutes, false)}
          </span>
        </span>

        {pct != null ? (
          <span className="shrink-0 text-right">
            <span className="block text-base font-medium tabular-nums text-ink-1">{pct} %</span>
            <span className="block text-meta text-ink-3">senaste</span>
          </span>
        ) : null}

        <ChevronRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-ink-3"
          strokeWidth={1.75}
        />
      </Link>
    </li>
  );
}
