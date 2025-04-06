// app/auth/error/page.tsx
'use client'; // Behövs för att använda useSearchParams-hooken

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // Bra att använda med useSearchParams

// En inre komponent för att hantera logiken med searchParams
// Detta gör att vi kan använda Suspense runt den del som faktiskt läser params.
function ErrorDisplay() {
  const searchParams = useSearchParams();
  // Hämta felmeddelandet från URL:en (?message=...)
  const errorMessageQuery = searchParams.get('message');

  // Avkoda meddelandet om det finns och ge ett standardmeddelande annars
  const displayMessage = errorMessageQuery
    ? decodeURIComponent(errorMessageQuery) // Avkoda URL-kodade tecken
    : 'Ett okänt fel uppstod under autentiseringen.';

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-navy-900 rounded-lg text-center shadow-lg">
      <h1 className="text-2xl font-semibold text-white">Något gick fel</h1>

      {/* Visa det specifika eller generiska felmeddelandet */}
      <p className="text-red-400"> {/* Använd en tydlig färg för fel */}
        {displayMessage}
      </p>

      {/* Ge användaren en ledtråd om vad de kan göra */}
      <p className="text-sm text-gray-400">
        Kontrollera att länken du använde är korrekt och inte har gått ut. Du kan också försöka logga in igen.
      </p>

      {/* Länk tillbaka till inloggningssidan */}
      <div className="pt-4">
        <Link
          href="/login"
          className="inline-block px-4 py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Tillbaka till inloggning
        </Link>
      </div>
    </div>
  );
}


// Huvudkomponenten för sidan
export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950 text-white p-6">
      {/* Använd Suspense som fallback medan searchParams läses */}
      <Suspense fallback={<div className="text-white animate-pulse">Laddar felinformation...</div>}>
        <ErrorDisplay />
      </Suspense>
    </div>
  );
}