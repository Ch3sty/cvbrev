'use client';

/**
 * Provkortet under träningskorten. "Träna ovan, pröva här."
 *
 * Provet är en egen upplevelse och får därför sin egen ikon och sin egen
 * formulering, men samma kortform som testen. Ingen fylld orange yta, den
 * enda per vy är reserverad för sidans primära handling.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IlluProv } from '@/components/illustrations/TestIllustrations';

interface Props {
  /** Startsidan för provet, till exempel /dashboard/tester/matrislogik-prov. */
  href: string;
  totalQuestions: number;
  minutes: number;
  /**
   * Bästa provresultat i procent, eller null när provet aldrig gjorts.
   *
   * Kortet fetchade förut sin egen session-endpoint vid mount, vilket blev tre
   * extra anrop per sidladdning ovanpå hubbens nio, vart och ett med ett eget
   * auth.getUser() före frågan. Siffran räknas nu på servern i getHubData.ts,
   * ur samma rader och med samma formel som förut.
   */
  bestPercent: number | null;
}

export default function ProvCard({ href, totalQuestions, minutes, bestPercent }: Props) {
  const pct = bestPercent;
  const best = pct != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link
        href={href}
        className="group flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
      >
        <span aria-hidden="true" className="shrink-0 text-neutral-900">
          <IlluProv size={48} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-neutral-900">
            Mät var du står
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
            Frågor från alla nivåer, blandade, utan hjälp under tiden.
          </p>
          <p className="mt-1 text-xs tabular-nums text-neutral-500">
            {totalQuestions} frågor · ca {minutes} min
            {pct != null ? ` · senaste ${pct} procent` : ''}
          </p>
        </div>

        <span className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-neutral-900">
          {best ? 'Gör om provet' : 'Gör provet'}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </motion.div>
  );
}
