/**
 * Inställningar (skiss-installningar-2026-10-12): Utseende, Mejl från oss,
 * Prenumeration och Konto. Rum Konto (grafit), väggen utan lyft kort: sidan
 * har ingen primär handling, den är en lista med val.
 *
 * Server component. Allt sidan visar finns redan i serverns HTML: profilen
 * (mejlväxlarna, hjälpväxeln, paketet) kommer ur den summary som
 * dashboard-layouten hämtat, och adressen och inloggningssättet ur
 * användaren som proxyn redan verifierat. Ingen extra fråga mot databasen.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { KONTO_SEKTION } from '../profil/profil-copy';
import InstallningarClient from './InstallningarClient';

/** "Google", "Lösenord" eller båda, ur app_metadata. */
function inloggningSatt(appMetadata: Record<string, unknown> | undefined): string {
  const lista = Array.isArray(appMetadata?.providers)
    ? (appMetadata.providers as unknown[]).map(String)
    : typeof appMetadata?.provider === 'string'
      ? [appMetadata.provider]
      : [];
  const ord: string[] = [];
  if (lista.includes('google')) ord.push(KONTO_SEKTION.inloggningSatt.google);
  if (lista.includes('email')) ord.push(KONTO_SEKTION.inloggningSatt.losenord);
  return ord.length === 2 ? `${ord[0]} och ${ord[1].toLowerCase()}` : (ord[0] ?? '');
}

export default async function InstallningarPage() {
  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  return (
    <InstallningarClient
      epost={user.email ?? ''}
      inloggningSatt={inloggningSatt(user.app_metadata as Record<string, unknown> | undefined)}
    />
  );
}
