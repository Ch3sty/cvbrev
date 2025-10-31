// src/components/subscription/SubscribeButton.tsx
// ================================================
// Uppdaterad med statisk knapptext "Uppgradera till Premium"

'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
// Importera eventuella ikoner du vill använda, t.ex. Crown eller en laddningsikon
// import { Crown } from 'lucide-react'; 

// Läs in din publicerbara Stripe-nyckel
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error("ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in .env.local");
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface SubscribeButtonProps {
  priceId: string;    // Stripe Price ID (t.ex. price_xxxxxxxxxxxx)
  planName: string;   // Namn att visa (används ej för text längre, men behålls som prop)
  className?: string; // För extra Tailwind-klasser från där knappen används
  disabled?: boolean; // För att externt kunna inaktivera knappen
}

export function SubscribeButton({ priceId, planName, className = '', disabled = false }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    if (!stripePromise) {
        setError("Stripe could not be initialized. Check API key.");
        setLoading(false);
        return;
    }

    try {
      // Anropa din backend API route
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: priceId }),
      });

      const sessionData = await response.json();

      // Kontrollera svaret från backend
      if (!response.ok || !sessionData.url) {
        throw new Error(sessionData.message || 'Failed to create checkout session.');
      }

      // Omdirigera till Stripe
      window.location.href = sessionData.url;

    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false); // Visa fel och sluta ladda
    }
    // Ingen setLoading(false) här vid success, pga omdirigering
  };

  return (
    <div>
      {/* Standard HTML-knapp med Tailwind-klasser */}
      <button
        onClick={handleSubscribe}
        disabled={loading || disabled || !stripePromise}
        // Tailwind-klasser - custom className överskrider defaults
        className={
          className ||
          `flex items-center justify-center w-full px-6 py-3
          text-base font-medium rounded-md shadow-sm
          text-white bg-pink-600 hover:bg-pink-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
          transition-colors duration-150 ease-in-out
          disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed`
        }
      >
        {loading ? (
          <>
            {/* Laddningsspinner */}
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Bearbetar...
          </>
        ) : (
           // ***** HÄR ÄR ÄNDRINGEN *****
           "Uppgradera till Premium" // Statisk text istället för dynamisk
           // ***** SLUT PÅ ÄNDRINGEN *****
        )}
      </button>
      
      {/* Felmeddelande */}
      {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}