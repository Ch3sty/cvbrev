'use client';

/**
 * Klientdelen av dashboard-layouten.
 *
 * Allt interaktivt bor här: mobilmenyns state, lösenordsprompten,
 * sidbytesintoningen, sidomenyn, headern och bottennavet. Det som INTE bor
 * här är beslutet om något får renderas. Layouten (en server component) har
 * redan verifierat sessionen mot Supabase, så user kommer in som prop och
 * första HTML från servern innehåller riktigt innehåll i stället för ett tomt
 * skal. Det får alltså inte finnas något return null som väntar på hydrering.
 *
 * Tråden (docs/designsystem.md): marken är mark, sidomeny och topprad är
 * panel, innehållet står i en kolumn på max 960 px med 32 px marginal på
 * desktop. Sidbytet är en ren intoning (fadeInPlace): en förflyttning räknas
 * som layoutskifte när innehållet kommer in sent.
 */

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/header';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import EmailVerificationBanner from '@/components/dashboard/email-verification-banner';

/** Rutter som körs i FlowShell och därför äger hela skärmen själva. */
const FLOW_ROUTES = [
  '/dashboard/skapa-brev',
  '/dashboard/skapa-cv',
  '/dashboard/cv-analys',
  '/dashboard/linkedin-optimizer',
];
import dynamic from 'next/dynamic';

// Visas bara för konton som saknar lösenord, alltså en minoritet, och först
// efter att user-objektet lästs. Ingen anledning att ladda den med skalet.
const SetPasswordPrompt = dynamic(
  () => import('@/components/dashboard/SetPasswordPrompt'),
  { ssr: false }
);
import NavigationProgress from '@/components/ui/NavigationProgress';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import {
  DashboardDataProvider,
  useDashboardData,
  type DashboardSummary,
} from '@/contexts/DashboardDataContext';

function MobileBottomNavWrapper() {
  // Tidigare gjorde den här komponenten två egna rundturer: auth.getUser()
  // följt av en count(*) mot job_applications. Båda värdena finns redan i den
  // delade summaryn, så navet kostar numera ingenting extra.
  const { summary } = useDashboardData();

  return (
    <MobileBottomNav
      cvCount={summary?.cv.count ?? 0}
      applicationCount={
        summary
          ? summary.applications.waitingCount + summary.applications.interviewCount
          : 0
      }
    />
  );
}

export default function DashboardShell({
  children,
  user,
  initialSummary,
}: {
  children: React.ReactNode;
  user: User;
  initialSummary: DashboardSummary | null;
}) {
  const pathname = usePathname();

  // Ett flöde är ett läge: FlowShell äger hela skärmen och har sin egen
  // topprad och fot. E-postbannern renderades ändå på servern och togs bort
  // först när FlowShell hydrerat, drygt 1,5 sekunder in på en vanlig mobil.
  // Sidan hoppade då 57 px uppåt mitt i frågan, alltså CLS 0,083 på varje
  // flödessteg. Vi hoppar över den direkt i stället: pathname är känd redan
  // vid första render, så det finns ingen bild där bannern syns.
  const isFlowRoute = FLOW_ROUTES.some((r) => pathname?.startsWith(r));

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Check if user needs to set password (trial users)
  useEffect(() => {
    if (user) {
      const passwordSet = user.user_metadata?.password_set;
      const dismissedThisSession = localStorage.getItem('password_prompt_dismissed') === 'true';

      if (passwordSet === false && !dismissedThisSession) {
        setShowPasswordPrompt(true);
      }
    }
  }, [user]);

  // Skalet äger hela skärmen: main rullar, body gör det aldrig.
  //
  // 100vh på mobil Chrome räknar med adressfältet dolt, så rotelementet stack
  // ut under den synliga ytan och body blev rullbar med exakt adressfältets
  // höjd. Headern ligger utanför main, i en förälder med overflow-hidden, så
  // sticky hjälpte inte: rullade body (scroll chaining från main, eller
  // scrollåterställning vid navigering, särskilt direkt efter inloggning)
  // åkte headern ur bild medan det fixerade bottennavet låg kvar. h-dvh tar
  // bort överskottet och den här låsningen tar bort möjligheten helt.
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

  // Mobilmenyn stängs med Escape, som alla andra lager.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  return (
    <DashboardDataProvider initialSummary={initialSummary}>
      <OnboardingProvider>
      {/* Tråden längs skärmens överkant vid sidbyten. */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <div className="min-h-screen supports-[height:100dvh]:min-h-dvh bg-mark">
        <div className="flex h-screen supports-[height:100dvh]:h-dvh flex-col lg:flex-row">
        {/* Sidomeny, desktop (alltid synlig) */}
        <div className="hidden lg:block lg:relative lg:z-20">
          <DashboardSidebar
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={false}
          />
        </div>

        {/* Sidomeny, mobil (helskärmslager) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Stäng meny"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-ink-1/40 motion-safe:animate-[fadeInPlace_200ms_ease-out]"
            />
            <div className="relative h-full w-[min(100%,320px)] motion-safe:animate-[sidebarIn_240ms_ease-out]">
              <DashboardSidebar
                onClose={() => setIsMobileMenuOpen(false)}
                isMobile={true}
              />
            </div>
          </div>
        )}

        {/* Innehåll */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Toppraden, med meny på mobil.
              z-40 så notisdrawern lägger sig ovanför verifieringsbannern. */}
          {/* Headern hör inte till ett flöde. globals.css döljer den redan via
              data-flow-active, men det attributet sätts först när FlowShell
              hydrerat. skapa-brev har dessutom en loading.tsx som ritar ett
              helskärmsskelett innan dess, så headerns 57 px hann målas och
              försvinna igen: CLS 0,083 innan användaren gjort något. Vi vet
              redan av pathname att det är ett flöde, så vi hoppar över den. */}
          {!isFlowRoute && (
            <div className="relative z-40">
              <DashboardHeader
                user={user}
                onMenuClick={() => setIsMobileMenuOpen(true)}
              />
            </div>
          )}

          {!isFlowRoute && <EmailVerificationBanner />}

          {showPasswordPrompt && user && (
            <div className="px-4 pt-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-[960px]">
                <SetPasswordPrompt
                  userId={user.id}
                  onDismiss={() => setShowPasswordPrompt(false)}
                  onPasswordSet={() => setShowPasswordPrompt(false)}
                />
              </div>
            </div>
          )}

          {/* Bottenpaddingen ligger i .dashboard-main-content och räknas mot
              --bottom-nav-h. Ingen pb-klass här: två sanningar om samma
              avstånd var precis det som gjorde att något alltid låg fel. */}
          <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:px-8 lg:py-6 dashboard-main-content relative bg-mark">
            <div className="mx-auto max-w-[960px] relative">
              <div key={pathname} className="motion-safe:animate-[fadeInPlace_150ms_ease-out]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobil bottennavigation (lg:hidden inuti komponenten) */}
      <MobileBottomNavWrapper />
      </div>
      </OnboardingProvider>
    </DashboardDataProvider>
  );
}
