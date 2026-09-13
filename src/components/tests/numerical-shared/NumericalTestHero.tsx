'use client';

/**
 * Sidhuvudet på det numeriska testets hubbsida. Vyns enda h1, steg-etikett över
 * rubriken och det som gäller som en rad metadata under. Ingen bakgrundsbild,
 * ingen färgad bricka.
 */

interface NumericalTestHeroProps {
  variant: 'v1' | 'v2' | 'expert';
  bestScore?: number;
  bestPercentage?: number;
  totalQuestions?: number;
}

export default function NumericalTestHero({
  variant,
  bestScore,
  bestPercentage,
  totalQuestions = 24,
}: NumericalTestHeroProps) {
  const eyebrowLabel =
    variant === 'v1'
      ? 'Numerisk analys'
      : variant === 'v2'
        ? 'Numerisk analys, avancerad'
        : 'Numerisk analys, expert';
  const title =
    variant === 'v1'
      ? 'Tolka siffror utan att gissa'
      : variant === 'v2'
        ? 'Avancerad sifferanalys på elitnivå'
        : 'Beslutsstödsmatte på expertnivå';
  const subtitle =
    variant === 'v1'
      ? 'Klassiskt rekryteringstest. Tolka tabeller, läs grafer, lös talserier och hantera procent och konvertering, det rekryterare faktiskt mäter.'
      : variant === 'v2'
        ? 'Komplexa beräkningar med flera steg, sammansatta procentförändringar och avancerade dataset, för dig som vill nå topprocenten.'
        : 'Investeringskalkyl, optimering och känslighetsanalys. Flera datakällor och beslut under osäkerhet, den tuffaste numeriska nivån.';
  const difficultyLabel =
    variant === 'v1' ? 'Grundnivå' : variant === 'v2' ? 'Avancerad' : 'Expert';
  const timeLabel = variant === 'v1' ? 'cirka 25 minuter' : 'cirka 35 minuter';

  const facts = [`${totalQuestions} frågor`, timeLabel, difficultyLabel];

  return (
    <header className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <p className="mb-1.5 text-steg uppercase text-ink-3">{eyebrowLabel}</p>
      <h1 className="text-h1 text-ink-1">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-[22px] text-ink-2">{subtitle}</p>

      <p className="mt-4 border-t border-kant pt-4 text-meta text-ink-3">
        {facts.join(' · ')}
        {bestScore !== undefined && bestScore > 0 ? (
          <span className="text-positiv">
            {' · '}
            Bäst {bestScore} av {totalQuestions} ({bestPercentage} procent)
          </span>
        ) : null}
      </p>
    </header>
  );
}
