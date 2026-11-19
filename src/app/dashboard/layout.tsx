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
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hamtaSummering } from '@/lib/dashboard/summaryForRequest';
import DashboardShell from './DashboardShell';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { rumForPath, VAGG_FARG, type Rum } from '@/lib/rum/rum';
import { PATHNAME_HEADER, SOK_HEADER } from '@/lib/rum/pathname-header';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { skaTillIngangen } from '@/lib/tester/v4/hamta.server';
import { EPOSTBANNER_AVFARDAD_COOKIE } from '@/components/dashboard/epostbanner-cookie';
import { OMSTYRNING_SKRIPT } from './profil/omstyrning';
import { KAMPANJ_STANGD_COOKIE, kampanjNu, visning } from '@/lib/kampanj/kampanj';
import { kampanjForVisning } from '@/lib/kampanj/kampanj.server';

/** Rummet för requesten, ur sökvägen som proxyn lägger på (spec 5). */
async function rumForRequest(): Promise<Rum> {
  const h = await headers();
  return rumForPath(h.get(PATHNAME_HEADER));
}

/**
 * Hems omdirigering till ingången (Plan inför provet, ?forsta=1) vid en hel
 * sidladdning av /dashboard/tester. Sidan ligger i loading.tsx:s
 * Suspense-gräns, så ett redirect() där kommer först när skalet strömmat:
 * webbläsaren fick ett 200-svar, laddade det och följde sedan en
 * meta-refresh, två hela dokument efter varandra (QA 2026-11-19: 2,3-3,2 s
 * för ett nytt konto). Här, före skalet, blir samma beslut en riktig 307.
 *
 * Bara dokumentladdningar av just Hem utan ?visa=hem. Underlaget delas med
 * sidan (cache()), så det kostar ingen extra läsning. RSC-hämtningar
 * (klientnavigering, förhämtning) hoppas över; där gör sidan samma kontroll.
 * Appens sidor under /app har egen layout och påverkas inte.
 */
async function hemTillIngangen(userId: string): Promise<boolean> {
  const h = await headers();
  if (h.get(PATHNAME_HEADER) !== TRANING_RUTT.hem || h.has('rsc')) return false;
  if (new URLSearchParams(h.get(SOK_HEADER) ?? '').get('visa') === 'hem') return false;
  // Ett läsfel får aldrig fälla det inloggade läget; sidan kontrollerar igen.
  return skaTillIngangen(userId).catch(() => false);
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
  // Kampanjens profilläsning (nedan) och Hems ingångsbeslut går i samma
  // omgång, inte efter.
  const [initialSummary, { kampanj, behorig }, tillIngangen] = await Promise.all([
    hamtaSummering(user.id),
    kampanjForVisning(user.id, kampanjNu()),
    hemTillIngangen(user.id),
  ]);
  if (tillIngangen) redirect(`${TRANING_RUTT.installningar}?forsta=1`);

  const rum = await rumForRequest();

  // E-postraden avgörs här, inte på klienten (beslut-banners-2026-10-12,
  // avsnitt 1): bara ett overifierat konto som inte avfärdat raden det
  // senaste dygnet får den i HTML:en. Ett bekräftat konto får ingen rad och
  // ingen platshållare, så inget kan falla ihop och skifta sidan. Saknas
  // summeringen (läsfel) visas ingen rad; hellre det än en gissning.
  const cookieStore = await cookies();
  const avfardad = cookieStore.has(EPOSTBANNER_AVFARDAD_COOKIE);
  const visaEpostbanner = initialSummary?.emailVerified === false && !avfardad;

  // Kampanjraden (lib/kampanj) avgörs också här: bara under en kampanj, bara
  // för konton som aldrig haft Premium och bara om raden inte stängts för
  // just den kampanjen. Utanför kampanjerna görs ingen extra läsning.
  // (Läst ovan, i samma omgång som summeringen.)
  const kampanjStangd = kampanj && cookieStore.get(KAMPANJ_STANGD_COOKIE)?.value === kampanj.nyckel;
  const kampanjRad = kampanj && behorig && !kampanjStangd ? visning(kampanj) : null;
  // Betalväggarna i rummen visar kampanjpriset oavsett om raden stängts (K1, K4).
  const kampanjPris = kampanj && behorig ? visning(kampanj) : null;

  return (
    <>
      {/* Profilens flyttade ankare (#konto, #utseende, #hjalp) leder till
          Inställningar innan skalet eller profilen ritas (omstyrning.ts).
          Först i inloggats markup, så att inget hinner målas före. */}
      <script dangerouslySetInnerHTML={{ __html: OMSTYRNING_SKRIPT }} />
      <DashboardShell
        user={user}
        initialSummary={initialSummary}
        rum={rum}
        visaEpostbanner={visaEpostbanner}
        kampanjRad={kampanjRad}
        kampanjBehorig={behorig}
        kampanjPris={kampanjPris}
      >
        {children}
      </DashboardShell>
    </>
  );
}
