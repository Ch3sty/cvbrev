'use client';

/**
 * Sidhuvudet på det verbala testets hubbsida. Vyns enda h1, steg-etikett över
 * rubriken och det som gäller som en rad metadata under. Ingen bakgrundsbild,
 * ingen färgad bricka.
 */

interface VerbalTestHeroProps {
  variant: 'v1' | 'v2';
  bestScore?: number;
  bestPercentage?: number;
  totalStatements?: number;
}

export default function VerbalTestHero({
  variant,
  bestScore,
  bestPercentage,
  totalStatements = 48,
}: VerbalTestHeroProps) {
  const eyebrowLabel = variant === 'v1' ? 'Verbalt resonemang' : 'Verbalt resonemang, avancerad';
  const title =
    variant === 'v1' ? 'Förstå texten utan att gissa' : 'Avancerad textanalys på elitnivå';
  const subtitle =
    variant === 'v1'
      ? 'Klassiskt rekryteringstest. Läs en passage och avgör om varje påstående är sant, falskt eller om det inte går att avgöra utifrån texten.'
      : 'Komplexa textstycken inom samhälle, vetenskap och kultur. Subtila slutledningar och nyanserade påståenden, tränade för Mensa-nivå.';
  const difficultyLabel = variant === 'v1' ? 'Grundnivå' : 'Avancerad';

  const facts = [`${totalStatements} påståenden`, 'cirka 25 minuter', difficultyLabel];

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
            Bäst {bestScore} av {totalStatements} ({bestPercentage} procent)
          </span>
        ) : null}
      </p>
    </header>
  );
}
