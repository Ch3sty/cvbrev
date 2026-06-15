'use client';
import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/header';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import AchievementManager from '@/components/gamification/AchievementManager';
import EmailVerificationBanner from '@/components/dashboard/email-verification-banner';
import SetPasswordPrompt from '@/components/dashboard/SetPasswordPrompt';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/use-profile';

function MobileBottomNavWrapper() {
  const { cvCount } = useProfile();
  return <MobileBottomNav cvCount={cvCount || 0} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // OBS: server-side middleware (src/middleware.ts) garanterar redan att bara
  // inloggade når /dashboard. Klient-redirecten + den blockerande spinnern är
  // därför borttagna — vi väntar bara kort på att user-objektet hydrerar för
  // UI som behöver user.id (header, achievements).

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

  // Kort fönster innan user-objektet hydrerat på klienten. Middleware har redan
  // verifierat inloggning server-side, så detta är millisekunder (ingen
  // nätverksväntan som förut) — visa inget för att undvika en flash.
  if (isLoading || !user) {
    return null;
  }

  // Om användaren är inloggad, visa dashboard-gränssnittet
  return (
    <OnboardingProvider>
      {/* Navigation Progress Bar - visas vid sidbyten */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20">
        <div className="flex h-screen flex-col lg:flex-row">
          {/* Achievement Notifications */}
          {user && <AchievementManager userId={user.id} />}

        {/* Dashboard Sidebar - Desktop (alltid synlig) */}
        <div className="hidden lg:block lg:relative lg:z-20">
          <DashboardSidebar
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={false}
          />
        </div>

        {/* Dashboard Sidebar - Mobile (full-screen overlay) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 lg:hidden bg-orange-50/30 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full"
              >
                <DashboardSidebar
                  onClose={() => setIsMobileMenuOpen(false)}
                  isMobile={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Dashboard Header - med hamburger på mobil */}
          <div className="relative z-15">
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
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 dashboard-main-content relative bg-gradient-to-br from-white/50 via-slate-50/30 to-slate-100/10">
            <div className="max-w-7xl mx-auto relative">
              {/* Page Transition Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Mobil bottennavigation - bara på mobil (lg:hidden inuti komponenten) */}
      <MobileBottomNavWrapper />
      </div>
    </OnboardingProvider>
  );
}