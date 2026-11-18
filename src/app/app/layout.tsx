/**
 * Appens ram (docs/plan-app.md, avsnitt 2). Allt under /app laddas bara av
 * appskalet: proxyn skriver om appens /dashboard, /dashboard/tester/... och
 * /login hit, och en webbläsare som går hit direkt skickas till webbens tester.
 *
 * Testsidorna under /app/tester är webbens egna sidor, så testerna är samma
 * kod i webben och appen. Det som skiljer är ramen: ingen sidomeny, inga
 * dörrar, ingen kampanjrad, e-postrad eller hemskärmsfråga.
 *
 * Appens egna typsnitt (Bricolage Grotesque och Figtree, ägarens beslut
 * 2026-11-13) och tokens (testklar.css) laddas bara här, som CSS-variabler på
 * appens rot. Webben laddar dem aldrig, och passens delade komponenter
 * behåller webbens typsnitt eftersom de inte använder variablerna.
 *
 * Appen ritar inte under statusfältet (viewport-fit auto nedan): skalet lägger
 * webbvyn mellan systemfälten, och remsan bakom statusfältet är skalets
 * nattbakgrund med ljusa ikoner i alla vyer (skal.ts, statusfalt).
 */
import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { RumKontextProvider } from '@/components/rum/RumKontext';
import { VAGG_FARG } from '@/lib/rum/rum';
import Skalet from '@/components/mobilapp/skalet/Skalet';
import './testklar.css';
import './mobilapp-samtycke.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-bricolage',
});

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// viewport-fit auto: skalet (Capacitor SystemBars) lägger då webbvyn under
// statusfältet i stället för bakom det. Webbens delade helskärmsflöden
// (passen, övningsproven, resultatvyerna: fixed inset-0) hamnade annars med
// sin översta rad under klockan, där trycken inte når sidan.
export const viewport: Viewport = {
  themeColor: VAGG_FARG.tran,
  viewportFit: 'auto',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Inloggningen ligger också i ramen, så kravet på konto sitter i
  // vyernas egna layouter. Här behövs användaren bara för rumskontexten.
  const user = await hamtaVerifieradAnvandare();

  return (
    <RumKontextProvider rum="tran" user={user}>
      <div
        data-rum="tran"
        data-mobilapp=""
        className={`${bricolage.variable} ${figtree.variable} flex h-screen supports-[height:100dvh]:h-dvh flex-col pt-[env(safe-area-inset-top)]`}
        style={{ backgroundColor: VAGG_FARG.tran }}
      >
        <main className="relative flex flex-1 flex-col overflow-y-auto overscroll-contain bg-golv pb-[env(safe-area-inset-bottom)]">
          <div className="flex min-h-full flex-col">{children}</div>
        </main>
        <Skalet />
      </div>
    </RumKontextProvider>
  );
}
