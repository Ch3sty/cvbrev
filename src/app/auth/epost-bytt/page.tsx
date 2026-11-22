// /auth/epost-bytt
// Landningen efter en följd länk i mejlen om byte av e-postadress
// (/api/konto/byt-epost, /auth/confirm). Med säkert e-postbyte måste båda
// adresserna bekräfta: ?steg=halvvags efter den första, ?steg=klart när
// adressen är bytt. Knappen går till kontot, som i appen är kontovyn.
//
// Publikt omgång 3: samma kort som Logga in (skissen inloggning), texterna
// är dagens.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Ikon } from '@/components/publikt/v3/Ikon'
import { AuthKortSkal, AuthRad } from '../_delar/AuthKortSkal'

export const metadata: Metadata = {
  title: 'Byte av e-postadress',
  robots: { index: false, follow: false },
}

export default async function EpostByttPage({ searchParams }: { searchParams: Promise<{ steg?: string }> }) {
  const { steg } = await searchParams
  const klart = steg !== 'halvvags'

  return (
    <AuthKortSkal toppLank={null}>
      <h1 className="rg-h1">{klart ? 'Klart, adressen är bytt' : 'En bekräftelse kvar'}</h1>
      <AuthRad ton={klart ? 'bra' : 'vanta'}>
        <p>
          {klart
            ? 'Från och med nu loggar du in med den nya e-postadressen.'
            : 'Tack! Vi har skickat ett mejl till den andra adressen också. Öppna länken i det, så går bytet igenom.'}
        </p>
      </AuthRad>

      {klart ? (
        <Link href="/dashboard/installningar" className="p3-knapp p3-knapp-bred">
          Till ditt konto
          <Ikon namn="pil" />
        </Link>
      ) : (
        <p className="rg-juridik">Ser du inget mejl? Kontrollera skräppostmappen.</p>
      )}
    </AuthKortSkal>
  )
}
