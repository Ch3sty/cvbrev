'use client';

import { useState } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PremiumCTAButtonProps {
  priceId: string;
  apiEndpoint?: string;
  buttonText?: string;
  variant?: 'primary' | 'inverse';
  className?: string;
}

/**
 * CTA-knapp för premium-uppgradering. Använder Stripe Embedded Checkout
 * men med vår egen orange/röd-DNA istället för pink/purple.
 *
 * - variant="primary" — orange/röd-gradient, för vita kort och allmänna ytor
 * - variant="inverse" — vit knapp med röd text, för användning på röd hero
 */
export function PremiumCTAButton({
  priceId,
  apiEndpoint = '/api/stripe/create-upgrade-session',
  buttonText = 'Uppgradera till Premium',
  variant = 'primary',
  className = '',
}: PremiumCTAButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

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
          onClick={() => {
            setShowCheckout(false);
            setClientSecret(null);
            setLoading(false);
          }}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Tillbaka
        </button>

        <div
          className="bg-white rounded-3xl border border-orange-200/50 overflow-hidden p-4 sm:p-6"
          style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
        >
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  const primaryStyles =
    'text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0';
  const inverseStyles =
    'bg-white text-orange-700 hover:bg-orange-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0';

  return (
    <div className="w-full">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`
          inline-flex items-center justify-center gap-2 w-full px-6 py-3.5
          rounded-xl font-bold text-sm sm:text-base
          transition-all duration-200 ease-out
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
          touch-manipulation min-h-[52px]
          ${variant === 'primary' ? primaryStyles : inverseStyles}
          ${className}
        `}
        style={
          variant === 'primary'
            ? {
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 10px 30px -8px rgba(220, 38, 38, 0.45)',
              }
            : undefined
        }
      >
        {loading ? (
          <>
            <Spinner variant={variant} />
            Bearbetar...
          </>
        ) : (
          <>
            {buttonText}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-snug">{error}</p>
        </div>
      )}
    </div>
  );
}

function Spinner({ variant }: { variant: 'primary' | 'inverse' }) {
  const color = variant === 'primary' ? 'text-white' : 'text-orange-700';
  return (
    <svg
      className={`animate-spin h-5 w-5 ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
