'use client';

/**
 * Provraden sist i gruppens panel. "Träna ovan, pröva här."
 *
 * Provet är en egen upplevelse och får därför sin egen ikon och sin egen
 * formulering, men samma radform som testen. Ingen fylld yta: raden skiljs
 * från träningstesten med en starkare hårlinje ovanför.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IlluProv } from '@/components/illustrations/TestIllustrations';
import { HUB_ROW } from './TestCard';

interface Props {
  /** Startsidan för provet, till exempel /dashboard/tester/matrislogik-prov. */
  href: string;
  totalQuestions: number;
  minutes: number;
  /**
   * Bästa provresultat i procent, eller null när provet aldrig gjorts.
   *
   * Raden fetchade förut sin egen session-endpoint vid mount, vilket blev tre
   * extra anrop per sidladdning ovanpå hubbens nio, vart och ett med ett eget
   * auth.getUser() före frågan. Siffran räknas nu på servern i getHubData.ts,
   * ur samma rader och med samma formel som förut.
   */
  bestPercent: number | null;
}

export default function ProvCard({ href, totalQuestions, minutes, bestPercent }: Props) {
  const pct = bestPercent;

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
