'use client';

import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { ArrowRight, Target, FileSearch, Zap } from 'lucide-react';

import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import MarginPlate from '@/components/shell/MarginPlate';
import { IlluPlattaCvPoang } from '@/components/illustrations/TradenScener';

interface CVAnalysisIntroProps {
  onStartAnalysis: () => void;
  remainingAnalyses?: number | null;
  isPremium?: boolean;
}

const FORDELAR = [
  {
    icon: Target,
    title: 'Läsbar i rekryteringssystem',
    description:
      'De flesta arbetsgivare låter ett rekryteringssystem (ATS) sortera ansökningarna först. Vi visar om ditt CV klarar det.',
  },
  {
    icon: FileSearch,
    title: 'Genomgång per avsnitt',
    description: 'Färdiga formuleringar för varje del av CV:t, från profiltext till kompetenser.',
  },
  {
    icon: Zap,
    title: 'Snabbt resultat',
    description: 'Fullständig analys på under en minut. Inga onödiga väntetider.',
  },
];

const INNEHALL = [
  'Poäng för hur väl rekryteringssystem läser ditt CV',
  'Analys av dina kompetenser och nyckelord',
  'Granskning av personlig beskrivning',
  'Konkreta förbättringar för varje sektion',
  'Jämförelse av före och efter',
  'Möjlighet att exportera till PDF',
];

/**
 * Startvyn för CV-analysen.
 *
 * Bort: herokortet i 40 px fet med orange halvmening, de tre gradientkorten,
 * de gröna bockarna och den andra primärknappen längst ner. Kvar: sidhuvudet,
 * kvotraden, en panel som säger vad analysen gör och en enda primärknapp.
 */
export default function CVAnalysisIntro({
  onStartAnalysis,
  remainingAnalyses,
  isPremium = false,
}: CVAnalysisIntroProps) {
  const visaKvot = remainingAnalyses !== null && remainingAnalyses !== undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Analysera ditt CV"
        description="Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på 30 sekunder."
      />

      {visaKvot && (
        <StatusRow label="Analyser kvar">
          {isPremium
            ? PAKETRADER.analysUtanTak
            : `${remainingAnalyses} ${
                remainingAnalyses === 1 ? 'analys' : 'analyser'
              } kvar. Som gratisanvändare får du en ny var tredje dygn.`}
        </StatusRow>
      )}

      {/* Enda plattan i vyn, på det kort som bär handlingen. */}
      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <MarginPlate>
            <IlluPlattaCvPoang size={48} />
          </MarginPlate>
          <div className="min-w-0 flex-1">
            <h2 className="text-kort text-ink-1">En komplett bild av ditt CV</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
              Vi går igenom struktur, nyckelord och formuleringar, och visar vad
              som håller dig tillbaka.
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-kant border-t border-kant">
          {INNEHALL.map((item) => (
            <li key={item} className="py-2.5 text-sm text-ink-2">
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onStartAnalysis}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto"
        >
          Analysera mitt CV
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </section>

      <section className="rounded-xl border border-kant bg-panel">
        <h2 className="border-b border-kant px-4 py-3 text-sm font-medium text-ink-3">
          Så fungerar analysen
        </h2>
        <ul className="divide-y divide-kant">
          {FORDELAR.map((fordel) => (
            <li key={fordel.title} className="flex items-start gap-3 px-4 py-3">
              <fordel.icon
                className="mt-0.5 h-6 w-6 flex-shrink-0 text-ink-2"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-kort text-ink-1">{fordel.title}</p>
                <p className="mt-0.5 text-meta leading-relaxed text-ink-3">
                  {fordel.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
