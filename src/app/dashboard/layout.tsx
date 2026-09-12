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
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getDashboardSummary } from '@/lib/dashboard/getSummary';
import type { DashboardSummary } from '@/contexts/DashboardDataContext';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Går summaryn fel ska det inte ta ner hela det inloggade läget. Skalet
  // renderas ändå och DashboardDataProvider hämtar om på klienten.
  let initialSummary: DashboardSummary | null = null;
  try {
    initialSummary = (await getDashboardSummary(supabase, user.id)) as DashboardSummary;
  } catch (error) {
    console.error('Fel vid server-hämtning av dashboard-summary:', error);
  }

  return (
    <DashboardShell user={user} initialSummary={initialSummary}>
      {children}
    </DashboardShell>
  );
}
