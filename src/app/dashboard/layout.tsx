/**
 * Dashboard-layouten är en server component.
 *
 * Förut var den 'use client' och returnerade null tills AuthContext hade
 * hydrerat och hunnit fråga Supabase vem användaren var. På riktig mobil blev
 * det flera sekunder grå skärm innan något ens kunde målas. Middleware
 * (src/middleware.ts) har redan verifierat inloggningen server-side, så den
 * väntan var onödig.
 *
 * Nu läser layouten sessionen och dashboard-summaryn här på servern och
 * skickar ner dem som props. Första HTML som når mobilen innehåller därför
 * sidomeny, header, bottennav och riktiga siffror, inte ett tomt skal.
 *
 * Summaryn hämtas via den delade getDashboardSummary, inte genom att fetcha
 * vår egen /api/dashboard/summary. Ett HTTP-anrop till oss själva hade lagt
 * till en hel extra rundtur per sidladdning.
 */
import type { Viewport } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hamtaSummering } from '@/lib/dashboard/summaryForRequest';
import type { DashboardSummary } from '@/contexts/DashboardDataContext';
import DashboardShell from './DashboardShell';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { rumForPath, VAGG_FARG, type Rum } from '@/lib/rum/rum';
import { PATHNAME_HEADER } from '@/lib/rum/pathname-header';

/** Rummet för requesten, ur sökvägen som proxyn lägger på (spec 5). */
async function rumForRequest(): Promise<Rum> {
  const h = await headers();
  return rumForPath(h.get(PATHNAME_HEADER));
}

/**
 * Systemets fält runt appen står i rummets vägg (spec-rummen 2.1 och 13,
 * beslut 6): ett enda värde utan media-villkor, eftersom väggen är densamma
 * i ljust och mörkt läge och statusfältet står över väggen, inte golvet.
 * Vid klientnavigering mellan rum byter DashboardShell färgen.
 */
export async function generateViewport(): Promise<Viewport> {
  return { themeColor: VAGG_FARG[await rumForRequest()] };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  // Går summaryn fel ska det inte ta ner hela det inloggade läget. Skalet
  // renderas ändå och DashboardDataProvider hämtar om på klienten. Svaret
  // delas med sidan i samma request (hamtaSummering är cache()).
  const initialSummary: DashboardSummary | null = await hamtaSummering(user.id);

  const rum = await rumForRequest();

  return (
    <DashboardShell user={user} initialSummary={initialSummary} rum={rum}>
      {children}
    </DashboardShell>
  );
}
