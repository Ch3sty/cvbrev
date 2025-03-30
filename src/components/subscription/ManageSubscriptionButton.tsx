// src/components/subscription/ManageSubscriptionButton.tsx
'use client'; // Klientkomponent för att hantera state och fetch

import { useState } from 'react';

export function ManageSubscriptionButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      // Anropa din backend för att skapa en portal-session
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Inga headers behövs här egentligen, sessionen hanteras av cookies
        },
      });

      const sessionData = await response.json();

      // Om backend svarade med fel eller inte gav en URL
      if (!response.ok || !sessionData.url) {
        throw new Error(sessionData.message || 'Kunde inte öppna hanteringsportalen.');
      }

      // Omdirigera användaren till Stripe Customer Portal
      window.location.href = sessionData.url;

    } catch (err: any) {
      console.error('Manage subscription error:', err);
      setError(err.message || 'Ett oväntat fel uppstod.');
      setLoading(false); // Stanna kvar och visa fel
    }
    // Ingen setLoading(false) vid success pga omdirigering
  };

  return (
    <div className={className}>
      {/* Använder en standard <button> med Tailwind-klasser */}
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className={`
          flex items-center justify-center w-full px-6 py-3 
          text-base font-medium rounded-md shadow-sm 
          text-white bg-gray-600 hover:bg-gray-700  {/* Annan färg för att skilja från "Uppgradera" */}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          transition-colors duration-150 ease-in-out
          disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Öppnar portal...
          </>
        ) : (
          'Hantera Prenumeration' // Knappens text
        )}
      </button>
      {/* Visa felmeddelande om det uppstår */}
      {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}