'use client';

/**
 * Provraden sist i gruppens panel. "Träna ovan, pröva här."
 *
 * Provet är en egen upplevelse och får därför sin egen ikon och sin egen
 * formulering, men samma radform som testen. Ingen fylld yta: raden skiljs
 * från träningstesten med en starkare hårlinje ovanför.
 *
 * Provläget ingår i Premium. På gratisnivån är raden grå med lås
 * (copy-premium-2026-10-11 avsnitt 5): rad 1 "Provläge mot klockan", rad 2
 * byggd av den som ritar raden (PROVRAD i prov-copy.ts). I logikgruppen är
 * raden generalrepetitionen och rad 2 säger planens format; i de andra
 * grupperna provets antal och tid ur konfigurationen. Öppen rad: rad 1
 * "Prov: mät var du står" och rad 2 utan "Ingår i Premium".
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IlluProv } from '@/components/illustrations/TestIllustrations';
import { PROVRAD } from '../prov/prov-copy';
import { HUB_ROW, HUB_ROW_LOCKED, LasIkon } from './TestCard';

interface Props {
  /** Startsidan för provet: generalrepetitionen eller provets testsida. */
  href: string;
  /** Rad 2, färdig mening ur PROVRAD.rad2 eller PROVRAD.rad2Format. */
  rad2: string;
  /** Skärmläsarens text för den låsta raden, ur PROVRAD.aria eller PROVRAD.ariaFormat. */
  aria: string;
  /** Bästa provresultat i procent. Null döljer talet. */
  bestPercent: number | null;
  /** Sann när provläget inte ingår: raden är grå och öppnar betalväggen. */
  locked?: boolean;
  onLocked?: () => void;
}

export default function ProvCard({ href, rad2, aria, bestPercent, locked, onLocked }: Props) {
  const pct = bestPercent;

  if (locked) {
    return (
      <li className="border-t border-kant-stark">
        <button type="button" onClick={onLocked} aria-label={aria} className={HUB_ROW_LOCKED}>
          <span aria-hidden="true" className="shrink-0 text-kant-stark">
            <IlluProv size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-3">{PROVRAD.titelLast}</span>
            <span className="mt-0.5 block text-meta text-ink-3">{rad2}</span>
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
          <span className="mt-0.5 block text-meta tabular-nums text-ink-3">{rad2}</span>
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
