'use client';

import { useState } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft } from 'lucide-react';

// Lazy singleton: loadStripe() korr forst nar komponenten renderas, inte vid
// modul-import, annars hamtas js.stripe.com pa sidor som bara prefetchar denna.
let stripePromise: ReturnType<typeof loadStripe> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

interface PremiumCTAButtonProps {
  priceId: string;
  apiEndpoint?: string;
  buttonText?: string;
  className?: string;
}

/**
 * CTA-knapp för premium-uppgradering, byggd på Stripe Embedded Checkout.
 *
 * Knappen är vyns primära handling och därför ink, aldrig orange: orange är
 * bläck i tråden, aldrig en fylld yta. Checkout-vyn ligger i en panel.
 */
export function PremiumCTAButton({
  priceId,
  apiEndpoint = '/api/stripe/create-upgrade-session',
  buttonText = 'Uppgradera till Premium',
  className = '',
}: PremiumCTAButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    setManageUrl(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      // Kunden prenumererar redan, visa vägen till portalen i stället för
      // att låta dem teckna ett andra abonnemang.
      if (response.status === 409 && data.alreadySubscribed) {
        setManageUrl(data.manageUrl || '/api/stripe/create-portal-session');
        throw new Error(data.error);
      }

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || 'Kunde inte starta checkout. Försök igen.');
      }

      setClientSecret(data.clientSecret);
      setShowCheckout(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Något gick fel. Försök igen.';
      setError(message);
      setLoading(false);
    }
  };

  if (showCheckout && clientSecret) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => {
            setShowCheckout(false);
            setClientSecret(null);
            setLoading(false);
          }}
          className="mb-4 inline-flex h-11 items-center gap-2 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Tillbaka
        </button>

        <div className="overflow-hidden rounded-xl border border-kant bg-panel p-4">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40 sm:w-auto ${className}`}
      >
        {loading ? 'Bearbetar' : buttonText}
      </button>

      {error && (
        <div className="mt-3 rounded-lg border border-fel-kant bg-fel-mjuk p-3">
          <p className="text-sm text-fel">{error}</p>
          {manageUrl && (
            <a
              href={manageUrl}
              className="mt-2 inline-block text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Öppna prenumerationsportalen
            </a>
          )}
        </div>
      )}
    </div>
  );
}
