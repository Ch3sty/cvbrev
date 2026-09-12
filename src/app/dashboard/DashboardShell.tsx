'use client';

/**
 * Klientdelen av dashboard-layouten.
 *
 * Allt interaktivt bor här: mobilmenyns state, lösenordsprompten,
 * sidbytesanimationen, sidomenyn, headern och bottennavet. Det som INTE bor
 * här är beslutet om något får renderas. Layouten (en server component) har
 * redan verifierat sessionen mot Supabase, så user kommer in som prop och
 * första HTML från servern innehåller riktigt innehåll i stället för ett tomt
 * skal. Det får alltså inte finnas något return null som väntar på hydrering.
 */

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/header';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import EmailVerificationBanner from '@/components/dashboard/email-verification-banner';
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

  return (
    <DashboardDataProvider initialSummary={initialSummary}>
      <OnboardingProvider>
      {/* Navigation Progress Bar - visas vid sidbyten */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <div className="min-h-screen bg-white">
        <div className="flex h-screen flex-col lg:flex-row">
        {/* Dashboard Sidebar - Desktop (alltid synlig) */}
        <div className="hidden lg:block lg:relative lg:z-20">
          <DashboardSidebar
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={false}
          />
        </div>

        {/* Dashboard Sidebar - Mobile (full-screen overlay) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-orange-50/30 backdrop-blur-md motion-safe:animate-[fadeIn_200ms_ease-out]">
            <div className="h-full motion-safe:animate-[sidebarIn_250ms_ease-out]">
              <DashboardSidebar
                onClose={() => setIsMobileMenuOpen(false)}
                isMobile={true}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Dashboard Header - med hamburger på mobil.
              z-40 så notisdrawern lägger sig ovanför verifieringsbannern. */}
          <div className="relative z-40">
            <DashboardHeader
              user={user}
              onMenuClick={() => setIsMobileMenuOpen(true)}
            />
          </div>

          {/* Email Verification Banner */}
          <EmailVerificationBanner />

          {/* Set Password Prompt for trial users */}
          {showPasswordPrompt && user && (
            <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <div className="max-w-7xl mx-auto">
                <SetPasswordPrompt
                  userId={user.id}
                  onDismiss={() => setShowPasswordPrompt(false)}
                  onPasswordSet={() => setShowPasswordPrompt(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content Area - responsiv padding */}
          {/* Bottenpaddingen ligger i .dashboard-main-content och räknas mot
              --bottom-nav-h. Ingen pb-klass här: två sanningar om samma
              avstånd var precis det som gjorde att något alltid låg fel. */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 dashboard-main-content relative bg-white">
            <div className="max-w-7xl mx-auto relative">
              {/* Page Transition Animation */}
              <div key={pathname} className="motion-safe:animate-[fadeIn_150ms_ease-out]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobil bottennavigation - bara på mobil (lg:hidden inuti komponenten) */}
      <MobileBottomNavWrapper />
      </div>
      </OnboardingProvider>
    </DashboardDataProvider>
  );
}
