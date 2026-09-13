'use client';

/**
 * Startknappen för det verbala testet. En primärknapp i ink, med det som
 * gäller under den som metadata. Väntläget säger vad som händer, ingen
 * spinner utanför knappen.
 */

interface VerbalStartCTAProps {
  onStart: () => void;
  isLoading: boolean;
  variant: 'v1' | 'v2';
}

export default function VerbalStartCTA({ onStart, isLoading, variant }: VerbalStartCTAProps) {
  const buttonText = isLoading
    ? 'Startar testet'
    : variant === 'v2'
      ? 'Starta avancerad'
      : 'Starta testet';

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
        25 minuters tidsgräns · resultatet sparas automatiskt
      </p>
    </section>
  );
}
