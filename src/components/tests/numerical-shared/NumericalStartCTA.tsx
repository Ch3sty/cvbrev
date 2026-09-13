'use client';

/**
 * Startknappen för det numeriska testet. En primärknapp i ink, med det som
 * gäller under den som metadata. Väntläget säger vad som händer, ingen
 * spinner utanför knappen.
 */

interface NumericalStartCTAProps {
  onStart: () => void;
  isLoading: boolean;
  variant: 'v1' | 'v2' | 'expert';
}

export default function NumericalStartCTA({
  onStart,
  isLoading,
  variant,
}: NumericalStartCTAProps) {
  const buttonText = isLoading
    ? 'Startar testet'
    : variant === 'v2'
      ? 'Starta avancerad'
      : variant === 'expert'
        ? 'Starta expert'
        : 'Starta testet';

  const timeLabel = variant === 'v1' ? '25 minuters' : '35 minuters';

  return (
    <section className="text-center">
      <button
        type="button"
        onClick={onStart}
        disabled={isLoading}
        className="inline-flex h-11 w-full touch-manipulation items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {buttonText}
      </button>

      <p className="mt-3 text-meta text-ink-3">
        {timeLabel} tidsgräns · resultatet sparas automatiskt
      </p>
    </section>
  );
}
