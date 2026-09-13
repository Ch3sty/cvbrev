'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import CancelFlowModal from './CancelFlowModal';

const STATUS_TEXT: Record<string, string> = {
  active: 'Aktiv',
  trialing: 'Provperiod',
  past_due: 'Betalning misslyckades',
  unpaid: 'Obetald',
  canceled: 'Avslutad',
};

export default function ManageSubscriptionCard() {
  const { subscriptionStatus, currentPeriodEnd } = useProfile();
  // Spår D6: uppsägning går genom enkät + erbjudande innan Stripe-portalen.
  const [cancelOpen, setCancelOpen] = useState(false);

  const statusLabel = subscriptionStatus
    ? STATUS_TEXT[subscriptionStatus] || subscriptionStatus
    : 'Hanteras via Stripe';

  const renewalLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('sv-SE')
    : null;

  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <h2 className="text-kort text-ink-1">Hantera prenumeration</h2>
      <p className="mt-1 text-sm text-ink-2">
        Uppdatera kort, ladda ner kvitton eller avsluta, allt på ett ställe.
      </p>

      <dl className="mt-4 divide-y divide-kant border-y border-kant">
        <Row label="Plan" value="Premium Månad" />
        <Row label="Pris" value="149 kr/mån" />
        <Row label="Status" value={statusLabel} />
        {renewalLabel && <Row label="Nästa betalning" value={renewalLabel} />}
      </dl>

      <a
        href="/api/stripe/create-portal-session"
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover sm:w-auto"
      >
        Öppna Stripe-portalen
      </a>

      {/* Avsluta, öppnar uppsägningsflödet (D6) i stället för portalen direkt */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className="inline-flex h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1 hover:decoration-ink-1"
        >
          Avsluta prenumerationen
        </button>
      </div>

      <CancelFlowModal open={cancelOpen} onClose={() => setCancelOpen(false)} />
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <dt className="text-ink-2">{label}</dt>
      <dd className="font-medium text-ink-1">{value}</dd>
    </div>
  );
}
