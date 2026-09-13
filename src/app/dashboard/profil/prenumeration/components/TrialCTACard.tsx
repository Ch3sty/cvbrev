'use client';

/**
 * Sista knuffen för den som har tidsbegränsad premium utan slutdatum.
 * Panel, ink-knapp via PremiumCTAButton, ingen orange yta.
 */

import { PremiumCTAButton } from './PremiumCTAButton';

interface TrialCTACardProps {
  priceId: string;
}

export default function TrialCTACard({ priceId }: TrialCTACardProps) {
  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <h2 className="text-kort text-ink-1">Fortsätt med Premium utan avbrott</h2>
      <p className="mt-1 text-sm text-ink-2">
        Uppgradera nu och behåll alla premiumfunktioner när provperioden tar slut.
      </p>

      <div className="mt-4">
        <PremiumCTAButton
          priceId={priceId}
          apiEndpoint="/api/stripe/create-upgrade-session"
          buttonText="Uppgradera till Premium"
        />
      </div>

      <p className="mt-3 text-meta text-ink-3">
        149 kr/mån. Ingen bindningstid, avsluta när du vill.
      </p>
    </section>
  );
}
