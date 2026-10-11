'use client';

/**
 * Klientdelen av dashboard-layouten (Rummen, spec-rummen 2.1 och 4).
 *
 * Allt interaktivt bor här: lösenordsprompten, sidbytesintoningen,
 * sidomenyn och dörrnavet. Det som INTE bor här är beslutet om något får
 * renderas. Layouten (en server component) har redan verifierat sessionen,
 * så user kommer in som prop och första HTML från servern innehåller
 * riktigt innehåll. Det får inte finnas något return null som väntar på
 * hydrering.
 *
 * Rummet: yttersta diven bär data-rum, som tänder rummets tokens i
 * globals.css. Värdet räknas av rumForPath på servern (layouten läser
 * x-pathname) och följer usePathname här, så ingen vy blinkar i fel rum vid
 * en hård omladdning och väggfärgen tonar 240 ms vid byte av rum.
 *
 * Skelettet är detsamma som förut (lärdomen 2026-09-14): h-dvh, låst body,
 * bara main rullar. Headern finns inte längre som egen rad: toppraden ligger
 * inne på väggen i varje vy (Topprad). Mobilens sidomeny som lager är borta,
 * navet är dörrarna och rummets undersidor nås från golvet. main har ingen
 * egen padding; vägg och golv sätter sina marginaler.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { User } from '@supabase/supabase-js';
import EmailVerificationBanner from '@/components/dashboard/email-verification-banner';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { KomIgangProvider } from '@/components/dashboard/KomIgangContext';
import KomIgangRad from '@/components/dashboard/KomIgangRad';
import KomIgangArk from '@/components/dashboard/KomIgangArk';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { DashboardDataProvider, type DashboardSummary } from '@/contexts/DashboardDataContext';
import Sidomeny from '@/components/rum/Sidomeny';
import Dorrnav from '@/components/rum/Dorrnav';
import { RumKontextProvider } from '@/components/rum/RumKontext';
import { tagRumYta } from '@/components/rum/rumMatning';
import { rumForPath, VAGG_FARG, type Rum } from '@/lib/rum/rum';
import { capture } from '@/lib/analytics/events';

/** Rutter som körs i FlowShell och därför äger hela skärmen själva. */
const FLOW_ROUTES = [
  '/dashboard/skapa-brev',
  '/dashboard/skapa-cv',
  '/dashboard/cv-analys',
  '/dashboard/linkedin-optimizer',
  // Välkomstskärmen efter köpet äger också hela skärmen (sektion 1).
  '/dashboard/vecka/start',
  // Nytt intervjuprov (docs/design/rod-trad-prov-spec-2026-09-24.md).
  '/dashboard/intervju/ny',
];

// Visas bara för konton som saknar lösenord, alltså en minoritet, och först
// efter att user-objektet lästs. Ingen anledning att ladda den med skalet.
const SetPasswordPrompt = dynamic(
  () => import('@/components/dashboard/SetPasswordPrompt'),
  { ssr: false }
);

// Frågan om hemskärmen (docs/plan-pwa.md). Den ligger tyst tills ett av de
// fyra triggerställena anropar requestInstallPrompt.
const InstallPrompt = dynamic(
  () => import('@/components/shell/InstallPrompt'),
  { ssr: false }
);

/** Testflödena: pass, prov, uppvärmning och de klassiska testen med resultat. */
const TESTFLODE = /^\/dashboard\/tester\/(?:pass|prov|uppvarmning)(?:\/|$)|^\/dashboard\/tester\/[^/]+\/test(?:\/|$)/;

/**
 * Sparar rummet för nästa landning (POST /api/rum/senaste) när webbläsaren
 * har tid över, aldrig i den kritiska vägen. Ett fel syns inte för
 * användaren; nästa byte försöker igen.
 */
function minnsRummet(rum: Exclude<Rum, 'neutral'>) {
  const skicka = () => {
    void fetch('/api/rum/senaste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rum }),
      keepalive: true,
    }).catch(() => {});
  };
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(skicka, { timeout: 4000 });
  else window.setTimeout(skicka, 1500);
}

export default function DashboardShell({
  children,
  user,
  initialSummary,
  rum: serverRum,
}: {
  children: React.ReactNode;
  user: User;
  initialSummary: DashboardSummary | null;
  /** Rummet ur rumForPath på servern (spec 4.1). */
  rum: Rum;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const rum: Rum = pathname ? rumForPath(pathname) : serverRum;

  // Ett flöde är ett läge: FlowShell äger hela skärmen och har sin egen
  // topprad och fot. E-postbannern hoppas över direkt, pathname är känd
  // redan vid första render, så det finns ingen bild där bannern syns.
  // Testpassen (/tester/<test>/test/<id>) är också ett läge: TestFlowShell
  // täcker skärmen. Bannern under den syntes aldrig men målades ändå och blev
  // vyns LCP-element när profilen landat (perf-inloggat, tester prov).
  const isFlowRoute =
    FLOW_ROUTES.some((r) => pathname?.startsWith(r)) ||
    /^\/dashboard\/tester\/[^/]+\/test\/[^/]+\/?$/.test(pathname ?? '');

  // Sidbytets intoning hör till sidbyten, inte till första laddningen
  // (LCP registreras inte på ett osynligt element).
  // Nyckeln för sidbytet. Passet byter adress från /tester/pass?typ=… till
  // /tester/pass/<id> med replaceState när sessionen skapats; det är samma
  // sida och får inte monteras om, annars startar passet en ny session i
  // varje varv (loopen 2026-10-11).
  const sidnyckel = pathname?.replace(/^(\/dashboard\/tester\/pass)(\/.*)?$/, '$1') ?? null;
  const forstaSokvag = useRef(pathname);
  const navigerat = useRef(false);
  if (pathname !== forstaSokvag.current) navigerat.current = true;
  const harNavigerat = navigerat.current;

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      const passwordSet = user.user_metadata?.password_set;
      const dismissedThisSession = localStorage.getItem('password_prompt_dismissed') === 'true';
      if (passwordSet === false && !dismissedThisSession) {
        setShowPasswordPrompt(true);
      }
    }
  }, [user]);

  // Skalet äger hela skärmen: main rullar, body gör det aldrig (h-dvh och
  // låst body, annars rullar toppraden ur bild när adressfältet syns).
  useEffect(() => {
    const { documentElement, body } = document;
    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    documentElement.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      documentElement.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Statusfältet står i rummets vägg (beslut 6). generateViewport sätter
  // värdet i serverns HTML; vid klientnavigering mellan rum byts det här.
  useEffect(() => {
    const farg = VAGG_FARG[rum];
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    if (metas.length === 0) {
      const m = document.createElement('meta');
      m.name = 'theme-color';
      m.content = farg;
      document.head.appendChild(m);
      return;
    }
    metas.forEach((m) => {
      m.removeAttribute('media');
      m.content = farg;
    });
  }, [rum]);

  // Färsk testvy efter ett test. Dörrarna förhämtar Rekryteringstester och
  // routern håller förhämtningen i fem minuter, så den som gjort ett pass och
  // går ut och in igen såg läget från före passet. Har ett testflöde besökts
  // sedan sist hämtas testsidorna om en gång när man kommer tillbaka.
  const testflodeBesokt = useRef(false);
  useEffect(() => {
    if (!pathname) return;
    if (TESTFLODE.test(pathname)) {
      testflodeBesokt.current = true;
      return;
    }
    if (testflodeBesokt.current && pathname.startsWith('/dashboard/tester')) {
      testflodeBesokt.current = false;
      router.refresh();
    }
  }, [pathname, router]);

  // Mätpunkterna (spec avsnitt 7): rum_oppnat när rummet byts eller vid
  // landningen, sokta_tjanster_oppnad varje gång listan öppnas.
  const valIRegistreringen = initialSummary?.komIgang?.intent ?? null;
  const senasteRum = useRef<Rum | null>(null);
  const senasteSida = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || pathname === senasteSida.current) return;
    const forsta = senasteSida.current === null;
    senasteSida.current = pathname;
    const yta = tagRumYta(forsta);
    if (rum !== senasteRum.current) {
      const fran = senasteRum.current;
      senasteRum.current = rum;
      // Registreringens val följer med som egenskap, bara för mätningen
      // (copywriterns önskemål om dörren Tester); menyn läser det aldrig.
      capture('rum_oppnat', { rum, surface: yta, intent: valIRegistreringen });
      // Våg 4: bytet mellan två rum, och rummet /dashboard ska öppna nästa
      // gång (profiles.senaste_rum). Kontot är inget rum man landar i.
      if (fran) capture('rum_bytt', { fran, till: rum, surface: yta });
      if (rum !== 'neutral') minnsRummet(rum);
    }
    if (pathname === '/dashboard/sokta-tjanster') {
      capture('sokta_tjanster_oppnad', { surface: yta });
    } else if (/^\/dashboard\/sokta-tjanster\/[^/]+$/.test(pathname)) {
      capture('sokta_tjanst_oppnad', { surface: yta });
    }
  }, [pathname, rum, valIRegistreringen]);

  return (
    <DashboardDataProvider initialSummary={initialSummary}>
      <OnboardingProvider>
      <KomIgangProvider>
      <RumKontextProvider rum={rum} user={user}>
      {/* Tråden längs skärmens överkant vid sidbyten. */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <div data-rum={rum} className="min-h-screen supports-[height:100dvh]:min-h-dvh bg-golv">
        <div className="flex h-screen supports-[height:100dvh]:h-dvh flex-col lg:flex-row">
          {/* Sidomenyn, bara på dator. */}
          <div className="hidden lg:relative lg:z-20 lg:block">
            <Sidomeny />
          </div>

          {/* Innehåll */}
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
            {!isFlowRoute && <EmailVerificationBanner />}

            {showPasswordPrompt && user && (
              <div className="bg-vagg-2 px-4 pt-4 lg:px-10">
                <div className="mx-auto max-w-[1120px]">
                  <SetPasswordPrompt
                    userId={user.id}
                    onDismiss={() => setShowPasswordPrompt(false)}
                    onPasswordSet={() => setShowPasswordPrompt(false)}
                  />
                </div>
              </div>
            )}

            {/* Bottenpaddingen ligger i .dashboard-main-content och räknas mot
                --bottom-nav-h. Väggen och golvet sätter sina egna marginaler. */}
            <main className="dashboard-main-content relative flex-1 overflow-y-auto overscroll-contain bg-golv p-0">
              <div
                key={sidnyckel ?? undefined}
                className={`flex min-h-full flex-col ${harNavigerat ? 'motion-safe:animate-[fadeInPlace_150ms_ease-out]' : ''}`}
              >
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Frågan om hemskärmen, en rad direkt ovanför den fot som råkar
            finnas. Den måste ligga kvar även i ett flöde. */}
        <InstallPrompt />

        {/* Hjälpredan Kom igång: raden ovanför dörrarna på Jobbsökets
            hemvy, och arket som båda raderna öppnar. */}
        {pathname === '/dashboard' ? <KomIgangRad variant="flytande" /> : null}
        <KomIgangArk />

        {/* Dörrarna, bara på mobil (lg:hidden i komponenten). */}
        <Dorrnav />
      </div>
      </RumKontextProvider>
      </KomIgangProvider>
      </OnboardingProvider>
    </DashboardDataProvider>
  );
}
