// app/auth/error/page.tsx
//
// Felsidan för autentiseringen i samma kort som Logga in (publikt omgång 3,
// skissnoten inloggning punkt 2). Logiken och texterna är dagens: meddelandet
// läses ur ?message=, annars ett standardmeddelande.
'use client' // Behövs för att använda useSearchParams-hooken

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AuthKortSkal, AuthRad } from '../_delar/AuthKortSkal'

// En inre komponent för att hantera logiken med searchParams, så att
// Suspense bara omsluter den del som faktiskt läser adressen.
function ErrorDisplay() {
  const searchParams = useSearchParams()
  // Hämta felmeddelandet från URL:en (?message=...)
  const errorMessageQuery = searchParams.get('message')

  // Avkoda meddelandet om det finns och ge ett standardmeddelande annars
  const displayMessage = errorMessageQuery
    ? decodeURIComponent(errorMessageQuery)
    : 'Ett okänt fel uppstod under autentiseringen.'

  return (
    <AuthRad ton="fel">
      <p>{displayMessage}</p>
    </AuthRad>
  )
}

export default function AuthErrorPage() {
  return (
    <AuthKortSkal>
      <h1 className="rg-h1">Något gick fel</h1>
      <Suspense fallback={<p className="rg-text">Laddar felinformation...</p>}>
        <ErrorDisplay />
      </Suspense>
      <p className="rg-text">
        Kontrollera att länken du använde är korrekt och inte har gått ut. Du kan också försöka logga in igen.
      </p>
      <Link href="/login" className="p3-knapp p3-knapp-bred">
        Tillbaka till inloggning
      </Link>
    </AuthKortSkal>
  )
}
