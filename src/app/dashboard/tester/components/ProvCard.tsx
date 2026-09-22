'use client';

/**
 * Provraden sist i gruppens panel. "Träna ovan, pröva här."
 *
 * Provet är en egen upplevelse och får därför sin egen ikon och sin egen
 * formulering, men samma radform som testen. Ingen fylld yta: raden skiljs
 * från träningstesten med en starkare hårlinje ovanför.
 *
 * Provläget ingår i Testveckan och Allt. I andra paket är raden grå med
 * lås och paketets namn (spec-onboarding 2026-09-22, sektion 3).
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IlluProv } from '@/components/illustrations/TestIllustrations';
import { HUB_ROW, HUB_ROW_LOCKED, LasIkon } from './TestCard';

interface Props {
  /** Startsidan för provet, till exempel /dashboard/tester/matrislogik-prov. */
  href: string;
  totalQuestions: number;
  minutes: number;
  /** Bästa provresultat i procent, eller null när provet aldrig gjorts. */
  bestPercent: number | null;
  /** Provläget ingår inte i paketet: etiketten säger var det finns. */
  locked?: string | null;
  onLocked?: () => void;
}

export default function ProvCard({ href, totalQuestions, minutes, bestPercent, locked, onLocked }: Props) {
  const pct = bestPercent;

  if (locked) {
    return (
      <li className="border-t border-kant-stark">
        <button
          type="button"
          onClick={onLocked}
          aria-label={`Provläge mot klockan, ${minutes} min. Ingår inte. ${locked}`}
          className={HUB_ROW_LOCKED}
        >
          <span aria-hidden="true" className="shrink-0 text-kant-stark">
            <IlluProv size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-3">Provläge mot klockan, {minutes} min</span>
            <span className="mt-0.5 block text-meta text-ink-3">{locked}</span>
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
          <span className="block text-sm font-medium text-ink-1">Prov: mät var du står</span>
          <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
            {totalQuestions} frågor · ca {minutes} min · alla nivåer blandade, utan hjälp
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
